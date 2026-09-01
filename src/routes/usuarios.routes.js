// ============================================================
//  usuarios.routes.js — Router de Usuarios
// ============================================================
// Un "router" agrupa todas las rutas de un recurso. Es como
// un mini-Express que después se "enchufa" en la app principal
// con un prefijo (en app.js se monta con '/api/usuarios').
//
// Cada ruta tiene la forma:
//   router.METHOD(PATH, HANDLER)
// donde:
//   - METHOD: verbo HTTP (get, post, put, delete, ...)
//   - PATH: la parte de la URL que viene DESPUÉS del prefijo.
//   - HANDLER: (req, res) => { ... } que arma la respuesta.
//
// Convenciones REST:
//   GET    /         -> listar todos
//   GET    /:id      -> obtener uno por id
//   POST   /         -> crear uno nuevo (datos en req.body)
//   PUT    /:id      -> actualizar uno existente
//   DELETE /:id      -> eliminar uno
// ============================================================

// express.Router() nos devuelve un router "mini" que después
// se monta en la app principal.
import express from 'express';

// Importamos las funciones (controllers) que vamos a invocar
// desde cada ruta. Desestructuramos para no tener que escribir
// "usuarioController.algo" en cada línea.
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../controllers/usuario.controller.js';

const router = express.Router();

// ============================================================
//  GET /api/usuarios  ->  listar todos
// ============================================================
// Cuando el cliente hace GET /api/usuarios, se ejecuta este
// handler. Llamamos al controller, que nos devuelve un array,
// y se lo mandamos como JSON con res.json().
router.get('/', (req, res) => {
  const usuarios = obtenerUsuarios();
  res.json(usuarios);
});

// ============================================================
//  GET /api/usuarios/:id  ->  obtener uno
// ============================================================
// ":id" es un PARÁMETRO DE RUTA: lo que el cliente escriba
// ahí lo recibimos en req.params.id como STRING.
// ⚠️ Antes lo convertíamos con Number(...) porque los ids
// eran numéricos. Ahora los ids son strings estilo Mongo
// (ObjectId hex), así que los pasamos TAL CUAL.
router.get('/:id', (req, res) => {
  const usuario = obtenerUsuarioPorId(req.params.id);
  if (!usuario) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }
  res.json(usuario);
});

// ============================================================
//  POST /api/usuarios  ->  crear uno
// ============================================================
// El cliente manda los datos del usuario en el BODY del
// request (en JSON). Esos datos llegan en req.body gracias
// al middleware express.json() configurado en app.js.
//
// Envolvemos la llamada al controller en try/catch porque
// el modelo "Usuario" puede lanzar Error si los datos no
// pasan las validaciones (mail inválido, clave corta, etc.).
// En ese caso respondemos 400 (Bad Request).
router.post('/', (req, res) => {
  try {
    const usuario = crearUsuario(req.body);
    res.status(201).json(usuario); // 201 = "Created"
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// ============================================================
//  PUT /api/usuarios/:id  ->  actualizar uno
// ============================================================
// Similar a GET por id: si no existe, 404. Si existe, el
// controller se encarga de mezclar los datos viejos con los
// nuevos y revalidar.
router.put('/:id', (req, res) => {
  const usuario = actualizarUsuario(req.params.id, req.body);
  if (!usuario) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }
  res.json(usuario);
});

// ============================================================
//  DELETE /api/usuarios/:id  ->  eliminar uno
// ============================================================
// Si borró, respondemos 204 (No Content) sin body.
// 204 es la convención REST para un delete exitoso.
// Si no encontró el id, respondemos 404.
router.delete('/:id', (req, res) => {
  const eliminado = eliminarUsuario(req.params.id);
  if (!eliminado) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }
  res.status(204).send();
});

// Exportamos el router para que app.js pueda montarlo.
export default router;
