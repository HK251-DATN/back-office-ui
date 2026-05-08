# Task: Implement Coupon Management UI

## Goal
Add a **Quản lý mã giảm giá** (Coupon Management) page to the back-office-ui. Follow the exact same patterns used in `manage-sale-event` — same file structure, same Ant Design components, same Vietnamese UI text, same API response handling.

---

## Backend API

Base URL: `${API_URLS.ECOMMERCE}/api/coupon` (port 9300)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/coupon?page=1&size=20` | List coupons (1-based page) |
| GET | `/api/coupon/{id}` | Get single coupon |
| POST | `/api/coupon` | Create coupon |
| PUT | `/api/coupon/{id}` | Update coupon |
| DELETE | `/api/coupon/{id}` | Delete coupon |

All responses follow `ApiResponse<T>`: check `response.data.type === 'GOOD'` for success, `'SKIP_AS_GOOD'` for empty results.

### Coupon fields (request body for POST/PUT)

```json
{
  "couponCode": "SUMMER20",
  "totalQuantity": 100,
  "currentQuantity": 100,
  "discountType": "PERCENTAGE",      // "PERCENTAGE" | "FIXED_AMOUNT"
  "discountValue": 20,               // percent value OR fixed VND amount
  "maxDiscountAmount": 50000,        // cap for PERCENTAGE type (nullable)
  "minOrderValue": 100000,           // minimum cart total to apply (nullable)
  "expiredAt": "2026-12-31T23:59:59", // ISO datetime (nullable)
  "publicYn": "Y"                    // "Y" = public (visible to all), "N" = private (e.g. VIP/employee only)
}
```

### Coupon fields (response)

Same fields as request plus:
- `couponId` (Long) — primary key
- `createdAt`, `updatedAt` (LocalDateTime)

---

## Files to Create

### 1. `src/services/couponService.js`

Mirror the pattern of `src/services/saleEventService.js`:

```js
import axios from './axiosInstance';
import { API_URLS } from '../config/api';

const BASE = `${API_URLS.ECOMMERCE}/api/coupon`;

export const getCoupons = (page = 1, size = 20) =>
    axios.get(`${BASE}?page=${page}&size=${size}`);

export const getCouponById = (id) => axios.get(`${BASE}/${id}`);

export const createCoupon = (data) => axios.post(BASE, data);

export const updateCoupon = (id, data) => axios.put(`${BASE}/${id}`, data);

