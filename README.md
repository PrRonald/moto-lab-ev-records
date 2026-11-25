# Moto Lab EV Record

Proyecto inicializado por **Codex de OpenAI** para Luis Ronald Núñez Valdez, con el objetivo de **llevar a producción el registro operativo de Moto Lab EV**. Esta primera versión permite registrar clientes y vehículos, reservar citas y cancelar reservas con persistencia local. No hay registros de demostración ni credenciales predeterminadas.

## Iniciar en Windows

Utiliza Node.js 24.18 o posterior de la rama 24 y npm. Ejecuta desde la raíz:

```powershell
npm ci
npm run setup
npm run build
npm start
```

Abre http://127.0.0.1:3000. La clave generada está en el archivo local `.env`. El comando de configuración se ejecuta una vez y protege el archivo existente. Entra al panel, registra un cliente, agrega su vehículo y reserva una cita. La hora se introduce y se muestra en la zona horaria de tu navegador. Las reservas se guardan en UTC.

Para desarrollo con recarga, ejecuta `npm run dev:api` y `npm run dev` en dos terminales. Abre la URL de Vite. Su proxy dirige `/api` al puerto 3000. Ejecuta `npm test` para comprobar el flujo HTTP con una base temporal.

## Organización

| Ruta | Responsabilidad |
| --- | --- |
| `api/server.js` | Configuración de arranque, conexión y cierre ordenado |
| `api/app.js` | Composición de Express, controles HTTP y entrega del frontend compilado |
| `api/modules/` | Autenticación, clientes, vehículos y agenda |
| `api/database.js` | Esquema inicial SQLite y restricciones de integridad |
| `web/src/routes/AppRouter.tsx` | Árbol de objetos de React Router, ruta general 404 y límite de errores |
| `web/src/store/` | Redux Toolkit y endpoints de RTK Query |
| `web/src/views/` | Pantallas y formularios con componentes funcionales de exportación nombrada |
| `tests/` | Prueba de integración con Express y SQLite |

El alias `@/` apunta a `web/src/` en TypeScript y Vite. Tailwind CSS se integra con Vite. La interfaz utiliza controles de texto sin iconos. Express sirve la compilación de React y la API bajo un solo origen.

## Reglas de operación

La versión inicial admite un operador y un puesto de taller con bloques de recepción de 30 minutos. El índice único sobre citas activas impide reservas duplicadas. Cancelar conserva el historial y libera el bloque. El teléfono es obligatorio. Cada vehículo pertenece a un cliente. La lista de clientes y vehículos y el historial de citas se cargan completos en esta versión.

## Antes de la puesta en producción

- Ejecutar `npm ci`, `npm test` y `npm run build` sobre la plataforma de despliegue. Revisar dependencias con `npm audit` donde haya acceso al registro.
- Configurar `NODE_ENV=production`, una clave aleatoria de 64 caracteres hexadecimales en `OPERATOR_KEY` y un proxy inverso HTTPS en la misma máquina. El servidor escucha en loopback. En producción la cookie exige HTTPS.
- Montar un volumen persistente para `DATABASE_PATH` (predeterminado `data/workshop.sqlite`). Usar una instancia de escritura. Preparar copias mediante el mecanismo de backup de SQLite y verificar una restauración antes de introducir datos reales.
- Las sesiones vencen a las ocho horas. Para revocar todos los accesos, cambiar la clave, invalidar las filas de `sessions` y reiniciar el servicio.
- Validar con el taller la duración de los bloques y el acceso de un solo operador. Para varios empleados se requieren cuentas individuales, autorización por rol y trazabilidad por persona. El despliegue público, el monitoreo y la recuperación operativa quedan pendientes.

