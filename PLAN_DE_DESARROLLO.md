# Plan de desarrollo integrado: Backend + Usuario/Login + Sincronizacion

Este documento recoge lo completado y lo que queda por hacer.

## Fase 0 - Auditoria inicial y documentacion
- [x] La app actual funciona con localStorage.
- [x] Datos principales identificados: plan diario, comidas check, entrenamientos, agenda semanal.
- [x] README.md creado con descripcion completa de la app.

## Fase 1 - Normalizacion + abstraccion de storage
### Modelo de datos (MVP)
- [x] User: id, email, passwordHash.
- [x] Day: id, userId, date, isPerfectDay, progress.
- [x] MealCheck: id, dayId, mealType, completed.
- [x] Workout: id, dayId, completed, exercises[].
- [x] WeeklyPlan: id, userId, days[].

### Storage abstraction
- [x] Crear modulo `src/services/storage.js` con funciones para dias, comidas, agenda, entreno y helpers.
- [x] Reemplazar accesos directos a localStorage en la app actual.

## Fase 2 - Backend MVP + conexion a base de datos
### Stack
- [x] Node.js + Express configurado.
- [x] MongoDB Atlas + Mongoose.
- [x] CORS configurado.
- [x] dotenv para variables de entorno.

### Conexion DB
- [x] Configuracion de conexion en `backend/config/db.js`.
- [x] Modelo User en `backend/models/User.js`.
- [x] Conexion a MongoDB Atlas verificada con la URI actual.

### Endpoints de auth
- [x] Middleware auth en `backend/middleware/auth.js` (JWT).
- [x] Controlador auth en `backend/controllers/authController.js` (register, login, me con bcrypt).
- [x] Rutas auth en `backend/routes/auth.js`.
- [x] Servidor en `backend/index.js` con rutas montadas.
- [x] Endpoints probados manualmente: `register`, `login` y `me`.

## Fase 3 - API service en frontend
- [x] Crear `src/services/api.js` con `fetchWithAuth`.
- [x] Implementar manejo de token en localStorage e inclusion en headers.

## Fase 4 - UI de login/registro
- [x] Crear componentes `Login.js` y `Register.js`.
- [x] Integrar con API service.
- [x] Agregar estado global de autenticacion con Context.
- [x] Añadir logout basico y bootstrap de sesion.

## Fase 5 - Sincronizacion local-first
- [x] Mantener localStorage como fuente primaria.
- [x] Sincronizar al login con el servidor.
- [x] Implementar merge local-server con `updatedAt`.
- [x] Debounce de updates para evitar multiples requests inmediatos.
- [ ] Manejo de conflictos y resolucion manual.
- [x] Manejo offline y reconexion con cola pendiente.

## Fase 6 - Endpoints de datos
- [x] GET `/days`.
- [x] POST `/days`.
- [x] PUT `/days/:id`.
- [x] GET `/weekly-plan`.
- [x] PUT `/weekly-plan`.

## Fase 7 - Testing y deployment
- [x] Tests unitarios para storage y API.
- [x] Backend tests para auth y data routes.
- [x] Pruebas de comportamiento base de sincronizacion.
- [x] Deploy backend (Railway, Render o similar).
- [ ] Mantener frontend desplegado en Vercel.
- [ ] Configurar CI/CD basico.

## Estado actual
- **Completado**: Fases 0-4, endpoints de datos, despliegue del backend y nucleo de sincronizacion local-first.
- **En progreso**: endurecer conflictos de sync y cerrar el hardening de produccion.
- **Pendiente**: resolucion manual de conflictos, despliegue estable del frontend y CI/CD.
- **Bloqueo principal**: Ninguno en auth/Mongo; el siguiente trabajo es resolver conflictos de sync y observabilidad.

## Resumen rapido
- Abstraccion de storage completada.
- Backend de auth funcionando con Mongo.
- Frontend con login/registro y sesion persistente.
- Endpoints de `days` y `weekly-plan` ya creados.
- Sync local-first funcional con estado visible, soporte offline y reintento al reconectar.
- Tests de backend y frontend pasando.