export const deleteCoupon = (id) => axios.delete(`${BASE}/${id}`);
```

### 2. `src/layout/manage-coupon/ManageCoupon.jsx`

Main page component. Mirror `manage-sale-event/ManageSaleEvent.jsx`:
- Header: title "Quản lý mã giảm giá", subtitle "Tạo và quản lý các mã giảm giá cho đơn hàng"
- "+ Tạo mã giảm giá" button (primary, top right)
- Search bar: `Input` filtering by coupon code (search on Enter or button click)
- Filter: `Select` for discount type (`PERCENTAGE` → "Phần trăm", `FIXED_AMOUNT` → "Số tiền cố định")
- "Tìm kiếm" + "Xóa bộ lọc" buttons
- `CouponTable` component (see below)
- `CouponFormModal` component (see below)
- State: `searchString`, `discountTypeFilter`, `appliedFilters`, `refreshTrigger`, `formOpen`, `editCouponId`

### 3. `src/layout/manage-coupon/components/CouponTable.jsx`

Mirror `manage-sale-event/components/SaleEventTable.jsx`:

- Props: `filters`, `refreshTrigger`, `onEdit`
- Fetch with `getCoupons(page, size)` on mount and when `filters`/`refreshTrigger` change
- Client-side filter by `couponCode` (contains, case-insensitive) and `discountType` from `filters`
- Ant Design `Table` with `rowKey="couponId"`, `loading`, `pagination` with `showSizeChanger`
- Columns:

| Column | dataIndex | Notes |
|--------|-----------|-------|
| ID | `couponId` | width 70 |
| Mã giảm giá | `couponCode` | bold font |
| Loại giảm giá | `discountType` | `Tag`: PERCENTAGE → blue "Phần trăm", FIXED_AMOUNT → green "Số tiền cố định" |
| Giá trị giảm | `discountValue` | render: if PERCENTAGE → `{value}%`; if FIXED_AMOUNT → `{value.toLocaleString('vi-VN')} ₫` |
| Giảm tối đa | `maxDiscountAmount` | `{value?.toLocaleString('vi-VN')} ₫` or `—` |
| Đơn tối thiểu | `minOrderValue` | `{value?.toLocaleString('vi-VN')} ₫` or `—` |
| Số lượng còn | — | render: `{currentQuantity} / {totalQuantity}` |
| Hết hạn | `expiredAt` | `dayjs(val).format('DD/MM/YYYY HH:mm')` or `—` |
| Thao tác | — | Edit button (`EditOutlined`), Delete `Popconfirm` (`DeleteOutlined`, danger) |

- On delete: call `deleteCoupon(id)`, `message.success('Đã xóa mã giảm giá')`, refetch

### 4. `src/layout/manage-coupon/components/CouponFormModal.jsx`

Mirror `manage-sale-event/components/SaleEventFormModal.jsx`:

- Props: `open`, `couponId`, `onClose`, `onSuccess`
- Modal title: "Tạo mã giảm giá mới" / "Chỉnh sửa mã giảm giá"
- Load existing coupon with `getCouponById(couponId)` when `open && couponId`
- `Form` layout `vertical`, `destroyOnClose`

Form fields:

| Field | Component | Rules |
|-------|-----------|-------|
| Mã giảm giá | `Input` | required |
| Loại giảm giá | `Select` (PERCENTAGE / FIXED_AMOUNT) | required |
| Giá trị giảm | `InputNumber` min=0 | required; label dynamically shows "%" or "₫" based on selected type |
| Giảm tối đa (₫) | `InputNumber` min=0 | optional; only show when type is PERCENTAGE |
| Đơn tối thiểu (₫) | `InputNumber` min=0 | optional |
| Tổng số lượng | `InputNumber` min=1 | required |
| Số lượng hiện tại | `InputNumber` min=0 | required; default = totalQuantity on create |
| Ngày hết hạn | `DatePicker` showTime | optional; format `DD/MM/YYYY HH:mm` |
| Hiển thị công khai | `Select` (Y / N) | required; Y = "Công khai", N = "Riêng tư" |

- On submit: build payload, call `createCoupon` or `updateCoupon`, check `type === 'GOOD'`, call `onSuccess()`
- Error messages in Vietnamese

---

## Files to Modify

### 5. `src/routes/AppRouter.jsx`

Add import and route:

```jsx
import ManageCoupon from "../layout/manage-coupon/ManageCoupon";

// Inside <Route path="/" ...>:
<Route path="manage-coupon" element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
        <ManageCoupon />
    </ProtectedRoute>
} />
```

### 6. `src/components/sidebar/Sidebar.jsx`

Add a sidebar entry after "Sự kiện khuyến mãi" (`LoyaltyOutlinedIcon`). Use `LocalOfferOutlinedIcon` from MUI (already available via `@mui/icons-material`):

```jsx
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

// After the manage-sale-event SidebarItem:
<SidebarItem
    icon={<LocalOfferOutlinedIcon />}
    name={"Mã giảm giá"}
    link={"/manage-coupon"}
/>
```

---

## Conventions to Follow

- **Language**: All UI text in Vietnamese
- **API response handling**: Always check `response.data.type`:
  - `'GOOD'` → success, data in `response.data.detail`
  - `'SKIP_AS_GOOD'` → empty list, not an error
  - anything else → `message.error(response.data?.message || 'fallback message')`
- **Error handling**: wrap all API calls in `try/catch`, show `message.error(...)` in catch
- **Styling**: Tailwind utility classes matching the rest of the app (`bg-gray-50`, `rounded-xl`, `border border-gray-200`, `p-5`, `gap-4`)
- **Components**: Ant Design only (Table, Modal, Form, Input, InputNumber, Select, DatePicker, Button, Tag, Popconfirm, Tooltip, message, Space)
- **Icons**: Mix of `@ant-design/icons` and `@mui/icons-material` is fine — both are used in the project
- **No new dependencies** — everything needed is already installed