import express from 'express';
import { resolve } from 'node:path';
import { clientsRouter } from './modules/clients.js';
import { vehiclesRouter } from './modules/vehicles.js';
import { appointmentsRouter } from './modules/appointments.js';
import { authenticate, identityRouter } from './modules/identity.js';

// Construye la aplicación con la base y la configuración del entorno.
export const createApp = ({ db, key, secure = false, publicDir }) => {
  const app = express();
  app.disable('x-powered-by');

  // Aplica cabeceras al frontend y a la API.
  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'self'"
    });
    next();
  });

  // Las mutaciones exigen una cabecera propia que un formulario externo no puede enviar.
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET','HEAD','OPTIONS'].includes(req.method) && req.get('X-Workshop-Request') !== '1') {
      return res.status(403).json({ message: 'Solicitud no permitida.' });
    }
    next();
  });
  app.use('/api', express.json({ limit: '12kb' }));

  // Monta autenticación y módulos privados en un mismo proceso.
  app.use('/api/auth', identityRouter(db, key, secure));
  app.use('/api', authenticate(db));
  app.use('/api/clients', clientsRouter(db));
  app.use('/api/vehicles', vehiclesRouter(db));
  app.use('/api/appointments', appointmentsRouter(db));
  app.use('/api', (_req, res) => res.status(404).json({ message: 'Ruta API desconocida.' }));

  // Sirve la compilación de React y permite abrir enlaces internos directamente.
  if (publicDir) {
    app.use(express.static(publicDir));
    app.get(/.*/, (req, res, next) => req.accepts('html') && !req.path.includes('.')
      ? res.sendFile(resolve(publicDir, 'index.html')) : next());
  }

  // Devuelve mensajes controlados y evita exponer trazas al navegador.
  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status || 500;
    if (status >= 500) console.error('Error interno:', error.name);
    const message = status >= 500 ? 'Error interno del servidor.' :
      error.type ? 'Cuerpo de solicitud inválido.' : error.message;
    res.status(status).json({ message });
  });
  return app;
};

