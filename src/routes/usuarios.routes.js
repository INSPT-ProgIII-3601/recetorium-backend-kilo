// ============================================================
//  usuarios.routes.js — Router de Usuarios
// ============================================================
// Las rutas solo montan los handlers de la capa controladora.
// No contienen lógica de negocio ni llamadas a la base de datos.
// ============================================================

import express from 'express';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../controllers/usuario.controller.js';
import { logInfoCli, authToken, esAdmin } from '../middlewares/middlewares.js';

const router = express.Router();

// GET /api/usuarios -> listar todos
router.get('/', obtenerUsuarios);

// GET /api/usuarios/:id -> obtener uno
router.get('/:id', logInfoCli, obtenerUsuarioPorId);

// POST /api/usuarios -> crear uno
router.post('/', crearUsuario);

// PUT /api/usuarios/:id -> actualizar uno
router.put('/:id', authToken, actualizarUsuario);

// DELETE /api/usuarios/:id -> eliminar uno
router.delete('/:id', [authToken, esAdmin], eliminarUsuario);

export default router;
