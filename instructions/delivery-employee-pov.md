# DELIVERY EMPLOYEE PERSPECTIVE

**Date:** 2026-04-14  
**Focus:** Employee-facing interface for delivery drivers  
**Purpose:** Design and implement delivery workflow from employee point of view

---

## 1. Overview

Similar to the packaging employee interface, this module provides delivery drivers with a simplified, mobile-first interface to:
- View orders ready for delivery
- Accept delivery tasks
- Track delivery progress
- Mark orders as delivered

### Key Differences from Packaging Employee:
- **Simpler workflow**: Only 2 main actions (start delivery, complete delivery)
- **No complex sub-tasks**: No product linking or item-by-item tracking
- **Location-based**: May include delivery address and route information
- **Time-sensitive**: Delivery deadlines and estimated times are critical

---

## 2. User Personas

### **Persona 1: Experienced Delivery Driver**
- **Name:** Trần Văn Hùng (3 years experience)
- **Needs:** 
  - Fast task acceptance
  - Clear delivery addresses
  - Batch delivery (multiple orders in one route)
  - Performance tracking
- **Pain Points:**
  - Unclear delivery locations
  - No route optimization
  - Manual status updates

### **Persona 2: New Delivery Driver**
- **Name:** Nguyễn Thị Mai (1 month experience)
- **Needs:**
  - Clear delivery instructions
  - Customer contact information
  - Support/help button
  - Delivery guidelines
- **Pain Points:**
  - Getting lost
  - Customer not available
  - Unclear package handling

---

## 3. Interface Structure

### 3.1 Routes

```
/delivery/employee              # Delivery employee dashboard (default)
/delivery/employee/task/:taskId # Task details (optional, can be modal)
```

### 3.2 Page Layout

#### **Main Component: DeliveryEmployee.jsx**

Two tabs:
1. **Đơn hàng sẵn sàng** (Ready for Delivery) - Orders with PACKED status
2. **Nhiệm vụ của tôi** (My Delivery Tasks) - Orders in DELIVERING status

---

## 4. Tab 1: Ready for Delivery Orders

### 4.1 Features

- **Table showing orders ready for delivery**
  - Order ID
  - Customer name & phone
  - Delivery address
  - Order value
  - Packaging completed time
  - Number of items/packages
  
- **Action Buttons:**
  - **"Xem chi tiết" (View Details)** - Opens modal with full order information
  - **"Bắt đầu giao hàng" (Start Delivery)** - Accept the delivery task

### 4.2 Order Details Modal

When "Xem chi tiết" is clicked, show modal with:
- **Customer Information:**
  - Full name
  - Phone number
  - Delivery address (formatted, readable)
  - Special delivery instructions (if any)
  
- **Order Information:**
  - Order ID
  - Total value
  - Payment status (COD, prepaid)
  - Items list (name, quantity)
  - Packaging notes
  
- **Actions:**
  - Close button
  - "Bắt đầu giao hàng" button

---

## 5. Tab 2: My Delivery Tasks

### 5.1 Features

- **Table showing accepted delivery tasks**
  - Order ID
  - Customer name & phone
  - Delivery address (truncated)
  - Delivery status
  - Time accepted
  - Estimated delivery time
  
- **Action Buttons:**
  - **"Xem chi tiết" (View Details)** - Opens order detail modal
  - **"Đã giao hàng" (Delivered)** - Mark as delivered (with confirmation)

### 5.2 Delivery Completion Flow

When "Đã giao hàng" is clicked:

1. **Confirmation Modal:**
   - "Xác nhận đã giao hàng cho đơn #[ORDER_ID]?"
   - Optional: Photo upload (proof of delivery)
   - Optional: Delivery notes (e.g., "Left at door", "Handed to customer")
   - Optional: Customer signature (future enhancement)

2. **Success Feedback:**
   - Show success message
   - Remove from "My Tasks" table
   - Update statistics

---

## 6. API Integration

### 6.1 Required APIs (4 endpoints)

#### **1. GET Ready for Delivery Orders**

**Endpoint:** `GET {{back-office-url}}/api/order/admin?status=READY_FOR_PICKUP`  

**Purpose:** Get all orders that have been packaged and are ready for delivery

