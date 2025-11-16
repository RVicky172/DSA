# Copilot Instructions for DSA Learning Platform

## Architecture Overview

This is a **monorepo-based DSA learning platform** with loose frontend/backend coupling:

- **Frontend**: React 18 + Vite (port 3000), in `frontend/`
- **Backend**: Express.js API (port 4000), in `backend/`
- **Monorepo**: npm workspaces in root `package.json`
- **Current state**: Scaffolding phase—backend returns sample data (no database yet)

**Key design principle**: Versioned REST API under `/api` (plan to prefix with `/api/v1/` for future expansions). Frontend and backend should remain loosely coupled.

## Critical Workflows & Commands

### Local Development
```bash
npm run install:all          # Install all workspace dependencies
npm run start:backend        # Dev backend (nodemon auto-restart on changes)
npm run start:frontend       # Dev frontend (Vite dev server, HMR)
npm run start                # Both together (runs in background)
```

### Important: Backend Setup
- Backend runs on **port 4000** (or `PORT` env var)
- Uses `dotenv` for config; check `.env.example` for required variables
- CORS already enabled for frontend integration

### Frontend Setup
- Vite dev server with React Fast Refresh HMR
- Entry: `frontend/src/main.jsx` → mounts `App.jsx` to `#root`
- CSS: global styles in `styles.css` with CSS variables (`:root`)

## Project-Specific Conventions

### Backend (Express)

**Current structure:**
- Single-file entry at `backend/src/index.js`
- Routes: `GET /api/health` (health check), `GET /api/lessons` (sample data)
- Error handling: centralized middleware at bottom

**When expanding, follow this structure:**
- `backend/src/routes/` — route definitions with `/api` prefix
- `backend/src/controllers/` — request handlers
- `backend/src/services/` — business logic
- `backend/src/middleware/` — auth, validation, error handling

**API responses**: Return consistent JSON structure, e.g. `{ lessons: [...] }` or `{ error: "..." }`

### Frontend (React)

**Current structure:**
- Single `App.jsx` entry component
- Styles in `styles.css` (no CSS-in-JS framework yet)
- No routing, API client, or state management yet

**When expanding, follow this structure:**
- `frontend/src/components/` — reusable UI components
- `frontend/src/pages/` — page-level components (for future routing)
- `frontend/src/services/api.js` — centralized API client (import fetch/axios calls here)
- `frontend/src/styles/` — organized CSS or component styles

**API calls**: Keep all backend calls in `services/api.js` for easy endpoint swaps and auth header injection.

## Integration Points & Data Flow

**Frontend → Backend**: 
- Frontend makes GET/POST requests to `http://localhost:4000/api/*`
- Example: `fetch('/api/lessons').then(r => r.json())`

**No database yet**: Backend currently returns hardcoded sample data. When adding a DB (PostgreSQL/MongoDB), create `backend/src/models/` directory and migrate data access to services layer.

**Authentication (planned)**: Will use JWT; store token in localStorage client-side, inject via `Authorization: Bearer <token>` header in API calls.

## Development Patterns to Follow

1. **New API endpoint**: 
   - Add route to `backend/src/index.js` (or `routes/` folder if refactoring)
   - Return JSON response
   - Test via `curl` or Postman; check CORS allows frontend

2. **New React component**:
   - Create functional component in `frontend/src/components/`
   - Use React hooks (no class components)
   - Import styles from `frontend/src/styles/`

3. **Environment variables**:
   - Backend: add to `backend/.env.example` and load via `require('dotenv').config()`
   - Frontend: add to root `.env.local` if needed (Vite exposes via `import.meta.env.*`)

## Dependencies to Know

**Backend**: `express`, `cors`, `dotenv`, `nodemon` (dev)
**Frontend**: `react`, `react-dom`, `vite`, `@vitejs/plugin-react` (dev)

**When adding features, preferred libraries** (per `docs/INSTRUCTIONS.md`):
- API calls: `axios` or native `fetch`
- State management: `zustand` or `redux` (optional)
- Routing: `react-router`
- Validation: `joi` or `zod` (backend), `zod` or custom (frontend)
- Testing: `vitest`/`jest` + `@testing-library/react` (frontend), `jest`+`supertest` (backend)

## Known Roadmap & Next Steps

**High-priority** (from `docs/architecture.md`):
1. Content model: lessons → topics → problems → testcases (add DB + endpoints)
2. User authentication (JWT, roles: student/instructor/admin)
3. Problem execution/sandbox (external judge integration)
4. Rich editor for lessons (Markdown)
5. CI/CD + deployment pipeline

**When adding features**, consult `docs/INSTRUCTIONS.md` and `docs/architecture.md` for rationale and suggestions.

## Tips for AI Agents

- Always verify that both `npm run start:backend` and `npm run start:frontend` work after major changes
- Keep API contracts stable; frontend and backend versions should align
- Add sample data / mocks to `backend/src/index.js` before implementing real DB
- Reference existing endpoint (`/api/lessons`) as a template for new routes
- Use `.env.example` as source of truth for required environment variables
