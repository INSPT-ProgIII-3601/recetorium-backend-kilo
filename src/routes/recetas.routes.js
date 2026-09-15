// ============================================================
//  recetas.routes.js — Router de Recetas
// ============================================================
// Las rutas solo montan los handlers de la capa controladora.
// No contienen lógica de negocio ni llamadas a la base de datos.
// ============================================================

import express from 'express';
import {
  listarRecetas,
  obtenerRecetaPorId,
  listarRecetasPorAutor,
  crearReceta,
} from '../controllers/receta.controller.js';
import {logInfoCli} from '../middlewares/middlewares.js'

const router = express.Router();

// GET /api/recetas -> listar todas
router.get('/', logInfoCli, listarRecetas);

// GET /api/recetas/autor/:autorId -> listar por autor
// Debe ir antes de /:id para que Express no confunda "autor"
// con un id de receta.
router.get('/autor/:autorId', listarRecetasPorAutor);

// GET /api/recetas/:id -> obtener una
router.get('/:id', obtenerRecetaPorId);

// POST /api/recetas -> crear una
router.post('/', [logInfoCli], crearReceta);

export default router;
