# Plan de Desarrollo: API Recetorium

**Proyecto educativo** — 6 clases de 4 hs reloj cada una.
**Tecnologías:** Node.js, Express, JWT.
**Filosofía:** Avance gradual. Cada clase introduce **un concepto nuevo**. Persistencia en memoria las primeras clases; MongoDB se adopta después de tener la lógica funcionando.

---

## Entidades del dominio

| Entidad | Operaciones | Descripción |
|---------|-------------|-------------|
| `usuarios` | CRUD completo | `_id`, `mail`, `clave`, `tipo` (ADMIN/STD), `perfil` (`nombre`, `foto`) |
| `recetas` | CRUD completo | `_id`, `nombre`, `foto`, `instrucciones`, `autor_id` (ref usuario), `ingredientes` (array embebido) |
| `ingredientes` | **Solo lectura** | `_id`, `nombre`, `foto`, `color` |

---

## Estructura de carpetas (desde el día 1)

```
recetorium/
├── src/
│   ├── config/
│   │   └── db.js                 # Día 1: store en memoria. Día 5: conexión MongoDB.
│   ├── middleware/
│   │   ├── auth.js               # Día 2
│   │   ├── authorize.js          # Día 3
│   │   └── errorHandler.js       # Día 6
│   ├── models/
│   │   ├── Usuario.js            # Día 1 (clase JS). Día 5: esquema Mongoose.
│   │   ├── Receta.js             # Día 3 (clase JS). Día 5: esquema Mongoose.
│   │   └── Ingrediente.js        # Día 4 (clase JS). Día 5: esquema Mongoose.
│   ├── routes/
│   │   ├── auth.routes.js        # Día 2
│   │   ├── usuarios.routes.js    # Día 1
│   │   ├── recetas.routes.js     # Día 3
│   │   └── ingredientes.routes.js # Día 4
│   ├── controllers/
│   │   ├── auth.controller.js    # Día 2
│   │   ├── usuario.controller.js # Día 1
│   │   ├── receta.controller.js  # Día 3
│   │   └── ingrediente.controller.js # Día 4
│   └── app.js                    # Día 1
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

**Estrategia de migración a MongoDB (Día 5):** Los modelos comienzan como clases JavaScript con métodos `find`, `findById`, `create`, `update`, `delete` que operan sobre arrays en memoria. Al llegar a MongoDB, se reemplazan por esquemas Mongoose manteniendo la misma interfaz pública. Los controladores no cambian.

---

## Clase 1 — Proyecto, estructura y persistencia en memoria + CRUD Usuarios

**Concepto nuevo:** Express, separación en capas, persistencia simulada.

### Qué se cubre
- Inicialización: `npm init`, carpetas, `.gitignore`.
- Dependencias: solo `express`, `dotenv`, `cors`.
- Variables de entorno: `PORT`.
- Configuración de `app.js`: middlewares globales, rutas base.
- Capa de persistencia simulada (`src/config/db.js`):
  - Objeto con arrays en memoria: `usuarios`, `recetas`, `ingredientes`.
  - Funciones wrapper: `getUsuarios()`, `getUsuarioById()`, `createUsuario()`, etc.
  - Comentario explícito: "Esta capa será reemplazada por MongoDB en la Clase 5".
- Modelo `Usuario.js` (clase JS, sin Mongoose):
  - Constructor con validaciones básicas.
  - Método `toJSON()`.
- Controlador y rutas de `usuarios` (CRUD completo):
  - `POST /api/usuarios`
  - `GET /api/usuarios`
  - `GET /api/usuarios/:id`
  - `PUT /api/usuarios/:id`
  - `DELETE /api/usuarios/:id`
- Pruebas con Thunder Client.

### Entregable
Servidor corriendo. CRUD de usuarios funcionando con datos en RAM.

---

## Clase 2 — Seguridad: bcrypt + JWT + Auth middleware

**Concepto nuevo:** Autenticación stateless con tokens.

### Qué se cubre
- Instalación incremental: `bcrypt`, `jsonwebtoken`.
- Variables de entorno nuevas: `JWT_SECRET`, `JWT_EXPIRY`.
- Endpoint `POST /api/auth/login`:
  - Buscar usuario por mail en el store en memoria.
  - Verificar contraseña con `bcrypt.compare`.
  - Generar JWT con payload `{ id, mail, tipo }`.
- Modelo `Usuario.js` extendido:
  - Método estático `findByMail()`.
  - Método de instancia `comparePassword()`.
  - Hook simulado de hasheo (no es `pre('save')` de Mongoose, es un método que se llama explícitamente).
- Middleware `auth.js`:
  - Extraer token de header `Authorization`.
  - Verificar con `jwt.verify`.
  - Adjuntar `req.user`.
- Pruebas: login, token inválido, ruta protegida.

### Entregable
Login funcional. Middleware `auth` reutilizable.

---

## Clase 3 — Autorización por roles + segunda entidad: Recetas (CRUD completo)

**Concepto nuevo:** Control de acceso granular.

### Qué se cubre
- Middleware `authorize.js`: array de roles permitidos, retorna 403.
- Modelo `Receta.js` (clase JS):
  - Propiedades: `id`, `nombre`, `foto`, `instrucciones`, `autorId`, `ingredientes` (array de objetos).
  - Validaciones en constructor.
- CRUD de recetas:
  - `POST /api/recetas` — crear (autenticado).
  - `GET /api/recetas` — listar.
  - `GET /api/recetas/:id` — detalle.
  - `PUT /api/recetas/:id` — actualizar (solo autor o ADMIN).
  - `DELETE /api/recetas/:id` — eliminar (solo autor o ADMIN).
- Relación implícita: `autorId` se valida contra el store de usuarios.
- Pruebas: STD edita su receta, no edita la de otro; ADMIN edita cualquiera.

### Entregable
Segunda entidad con CRUD completo. Roles funcionando.

---

## Clase 4 — Entidad de solo lectura: Ingredientes + relaciones

**Concepto nuevo:** Entidades de solo lectura y datos poblados (simulados).

### Qué se cubre
- Modelo `Ingrediente.js` (clase JS): datos cargados desde el JSON de `/data`.
- CRUD de **solo lectura**:
  - `GET /api/ingredientes` — listar todos.
  - `GET /api/ingredientes/:id` — detalle.
- Sin POST/PUT/DELETE: se explica que es un catálogo administrado externamente.
- Relación en `recetas`: al crear/editar una receta, se valida que cada `ingrediente_id` del array exista en el catálogo.
- Respuesta poblada simulada: en `GET /api/recetas/:id`, el controlador reemplaza los `ingrediente_id` por los objetos completos de ingredientes.
- Pruebas: listar ingredientes, crear receta con ingredientes válidos/inválidos.

### Entregable
Tercera entidad funcionando (solo lectura). Relaciones entre recetas, usuarios e ingredientes visibles en las respuestas.

---

## Clase 5 — Migración a MongoDB + Mongoose

**Concepto nuevo:** Reemplazar la capa de persistencia en memoria por una base de datos real.

### Qué se cubre
- Instalación: `mongoose`, `mongoose-aggregate-paginate` (opcional).
- Variables de entorno: `MONGO_URI`.
- Refactor de `src/config/db.js`:
  - Antes: store en memoria.
  - Ahora: `mongoose.connect()` con eventos.
- Refactor de modelos:
  - `Usuario.js`: esquema Mongoose + métodos de instancia (`comparePassword`).
  - `Receta.js`: esquema con `ref` a Usuario y array de subdocumentos o refs a Ingredientes.
  - `Ingrediente.js`: esquema Mongoose.
- Cambio de controladores para usar métodos de Mongoose (`find`, `findById`, `populate`, etc.).
- Migración de datos: seed inicial desde los JSONs de `/data` si la colección está vacía.
- Pruebas: mismos endpoints, mismos resultados, ahora persistidos en MongoDB.

### Entregable
API funcionando contra MongoDB. Misma interfaz que en memoria, pero con persistencia real.

---

## Clase 6 — Manejo de excepciones, documentación y despliegue

**Concepto nuevo:** Robustez profesional y publicación.

### Qué se cubre
- **Manejo de errores centralizado:**
  - Clase `AppError` (si no existe ya).
  - Middleware `errorHandler.js`: formato JSON consistente.
  - Manejo de errores específicos: validaciones Mongoose, CastError, JsonWebTokenError.
- **Documentación:**
  - README.md completo: instalación, variables de entorno, ejecución.
  - Estructura del proyecto explicada.
  - Documentación de endpoints (tabla o colección Postman).
  - Modelo de datos: esquemas de las 3 colecciones.
- **Despliegue:**
  - MongoDB Atlas (cluster free).
  - Render (web service free tier).
  - Pasos: variables en Render, conectar repo, deploy.
  - Pruebas en producción.

### Entregable
API robusta, documentada y desplegada públicamente.

---

## Resumen de endpoints

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| POST | `/api/auth/login` | No | — | Obtener JWT |
| POST | `/api/usuarios` | No | — | Crear usuario |
| GET | `/api/usuarios` | No | — | Listar usuarios |
| GET | `/api/usuarios/:id` | No | — | Ver usuario |
| PUT | `/api/usuarios/:id` | No | — | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | No | — | Eliminar usuario |
| POST | `/api/recetas` | Sí | Autenticado | Crear receta |
| GET | `/api/recetas` | No | — | Listar recetas |
| GET | `/api/recetas/:id` | No | — | Ver receta (poblada) |
| PUT | `/api/recetas/:id` | Sí | Autor/ADMIN | Actualizar receta |
| DELETE | `/api/recetas/:id` | Sí | Autor/ADMIN | Eliminar receta |
| GET | `/api/ingredientes` | No | — | Listar ingredientes |
| GET | `/api/ingredientes/:id` | No | — | Ver ingrediente |

---

## Checklist por clase

| Clase | Foco | Validación |
|-------|------|-----------|
| 1 | Proyecto + persistencia en memoria + CRUD Usuarios | Servidor responde. CRUD funciona sin BD. |
| 2 | JWT + bcrypt | Login devuelve token. Rutas protegidas rechazan sin él. |
| 3 | Roles + CRUD Recetas | STD edita su receta, no la ajena. ADMIN edita cualquiera. |
| 4 | Ingredientes (solo lectura) + relaciones | Listar ingredientes. Receta devuelve ingredientes poblados. |
| 5 | Migración a MongoDB/Mongoose | Mismos endpoints, ahora con persistencia real. Seed desde JSON. |
| 6 | Errores + Docs + Deploy | Errores en JSON. README completo. API pública. |

---

## Decisiones pendientes a consensuar

1. **Registro:** ¿Público o solo ADMIN crea usuarios en el seed? (Recomendación: seed inicial + ADMIN puede crear más).
2. **Hosting:** ¿Render (gratis) o alternativa? (Recomendación: Render + MongoDB Atlas free tier).
