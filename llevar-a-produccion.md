# Guía práctica: conectar una API REST en Render con MongoDB Atlas

**Objetivo:** publicar una API REST en Render y conectarla correctamente con una base de datos MongoDB Atlas, utilizando variables de entorno para proteger las credenciales.

## Paso 1. Crear la base de datos en MongoDB Atlas

1. Ingresar a https://cloud.mongodb.com/.
2. Crear un proyecto y un cluster (pueden utilizar el plan gratuito M0).
3. En **Database Access**, crear un usuario de base de datos con nombre y contraseña.
4. Asignarle permisos `readWrite` sobre la base que utilizará la API.
5. En **Network Access**, autorizar la IP pública de su computadora para poder conectarse desde MongoDB Compass.

## Paso 2. Obtener la cadena de conexión

1. En Atlas, ingresar al cluster y seleccionar **Connect → Drivers**.
2. Elegir Node.js y copiar la cadena de conexión proporcionada.

Ejemplo:

`mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/mi_base`

Reemplazar el usuario, contraseña y nombre de la base de datos por los valores correspondientes.

**Importante:** si la contraseña contiene caracteres especiales, deben codificarlos correctamente para utilizarlos en una URI.

## Paso 3. Configurar la API localmente

Instalar las dependencias necesarias:

```bash
npm install mongoose dotenv
```

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/mi_base
```

En el código de la aplicación, utilizar `process.env.MONGO_URI` para obtener la cadena de conexión.

Ejemplo:

```javascript
import "dotenv/config";
import mongoose from "mongoose";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Registrar aquí las rutas de la API.

async function iniciarServidor() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("Falta configurar MONGO_URI");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB conectado");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Servidor escuchando en puerto ${PORT}`);
        });
    } catch (error) {
        console.error("Error de conexión:", error.message);
        process.exit(1);
    }
}

iniciarServidor();
```

**Es fundamental utilizar `await mongoose.connect()` antes de iniciar el servidor.** Así evitamos que Express comience a recibir solicitudes sin haber establecido la conexión con MongoDB.

## Paso 4. Proteger las credenciales

Incluir en `.gitignore`:

```gitignore
node_modules/
.env
```

Crear también `.env.example`, sin contraseñas:

```env
PORT=
MONGO_URI=
```

**Nunca subir el archivo `.env` ni las contraseñas a GitHub.**

## Paso 5. Configurar las variables de entorno en Render

1. Ingresar a https://dashboard.render.com/.
2. Seleccionar el Web Service correspondiente a la API.
3. Acceder a la sección **Environment**.
4. Agregar una variable:
   - **Key:** `MONGO_URI`
   - **Value:** la cadena de conexión de MongoDB Atlas, con sus credenciales reales.
5. Configurar también las demás variables que utiliza la API, como `JWT_SECRET` y `CORS_ORIGIN`.
6. Guardar los cambios y aplicarlos al servicio mediante la opción de despliegue o reinicio correspondiente.

Render proporciona un puerto para la aplicación. Por eso debemos utilizar `process.env.PORT` en lugar de fijar un puerto únicamente para producción.

## Paso 6. Autorizar a Render en MongoDB Atlas

Este paso es fundamental: **aunque la cadena de conexión sea correcta, Atlas puede rechazar las conexiones provenientes de Render si su red no está autorizada.**

1. Ingresar al Web Service en Render.
2. Buscar **Connect → Outbound**.
3. Copiar los rangos de direcciones IP salientes (CIDR) que informa Render.
4. Volver a MongoDB Atlas.
5. Ingresar en **Network Access → Add IP Address**.
6. Agregar los rangos correspondientes.

No confundir la IP de nuestra computadora con las IP desde las cuales Render intenta conectarse.

Evitar habilitar permanentemente `0.0.0.0/0`, ya que permite conexiones desde cualquier dirección IPv4.

## Paso 7. Probar la API desplegada

Una vez realizado el deploy:

1. Abrir la URL pública de la API proporcionada por Render.
2. Ejecutar un endpoint que consulte MongoDB, por ejemplo `GET /api/usuarios`.
3. Comprobar que devuelve correctamente los documentos almacenados en Atlas.
4. Probar también una operación de inserción y verificar desde MongoDB Compass que el documento fue guardado.

Si aparece un error como:

`Operation usuarios.find() buffering timed out after 10000ms`

significa que Mongoose no pudo ejecutar la consulta porque no contaba con una conexión disponible.

En ese caso, revisar:

- Las IP autorizadas en Atlas.
- El valor de `MONGO_URI` en Render.
- Los permisos y credenciales del usuario de base de datos.
- Que se espere la conexión con `await mongoose.connect()`.
- Los mensajes de error en **Render → Logs**.

## Checklist final

- [ ] Cluster de MongoDB Atlas creado.
- [ ] Usuario de base de datos configurado con permisos adecuados.
- [ ] IP de desarrollo y rangos de Render autorizados en Atlas.
- [ ] Conexión con Atlas funcionando localmente.
- [ ] Archivo `.env` excluido del repositorio.
- [ ] Variable `MONGO_URI` configurada en Render.
- [ ] Conexión a MongoDB establecida antes de iniciar Express.
- [ ] API accesible desde la URL pública de Render.
- [ ] Operaciones de lectura y escritura funcionando correctamente.

**Resultado esperado:** la API debe poder consultar y modificar los datos almacenados en MongoDB Atlas desde su URL pública, sin depender de que la computadora del desarrollador esté encendida.