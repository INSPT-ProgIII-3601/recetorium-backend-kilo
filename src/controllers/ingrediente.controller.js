// ============================================================
//  ingrediente.controller.js — Controladores HTTP de Ingredientes
// ============================================================
// Cada función recibe (req, res) y se registra directamente
// como handler de Express. La ruta solo delega la petición;
// toda la lógica de lectura, validación, acceso a la base de
// datos y respuesta HTTP vive en esta capa.
// ============================================================

import { db } from '../config/db.js';

// ============================================================
//  listarIngredientes — GET /api/ingredientes
// ============================================================
export const listarIngredientes = (req, res) => {
  res.json(db.getIngredientes());
};

// ============================================================
//  obtenerIngredientePorId — GET /api/ingredientes/:id
// ============================================================
export const obtenerIngredientePorId = (req, res) => {
  const ingrediente = db.getIngredienteById(req.params.id);

  if (!ingrediente) {
    return res.status(404).json({ mensaje: 'Ingrediente no encontrado' });
  }

  res.json(ingrediente);
};