**Response Example:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get all orders successfully",
  "detail": [
    {
      "email": "buyer@gmail.com",
      "f_name": "Fbuyer",
      "l_name": "Lbuyer",
      "order_id": "6",
      "owned_by": "2",
      "packaging_progress": 100,
      "status": "READY_FOR_PICKUP",
      "total_price": null,
      "updated_at": "2026-04-14T13:10:36.324865"
    }
  ],
  "timestamp": "2026-04-14T13:51:08.667870846"
}
```

For each of the order fetched in the above api, call an additional API to to order delivery address and receiver
GET {{ecommerce-url}}/api/orders/admin/delivery/:order-id
**Response Example:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get delivery info for order success",
  "detail": {
    "detail": "123 Nguyễn Văn Linh",
    "note": null,
    "status": "CONFIRMED",
    "commune": "Phường Tân Phú",
    "district": "Quận 7",
    "province": "TP.HCM",
    "receiver_name": "Fbuyer Lbuyer",
    "receiver_p_num": "0901234567",
    "buyer_id": "2",
    "created_at": "2026-04-12T13:46:30.239201",
    "order_id": 6,
    "total_price": 450000
  },
  "timestamp": "2026-04-14T13:56:03.812270668"
}
```

---

#### **2. PUT Start Delivery**

**Endpoint:** `PUT {{back-office-url}}/api/order/:order-id/ship`  

**Purpose:** Employee accepts a delivery task, changes status from PACKED to SHIPPING

**Response:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Ship order successfully",
  "detail": null,
  "timestamp": "2026-04-14T13:57:33.703022562"
}
```

---

#### **3. GET My Delivery Tasks**

**Endpoint:** `GET {{back-office-url}}/api/order/emp/delivering-tasks`  

**Purpose:** Get all orders currently being delivered by this employee

**Response:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get all orders successfully",
  "detail": [
    {
      "email": "buyer@gmail.com",
      "f_name": "Fbuyer",
      "l_name": "Lbuyer",
      "order_id": "6",
      "owned_by": "2",
      "packaging_progress": 100,
      "status": "SHIPPING",
      "total_price": null,
      "updated_at": "2026-04-14T13:57:33.667213"
    }
  ],
  "timestamp": "2026-04-14T14:04:44.753187655"
}
```

---

#### **4. PUT Complete Delivery**

**Endpoint:** `PUT {{back-office-url}}/api/order/:order:id/deliver`  

**Purpose:** Mark order as delivered, changes status from SHIPPING to DELIVERED

**Response:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Order delivered successfully",
  "detail": null,
  "timestamp": "2026-04-14T14:05:39.918405536"
}
```

---

### 6.2 Optional/Future APIs

#### **5. GET Order Details (Combined)**

**Endpoint:** `GET /api/delivery/order/:orderId/details`

**Purpose:** Get comprehensive order details for delivery (combines data from multiple services)

**Response:**
```json
{
  "type": "GOOD",
  "detail": {
    "order": {
      "order_id": 123,
      "status": "PACKED",
      "total_price": 450000,
      "payment_status": "COD"
    },
    "customer": {
      "name": "Nguyễn Văn A",
      "phone": "0901234567"
    },
    "address": {
      "full_address": "123 Nguyễn Văn Linh, Q7, TP.HCM",
      "ward": "Phường Tân Phú",
      "district": "Quận 7",
      "city": "TP.HCM",
      "coordinates": {
        "lat": 10.7331,
        "lng": 106.7196
      }
    },
    "items": [
      {
        "product_name": "Gà Ta Nguyên Con",
        "quantity": 3,
        "unit_price": 150000
      }
    ],
    "delivery_instructions": "Gọi trước 15 phút, tránh giờ nghỉ trưa"
  }
}
```

---

## 7. File Structure

```
src/layout/delivery-employee/
├── DeliveryEmployee.jsx           # Main container component
├── DeliveryEmployee.css           # Mobile-first styling
├── README.md                      # Documentation
└── components/
    ├── ReadyForDeliveryTable.jsx  # Orders ready for delivery
    ├── MyDeliveryTasksTable.jsx   # Employee's delivery tasks
    ├── OrderDetailModal.jsx       # Order details modal
    └── DeliveryConfirmModal.jsx   # Delivery completion confirmation

