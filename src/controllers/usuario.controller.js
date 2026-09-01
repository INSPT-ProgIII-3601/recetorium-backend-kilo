// ============================================================
//  usuario.controller.js — Capa de negocio de Usuarios
// ============================================================
// Un "controller" es el punto medio entre la RUTA (que recibe
// el request HTTP) y la BASE DE DATOS (que guarda los datos).
//
// Responsabilidad típica de un controller:
//   1) Tomar lo que vino en el request (params, body, etc.).
//   2) Llamar al modelo y/o a la DB para hacer el trabajo.
//   3) Devolver una respuesta (o null/error) al router.
//
// ⚠️ Observación: en este proyecto los controllers están
// definidos como FUNCIONES PURAS, no como métodos que reciben
// req/res. El router (usuarios.routes.js) es el que llama a
// estas funciones y arma la respuesta HTTP. Esto es válido y
// didáctico, pero a nivel profesional muchas veces se prefiere
// que el controller SI reciba req/res para tener todo más junto.
// ============================================================

// Importamos el "db" (nuestra mini-base-de-datos) y el modelo.
import { db } from '../config/db.js';
import { Usuario } from '../models/Usuario.js';

// ============================================================
//  obtenerUsuarios — equivalente a GET /api/usuarios
// ============================================================
// Devuelve un array con todos los usuarios en formato "limpio"
// (gracias a toJSON()). Si la DB está vacía, devuelve [].
export const obtenerUsuarios = () => {
  return db.getUsuarios().map((u) => u.toJSON());
};

// ============================================================
//  obtenerUsuarioPorId — equivalente a GET /api/usuarios/:id
// ============================================================
// Devuelve UN usuario por id, o null si no existe. Dejar que
// devuelva null (en vez de tirar un error) es cómodo: el router
// lo traduce a 404.
export const obtenerUsuarioPorId = (id) => {
  const usuario = db.getUsuarioById(id);
  if (!usuario) return null;
  return usuario.toJSON();
};

// ============================================================
//  crearUsuario — equivalente a POST /api/usuarios
// ============================================================
// Crea un Usuario nuevo a partir de lo que vino en el body.
// Fijate el orden:
//   1) new Usuario(datos) puede LANZAR un Error si los datos
//      no pasan las validaciones. Eso lo atrapamos en la ruta
//      con un try/catch y respondemos 400.
//   2) Si todo OK, le asignamos un id (en este caso usamos
//      Date.now() para que sea único "suficiente" en memoria)
//      y lo guardamos en la DB.
export const crearUsuario = (datos) => {
  const usuario = new Usuario(datos);
  // El id lo genera db.createUsuario (es un ObjectId-like string).
  // Antes generábamos Date.now() acá, pero ahora lo centralizamos
  // en la "DB" para que la lógica de IDs viva en un solo lugar.
  const creado = db.createUsuario(usuario);
  return creado.toJSON();
};

// ============================================================
//  actualizarUsuario — equivalente a PUT /api/usuarios/:id
// ============================================================
// Primero chequeamos que el usuario exista. Si no, null.
// Después armamos un objeto "datosActualizados" aplicando el
// truco del "??": si en el body vino un campo, lo usamos;
// si no, conservamos el valor anterior. Así un PUT parcial
// no borra los campos que el cliente no mandó.
//
// Luego creamos un Usuario NUEVO con esos datos (para que
// se revaliden) y lo guardamos pisando el viejo.
export const actualizarUsuario = (id, datos) => {
  const existente = db.getUsuarioById(id);
  if (!existente) return null;

  const datosActualizados = {
    mail: datos.mail ?? existente.mail,
    clave: datos.clave ?? existente.clave,
    tipo: datos.tipo ?? existente.tipo,
    perfil: datos.perfil ?? existente.perfil,
  };

  const usuario = new Usuario(datosActualizados);
  usuario.setId(id);
  const actualizado = db.updateUsuario(id, usuario);
  return actualizado.toJSON();
};

// ============================================================
//  eliminarUsuario — equivalente a DELETE /api/usuarios/:id
// ============================================================
// Devuelve true si borró, false si el id no existía.
// El router usa ese boolean para responder 204 (sin contenido)
// o 404 (no encontrado).
export const eliminarUsuario = (id) => {
  const eliminado = db.deleteUsuario(id);
  return eliminado;
};
