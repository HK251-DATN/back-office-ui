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
- `VITE_API_ECOMMERCE_URL` — ecommerce service (default: `http://localhost:9300`)

Import from `src/config/api.js` as `API_URLS.AUTH`, `API_URLS.MAIN`, `API_URLS.STORAGE`, `API_URLS.ECOMMERCE`.

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

Available features (routes):

**Manager/Admin Routes:**
- `/dashboard` — Dashboard with summary statistics
- `/manage-employee` — Employee management
- `/manage-customer` — Customer/buyer management
- `/manage-product` — Product general information
- `/manage-category` — 3-tier category management (Category → Subcategory → SubSubcategory)
- `/manage-warehouse` — Warehouse, storage tools, product batches
- `/manage-packaging` — Packaging task management (manager view)
- `/manage-shipping` — Delivery and driver management
- `/manage-order` — Order processing and confirmation
- `/manage-content` — Content management
- `/manage-sale-event` — Sales event/promotion management
- `/system-setting` — System configuration

**Employee Routes:**
- `/packaging/employee` — Packaging employee interface (warehouse floor staff)
- `/delivery/employee` — Delivery employee interface (delivery drivers)

### API Layer
- `src/services/axiosInstance.js` — axios instance with a request interceptor that reads `localStorage.getItem('token')` and attaches it as `Authorization: Bearer <token>`.
- Service files (e.g., `src/services/categoryService.js`, `src/services/userService.js`) export named functions that call `axiosInstance`. Pattern:
  ```js
  import axios from './axiosInstance';
  import { API_URLS } from '../config/api';
  const BASE = `${API_URLS.MAIN}/api/endpoint`;
  export const getItems = () => axios.get(BASE);
  export const getItemById = (id) => axios.get(`${BASE}/${id}`);
  export const createItem = (data) => axios.post(BASE, data);
  ```
- Some components call `axiosInstance` directly for CRUD instead of using service files.
- Backend endpoints:
  - `http://localhost:9000` — identity/auth service (login)
  - `http://localhost:9100` — main back-office service (products, users, warehouse, etc.)
  - `http://localhost:9200` — product storage service
  - `http://localhost:9300` — ecommerce service (orders)
- Standard API response shape: `{ type: 'GOOD', detail: <payload> }` on success; check `response.data.type === 'GOOD'` before using `response.data.detail`.

### Auth / State
- `src/store/slices/AuthSlice.js` — Redux slice for `{ user, token, role, isAuthenticated }`. Persisted to `localStorage` keys: `token`, `user`, `role`.
- `src/routes/ProtectedRoute.jsx` — redirects to `/login` if not authenticated, or `/unauthorized` if role not in `allowedRoles`.
- `@casl/ability` + `@casl/react` are installed for fine-grained permissions but not yet fully integrated.

### UI Conventions
- UI labels and messages are in **Vietnamese**.
- Tables use Ant Design `<Table>` with `rowKey`, `scroll={{ x: ... }}`, and local state for loading/error.
- Modals for create/edit/view are kept in the feature's `components/` folder and opened via boolean state + selected record in the parent table component.
- Reusable action buttons: `<ViewButton>`, `<EditButton>`, `<DeleteButton>` from `src/components/`.
- Dashboard pages often use `<SummaryCard>` components for statistics display.
- Some features (employee, buyer) still use mock data from `src/mocks/`.
- Multi-section features use Ant Design `<Tabs>` (e.g., category management has 3 tabs, warehouse has 3 tabs).

### Category Management
The category module (`src/layout/manage-category/`) implements a 3-tier hierarchy using tabs:
1. **Danh mục chính (Category)** — Top-level categories
2. **Danh mục con (Subcategory)** — Second-level, linked to parent category
3. **Danh mục chi tiết (SubSubcategory)** — Finest granularity, linked to products

Category API endpoints: `${API_URLS.MAIN}/api/categories`
- Subcategories: `/api/categories/{parentId}/subcategories`
- SubSubcategories: `/api/categories/sub-subcategories`

### Warehouse Management
The warehouse module (`src/layout/manage-warehouse/`) uses a tabbed interface with three sections:

1. **Sản phẩm & Batch** — Product batches and product details
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

All storage APIs use `${API_URLS.STORAGE}` (`http://localhost:9200`).

### Packaging Employee Interface

The packaging employee module (`src/layout/packaging-employee/`) provides a mobile-first interface for warehouse floor staff to execute packaging tasks.

**Route:** `/packaging/employee`  
**Access:** `ADMIN`, `EMPLOYEE` roles

**Features:**
1. **Available Orders (Đơn hàng sẵn sàng)** — Tab showing orders with CONFIRMED status
   - Orders that have been confirmed and are ready to be packaged
   - "Bắt đầu" button to claim an order
   - Displays customer info, item counts, order summaries

