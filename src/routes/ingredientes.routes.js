// ============================================================
//  ingredientes.routes.js — Router de Ingredientes
// ============================================================
// Endpoints de lectura para los ingredientes del seed.
// La idea es que sirvan como catálogo para autocompletar al
// armar una receta.
// ============================================================

import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/ingredientes  -> listar todos
router.get('/', (_req, res) => {
  res.json(db.getIngredientes());
});

// GET /api/ingredientes/:id  -> obtener uno
router.get('/:id', (req, res) => {
  const ing = db.getIngredienteById(req.params.id);
  if (!ing) {
    return res.status(404).json({ mensaje: 'Ingrediente no encontrado' });
  }
  res.json(ing);
});

export default router;
