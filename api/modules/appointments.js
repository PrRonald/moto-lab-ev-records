import { Router } from 'express';
import { fail, fields, identifier, requiredText } from '../http.js';
import { vehicleExists } from './vehicles.js';

// Reserva media hora para un único puesto y resuelve conflictos en la base.
export const reserve = (db, body) => {
  fields(body, ['vehicleId','startsAt','reason']);
  const vehicleId = identifier(body.vehicleId);
  const reason = requiredText(body.reason, 300);
  const start = new Date(body.startsAt);
  if (typeof body.startsAt !== 'string' || !Number.isFinite(start.getTime()) ||
      start.toISOString() !== body.startsAt || start.getTime() <= Date.now() ||
      start.getTime() % 1800000 !== 0) fail(400, 'Selecciona una media hora futura.');
  if (!vehicleExists(db, vehicleId)) fail(404, 'Vehículo desconocido.');

  // El índice parcial permite reutilizar horarios cancelados.
  const row = db.prepare(`INSERT INTO appointments(vehicleId,startsAt,reason) VALUES (?,?,?)
    ON CONFLICT(startsAt) WHERE status='reserved' DO NOTHING`).run(vehicleId, body.startsAt, reason);
  if (!row.changes) fail(409, 'Este horario ya está reservado.');
  return { id: Number(row.lastInsertRowid) };
};

// Expone la agenda y permite cancelar una reserva activa.
export const appointmentsRouter = (db) => {
  const router = Router();
  router.get('/', (_req, res) => res.json(db.prepare(`SELECT a.*,v.model,c.name AS owner
    FROM appointments a JOIN vehicles v ON v.id=a.vehicleId JOIN clients c ON c.id=v.clientId
    ORDER BY a.startsAt DESC, a.id DESC`).all()));
  router.post('/', (req, res) => res.status(201).json(reserve(db, req.body)));

  // Solo actualiza citas que todavía están reservadas.
  router.post('/:id/cancel', (req, res) => {
    const id = identifier(Number(req.params.id));
    const row = db.prepare("UPDATE appointments SET status='cancelled' WHERE id=? AND status='reserved'").run(id);
    if (!row.changes) fail(409, 'La cita ya no está disponible.');
    res.sendStatus(204);
  });
  return router;
};

