import { Router } from 'express';
import { fields, requiredText } from '../http.js';

// Agrupa altas y consultas de clientes del taller.
export const clientsRouter = (db) => {
  const router = Router();
  router.get('/', (_req, res) => res.json(db.prepare('SELECT id,name,phone FROM clients ORDER BY name,id').all()));

  // Guarda el nombre y el teléfono de contacto.
  router.post('/', (req, res) => {
    fields(req.body, ['name','phone']);
    const name = requiredText(req.body.name, 120);
    const phone = requiredText(req.body.phone, 32);
    const { lastInsertRowid } = db.prepare('INSERT INTO clients(name,phone) VALUES (?,?)').run(name, phone);
    res.status(201).json({ id: Number(lastInsertRowid) });
  });
  return router;
};

