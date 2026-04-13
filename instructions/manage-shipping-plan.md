# Plan để cải thiện Quản lý Vận chuyển (Manage Shipping)

## 📊 Implementation Progress

**Last Updated:** 2026-04-09

### ✅ Completed (Phase 1 + Driver Detail Modal)

**Mock Data & Services:**
- ✅ `src/mocks/deliveryOrders.js` - 6 sample delivery orders (PENDING, DELIVERING, DELIVERED, FAILED statuses)
- ✅ `src/mocks/drivers.js` - 8 sample drivers with different statuses
- ✅ `src/services/deliveryService.js` - Complete CRUD operations (get, assign, update status, cancel)
- ✅ `src/services/driverService.js` - Driver management (get, filter, get available, update status/location)

**Custom Hooks:**
- ✅ `src/layout/manage-shipping/hooks/useDeliveries.js` - State management for deliveries
- ✅ `src/layout/manage-shipping/hooks/useDrivers.js` - State management for drivers

**Components Created:**
- ✅ `src/layout/manage-shipping/components/DeliveryCard.jsx` - Enhanced delivery card with full info
- ✅ `src/layout/manage-shipping/components/DriverCard.jsx` - Driver card with ratings & stats
- ✅ `src/layout/manage-shipping/components/DeliveryDetailModal.jsx` - Full detail modal with status updates
- ✅ `src/layout/manage-shipping/components/AssignDriverModal.jsx` - Driver assignment with recommendations
- ✅ `src/layout/manage-shipping/components/DriverDetailModal.jsx` - Comprehensive driver detail modal

**Main Component:**
- ✅ `src/layout/manage-shipping/ManageShipping.jsx` - Fully integrated with all features

**Enhanced:**
- ✅ `src/components/summary-card/SummaryCard.jsx` - Added onClick support for filtering

**Features Working:**
1. ✅ **Delivery Management**
   - Real-time data from mock API with filters & pagination
   - Search by order ID, customer name, phone, address, driver
   - Tab-based filtering (All, Pending, Delivering, Delivered, Failed)
   - Priority tags (Urgent/Normal)
   - Payment status indicators
   - Distance, shipping fee, total amount display

2. ✅ **Delivery Detail Modal**
   - Full order information with customer & driver details
   - Product list with pricing breakdown
   - Status history timeline
   - Inline status update
   - Call buttons for customer & driver
   - Notes and failure reasons

3. ✅ **Driver Assignment**
   - Shows available drivers with stats
   - Recommends best driver (distance + rating)
   - One-click assignment
   - Driver performance metrics visible

4. ✅ **Driver Management**
   - Driver list with status filters (All, Available, Busy, Offline)
   - Rating display, vehicle type, current deliveries
   - Today/month delivery counts

5. ✅ **Driver Detail Modal** ⭐ NEW
   - **Info Tab:** Personal info, vehicle details, contact buttons
   - **Statistics Tab:** Key metrics, success rate, performance stats
   - **Current Delivery Tab:** Active delivery details (if busy)
   - **History Tab:** Paginated delivery history table

6. ✅ **Summary Cards**
   - Real-time statistics from API
   - Clickable to filter by status
   - Color-coded by status

**How to Switch to Real API:**
```javascript
// In deliveryService.js and driverService.js
const USE_MOCK = false; // Change to false and implement realApi object
```

---

## Phân tích hiện trạng

**Vấn đề chính:**
- Tất cả dữ liệu đều hardcoded (không kết nối API)
- Không có state management
- Thiếu các modal chi tiết, phân công tài xế
- Search/filter không hoạt động
- Không có pagination
- Không có tính năng theo dõi giao hàng real-time

---

## 1. Cải thiện UI/UX

### 1.1. Danh sách đơn giao hàng
**Hiện tại:** Card view với 3 status hardcoded

**Cải thiện:**
- **Thêm Tabs** để filter theo trạng thái:
  ```
  [Tất cả] [Chờ lấy hàng] [Đang giao] [Đã giao] [Thất bại]
  ```
- **Table view option** (toggle giữa card view và table view)
- **Sort/Filter controls:**
  - Lọc theo ngày (hôm nay, tuần này, tháng này, custom range)
  - Lọc theo tài xế
  - Lọc theo khu vực giao hàng
  - Sort: mới nhất, cũ nhất, khoảng cách, phí ship
