# GEMINI.md

This file provides context and architectural guidance to Gemini (Google AI) when assisting with development in this repository.

---

## Commands

```bash
npm run dev        # Start dev server (binds to 0.0.0.0)
npm run build      # Production build
npm run lint       # ESLint check
npm run preview    # Preview production build
```

---

## Tech Stack

* **Core**: React 19 with Vite, **JavaScript** (No TypeScript).
* **UI Components**: **Ant Design (antd v6)** (Primary) for tables, modals, and forms; **MUI v9** (Secondary) for specific components.
* **Styling**: **Tailwind CSS v4** utility classes.
* **State Management**: **Redux Toolkit** (Global auth state only).
* **Routing**: **React Router v7**.
* **Networking**: **Axios** via a shared `axiosInstance`.
* **Forms**: **Zod** + **React Hook Form**.
* **Visualization**: **Recharts** for dashboard analytics.

---

## Architecture & Routing

### Project Flow
* **Entry**: `src/main.jsx` → `src/app/App.jsx` → `src/routes/AppRouter.jsx`.
* **Security**: All routes are nested under `ProtectedRoute`. Access requires **ADMIN** role and valid Redux auth state.
* **Layout**: `src/layout/Base.jsx` provides the authenticated shell featuring `<Sidebar>`, `<Header>`, and `<Outlet>`.

### Feature Organization
* Features are located in `src/layout/<feature-name>/`.
* Main views (e.g., `ManageProduct.jsx`) reside in the root of the feature folder.
* Supporting components (Tables, Modals) are grouped in `src/layout/<feature>/components/`.

---

## Data Layer & API

### API Configuration
* **Base Instance**: `src/services/axiosInstance.js` automatically attaches `Authorization: Bearer <token>` from `localStorage`.
* **Endpoints**:
    * `9000`: Identity/Auth
    * `9100`: Back-office (Products, Users, Warehouse)
    * `9200`: Product Storage Service
* **Response Handling**: Success is defined by `{ type: 'GOOD', detail: <payload> }`. Always verify `response.data.type === 'GOOD'` before processing `detail`.

### Storage Management (Warehouse)
Located in `src/layout/manage-warehouse/`, utilizing a tabbed interface:
1.  **Sản phẩm & Batch**: Manages `ProductBatch` and `ProductDetail`.
2.  **Kho (Warehouses)**: Physical locations with metadata (address, usage, fridges, racks).
3.  **Công cụ lưu trữ (Storage Tools)**: 
    * **RACK**: Hierarchical creation (StorageTool → Rack → RackLevel).
    * **FRIDGE**: Direct creation (StorageTool → Fridge) with temperature monitoring.

---

## Development Conventions

* **Language**: UI labels, success/error messages, and toast notifications must be in **Vietnamese**.
* **Tables**: Always use Ant Design `<Table>` with `rowKey`, `scroll={{ x: ... }}`, and manual loading states.
* **Forms**: Use **React Hook Form** with **Zod** schema validation.
* **Auth State**: Managed via `AuthSlice.js` and persisted in `localStorage` (`token`, `user`, `role`).
* **Permissions**: Fine-grained control via `@casl/ability` is installed but integration is currently partial.

---

## Gemini Instructions for Code Generation

> When generating code for this project:
> 1.  Use **Functional Components** and React Hooks.
> 2.  Prefer **Ant Design** components for UI consistency unless MUI is specifically required.
> 3.  Ensure all user-facing text is in **Vietnamese**.
> 4.  Follow the established API response pattern (`type === 'GOOD'`).
> 5.  Apply Tailwind CSS v4 classes for layout and spacing adjustments.