# Chess State frontend

React + TypeScript app built with [Vite](https://vite.dev). Tests run on [Vitest](https://vitest.dev).

## Scripts

- `npm run dev` (alias `npm start`) — regenerate the API client and start the dev server on [http://localhost:3000](http://localhost:3000).
- `npm run dev:exploration-preview` — dev server in exploration preview mode (`VITE_PREVIEW=true`).
- `npm run build` — regenerate the API client, typecheck, and build to `build/`.
- `npm run preview` — serve the production build locally.
- `npm test` — Vitest (watch mode locally, single run when `CI=true`); `npm run test:run` for a single run.
- `npm run lint` — ESLint (flat config in `eslint.config.js`), zero warnings allowed.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run generate-api` — regenerate `src/api/` from `openapi.json` (uses `custom-request.ts`).

## Environment

Copy `.env.example` to `.env`. Variables must use the `VITE_` prefix to be exposed to the app:

- `VITE_API_URL` — backend base URL without `/api` (overrides `VITE_IS_LOCAL`).
- `VITE_IS_LOCAL` — `true` to use `http://localhost:8000`.

## Deployment

Vercel builds pushes to `master` (`vercel.json`: Vite framework, `npm run build`, output `build/`, SPA rewrite to `index.html`).