2. **My Packaging Tasks (Nhiệm vụ của tôi)** — Tab showing employee's active packaging tasks
   - Orders with PACKING status assigned to current employee
   - Visual progress indicators (0-100%)
   - "Chi tiết" button opens task execution modal
   - Auto-refresh every 30 seconds

3. **Task Execution Modal** — Step-by-step packaging workflow
   - Order information tab with complete order details
   - Pick list tab showing items to package
   - Product selection for each order item
   - Real-time progress tracking

**Key APIs:**
- `GET /api/order/admin?status=CONFIRMED` — Get available orders
- `GET /api/orders/admin/order-summary?status=CONFIRMED` — Get order summaries
- `PUT /api/order/:orderId/package` — Start packaging (changes status to PACKING)
- `GET /api/order/emp/packaging-tasks` — Get employee's packaging tasks
- `GET /api/pick-list/:orderId` — Get pick list for order
- `GET /api/pick-list/product-detail-list/:orderItemId` — Get available products
- `PUT /api/pick-list/:orderItemId/link/:productDetailId` — Link product to order item

**Components:**
- `PackagingEmployee.jsx` — Main container with tabs
- `AvailableOrdersTable.jsx` — Shows CONFIRMED orders
- `MyPackagingTasksTable.jsx` — Shows PACKING orders
- `TaskExecutionModal.jsx` — Order details and pick list
- `ProductSelectionModal.jsx` — Product selection interface

**Service:** `src/services/packagingEmployeeService.js`

**Mobile-First Design:**
- Large touch targets (min 48px height)
- Responsive layout for tablets/phones
- High contrast colors for warehouse lighting
- Auto-refresh with success feedback

### Delivery Employee Interface

The delivery employee module (`src/layout/delivery-employee/`) provides a mobile-first interface for delivery drivers to manage delivery tasks.

**Route:** `/delivery/employee`  
**Access:** `ADMIN`, `EMPLOYEE` roles

**Features:**
1. **Ready for Delivery (Đơn hàng sẵn sàng)** — Tab showing orders ready to deliver
   - Orders with READY_FOR_PICKUP status
   - Combined API calls to fetch order + delivery information
   - Click-to-call phone numbers
   - Click-to-map delivery addresses
   - COD amount display
   - "Bắt đầu giao" button to accept delivery task

2. **My Delivery Tasks (Nhiệm vụ của tôi)** — Tab showing employee's active deliveries
   - Orders with SHIPPING status assigned to current employee
   - Customer contact info with click-to-call
   - Delivery addresses with click-to-map
   - "Đã giao hàng" button to mark as delivered
   - Auto-refresh every 30 seconds
   - COD collection tracking

3. **Order Detail Modal** — Comprehensive order information
   - Customer details with click-to-call
   - Full delivery address with Google Maps integration
   - Payment information (COD)
   - Special delivery instructions

**Key APIs:**
- `GET /api/order/admin?status=READY_FOR_PICKUP` — Get orders ready for delivery
- `GET /api/orders/admin/delivery/:orderId` — Get delivery info (address, receiver, phone)
- `PUT /api/order/:orderId/ship` — Start delivery (changes status to SHIPPING)
- `GET /api/order/emp/delivering-tasks` — Get employee's delivery tasks
- `PUT /api/order/:orderId/deliver` — Complete delivery (changes status to DELIVERED)

**Components:**
- `DeliveryEmployee.jsx` — Main container with tabs
- `ReadyForDeliveryTable.jsx` — Shows READY_FOR_PICKUP orders
- `MyDeliveryTasksTable.jsx` — Shows SHIPPING orders
- `OrderDetailModal.jsx` — Order details display

**Service:** `src/services/deliveryEmployeeService.js`

**Special Features:**
- Combined data fetching: `getReadyOrdersWithDeliveryInfo()` and `getMyTasksWithDeliveryInfo()` automatically enrich each order with delivery information
- Click-to-call: `<a href="tel:...">` for phone numbers
- Click-to-map: Google Maps integration for addresses
- COD tracking: Displays total amount to collect

**Mobile-First Design:**
- Large touch targets (min 48px height)
- Click-to-call and click-to-map for quick actions
- High contrast for outdoor visibility
- Responsive layout optimized for tablets/phones

### API Response Handling

**Standard Response Types:**
- `type: 'GOOD'` — Successful response with data
- `type: 'SKIP_AS_GOOD'` — Successful response with no data (empty result, not an error)
- Other types — Actual API failures

**Best Practice:**
```javascript
const responseType = response.data?.type;

if (responseType === 'GOOD' || responseType === 'SKIP_AS_GOOD') {
  // Update state even if empty
  setData(response.data.detail || []);
  // Summary stats recalculate from state
} else {
  // Only show error for actual failures
  setData([]);
  message.error('Error message');
}
```

This ensures:
- Empty results don't trigger error messages
- Summary statistics always update with current state
- Refresh buttons work correctly
- State is always consistent
