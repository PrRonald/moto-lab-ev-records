import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { openDatabase } from '../api/database.js';
import { createApp } from '../api/app.js';

test('Sesión, clientes, vehículos y ciclo completo de una reserva', async (t) => {
  const db = openDatabase(':memory:');
  const key = randomBytes(32).toString('hex');
  const socketPath = process.platform === 'win32' ? '//./pipe/workshop-' + randomUUID() : join(tmpdir(),randomUUID()+'.sock');
  const server = createApp({db, key}).listen(socketPath);
  await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); db.close(); });
  let cookie = '';
  const call = (path, body, protectedHeader = true) => new Promise((resolve, reject) => {
    const headers = { Cookie: cookie, 'Content-Type':'application/json' };
    if (protectedHeader) headers['X-Workshop-Request'] = '1';
    const req = request({socketPath, path:'/api/'+path, method: body ? 'POST':'GET', headers, agent:false}, res => {
      let data = '';
      res.setEncoding('utf8').on('data', part => data += part);
      res.on('end', () => resolve({status:res.statusCode, body:data ? JSON.parse(data):null, headers:res.headers}));
    });
    req.on('error', reject);
    req.end(body ? JSON.stringify(body) : undefined);
  });

  assert.equal((await call('clients')).status,401);
  assert.equal((await call('auth/login',{key},false)).status,403);
  const login = await call('auth/login',{key});
  assert.equal(login.status,204);
  cookie = login.headers['set-cookie'][0].split(';')[0];
  assert.equal((await call('clients',{name:'Cliente',phone:'555',role:'admin'})).status,400);
  const client = await call('clients',{name:'Cliente',phone:'555'});
  assert.equal(client.status,201);
  const vehicle = await call('vehicles',{model:'Ultra Bee',clientId:client.body.id});
  assert.equal(vehicle.status,201);
  const startsAt = new Date((Math.floor(Date.now()/1800000)+2)*1800000).toISOString();
  const payload = {startsAt,vehicleId:vehicle.body.id,reason:'Diagnóstico'};
  const results = await Promise.all([call('appointments',payload),call('appointments',payload)]);
  assert.deepEqual(results.map(r => r.status).sort(),[201,409]);
  const id = results.find(r => r.status === 201).body.id;
  assert.equal((await call('appointments')).body[0].owner,'Cliente');
  assert.equal((await call('appointments/'+id+'/cancel',{})).status,204);
  assert.equal((await call('appointments',payload)).status,201);
  assert.equal((await call('auth/logout',{})).status,204);
  assert.equal((await call('clients')).status,401);
});
