// ============================================================
//  Usuario.js — Modelo de Usuario
// ============================================================
// Un "modelo" representa UNA entidad de la aplicación (en este
// caso, un usuario). Define qué datos tiene y qué reglas
// (validaciones) debe cumplir.
//
// Acá usamos una CLASE de JavaScript con campos privados
// (los # al principio). Esto se llama ENCAPSULAMIENTO:
// desde afuera de la clase no se puede acceder ni modificar
// directamente mail/clave/tipo; hay que pasar por los getters
// y por el setId controlado.
// ============================================================

export class Usuario {
  // --- Campos privados (con #) ---
  // No se pueden leer ni escribir desde fuera de la clase.
  // Esto protege los datos: por ejemplo, la clave (#clave)
  // queda "escondida" y solo se devuelve en toJSON() si
  // nosotros explícitamente lo permitimos.
  #id;
  #mail;
  #clave;
  #tipo;
  #perfil;

  // --- Constructor ---
  // Se ejecuta cuando hacemos "new Usuario({...})".
  // Acá recibimos los datos y aplicamos las validaciones.
  // Si algo está mal, lanzamos un Error que después el
  // controller atrapará con try/catch.
  constructor({ mail, clave, tipo = 'STD', perfil = {} }) {
    // Cada "this.#campo = this.validarX(...)" corre la
    // validación y, si pasa, guarda el valor. Si no pasa,
    // la validación lanza Error y el constructor se corta.
    this.#mail = this.validarMail(mail);
    this.#clave = this.validarClave(clave);
    this.#tipo = this.validarTipo(tipo);
    this.#perfil = perfil;
  }

  // --- Validaciones ---
  // Cada método valida UNA regla. Lanzan Error si no se cumple.
  // Más adelante podemos moverlas a una librería como "zod"
  // o "express-validator", pero por ahora las escribimos a mano
  // para entender la idea.

  // El mail tiene que existir y contener un "@".
  // (Esta validación es BÁSICA; en producción usamos regex
  // más estrictas, por ejemplo del RFC 5322.)
  validarMail(mail) {
    if (!mail || !mail.includes('@')) {
      throw new Error('El mail es inválido');
    }
    return mail;
  }

  // La clave debe tener al menos 4 caracteres. (También es
  // una validación floja; en producción pediríamos mayúsculas,
  // números, símbolos, etc., y la guardaríamos hasheada con
  // bcrypt, nunca en texto plano.)
  validarClave(clave) {
    if (!clave || clave.length < 4) {
      throw new Error('La clave debe tener al menos 4 caracteres');
    }
    return clave;
  }

  // El tipo solo puede ser 'ADMIN' o 'STD' (estándar/usuario
  // común). Usamos un array con los valores permitidos.
  validarTipo(tipo) {
    if (!['ADMIN', 'STD'].includes(tipo)) {
      throw new Error('El tipo de usuario debe ser ADMIN o STD');
    }
    return tipo;
  }

  // --- Getters ---
  // Permiten LEER los campos privados desde afuera, pero no
  // modificarlos. Por eso el id solo tiene getter (es único
  // y lo asigna el "db", no el cliente).
  get id() { return this.#id; }
  get mail() { return this.#mail; }
  get clave() { return this.#clave; }
  get tipo() { return this.#tipo; }
  get perfil() { return this.#perfil; }

  // --- Setter controlado del id ---
  // No dejamos "set id" público porque no queremos que
  // cualquiera lo cambie. En cambio, exponemos setId(id)
  // para que SOLO la capa de datos (db.js) lo asigne al
  // crear/actualizar.
  setId(id) { this.#id = id; }

  // --- Serialización a JSON ---
  // Cuando Express responde con res.json(usuario), internamente
  // llama a usuario.toJSON(). Devolvemos un objeto "limpio":
  //   - SIN la clave (por seguridad, no la mandamos al cliente).
  //   - SIN campos internos como __v.
  // Si querés que el id aparezca como "_id" (estilo MongoDB),
  // lo cambiamos acá en un futuro.
  toJSON() {
    return {
      id: this.#id,
      mail: this.#mail,
      tipo: this.#tipo,
      perfil: this.#perfil,
    };
  }
}
