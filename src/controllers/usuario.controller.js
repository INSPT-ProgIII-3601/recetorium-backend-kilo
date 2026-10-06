// ============================================================
//  usuario.controller.js — Controladores HTTP de Usuarios
// ============================================================

import { Usuario } from "../models/Usuario.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// ============================================================
//  obtenerUsuarios — GET /api/usuarios
// ============================================================
export const obtenerUsuarios = async (_req, res) => {
  try {
    const usuarios = await Usuario.find();
    // res.json llama a toJSON implícitamente, ocultando 'clave' y '__v'
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  obtenerUsuarioPorId — GET /api/usuarios/:id
// ============================================================
export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usu = await Usuario.findById(id);
    if (!usu) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usu);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  crearUsuario — POST /api/usuarios
// ============================================================
export const crearUsuario = async (req, res) => {
  try {
    const { mail, clave, tipo = 'STD', perfil = {} } = req.body;

    // Mongoose maneja la unicidad por índice, pero validar aquí permite responder rápido
    const existente = await Usuario.findOne({ mail });
    if (existente) {
      return res.status(400).json({ mensaje: `Ya existe un usuario con el mail: ${mail}` });
    }

    const claveHasheada = await bcrypt.hash(clave, SALT_ROUNDS);

    const nuevoUsuario = new Usuario({
      mail,
      clave: claveHasheada,
      tipo,
      perfil,
    });

    const creado = await nuevoUsuario.save();
    res.status(201).json(creado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ============================================================
//  actualizarUsuario — PUT /api/usuarios/:id
// ============================================================
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { mail, tipo, perfil, clave } = req.body;

    const existente = await Usuario.findById(id);
    if (!existente) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Construcción dinámica de actualizaciones parciales
    const datosActualizados = {};

    if (mail !== undefined) datosActualizados.mail = mail;
    if (tipo !== undefined) datosActualizados.tipo = tipo;

    // Preserva subdocumento 'perfil' sin sobreescribir propiedades no enviadas
    if (perfil) {
      if (perfil.nombre !== undefined) datosActualizados['perfil.nombre'] = perfil.nombre;
      if (perfil.foto !== undefined) datosActualizados['perfil.foto'] = perfil.foto;
    }

    // Re-hashear clave solo si se provee una nueva
    if (clave) {
      datosActualizados.clave = await bcrypt.hash(clave, SALT_ROUNDS);
    }

    const actualizado = await Usuario.findByIdAndUpdate(
      id,
      { $set: datosActualizados },
      { new: true, runValidators: true }
    );

    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ============================================================
//  eliminarUsuario — DELETE /api/usuarios/:id
// ============================================================
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const eliminado = await Usuario.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  loginUsuario — POST /api/login
// ============================================================
export const loginUsuario = async (req, res) => {
  try {
    const { mail, clave } = req.body;

    if (!mail || !clave) {
      return res.status(400).json({ mensaje: "El mail y la clave son obligatorios" });
    }

    // Recupear campo con 'select: false' usando '+clave'
    const usu = await Usuario.findOne({ mail }).select('+clave');
    if (!usu) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const esClaveValida = await bcrypt.compare(clave, usu.clave);
    if (!esClaveValida) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const SECRET_KEY = process.env.JWT_SECRET || 'claveblablabla';

    const token = jwt.sign(
      { id: usu._id, tipo: usu.tipo },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.json({
      mensaje: "Login exitoso",
      token,
      usuario: usu,
    });
  } catch (error) {
    console.error('Error en loginUsuario:', error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};