src/services/
└── deliveryEmployeeService.js     # API integration
```

---

## 8. Component Details

### 8.1 ReadyForDeliveryTable.jsx

**State:**
- `loading`: Boolean for loading state
- `orders`: Array of available orders
- `selectedOrder`: Selected order for detail modal
- `modalVisible`: Boolean for modal visibility

**Functions:**
- `fetchOrders()`: Fetch orders with PACKED status
- `handleViewDetails(order)`: Open detail modal
- `handleStartDelivery(orderId)`: Accept delivery task

**Columns:**
- Mã đơn hàng (Order ID)
- Khách hàng (Customer name & phone)
- Địa chỉ giao hàng (Delivery address - truncated)
- Giá trị đơn (Order value)
- Số lượng SP (Number of items)
- Đóng gói lúc (Packaged at)
- Thao tác (Actions: View Detail, Start Delivery)

---

### 8.2 MyDeliveryTasksTable.jsx

**State:**
- `loading`: Boolean for loading state
- `tasks`: Array of delivery tasks
- `selectedTask`: Selected task for detail modal
- `deliveryModalVisible`: Boolean for delivery confirmation modal

**Functions:**
- `fetchTasks()`: Fetch employee's delivery tasks
- `handleViewDetails(task)`: Open detail modal
- `handleCompleteDelivery(orderId)`: Open delivery confirmation modal

**Columns:**
- Mã đơn hàng (Order ID)
- Khách hàng (Customer name & phone)
- Địa chỉ (Delivery address - truncated)
- Trạng thái (Status)
- Bắt đầu lúc (Started at)
- Thời gian dự kiến (Estimated delivery time)
- Thao tác (Actions: View Detail, Delivered)

---

### 8.3 OrderDetailModal.jsx

**Props:**
- `visible`: Boolean
- `order`: Order object
- `onClose`: Close callback
- `onStartDelivery`: Optional callback to start delivery from modal

**Sections:**
- Customer information
- Delivery address (formatted)
- Order items list
- Payment information
- Special instructions
- Actions (Close, Start Delivery if not started)

---

### 8.4 DeliveryConfirmModal.jsx

**Props:**
- `visible`: Boolean
- `order`: Order object
- `onClose`: Close callback
- `onConfirm`: Confirm delivery callback

**Features:**
- Confirmation message
- Optional delivery notes textarea
- Optional photo upload (proof of delivery)
- Confirm and Cancel buttons

---

## 9. Mobile-First Design Principles

### 9.1 Layout
- Portrait orientation optimized
- Large touch targets (min 3rem / 48px height)
- High contrast colors
- Clear typography (base 18px)

### 9.2 Colors
- 🔵 **Blue**: Available orders
- 🟢 **Green**: Active delivery tasks
- 🟡 **Orange**: Urgent/time-sensitive
- ✅ **Success**: Completed deliveries

### 9.3 Critical Information First
- Customer phone number (prominent, tap to call)
- Delivery address (tap to open maps)
- Order value (if COD)
- Special instructions (highlighted)

---

## 10. User Flow

### 10.1 Accept Delivery Task

```
1. Open "Đơn hàng sẵn sàng" tab
2. Browse available orders
3. Click "Xem chi tiết" to review order
4. Click "Bắt đầu giao hàng" button
5. Confirmation: "Bạn có chắc muốn nhận đơn #123?"
6. Click "Xác nhận"
7. Order moves to "Nhiệm vụ của tôi" tab
8. Success message: "Đã nhận đơn hàng #123"
```

### 10.2 Complete Delivery

```
1. Open "Nhiệm vụ của tôi" tab
2. Find delivered order
3. Click "Đã giao hàng" button
4. Delivery confirmation modal opens
5. (Optional) Add delivery notes
6. (Optional) Upload photo proof
7. Click "Xác nhận giao hàng"
8. Order removed from task list
9. Success message: "Đã hoàn thành giao hàng #123"
```

---

## 11. Implementation Plan

### **Phase 1: Core Structure (Day 1)**

- [ ] Create route `/delivery/employee`
- [ ] Create folder structure
- [ ] Setup DeliveryEmployee.jsx with tabs
- [ ] Create deliveryEmployeeService.js
- [ ] Add route to AppRouter
- [ ] Add sidebar link

### **Phase 2: Ready for Delivery Tab (Day 2)**

- [ ] Create ReadyForDeliveryTable.jsx
- [ ] Implement fetchOrders() API call
- [ ] Build table with columns
- [ ] Add "View Detail" button
- [ ] Add "Start Delivery" button with confirmation
- [ ] Add statistics summary

### **Phase 3: My Delivery Tasks Tab (Day 3)**

- [ ] Create MyDeliveryTasksTable.jsx
- [ ] Implement fetchTasks() API call
- [ ] Build table with columns
- [ ] Add "Delivered" button
- [ ] Add status indicators
- [ ] Auto-refresh functionality

### **Phase 4: Modals & Details (Day 4)**

- [ ] Create OrderDetailModal.jsx
- [ ] Display customer information
- [ ] Display delivery address
- [ ] Display order items
- [ ] Create DeliveryConfirmModal.jsx
- [ ] Add delivery notes input
- [ ] Add photo upload (optional)

### **Phase 5: Polish & Mobile UX (Day 5)**

- [ ] Create DeliveryEmployee.css
- [ ] Apply mobile-first styling
- [ ] Large touch targets
- [ ] Responsive design
- [ ] Click-to-call phone numbers
- [ ] Click-to-map addresses
- [ ] Test on mobile devices

---

## 12. Key Features

### 12.1 Click-to-Call
```jsx
<a href={`tel:${customer.phone}`} className="text-blue-600 font-semibold">
  {customer.phone}
