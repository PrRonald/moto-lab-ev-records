import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { openDatabase } from './database.js';
import { createApp } from './app.js';

// Verifica los parámetros antes de iniciar la aplicación.
const key = process.env.OPERATOR_KEY ?? '';
if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('Configura OPERATOR_KEY con npm run setup.');
const path = resolve(process.env.DATABASE_PATH || 'data/workshop.sqlite');
mkdirSync(dirname(path), { recursive: true });

// Abre una instancia del monolito detrás del proxy local.
const db = openDatabase(path);
const app = createApp({ db, key, secure: process.env.NODE_ENV === 'production', publicDir: resolve('web/dist') });
const server = app.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log('API disponible en loopback.'));

// Termina las peticiones activas antes de cerrar la base de datos.
const stop = () => server.close(() => db.close());
process.once('SIGTERM', stop);
process.once('SIGINT', stop);