- **Pagination** thay vì load tất cả
- **Thêm thông tin:**
  - Thời gian ước tính giao hàng (ETA)
  - Mức độ ưu tiên (urgent/normal)
  - Số điện thoại khách hàng
  - Trạng thái thanh toán
  - Ghi chú đặc biệt

### 1.2. Chi tiết đơn hàng Modal
**Thêm modal chi tiết** khi click "Chi tiết":
- **Thông tin đơn hàng:**
  - Mã đơn, ngày tạo, thời gian giao dự kiến
  - Thông tin khách hàng (tên, SĐT, địa chỉ chi tiết)
  - Danh sách sản phẩm trong đơn (tên, số lượng, giá)
  - Tổng tiền hàng + phí ship
  - Phương thức thanh toán

- **Thông tin vận chuyển:**
  - Tài xế (nếu đã phân công)
  - Phương tiện
  - Khoảng cách, thời gian ước tính
  - Timeline trạng thái (Tạo đơn → Lấy hàng → Đang giao → Hoàn thành)

- **Tracking Map** (nếu đang giao):
  - Hiển thị vị trí real-time của tài xế
  - Route từ kho đến địa chỉ giao hàng

- **Lịch sử thay đổi:**
  - Log các thay đổi trạng thái
  - Người thực hiện, thời gian

- **Actions:**
  - Gọi điện cho khách/tài xế
  - Hủy đơn (nếu chưa giao)
  - Báo cáo vấn đề
  - In phiếu giao hàng

### 1.3. Modal phân công tài xế
**Khi click "Phân công tài xế":**
- **Danh sách tài xế khả dụng:**
  - Avatar, tên, phương tiện
  - Số đơn đang giao
  - Vị trí hiện tại (khoảng cách đến kho)
  - Rating/đánh giá
  - Số đơn đã giao hôm nay
  
- **Gợi ý tài xế phù hợp nhất** (highlight):
  - Dựa vào khoảng cách
  - Workload hiện tại
  - Performance
  
- **Manual assignment** hoặc **Auto assign** button

### 1.4. Sidebar nhân viên giao hàng
**Hiện tại:** Hardcoded list

**Cải thiện:**
- **Tab filters:** [Tất cả] [Rảnh] [Bận] [Offline]
- **Thêm thông tin:**
  - Số đơn đã giao hôm nay / tháng này
  - Rating trung bình
  - Vị trí hiện tại (khoảng cách từ kho)
  - Phương tiện
  - Shift làm việc (ca sáng/chiều/tối)
  
- **Quick actions:**
  - Xem chi tiết nhân viên
  - Gọi điện
  - Xem lịch sử giao hàng
  - Đánh giá performance

- **Click vào employee card** → hiện modal:
  - Thông tin cá nhân
  - Đơn hàng đang giao
  - Lịch sử giao hàng
  - Thống kê (tỷ lệ thành công, đánh giá TB, tổng đơn)

### 1.5. Summary Cards
**Hiện tại:** Hardcoded numbers

**Cải thiện:**
- **Real-time data** từ API
- **Click vào card** → filter danh sách theo status đó
- **Thêm trend indicators** (tăng/giảm so với hôm qua/tuần trước)
- **Tooltip** hiển thị breakdown chi tiết

### 1.6. Search & Filter
**Hiện tại:** Chỉ có placeholder

**Cải thiện:**
- **Search by:**
  - Mã đơn hàng
  - Tên khách hàng
  - Số điện thoại
  - Địa chỉ
  - Tên tài xế
  
- **Advanced filters:**
  - Date range picker
  - Status multi-select
  - Khu vực giao hàng
  - Khoảng phí ship (min-max)
  - Tài xế
  - Mức độ ưu tiên

### 1.7. Tính năng bổ sung
- **Bulk actions:**
  - Select multiple orders
  - Assign to same driver
  - Export to Excel
  - Print multiple delivery notes
  
- **Dashboard/Analytics tab:**
  - Biểu đồ giao hàng theo giờ/ngày/tháng
  - Heatmap khu vực giao hàng
  - Performance ranking tài xế
  - Revenue từ phí ship

- **Notifications:**
  - Đơn hàng mới
  - Tài xế giao thành công/thất bại
  - Khách hàng phàn nàn
  - Đơn hàng quá hạn

---

## 2. Backend APIs cần thiết

### 2.1. Delivery Orders (Đơn giao hàng)