</a>
```

### 12.2 Click-to-Map
```jsx
<a 
  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-600"
>
  {address}
</a>
```

### 12.3 Payment Status Badge
```jsx
{paymentStatus === 'COD' ? (
  <Tag color="orange">Thu tiền: {totalPrice.toLocaleString('vi-VN')} đ</Tag>
) : (
  <Tag color="green">Đã thanh toán</Tag>
)}
```

---

## 13. Statistics Dashboard

Both tabs should show summary statistics:

### **Ready for Delivery Tab:**
- Tổng đơn hàng sẵn sàng (Total ready orders)
- Đơn COD (COD orders)
- Tổng giá trị (Total value if COD)

### **My Delivery Tasks Tab:**
- Nhiệm vụ của tôi (My tasks count)
- Đang giao (In progress)
- Hôm nay đã giao (Delivered today)

---

## 14. Error Handling

### Common Scenarios:

1. **No orders available**: Show empty state with friendly message
2. **API error**: Show error message with retry button
3. **Network timeout**: Show "Mất kết nối, vui lòng thử lại"
4. **Order already taken**: "Đơn hàng này đã được nhận bởi người khác"
5. **Cannot complete delivery**: Show specific error message

---

## 15. Future Enhancements

### Phase 2 Features (Not in Initial Implementation):
- [ ] Route optimization (multiple orders, optimal path)
- [ ] Real-time GPS tracking
- [ ] Photo proof of delivery
- [ ] Customer signature capture
- [ ] Delivery performance metrics
- [ ] Daily/weekly delivery reports
- [ ] Push notifications for new orders
- [ ] Cash collection tracking (for COD)
- [ ] Return/exchange handling
- [ ] Customer rating system

---

## 16. Differences from Packaging Employee

| Feature | Packaging Employee | Delivery Employee |
|---------|-------------------|-------------------|
| **Complexity** | High (product linking, pick lists) | Low (start/complete only) |
| **Sub-tasks** | Multiple (per order item) | None |
| **Progress tracking** | Percentage-based | Binary (started/completed) |
| **External interaction** | Internal (warehouse) | External (customer) |
| **Critical info** | Product locations | Delivery address, phone |
| **Time pressure** | Moderate | High (delivery windows) |
| **Mobile features** | Barcode scanning | Maps, phone calls |

---

## 17. Testing Checklist

- [ ] Orders load in "Ready for Delivery" tab
- [ ] "Start Delivery" accepts order successfully
- [ ] Order moves to "My Tasks" after acceptance
- [ ] Order details modal displays correctly
- [ ] "Delivered" button marks order as complete
- [ ] Statistics update correctly
- [ ] Refresh buttons work
- [ ] Click-to-call works on mobile
- [ ] Click-to-map opens navigation app
- [ ] Responsive on tablets/phones
- [ ] Vietnamese labels display correctly
- [ ] Error messages show properly

---

## 18. API Service Template

```javascript
// src/services/deliveryEmployeeService.js

import axios from './axiosInstance';
import { API_URLS } from '../config/api';

