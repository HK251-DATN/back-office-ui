# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (binds to 0.0.0.0)
npm run build      # Production build
npm run lint       # ESLint check
npm run preview    # Preview production build
```

No test runner is configured.

## Environment Configuration

API base URLs are managed via environment variables in `.env`:
- `VITE_API_AUTH_URL` — identity/auth service (default: `http://localhost:9000`)
- `VITE_API_MAIN_URL` — main back-office service (default: `http://localhost:9100`)
- `VITE_API_STORAGE_URL` — product storage service (default: `http://localhost:9200`)

Import from `src/config/api.js` as `API_URLS.AUTH`, `API_URLS.MAIN`, `API_URLS.STORAGE`.

## Tech Stack

- **React 19** with Vite, JavaScript (no TypeScript)
- **Ant Design (antd v6)** — primary UI component library for tables, modals, forms, buttons
- **MUI v9** — used alongside antd in some components
- **Tailwind CSS v4** — utility classes for layout
- **Redux Toolkit** — global auth state only
- **React Router v7** — routing
- **Axios** — API calls via a shared `axiosInstance`
- **Zod + React Hook Form** — form validation
- **React Toastify** — toast notifications
- **Recharts** — dashboard charts

## Architecture

### Entry Points
- `src/main.jsx` → `src/app/App.jsx` (BrowserRouter) → `src/routes/AppRouter.jsx`
- `src/routes/AppRouter.jsx` defines all routes, all nested under a `ProtectedRoute` that checks Redux auth state. All protected routes require `ADMIN` role.
- `src/layout/Base.jsx` is the authenticated shell: `<Sidebar>` + `<Header>` + `<Outlet>`.

### Feature Layout
Each feature lives in `src/layout/<feature-name>/`:
- Main component: `ManageProduct.jsx`, `ManageEmployee.jsx`, etc.
- Sub-components (tables, modals): `src/layout/<feature>/components/`

### API Layer
- `src/services/axiosInstance.js` — axios instance with a request interceptor that reads `localStorage.getItem('token')` and attaches it as `Authorization: Bearer <token>`.
- Service files (e.g., `src/services/userService.js`) use this instance. Some components call `axiosInstance` directly for CRUD.
- Backend endpoints:
  - `http://localhost:9000` — identity/auth service (login)
  - `http://localhost:9100` — main back-office service (products, users, warehouse, etc.)
  - `http://localhost:9200` — product storage service
- Standard API response shape: `{ type: 'GOOD', detail: <payload> }` on success; check `response.data.type === 'GOOD'` before using `response.data.detail`.

### Auth / State
- `src/store/slices/AuthSlice.js` — Redux slice for `{ user, token, role, isAuthenticated }`. Persisted to `localStorage` keys: `token`, `user`, `role`.
- `src/routes/ProtectedRoute.jsx` — redirects to `/login` if not authenticated, or `/unauthorized` if role not in `allowedRoles`.
- `@casl/ability` + `@casl/react` are installed for fine-grained permissions but not yet fully integrated.

### UI Conventions
- UI labels and messages are in **Vietnamese**.
- Tables use Ant Design `<Table>` with `rowKey`, `scroll={{ x: ... }}`, and local state for loading/error.
- Modals for create/edit/view are kept in the feature's `components/` folder and opened via boolean state + selected record in the parent table component.
- Some features (employee, buyer) still use mock data from `src/mocks/`.

### Storage Management System
The warehouse management module (`src/layout/manage-warehouse/`) uses a tabbed interface with three main sections:

1. **Sản phẩm & Batch** — Product batches and product details (existing functionality)
   - ProductBatchTable / ProductBatchCreateModal
   - ProductDetailTable / ProductDetailCreateModal

2. **Kho (Warehouses)** — Physical warehouse locations
   - WarehouseTable / WarehouseFormModal
   - Each warehouse has: address, usagePercentage, numOfFridge, numOfRack

3. **Công cụ lưu trữ (Storage Tools)** — Racks and fridges
   - StorageToolTable / StorageToolCreateModal
   - **Storage Tool** is the parent entity with type (RACK/FRIDGE), status (ACTIVE/INACTIVE/FULL/IN_MAINTAINANCE), and warehouseId
   - Creating a storage tool requires creating multiple entities:
     - For RACK: StorageTool → Rack → RackLevel (one per level)
     - For FRIDGE: StorageTool → Fridge
   - RackDetailModal shows rack levels with usage percentages
   - FridgeDetailModal shows temperature monitoring (curTemp, minTemp, maxTemp) with visual indicators

All storage APIs use `http://localhost:9200` base URL.
