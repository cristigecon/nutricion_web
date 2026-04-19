# Nutricion & Entrenamiento App

Aplicacion web para gestionar plan nutricional diario, entrenamiento, progreso y agenda semanal. El proyecto ya esta dividido en `frontend/` y `backend/`, con autenticacion y sincronizacion basica sobre MongoDB.

## Estructura

- `frontend/`: app React.
- `backend/`: API Express + MongoDB + JWT.

## Funcionalidades actuales

- Plan del dia con bloques de comida y checks.
- Entrenamiento diario con series, repeticiones y peso.
- Agenda semanal de entreno y cardio.
- Historial y grafico semanal.
- Login, registro y sesion persistente.
- Sincronizacion local-first entre `localStorage` y backend.

## Tecnologias

- React
- Express
- MongoDB + Mongoose
- JWT

## Entorno local

### Backend

Crear `backend/.env` con:

```env
MONGO_URI=tu_uri_de_mongo
JWT_SECRET=tu_secreto
PORT=5000
```

Arranque:

```bash
cd backend
npm install
npm start
```

Tests:

```bash
cd backend
npm test
```

### Frontend

Puedes partir de `frontend/.env.example`.

```env
REACT_APP_API_URL=http://localhost:5000
```

Arranque:

```bash
cd frontend
npm install
npm start
```

Build:

```bash
cd frontend
npm run build
```

Tests:

```bash
cd frontend
npm run test:ci
```

## Scripts utiles

### Backend

- `npm start`: arranca la API.
- `npm run dev`: arranca la API con nodemon.
- `npm test`: ejecuta los tests de backend.

### Frontend

- `npm start`: arranca la app React.
- `npm run build`: genera la build de produccion.
- `npm test`: abre el runner interactivo de CRA.
- `npm run test:ci`: ejecuta los tests en modo no interactivo y en serie.

## Estado actual

- Auth backend funcionando.
- Endpoints `days` y `weekly-plan` funcionando.
- Frontend con estado de sincronizacion visible.
- Merge basico por `updatedAt` ya integrado.
- Tests de backend y frontend pasando.
  ddd

## Siguiente trabajo recomendado

- Endurecer conflictos de sincronizacion.
- Anadir tests de backend y frontend.
- Preparar deploy de backend y variables de produccion.