#### GET `/api/delivery-orders`
**Query params:**
```javascript
{
  page: 1,
  limit: 20,
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERING' | 'DELIVERED' | 'FAILED' | 'CANCELLED',
  search: 'DH-8901', // search by orderId, customer name, phone, address
  driverId: 'uuid',
  startDate: '2026-04-01',
  endDate: '2026-04-09',
  sortBy: 'createdAt' | 'distance' | 'shippingFee',
  sortOrder: 'asc' | 'desc',
  priority: 'URGENT' | 'NORMAL',
  area: 'Ba Đình, Hà Nội' // khu vực
}
```

**Response:**
```javascript
{
  type: 'GOOD',
  detail: {
    data: [
      {
        id: 'uuid',
        orderId: 'DH-8901',
        status: 'DELIVERING',
        priority: 'NORMAL',
        customer: {
          id: 'uuid',
          name: 'Nguyen Thi Mai',
          phone: '0912345678',
          address: '123 Hoàng Hoa Thám, Ba Đình, Hà Nội',
          coordinates: { lat: 21.0285, lng: 105.8542 }
        },
        driver: {
          id: 'uuid',
          name: 'Lê Hoàng Duy',
          phone: '0987654321',
          vehicleType: 'MOTORCYCLE' | 'CAR' | 'TRUCK',
          currentLocation: { lat: 21.0285, lng: 105.8542 }
        },
        warehouse: {
          id: 'uuid',
          name: 'Kho Hà Nội',
          address: '...',
          coordinates: { lat: 21.0285, lng: 105.8542 }
        },
        items: [
          {
            productId: 'uuid',
            productName: 'Cá tươi',
            quantity: 2,
            unitPrice: 150000,
            totalPrice: 300000
          }
        ],
        totalAmount: 300000,
        shippingFee: 35000,
        distance: 4.2, // km
        paymentMethod: 'COD' | 'PAID',
        paymentStatus: 'PENDING' | 'PAID',
        estimatedDeliveryTime: '2026-04-09T14:30:00Z',
        actualDeliveryTime: null,
        createdAt: '2026-04-09T10:00:00Z',
        updatedAt: '2026-04-09T10:30:00Z',
        notes: 'Gọi trước khi giao',
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: '2026-04-09T10:00:00Z',
            updatedBy: 'system'
          },
          {
            status: 'ASSIGNED',
            timestamp: '2026-04-09T10:15:00Z',
            updatedBy: 'admin-id',
            notes: 'Assigned to driver'
          }
        ]
      }
    ],
    pagination: {
      total: 150,
      page: 1,
      limit: 20,
      totalPages: 8
    },
    summary: {
      pending: 12,
      delivering: 5,
      delivered: 130,
      failed: 3,
      onTimeRate: 88.5 // %
    }
  }
}
```

#### GET `/api/delivery-orders/:id`
**Response:** Chi tiết 1 đơn hàng (format như trên)

#### POST `/api/delivery-orders/:id/assign-driver`
**Body:**
```javascript
{
  driverId: 'uuid'
}
```

**Response:**
```javascript
{
  type: 'GOOD',
  detail: {
    // updated delivery order
  }
}
```

#### PUT `/api/delivery-orders/:id/status`
**Body:**
```javascript
{
  status: 'PICKED_UP' | 'DELIVERING' | 'DELIVERED' | 'FAILED' | 'CANCELLED',
  notes: 'Khách không nhận hàng',
  failureReason: 'CUSTOMER_NOT_AVAILABLE' | 'WRONG_ADDRESS' | 'REFUSED' | 'OTHER' // if failed
}
```

#### PUT `/api/delivery-orders/:id/cancel`
**Body:**
```javascript
{
  reason: 'Customer requested cancellation'
}
```

#### GET `/api/delivery-orders/:id/tracking`
**Response:**
```javascript
{
  type: 'GOOD',
  detail: {
    orderId: 'DH-8901',
    status: 'DELIVERING',
    driver: {
      name: 'Lê Hoàng Duy',
      phone: '0987654321',
      currentLocation: { lat: 21.0285, lng: 105.8542 },
      lastUpdated: '2026-04-09T12:00:00Z'
    },
    route: [
      { lat: 21.0285, lng: 105.8542, timestamp: '...' },
      // GPS tracking points
    ],
    eta: '2026-04-09T14:30:00Z'
  }
}
```

---

### 2.2. Drivers (Tài xế)

