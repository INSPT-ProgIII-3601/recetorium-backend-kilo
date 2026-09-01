// ============================================================
//  recetas.routes.js — Router de Recetas
// ============================================================
// Endpoints básicos para leer las recetas del seed.
// Por ahora solo lectura (GET) y creación (POST): la idea es
// que los estudiantes vayan sumando PUT/DELETE como práctica.
// ============================================================

import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/recetas  -> listar todas las recetas del seed
router.get('/', (_req, res) => {
  res.json(db.getRecetas());
});

// GET /api/recetas/:id  -> obtener una receta por _id
router.get('/:id', (req, res) => {
  const receta = db.getRecetaById(req.params.id);
  if (!receta) {
    return res.status(404).json({ mensaje: 'Receta no encontrada' });
  }
  res.json(receta);
});

// GET /api/recetas/autor/:autorId  -> recetas de un autor
// (útil para mostrar el "perfil" de un usuario con sus recetas)
router.get('/autor/:autorId', (req, res) => {
  const recetas = db.getRecetas().filter((r) => r.autor_id === req.params.autorId);
  res.json(recetas);
});

// POST /api/recetas  -> crear una nueva receta
// body esperado: { nombre, foto, instrucciones, autor_id, ingredientes }
router.post('/', (req, res) => {
  const { nombre, instrucciones, autor_id, ingredientes = [] } = req.body;
  if (!nombre || !instrucciones || !autor_id) {
    return res.status(400).json({
      mensaje: 'nombre, instrucciones y autor_id son obligatorios',
    });
  }
  const autor = db.getUsuarioById(autor_id);
  if (!autor) {
    return res.status(400).json({ mensaje: 'autor_id no existe' });
  }
  const nueva = db.createReceta({
    nombre,
    foto: req.body.foto || '',
    instrucciones,
    autor_id,
    ingredientes,
  });
  res.status(201).json(nueva);
});

export default router;
