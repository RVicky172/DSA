# Architecture & Roadmap

Overview

- Frontend: React (Vite) single-page app in `frontend/`.
- Backend: Node.js + Express API in `backend/`.
- Repo: npm workspaces monorepo with root `package.json`.

Folder layout

- `frontend/` — React app (dev with `npm run dev`).
- `backend/` — Express API (dev with `nodemon`).
- `docs/` — Architecture notes and future backlog.

Key design decisions

- Keep frontend and backend loosely coupled via a versioned REST API under `/api`.
- Start without a DB — keep endpoints returning sample data; plan to add PostgreSQL / MongoDB later.
- Plan for authentication (JWT) and role-based features (students, instructors).

Local development

- Install all dependencies: `npm run install:all`
- Start backend dev server: `npm run start:backend`
- Start frontend dev server: `npm run start:frontend`

Initial API surface (examples)

- `GET /api/health` — health check
- `GET /api/lessons` — list of lesson metadata

Roadmap (next prioritized items)

1. Content model + endpoints: lessons, topics, problems, testcases
2. User model + auth (signup/login, JWT, roles)
3. Problem runner microservice (sandboxed execution)
4. Rich text / Markdown editor for lessons + problem statements
5. CI, deployment, and infra (Heroku/Render/Vercel + managed DB)

Notes

- When adding a DB, add a `services/` directory or a separate workspace if needed for migrations and workers.
- Consider a small admin UI or integrate a headless CMS for non-developer content creation.
