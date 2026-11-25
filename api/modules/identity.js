import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { fail, fields } from '../http.js';

// Conserva únicamente la huella de cada sesión en la base.
const digest = (value) => createHash('sha256').update(value).digest('hex');
const tokenOf = (req) => /(?:^|;\s*)workshop=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie ?? '')?.[1] ?? '';

// Comprueba la vigencia de la sesión antes de entregar datos privados.
export const authenticate = (db) => (req, _res, next) => {
  const session = db.prepare('SELECT expires FROM sessions WHERE digest=?').get(digest(tokenOf(req)));
  if (!session || session.expires <= Date.now()) fail(401, 'Inicia sesión.');
  next();
};

// Administra el acceso del operador y la caducidad de sus sesiones.
export const identityRouter = (db, key, secure) => {
  const router = Router();
  const lifetime = 8 * 60 * 60 * 1000;
  const cookie = { httpOnly: true, secure, sameSite: 'strict', path: '/api' };
  let failures = 0;
  let windowEnds = 0;

  // Limita intentos por proceso para el acceso de un solo operador.
  router.post('/login', (req, res) => {
    fields(req.body, ['key']);
    if (Date.now() >= windowEnds) {
      failures = 0;
      windowEnds = Date.now() + 60000;
    }
    if (failures >= 20) fail(429, 'Espera un minuto para volver a entrar.');
    const supplied = typeof req.body.key === 'string' ? req.body.key : '';
    if (!timingSafeEqual(Buffer.from(digest(supplied)), Buffer.from(digest(key)))) {
      failures += 1;
      fail(401, 'Clave incorrecta.');
    }

    // Sustituye la sesión anterior del navegador y elimina sesiones vencidas.
    const token = randomBytes(32).toString('hex');
    db.prepare('DELETE FROM sessions WHERE expires<=? OR digest=?').run(Date.now(), digest(tokenOf(req)));
    db.prepare('INSERT INTO sessions VALUES (?,?)').run(digest(token), Date.now() + lifetime);
    res.cookie('workshop', token, { ...cookie, maxAge: lifetime }).sendStatus(204);
  });

  // Invalida la sesión también en el servidor.
  router.post('/logout', (req, res) => {
    db.prepare('DELETE FROM sessions WHERE digest=?').run(digest(tokenOf(req)));
    res.clearCookie('workshop', cookie).sendStatus(204);
  });
  router.get('/session', authenticate(db), (_req, res) => res.json({ authenticated: true }));
  return router;
};

