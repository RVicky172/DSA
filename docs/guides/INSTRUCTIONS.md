# Development Instructions & Extension Roadmap

This file outlines how to work on the repository, run the project locally, coding conventions, and a recommended roadmap for extending the DSA learning site.

1) Local setup and common commands

- Install all workspace dependencies (run from repository root):

  ```bash
  npm run install:all
  ```

- Start backend (development):

  ```bash
  npm run start:backend
  ```

- Start frontend (development):

  ```bash
  npm run start:frontend
  ```

- Start both (background):

  ```bash
  npm run start
  ```

2) Branching & workflow

- Feature branches: `feature/<short-desc>` (e.g. `feature/lessons-api`).
- Bugfix branches: `fix/<short-desc>`.
- Release branches: `release/<version>`.
- Pull requests: open PRs against `main`; include description, testing steps, and link to issue if present.

3) Code style & linting (recommended)

- Add `eslint` with a shared config (Airbnb or recommended React config) and `prettier` for formatting.
- Before committing, run linter and formatter. Consider adding Husky + lint-staged for pre-commit checks.

4) Frontend conventions

- Framework: React (Vite). Use functional components with hooks.
- File layout (suggested):
  - `frontend/src/components/` — presentational and shared components
  - `frontend/src/pages/` — route-level components
  - `frontend/src/services/` — API client code
  - `frontend/src/styles/` — global and component styles
- Networking: keep API calls in a central `services/api.js` so it's easy to swap endpoints and add auth headers.

5) Backend conventions

- Framework: Express.
- File layout (suggested):
  - `backend/src/routes/` — route definitions
  - `backend/src/controllers/` — handler logic
  - `backend/src/services/` — business logic and data access
  - `backend/src/models/` — DB models (when adding a DB)
  - `backend/src/middleware/` — auth, error handling, validation
- API versioning: prefix routes with `/api/v1/` to allow future breaking changes.

6) Environment & secrets

- Keep environment variables out of source. Use `.env` locally and include `.env.example` with required keys.
- Typical variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`.

7) Testing

- Frontend: use `vitest` or `jest` and `@testing-library/react` for component tests.
- Backend: use `jest` / `mocha` + `supertest` for API tests.
- Add CI job to run tests on PRs.

8) Database & migrations (next step)

- Start with SQLite for quick prototyping or Postgres for production.
- Use an ORM (Prisma recommended) or query builder (Knex) and include migrations and seeds.

9) Authentication & authorization

- Use JWT for stateless auth initially. Keep auth middleware in `backend/src/middleware/auth.js`.
- Plan for roles: `student`, `instructor`, `admin`.

10) Problem execution/sandbox (advanced)

- Running user-submitted code requires isolation. Consider using:
  - Remote sandboxed service (e.g. judge0, or a dedicated microservice using Docker containers)
  - Strict resource limits and careful input validation
- Start by integrating a third-party judge or stubbed runner returning precomputed results.

11) CI/CD recommendations

- Add GitHub Actions workflow to: run tests, lint, and build frontend.
- Deploy backend to Heroku/Render/Cloud Run and frontend to Vercel/Netlify or serve the built frontend from the backend.

12) Security & best practices

- Validate and sanitize all user inputs.
- Never log secrets. Rotate keys regularly.
- Use HTTPS in production.

13) PR checklist (suggestion)

- [ ] Branch is up-to-date with `main`.
- [ ] Linter passes and code formatted.
- [ ] Tests added / updated and all passing.
- [ ] API changes documented in `docs/architecture.md` or endpoint docs.

14) Extension roadmap (prioritized next features)

1. Content model & API (lessons, topics, problems, testcases) — implement DB and migrations.
2. User accounts & auth (signup/login, JWT, roles).
3. Lesson editor — markdown support + preview; admin UI or CMS integration.
4. Problem runner integration — start with external judge, later self-hosted sandbox.
5. UI library + component system — design tokens, Storybook for components.
6. CI/CD + deployment to staging and production.
7. Analytics and progress tracking for learners.

15) How you can contribute (quick)

- Pick an open item from the roadmap in `docs/architecture.md` or create an issue describing the change.
- Create a branch, implement the feature with tests, and open a PR.

16) Contact and references

- Repository owner: `RVicky172` (see GitHub repo for issues and discussions).
- Helpful libs:
  - Frontend: `react-router`, `axios`/`fetch`, `zustand` or `redux` (optional)
  - Backend: `express`, `prisma` (ORM), `joi` or `zod` (validation)

If you'd like, I can now:
- add an example API client in `frontend/src/services/api.js` and a component that fetches `/api/lessons`, or
- add ESLint/Prettier configs and Husky pre-commit hooks, or
- create a GitHub Actions workflow template for CI.
