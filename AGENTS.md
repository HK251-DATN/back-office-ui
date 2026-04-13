# AGENTS.md

## Commands
```bash
npm run dev      # Dev server (binds to 0.0.0.0)
npm run build    # Production build
npm run lint     # ESLint check
```
No test runner configured.

## API Conventions
- Check `response.data.type === 'GOOD'` before using `response.data.detail`
- Three backend services:
  - `http://localhost:9000` — auth/identity
  - `http://localhost:9100` — main back-office
  - `http://localhost:9200` — product storage (warehouse)

## ESLint
- Unused vars with `_` prefix or `ALL_CAPS` are ignored: `no-unused-vars: ['error', { varsIgnorePattern: '^[A-Z_]' }]`

## UI
- All labels/messages are in **Vietnamese**

## Storage Management (localhost:9200)
Entity creation order matters:
1. StorageTool (RACK/FRIDGE)
2. Rack/Fridge (links to StorageTool)
3. For RACK: create RackLevel entities (one per level)

## More Context
See `CLAUDE.md` for detailed architecture and `instructions/StorageManagementUiInstructions.md` for warehouse/storage API specs.