#### GET `/api/drivers`
**Query params:**
```javascript
{
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE',
  vehicleType: 'MOTORCYCLE' | 'CAR' | 'TRUCK',
  page: 1,
  limit: 20
}
```

**Response:**
```javascript
{
  type: 'GOOD',
  detail: {
    data: [
      {
        id: 'uuid',
        name: 'Nguyễn Thị Cẩm',
        phone: '0912345678',
        email: 'cam@example.com',
        avatar: 'https://...',
        vehicleType: 'MOTORCYCLE',
        vehiclePlate: '29A-12345',
        status: 'BUSY',
        currentLocation: { lat: 21.0285, lng: 105.8542 },
        distanceFromWarehouse: 2.5, // km
        currentDelivery: {
          orderId: 'DH-8902',
          estimatedCompletion: '2026-04-09T13:00:00Z'
        },
        shift: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY',
        rating: 4.8,
        totalDeliveries: 1250,
        successRate: 96.5, // %
        todayDeliveries: 8,
        monthDeliveries: 120,
        createdAt: '2025-01-01T00:00:00Z'
      }
    ],
    pagination: {
      total: 25,
      page: 1,
      limit: 20
    },
    summary: {
      available: 5,
      busy: 12,
      offline: 8
    }
  }
}
```

#### GET `/api/drivers/:id`
**Response:** Chi tiết 1 tài xế + lịch sử giao hàng

#### GET `/api/drivers/available-for-order/:orderId`
**Response:** Danh sách tài xế có thể giao đơn này
```javascript
{
  type: 'GOOD',
  detail: {
    recommended: {
      // driver object
      reason: 'Closest to warehouse, high success rate'
    },
    available: [
      // array of driver objects
    ]
  }
}
```

#### PUT `/api/drivers/:id/status`
**Body:**
```javascript
{
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
}
```

#### PUT `/api/drivers/:id/location`
**Body:**
```javascript
{
  lat: 21.0285,
  lng: 105.8542,
  timestamp: '2026-04-09T12:00:00Z'
}
```
(Được gọi từ mobile app của tài xế, định kỳ mỗi 30s-1 phút)

---

### 2.3. Statistics & Analytics

#### GET `/api/delivery-statistics/summary`
**Query params:**
```javascript
{
  startDate: '2026-04-01',
  endDate: '2026-04-09'
}
```

**Response:**
```javascript
{
  type: 'GOOD',
  detail: {
    totalOrders: 150,
    delivered: 130,
    delivering: 5,
    pending: 12,
    failed: 3,
    cancelled: 0,
    onTimeDeliveries: 115,
    onTimeRate: 88.5,
    avgDeliveryTime: 45, // minutes
    totalRevenue: 4500000, // shipping fees
    avgShippingFee: 35000
  }
}
```

#### GET `/api/delivery-statistics/by-time`
**Query params:**
```javascript
{
  groupBy: 'hour' | 'day' | 'week' | 'month',
  startDate: '2026-04-01',
  endDate: '2026-04-09'
}
```

**Response:**
```javascript
{
  type: 'GOOD',
  detail: [
    {
      time: '2026-04-01',
      totalOrders: 20,
      delivered: 18,
      failed: 2,
      revenue: 700000
    }
    // ...
  ]
}
```

#### GET `/api/delivery-statistics/by-area`
Heatmap data cho các khu vực giao hàng

#### GET `/api/drivers/:id/statistics`
Performance stats của 1 tài xế cụ thể

---

### 2.4. WebSocket/Real-time updates (Optional but recommended)

**WebSocket endpoint:** `ws://localhost:9100/ws/deliveries`

**Events:**
- `delivery:created` - Đơn mới
- `delivery:assigned` - Đã phân tài xế
- `delivery:status_updated` - Thay đổi trạng thái
- `delivery:location_updated` - Cập nhật vị trí tài xế
- `driver:status_changed` - Tài xế online/offline/busy

---

## 3. Cấu trúc code đề xuất

