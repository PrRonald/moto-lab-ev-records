import { Router } from 'express';
import { fail, fields, identifier, requiredText } from '../http.js';

// Ofrece a la agenda una consulta pública sobre vehículos registrados.
export const vehicleExists = (db, id) => Boolean(db.prepare('SELECT id FROM vehicles WHERE id=?').get(id));

// Registra vehículos y devuelve el nombre de su propietario.
export const vehiclesRouter = (db) => {
  const router = Router();
  router.get('/', (_req, res) => res.json(db.prepare(
    'SELECT v.*, c.name AS owner FROM vehicles v JOIN clients c ON c.id=v.clientId ORDER BY v.id DESC'
  ).all()));

  // Asocia el vehículo con un cliente existente.
  router.post('/', (req, res) => {
    fields(req.body, ['clientId','model']);
    const clientId = identifier(req.body.clientId);
    const model = requiredText(req.body.model, 100);
    if (!db.prepare('SELECT id FROM clients WHERE id=?').get(clientId)) fail(404, 'Cliente desconocido.');
    const row = db.prepare('INSERT INTO vehicles(clientId,model) VALUES (?,?)').run(clientId, model);
    res.status(201).json({ id: Number(row.lastInsertRowid) });
  });
  return router;
};