const BACK_OFFICE_BASE = API_URLS.MAIN;
const ECOMMERCE_BASE = API_URLS.ECOMMERCE;

/**
 * Get orders ready for delivery (PACKED status)
 */
export const getReadyForDeliveryOrders = (status = 'PACKED') => {
  return axios.get(`${BACK_OFFICE_BASE}/api/order/admin`, {
    params: { status }
  });
};

/**
 * Start delivery task (accept order)
 */
export const startDelivery = (orderId) => {
  return axios.put(`${BACK_OFFICE_BASE}/api/order/${orderId}/start-delivery`);
};

/**
 * Get employee's current delivery tasks
 */
export const getMyDeliveryTasks = () => {
  return axios.get(`${BACK_OFFICE_BASE}/api/order/emp/delivery-tasks`);
};

/**
 * Complete delivery (mark as delivered)
 */
export const completeDelivery = (orderId, data = {}) => {
  return axios.put(`${BACK_OFFICE_BASE}/api/order/${orderId}/complete-delivery`, data);
};

/**
 * Get order details for delivery
 */
export const getOrderDetails = async (orderId) => {
  try {
    const [ecommerceResponse, backOfficeResponse] = await Promise.all([
      axios.get(`${ECOMMERCE_BASE}/api/orders/admin/${orderId}`),
      axios.get(`${BACK_OFFICE_BASE}/api/order/${orderId}`)
    ]);

    return {
      ecommerce: ecommerceResponse.data?.detail,
      backOffice: backOfficeResponse.data?.detail
    };
  } catch (error) {
    throw error;
  }
};
```

---

## 19. Sample UI Screenshots (Mockups)

### Tab 1: Đơn hàng sẵn sàng
```
┌─────────────────────────────────────────────┐
│ [Stats]                                     │
│ Tổng: 15 | COD: 8 | Giá trị: 12.5M         │
│ [🔄 Làm mới]                                │
├─────────────────────────────────────────────┤
│ Table:                                      │
│ #123 | Nguyễn Văn A | 0901234567           │
│      | 123 Nguyễn Văn Linh, Q7...          │
│      | 450,000đ | 10:30 | [Chi tiết] [Bắt đầu] │
├─────────────────────────────────────────────┤
│ #124 | Trần Thị B | 0907654321             │
│      | 456 Lê Văn Việt, Q9...              │
│      | 680,000đ | 11:00 | [Chi tiết] [Bắt đầu] │
└─────────────────────────────────────────────┘
```

### Tab 2: Nhiệm vụ của tôi
```
┌─────────────────────────────────────────────┐
│ [Stats]                                     │
│ Của tôi: 3 | Đang giao: 3 | Hôm nay: 5     │
│ [🔄 Làm mới]                                │
├─────────────────────────────────────────────┤
│ Table:                                      │
│ #120 | Lê Văn C | 0909123456               │
│      | 789 Võ Văn Tần, Q3...               │
│      | 14:00 | Dự kiến: 16:00              │
│      | [Chi tiết] [✓ Đã giao hàng]        │
└─────────────────────────────────────────────┘
```

---

## 20. Success Metrics

### User Adoption
- ✅ 90%+ delivery staff actively use system
- ✅ Less than 5% manual status updates needed

### Efficiency
- ✅ 30% reduction in delivery confirmation time
- ✅ Real-time status visibility for managers
- ✅ Fewer customer complaints about delivery status

### User Satisfaction
- ✅ 4.5+ star rating from delivery staff
- ✅ Less than 3% error rate in status updates
- ✅ Positive feedback on mobile usability

---

## 21. Summary

This delivery employee interface provides a **simplified, mobile-first workflow** for delivery drivers to:

1. **View available orders** ready for delivery
2. **Accept delivery tasks** with one tap
3. **Access critical information** (address, phone, instructions)
4. **Mark deliveries complete** with optional proof

The design prioritizes **speed and simplicity** over complexity, recognizing that delivery drivers are:
- Often on the road
- Using mobile devices
- Need quick, clear actions
- Focused on customer interaction

**Estimated Effort:** 5 days (1 developer)  
**Priority:** High (completes the order fulfillment workflow)  
**Dependencies:** Packaging employee perspective (similar pattern)

---

**Created:** 2026-04-14  
**Based on:** Packaging employee perspective implementation  
**Ready for:** Implementation
