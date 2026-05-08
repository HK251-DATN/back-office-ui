# AGENTS.md

## Commands
```bash
npm run dev      # Dev server (binds to 0.0.0.0)
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```
No test runner configured.

## Tech Stack
- JavaScript (no TypeScript)
- React 19 + Vite, Ant Design v6 + MUI v9, Tailwind CSS v4
- Redux Toolkit (global auth state only), React Router v7
- Axios via shared `src/services/axiosInstance.js` (attaches Bearer token from localStorage)

## API Conventions
- Standard response: `{ type: 'GOOD' | 'SKIP_AS_GOOD' | <error>, detail: <payload> }`
- Check `response.data.type === 'GOOD' || response.data.type === 'SKIP_AS_GOOD'` before using `detail`
- API base URLs via `VITE_*` env vars, imported from `src/config/api.js` as `API_URLS`:
  - `AUTH` (default: `http://localhost:9000`) — auth/identity
  - `MAIN` (default: `http://localhost:9100`) — main back-office
  - `STORAGE` (default: `http://localhost:9200`) — product storage
  - `ECOMMERCE` (default: `http://localhost:9300`) — ecommerce

## Architecture
- Entry: `src/main.jsx` → `src/app/App.jsx` → `src/routes/AppRouter.jsx`
- Features live in `src/layout/<feature-name>/`, subcomponents in `components/` folder
- All routes protected by `ProtectedRoute`: requires `ADMIN` role, redirects unauthenticated to `/login`

## ESLint
- Unused vars with `_` prefix or `ALL_CAPS` are ignored: `no-unused-vars: ['error', { varsIgnorePattern: '^[A-Z_]' }]`

## UI
- All labels/messages are in **Vietnamese**

## Storage Management (localhost:9200)
Entity creation order matters:
1. StorageTool (RACK/FRIDGE)
2. Rack/Fridge (links to StorageTool)
3. For RACK: create RackLevel entities (one per level)

## References
- Detailed architecture: `CLAUDE.md`
- Module-specific API specs: `instructions/` (e.g., `StorageManagementUiInstructions.md`)
