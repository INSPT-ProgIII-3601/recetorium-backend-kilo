// ============================================================
//  receta.controller.js — Controladores HTTP de Recetas
// ============================================================
// Cada función recibe (req, res) y se registra directamente
// como handler de Express. La ruta solo delega la petición;
// toda la lógica de lectura, validación, acceso a la base de
// datos y respuesta HTTP vive en esta capa.
// ============================================================

import { db } from '../config/db.js';

// ============================================================
//  listarRecetas — GET /api/recetas
// ============================================================
// Devuelve las recetas cargadas desde el seed JSON.
export const listarRecetas = (req, res) => {
  res.json(db.getRecetas());
};

// ============================================================
//  obtenerRecetaPorId — GET /api/recetas/:id
// ============================================================
export const obtenerRecetaPorId = (req, res) => {
  const receta = db.getRecetaById(req.params.id);

  if (!receta) {
    return res.status(404).json({ mensaje: 'Receta no encontrada' });
  }

  res.json(receta);
};

// ============================================================
//  listarRecetasPorAutor — GET /api/recetas/autor/:autorId
// ============================================================
export const listarRecetasPorAutor = (req, res) => {
  const recetas = db
    .getRecetas()
    .filter((receta) => receta.autor_id === req.params.autorId);

  res.json(recetas);
};

// ============================================================
//  crearReceta — POST /api/recetas
// ============================================================
// Valida los campos obligatorios y que el autor exista antes
// de guardar. Cualquier error se traduce a HTTP 400.
export const crearReceta = (req, res) => {
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
};
