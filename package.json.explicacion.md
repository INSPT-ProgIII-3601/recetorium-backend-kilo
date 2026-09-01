# Explicación del `package.json`

El archivo `package.json` es la "huella digital" del proyecto
de Node.js. Como está en formato JSON, **no admite comentarios**
(`//` o `/* */` no son válidos ahí). Por eso esta explicación
vive en un `.md` aparte.

---

## Bloque por bloque

```json
{
  "name": "recetorium",
  "version": "1.0.0",
  "description": "API REST de recetas de cocina - Proyecto educativo",
  "main": "src/app.js",
  "scripts": { ... },
  "dependencies": { ... },
  "keywords": ["api", "recetas", "express", "nodejs"],
  "author": "",
  "license": "ISC"
}
```

### `name`
Nombre del proyecto. Se usa cuando lo publicás en npm
(por ahora no es nuestro caso). En minúsculas, sin espacios.

### `version`
Versión actual siguiendo [SemVer](https://semver.org/):
`MAYOR.MINOR.PATCH` (1.0.0 = primera versión estable).

### `description`
Descripción corta. Aparece en `npm search`, en GitHub, etc.

### `main`
Archivo de entrada. Algunos paquetes lo usan para saber qué
importar por defecto. Acá decimos que el "main" es `src/app.js`
(nuestro punto de entrada).

### `scripts`
Comandos personalizados que se ejecutan con `npm run <nombre>`.

- `start`: corre la app con Node normal. Lo usarías en el
  servidor de producción.
  ```bash
  npm start
  ```

- `dev`: usa `node --watch`, que es la opción moderna (a partir
  de Node 18) para reiniciar automáticamente el servidor cuando
  modificás un archivo. Es como `nodemon` pero sin instalar nada.
  ```bash
  npm run dev
  ```

### `dependencies`
Las librerías que tu app NECESITA para correr. Acá tenemos:

- **express** (`^4.18.2`): el framework web que usamos para
  definir rutas, middlewares y levantar el servidor HTTP.
- **dotenv** (`^16.3.1`): lee el archivo `.env` y carga las
  variables en `process.env`. Sirve para no hardcodear datos
  sensibles (puertos, claves, URLs) en el código.
- **cors** (`^2.8.5`): middleware que permite que el frontend
  (en otro dominio) consuma esta API sin que el navegador
  bloquee las peticiones.

> El `^` delante de la versión significa "cualquier versión
> compatible 4.x.x". Cuando corrés `npm install`, npm descarga
> la última compatible y la registra en `package-lock.json`.

### `keywords`
Etiquetas para encontrar el paquete en npm. No afecta al
funcionamiento.

### `author`
Tu nombre / empresa. Cuando lo llenes, queda asentado acá.

### `license`
Tipo de licencia. `ISC` es una licencia permisiva similar a MIT
(la podés usar comercialmente, modificarla, etc.).