```
src/layout/manage-shipping/
├── ManageShipping.jsx          # Main component
├── components/
│   ├── DeliveryList.jsx        # Table/Card view of deliveries
│   ├── DeliveryCard.jsx        # Individual delivery card
│   ├── DeliveryDetailModal.jsx # Detail modal
│   ├── AssignDriverModal.jsx   # Driver assignment modal
│   ├── DriverList.jsx          # Sidebar driver list
│   ├── DriverCard.jsx          # Individual driver card
│   ├── DriverDetailModal.jsx   # Driver detail modal
│   ├── DeliveryFilters.jsx     # Advanced filters
│   ├── DeliveryMap.jsx         # Map tracking component
│   └── DeliveryTimeline.jsx    # Status timeline
└── hooks/
    ├── useDeliveries.js        # Fetch & manage deliveries
    ├── useDrivers.js           # Fetch & manage drivers
    └── useDeliveryTracking.js  # Real-time tracking
```

---

## 4. Priority Implementation

**Phase 1 (MVP): ✅ COMPLETED**
1. ✅ API integration cho delivery orders list (mocked)
2. ✅ API integration cho drivers list (mocked)
3. ✅ Assign driver functionality (with recommendations)
4. ✅ Detail modal với đầy đủ thông tin (DeliveryDetailModal)
5. ✅ Search & basic filters (search + tab filters)
6. ✅ Update status (inline in detail modal)
7. ✅ **BONUS:** Driver detail modal (DriverDetailModal)

**Phase 2: 🔄 PARTIALLY COMPLETED**
1. ⏳ Advanced filters (date range, area, etc.) - NOT YET
2. ⏳ Table view option - NOT YET (currently card view only)
3. ✅ Pagination (working with mock API)
4. ✅ Driver detail modal (4 tabs: Info, Statistics, Current Delivery, History)
5. ✅ Statistics integration (summary cards, driver stats)

**Phase 3: 📋 TODO**
1. ⏳ Real-time tracking map (GPS tracking)
2. ⏳ WebSocket for live updates
3. ⏳ Analytics dashboard (charts, heatmaps)
4. ⏳ Bulk actions (multi-select, batch operations)
5. ⏳ Export/Print features (Excel export, print delivery notes)

---

## 🚀 Next Steps Recommendations

### Immediate (Phase 2 Completion):
1. **Advanced Filters Component**
   - Date range picker (start/end date)
   - Area/district dropdown
   - Price range slider (shipping fee)
   - Priority filter
   - Multi-select status

2. **Table View Toggle**
   - Add view mode switcher (Card/Table)
   - Create DeliveryTable component
   - Maintain same functionality in both views

### Future (Phase 3):
1. **Analytics Dashboard**
   - Delivery trends chart (Recharts)
   - Area heatmap
   - Driver performance ranking
   - Revenue tracking

2. **Real-time Features**
   - WebSocket integration
   - Live driver location on map
   - Push notifications for status changes

3. **Productivity Features**
   - Bulk operations (select multiple orders)
   - Excel export
   - Print delivery notes
   - Auto-assignment algorithm

---

## 📁 File Structure (Current)

```
src/
├── mocks/
│   ├── deliveryOrders.js        ✅ 6 sample orders
│   └── drivers.js                ✅ 8 sample drivers
├── services/
│   ├── deliveryService.js        ✅ CRUD operations
│   └── driverService.js          ✅ Driver management
├── layout/manage-shipping/
│   ├── ManageShipping.jsx        ✅ Main component
│   ├── hooks/
│   │   ├── useDeliveries.js      ✅ State management
│   │   └── useDrivers.js         ✅ State management
│   └── components/
│       ├── DeliveryCard.jsx      ✅ Order card
│       ├── DriverCard.jsx        ✅ Driver card
│       ├── DeliveryDetailModal.jsx ✅ Order details
│       ├── AssignDriverModal.jsx   ✅ Assignment
│       └── DriverDetailModal.jsx   ✅ Driver details
└── components/
    └── summary-card/
        └── SummaryCard.jsx       ✅ Enhanced with onClick
```

---

## 💾 Session Notes

**What Works:**
- Complete delivery order management with mock APIs
- Driver management with filtering
- Full CRUD operations (create assignment, read details, update status, cancel)
- Search functionality across multiple fields
- Pagination with configurable page size
- Real-time summary statistics
- Professional UI with loading/empty states
- Vietnamese localization for dates, currency, labels

**API Mock System:**
- Simulates 300-500ms network delay
- Returns data in standard format: `{ type: 'GOOD', detail: {...} }`
- Supports filtering, searching, sorting, pagination
- Toggle between mock/real API via `USE_MOCK` constant

**Ready for Backend Integration:**
- All API endpoints are documented in this plan
- Service layer is abstracted (just implement `realApi` object)
- Error handling with toast notifications in place
- Standard response format expected
