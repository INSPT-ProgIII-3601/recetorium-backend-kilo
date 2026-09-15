// ============================================================
//  ingredientes.routes.js — Router de Ingredientes
// ============================================================
// Las rutas solo montan los handlers de la capa controladora.
// No contienen lógica de negocio ni llamadas a la base de datos.
// ============================================================

import express from 'express';
import {
  listarIngredientes,
  obtenerIngredientePorId,
} from '../controllers/ingrediente.controller.js';

const router = express.Router();

// GET /api/ingredientes -> listar todos
router.get('/', listarIngredientes);

// GET /api/ingredientes/:id -> obtener uno
router.get('/:id', obtenerIngredientePorId);

export default router;
