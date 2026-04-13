# Manage Packaging Module - Improvement Plan

**Date:** 2026-04-08  
**Module:** `src/layout/manage-packaging/`  
**Purpose:** Analyze current implementation, suggest UI improvements, and define required APIs

---

## 1. Current State Analysis

### 1.1 File Structure
```
src/layout/manage-packaging/
├── ManagePackaging.jsx          # Main component (70 lines)
└── components/
    ├── PackagingTask.jsx        # Task card component (32 lines)
    └── PackagingEmp.jsx          # Employee card component (30 lines)
```

### 1.2 Current Implementation Issues

#### **Hard-coded Data**
- All data is static/hard-coded:
  - Summary cards show fixed numbers (3, 2, 1, "3/5")
  - 5 identical `<PackagingTask />` components rendered
  - 5 identical `<PackagingEmp />` components rendered
  - Employee shown: "Nguyễn Thị Cẩm" appears on every task
  - Order ID: "DH-8901" is hard-coded

#### **No State Management**
- No React state (`useState`, `useEffect`)
- No API integration
- No loading/error handling
- No data fetching logic

#### **No Interactivity**
- "Bắt đầu đóng gói" button has no handler
- Search box is non-functional
- Filter button is just text
- No modals for task details

#### **Inconsistent with Codebase Patterns**
Unlike other modules (warehouse, product, customer), this module doesn't:
- Use Ant Design `<Table>` component
- Have detail/edit/create modals
- Follow the service layer pattern (`src/services/packagingService.js` doesn't exist)
- Check API response format (`response.data.type === 'GOOD'`)
- Show loading states or error messages
- Use `message.success/error` for notifications

---

## 2. UI Improvements

### 2.1 Component Restructure

#### **Replace static lists with dynamic Table components**

**Before:**
```jsx
<PackagingTask />
<Divider />
<PackagingTask />
<Divider />
// ... repeated 5 times
```

**After:**
```jsx
<PackagingTaskTable 
  refreshTrigger={refreshTrigger}
  onTaskAction={handleTaskAction}
/>
```

**Benefits:**
- Pagination support
- Sorting by priority, deadline, status
- Filtering by status, employee
- Better performance with large datasets

---

### 2.2 Add Missing Modal Components

#### **2.2.1 PackagingTaskDetailModal**
**Purpose:** View order details and item list  
**Trigger:** Click "Chi tiết" or task row  
**Contents:**
- Order information (ID, customer, address, phone)
- Item list (product name, quantity, unit, location in warehouse)
- Timeline (ordered → ready for packaging → packaging → quality check → ready for delivery)
- Packaging notes/instructions
- Special requirements (fragile, temperature-sensitive)

#### **2.2.2 StartPackagingModal**
**Purpose:** Assign employee and start packaging process  
**Trigger:** Click "Bắt đầu đóng gói"  
**Contents:**
- Order summary
- Employee assignment dropdown (filter by available/role="Packaging Staff")
- Packaging checklist
- Start time recording
- Confirm button → updates order status to "PACKAGING"

#### **2.2.3 QualityCheckModal**
**Purpose:** Quality inspection before shipping  
**Trigger:** After packaging is marked complete  
**Contents:**
- Checklist: items correct, packaging secure, labels attached, temperature check (if needed)
- Photo upload for package documentation
- Pass/Fail decision
- Notes field for issues
- Approve button → updates status to "READY_FOR_DELIVERY"

---

### 2.3 Enhanced Task Card (PackagingTask Component)

**Current data shown:**
- Order ID, Customer name, Item count, Weight, Delivery deadline, Assigned employee, Status

**Additional data needed:**
- Priority level (HIGH/MEDIUM/LOW) → visual indicator (red/yellow/green dot)
- Time remaining until deadline → countdown badge
- Order type (FRESH/FROZEN/DRY) → affects packaging requirements
- Special instructions icon (if present)
- Packaging materials required
- Action buttons context-aware by status:
  - WAITING → "Bắt đầu đóng gói"
  - PACKAGING → "Đang xử lý" (disabled) + progress indicator
  - QUALITY_CHECK → "Kiểm tra chất lượng"
  - READY_FOR_DELIVERY → "Sẵn sàng" (green checkmark)

---

### 2.4 Enhanced Employee Card (PackagingEmp Component)

**Current data shown:**
- Avatar, Name, Orders today count, Status, Current task

**Improvements:**
- Show efficiency metrics: avg time per order, orders completed today/this week
- Status with more granularity:
  - AVAILABLE (green) → show "Phân công" button
  - BUSY (blue) → show current task with progress %
  - BREAK (orange) → show return time
  - OFFLINE (gray)
- Click employee card → view employee detail modal with:
  - Work history today
  - Performance metrics
  - Assign new task button (if available)

---

### 2.5 Functional Search & Filter

#### **Search capabilities:**
- Order ID (DH-xxxx)
- Customer name
- Employee name

#### **Filter options:**
```jsx
<Select placeholder="Trạng thái">
  <Option value="WAITING">Chờ đóng gói</Option>
  <Option value="PACKAGING">Đang đóng gói</Option>
  <Option value="QUALITY_CHECK">Kiểm tra chất lượng</Option>
  <Option value="READY_FOR_DELIVERY">Sẵn sàng giao</Option>
</Select>

<Select placeholder="Độ ưu tiên">
  <Option value="HIGH">Cao</Option>
  <Option value="MEDIUM">Trung bình</Option>
  <Option value="LOW">Thấp</Option>
</Select>

<DatePicker placeholder="Deadline" />
```

---

### 2.6 Real-time Summary Cards

**Connect to live data:**
```jsx
const [stats, setStats] = useState({
  waitingCount: 0,
  packagingCount: 0,
  qualityCheckCount: 0,
  activeEmployees: 0,
  totalEmployees: 0
});

// Update from API every 30s or on action
useEffect(() => {
  fetchPackagingStats();
  const interval = setInterval(fetchPackagingStats, 30000);
  return () => clearInterval(interval);
}, []);
```

---

### 2.7 Add "Hướng dẫn đóng gói" Content

**Current:** Just text "Hướng dẫn đóng gói"

**Improved:**
```jsx
<div className="flex flex-col w-full h-fit bg-white p-5 rounded-xl gap-3">
  <p className="text-xl font-bold">Hướng dẫn đóng gói</p>
  <Divider style={{ margin: 0 }} />
  
  <Collapse>
    <Panel header="🥬 Sản phẩm tươi sống" key="1">
      <ol>
        <li>Kiểm tra nhiệt độ sản phẩm</li>
        <li>Sử dụng túi cách nhiệt</li>
        <li>Thêm ice pack theo yêu cầu</li>
        <li>Dán nhãn "HÀNG TƯƠI SỐNG"</li>
      </ol>
    </Panel>
    
    <Panel header="❄️ Sản phẩm đông lạnh" key="2">
      <ol>
        <li>Sử dụng thùng xốp chuyên dụng</li>
        <li>Ice pack tối thiểu 3 miếng</li>
        <li>Dán nhãn "ĐÔNG LẠNH - GIAO NHANH"</li>
      </ol>
    </Panel>
    
    <Panel header="📦 Sản phẩm khô" key="3">
      <ol>
        <li>Kiểm tra bao bì sản phẩm</li>
        <li>Đệm chống va đập</li>
        <li>Dán nhãn cẩn thận</li>
      </ol>
    </Panel>
  </Collapse>
  
  <Button type="link">Xem video hướng dẫn →</Button>
</div>
```

---

## 3. Required APIs

### 3.1 Packaging Tasks (Orders)

#### **GET /api/packaging/tasks**
**Purpose:** Fetch list of orders ready for packaging  
**Query Parameters:**
```typescript
{
  pageNum: number;          // Default: 1
  pageSize: number;         // Default: 10
  status?: string;          // WAITING | PACKAGING | QUALITY_CHECK | READY_FOR_DELIVERY
  priority?: string;        // HIGH | MEDIUM | LOW
  employeeId?: number;      // Filter by assigned employee
  searchTerm?: string;      // Search by order ID or customer name
  deadlineBefore?: string;  // ISO date
  sortBy?: string;          // deadline | priority | createdAt
  sortOrder?: string;       // ASC | DESC
}
```

**Expected Response:**
```json
{
  "type": "GOOD",
  "detail": [
    {
      "taskId": 1,
      "orderId": "DH-8901",
      "orderType": "FRESH",
      "customerId": 123,
      "customerName": "Nguyễn Thị Mai",
      "customerPhone": "0901234567",
      "deliveryAddress": "123 Hoàng Hoa Thám, Ba Đình, Hà Nội",
      "itemCount": 3,
      "totalWeight": 1.2,
      "weightUnit": "KILOGRAM",
      "deadline": "2026-04-08T10:00:00Z",
      "priority": "HIGH",
      "status": "WAITING",
      "assignedEmployeeId": 45,
      "assignedEmployeeName": "Nguyễn Thị Cẩm",
      "specialInstructions": "Giao trước 10:00, khách yêu cầu gọi điện trước khi giao",
      "requiresRefrigeration": true,
      "createdAt": "2026-04-08T07:30:00Z",
      "startedAt": null,
      "completedAt": null
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "currentPage": 1
}
```

---

#### **GET /api/packaging/tasks/{taskId}**
**Purpose:** Get detailed information for a specific packaging task  
**Path Parameter:** `taskId` (number)

**Expected Response:**
```json
{
  "type": "GOOD",
  "detail": {
    "taskId": 1,
    "orderId": "DH-8901",
    "orderType": "FRESH",
    "customer": {
      "customerId": 123,
      "name": "Nguyễn Thị Mai",
      "phone": "0901234567",
      "email": "mai@example.com",
      "deliveryAddress": "123 Hoàng Hoa Thám, Ba Đình, Hà Nội"
    },
    "items": [
      {
        "productDetailId": 501,
        "productName": "Cà chua bi",
        "quantity": 2,
        "unit": "KILOGRAM",
        "warehouseLocation": "Kho A - Rack 3 - Level 2",
        "requiresRefrigeration": true,
        "expiryDate": "2026-04-15"
      },
      {
        "productDetailId": 502,
        "productName": "Xà lách xoăn",
        "quantity": 500,
        "unit": "GRAM",
        "warehouseLocation": "Kho A - Fridge 1",
        "requiresRefrigeration": true,
        "expiryDate": "2026-04-12"
      },
      {
        "productDetailId": 503,
        "productName": "Dầu ăn Simply",
        "quantity": 1,
        "unit": "LITER",
        "warehouseLocation": "Kho B - Rack 1 - Level 1",
        "requiresRefrigeration": false,
        "expiryDate": "2027-01-01"
      }
    ],
    "packagingRequirements": {
      "boxSize": "LARGE",
      "needsIcePack": true,
      "icePackCount": 2,
      "needsInsulation": true,
      "fragile": false
    },
    "timeline": {
      "orderPlaced": "2026-04-08T07:30:00Z",
      "readyForPackaging": "2026-04-08T08:00:00Z",
      "packagingStarted": null,
      "packagingCompleted": null,
      "qualityCheckPassed": null,
      "readyForDelivery": null
    },
    "priority": "HIGH",
    "status": "WAITING",
    "deadline": "2026-04-08T10:00:00Z",
    "specialInstructions": "Giao trước 10:00, khách yêu cầu gọi điện trước khi giao",
    "assignedEmployee": {
      "employeeId": 45,
      "name": "Nguyễn Thị Cẩm",
      "avatarUrl": "https://i.pravatar.cc/150?img=5"
    }
  }
}
```

---

#### **POST /api/packaging/tasks/{taskId}/start**
**Purpose:** Assign employee and start packaging process  
**Path Parameter:** `taskId` (number)  
**Request Body:**
```json
{
  "employeeId": 45
}
```

**Expected Response:**
```json
{
  "type": "GOOD",
  "detail": {
    "taskId": 1,
    "status": "PACKAGING",
    "assignedEmployeeId": 45,
    "startedAt": "2026-04-08T08:15:00Z"
  },
  "message": "Bắt đầu đóng gói thành công"
}
```

---

#### **PUT /api/packaging/tasks/{taskId}/complete**
**Purpose:** Mark packaging as completed, ready for quality check  
**Path Parameter:** `taskId` (number)  
**Request Body:**
```json
{
  "employeeId": 45,
  "notes": "Đã đóng gói xong, chờ kiểm tra"
}
```

**Expected Response:**
```json
{
  "type": "GOOD",
  "detail": {
    "taskId": 1,
    "status": "QUALITY_CHECK",
    "completedAt": "2026-04-08T08:45:00Z"
  },
  "message": "Hoàn thành đóng gói"
}
```

---

#### **POST /api/packaging/tasks/{taskId}/quality-check**
**Purpose:** Perform quality inspection and approve/reject  
**Path Parameter:** `taskId` (number)  
**Request Body:**
```json
{
  "inspectorEmployeeId": 12,
  "passed": true,
  "checklist": {
    "itemsCorrect": true,
    "packagingSecure": true,
    "labelsAttached": true,
    "temperatureCheck": true
  },
  "notes": "Đạt chuẩn",
  "photoUrls": [
    "https://storage.example.com/packaging/DH8901-1.jpg",
    "https://storage.example.com/packaging/DH8901-2.jpg"
  ]
}
```

**Expected Response:**
```json
{
  "type": "GOOD",
  "detail": {
    "taskId": 1,
    "status": "READY_FOR_DELIVERY",
    "qualityCheckPassed": true,
    "checkedAt": "2026-04-08T08:50:00Z"
  },
  "message": "Kiểm tra chất lượng thành công"
}
```

---

### 3.2 Packaging Statistics

#### **GET /api/packaging/stats**
**Purpose:** Get real-time packaging statistics for summary cards  
**Query Parameters:**
```typescript
{
  date?: string;  // ISO date, default: today
}
```

**Expected Response:**
```json
{
  "type": "GOOD",
  "detail": {
    "waitingCount": 3,
    "packagingCount": 2,
    "qualityCheckCount": 1,
    "readyForDeliveryCount": 5,
    "activeEmployees": 3,
    "totalPackagingEmployees": 5,
    "averagePackagingTime": 18.5,
    "completedToday": 12,
    "onTimeRate": 0.92
  }
}
```

---

### 3.3 Packaging Employees

#### **GET /api/employees/packaging**
**Purpose:** Get list of packaging staff with availability  
**Query Parameters:**
```typescript
{
  status?: string;  // AVAILABLE | BUSY | BREAK | OFFLINE
  includeStats?: boolean;  // Include performance stats
}
```

**Expected Response:**
```json
{
  "type": "GOOD",
  "detail": [
    {
      "employeeId": 45,
      "name": "Nguyễn Thị Cẩm",
      "avatarUrl": "https://i.pravatar.cc/150?img=5",
      "role": "Packaging Staff",
      "status": "BUSY",
      "currentTaskId": 1,
      "currentTaskOrderId": "DH-8902",
      "currentTaskProgress": 65,
      "stats": {
        "ordersToday": 8,
        "ordersThisWeek": 43,
        "averageTimePerOrder": 17.5,
        "onTimeRate": 0.95
      },
      "shiftStart": "2026-04-08T07:00:00Z",
      "shiftEnd": "2026-04-08T15:00:00Z"
    },
    {
      "employeeId": 46,
      "name": "Trần Văn Nam",
      "avatarUrl": "https://i.pravatar.cc/150?img=8",
      "role": "Packaging Staff",
      "status": "AVAILABLE",
      "currentTaskId": null,
      "currentTaskOrderId": null,
      "currentTaskProgress": 0,
      "stats": {
        "ordersToday": 6,
        "ordersThisWeek": 38,
        "averageTimePerOrder": 19.2,
        "onTimeRate": 0.88
      },
      "shiftStart": "2026-04-08T07:00:00Z",
      "shiftEnd": "2026-04-08T15:00:00Z"
    }
  ]
}
```

---

#### **GET /api/employees/{employeeId}/tasks**
**Purpose:** Get task history for a specific employee  
**Path Parameter:** `employeeId` (number)  
**Query Parameters:**
```typescript
{
  date?: string;  // ISO date, default: today
  pageNum?: number;
  pageSize?: number;
}
```

**Expected Response:**
```json
{
  "type": "GOOD",
  "detail": {
    "employeeId": 45,
    "employeeName": "Nguyễn Thị Cẩm",
    "date": "2026-04-08",
    "tasks": [
      {
        "taskId": 1,
        "orderId": "DH-8902",
        "startedAt": "2026-04-08T07:15:00Z",
        "completedAt": "2026-04-08T07:32:00Z",
        "duration": 17,
        "status": "COMPLETED",
        "onTime": true
      },
      {
        "taskId": 2,
        "orderId": "DH-8903",
        "startedAt": "2026-04-08T07:35:00Z",
        "completedAt": "2026-04-08T07:58:00Z",
        "duration": 23,
        "status": "COMPLETED",
        "onTime": true
      }
    ],
    "totalTasks": 8,
    "averageDuration": 18.5,
    "totalWorkTime": 148
  }
}
```

---

### 3.4 Packaging Instructions

#### **GET /api/packaging/instructions**
**Purpose:** Get packaging guidelines by product type

**Expected Response:**
```json
{
  "type": "GOOD",
  "detail": [
    {
      "categoryType": "FRESH",
      "categoryName": "Sản phẩm tươi sống",
      "icon": "🥬",
      "steps": [
        "Kiểm tra nhiệt độ sản phẩm (2-4°C)",
        "Sử dụng túi cách nhiệt chuyên dụng",
        "Thêm ice pack theo yêu cầu (1 pack/kg)",
        "Dán nhãn \"HÀNG TƯƠI SỐNG - GIAO NHANH\"",
        "Ghi rõ hạn sử dụng trên nhãn"
      ],
      "videoUrl": "https://video.example.com/fresh-packaging.mp4"
    },
    {
      "categoryType": "FROZEN",
      "categoryName": "Sản phẩm đông lạnh",
      "icon": "❄️",
      "steps": [
        "Kiểm tra nhiệt độ sản phẩm (-18°C)",
        "Sử dụng thùng xốp chuyên dụng",
        "Ice pack tối thiểu 3 miếng/đơn",
        "Dán niêm phong nhiệt độ",
        "Dán nhãn \"ĐÔNG LẠNH - GIAO NHANH\""
      ],
      "videoUrl": "https://video.example.com/frozen-packaging.mp4"
    },
    {
      "categoryType": "DRY",
      "categoryName": "Sản phẩm khô",
      "icon": "📦",
      "steps": [
        "Kiểm tra bao bì sản phẩm nguyên vẹn",
        "Sử dụng giấy đệm chống va đập",
        "Xếp sản phẩm nặng xuống dưới",
        "Dán nhãn cẩn thận, dễ dàng",
        "Niêm phong thùng hàng"
      ],
      "videoUrl": "https://video.example.com/dry-packaging.mp4"
    }
  ]
}
```

---

## 4. UI/UX Improvement Tasks (Sequential Order)

### **Day 1: Service Layer & API Foundation**
**Goal:** Set up backend communication infrastructure

**Tasks:**
- [ ] Create `src/services/packagingService.js` with all API functions
  - `getPackagingTasks(params)`
  - `getPackagingTaskById(taskId)`
  - `startPackagingTask(taskId, employeeId)`
  - `completePackagingTask(taskId, data)`
  - `performQualityCheck(taskId, data)`
  - `getPackagingStats(date)`
  - `getPackagingEmployees(status)`
  - `getEmployeeTaskHistory(employeeId, date)`
  - `getPackagingInstructions()`
- [ ] Test all service functions with Postman/API client
- [ ] Add proper error handling for network failures

**Files Created:** `src/services/packagingService.js`  
**Estimated Time:** 6-8 hours

---

### **Day 2: Dynamic Summary Cards**
**Goal:** Replace hard-coded statistics with live data

**Tasks:**
- [ ] Add state management for stats in `ManagePackaging.jsx`
  ```javascript
  const [stats, setStats] = useState({
    waitingCount: 0,
    packagingCount: 0,
    qualityCheckCount: 0,
    activeEmployees: 0,
    totalEmployees: 0
  });
  ```
- [ ] Create `fetchPackagingStats()` function
- [ ] Implement `useEffect` to fetch on mount
- [ ] Connect stats to `<SummaryCard>` components
- [ ] Add loading skeleton for summary cards
- [ ] Add error state with retry button
- [ ] Implement auto-refresh every 30 seconds

**Files Modified:** `src/layout/manage-packaging/ManagePackaging.jsx`  
**Estimated Time:** 6-8 hours

---

### **Day 3: PackagingTaskTable Component**
**Goal:** Replace static task list with dynamic table

**Tasks:**
- [ ] Create `src/layout/manage-packaging/components/PackagingTaskTable.jsx`
- [ ] Implement Ant Design `<Table>` with columns:
  - Order ID (sortable, with link)
  - Customer Info (name + avatar)
  - Items Summary (count + weight)
  - Deadline (with countdown badge)
  - Priority (HIGH/MEDIUM/LOW indicator)
  - Status (with color-coded tag)
  - Assigned Employee
  - Actions (Detail/Start buttons)
- [ ] Add pagination (10 items per page)
- [ ] Implement sorting by deadline, priority, createdAt
- [ ] Add loading skeleton
- [ ] Add empty state ("Không có đơn hàng cần đóng gói")
- [ ] Replace static task list in `ManagePackaging.jsx`

**Files Created:** `src/layout/manage-packaging/components/PackagingTaskTable.jsx`  
**Files Modified:** `src/layout/manage-packaging/ManagePackaging.jsx`  
**Estimated Time:** 8 hours

---

### **Day 4: Search & Filter Functionality**
**Goal:** Enable users to find tasks quickly

**Tasks:**
- [ ] Replace static "Filter" text with functional filter controls
- [ ] Add status filter dropdown:
  ```jsx
  <Select placeholder="Trạng thái" onChange={handleStatusFilter}>
    <Option value="ALL">Tất cả</Option>
    <Option value="WAITING">Chờ đóng gói</Option>
    <Option value="PACKAGING">Đang đóng gói</Option>
    <Option value="QUALITY_CHECK">Kiểm tra chất lượng</Option>
    <Option value="READY_FOR_DELIVERY">Sẵn sàng giao</Option>
  </Select>
  ```
- [ ] Add priority filter dropdown (HIGH/MEDIUM/LOW)
- [ ] Add deadline date picker filter
- [ ] Make SearchBox functional (search by order ID or customer name)
- [ ] Implement debounce for search input (300ms)
- [ ] Add "Clear filters" button
- [ ] Update table when filters change

**Files Modified:** 
- `src/layout/manage-packaging/ManagePackaging.jsx`
- `src/layout/manage-packaging/components/PackagingTaskTable.jsx`  
**Estimated Time:** 6-8 hours

---

### **Day 5: PackagingTaskDetailModal**
**Goal:** View comprehensive order details

**Tasks:**
- [ ] Create `src/layout/manage-packaging/components/PackagingTaskDetailModal.jsx`
- [ ] Add modal structure with Ant Design `<Modal>`
- [ ] Create sections:
  - **Order Information** (ID, customer, address, phone)
  - **Items List** (table with product name, quantity, unit, warehouse location, expiry)
  - **Packaging Requirements** (box size, ice packs, insulation)
  - **Timeline** (Steps component showing progress)
  - **Special Instructions** (alert box if present)
- [ ] Implement `fetchTaskDetail()` on modal open
- [ ] Add loading spinner
- [ ] Add error state
- [ ] Connect to "Chi tiết" button in task table

**Files Created:** `src/layout/manage-packaging/components/PackagingTaskDetailModal.jsx`  
**Files Modified:** `src/layout/manage-packaging/components/PackagingTaskTable.jsx`  
**Estimated Time:** 8 hours

---

### **Day 6: StartPackagingModal**
**Goal:** Assign employee and begin packaging workflow

**Tasks:**
- [ ] Create `src/layout/manage-packaging/components/StartPackagingModal.jsx`
- [ ] Add form with Ant Design `<Form>`:
  - Order summary (read-only)
  - Employee assignment dropdown (filter AVAILABLE employees)
  - Packaging checklist (checkboxes)
  - Notes field (optional)
- [ ] Fetch available employees on modal open
- [ ] Implement `handleStartPackaging()` function
- [ ] Show loading state during submission
- [ ] Show success message: "Bắt đầu đóng gói thành công"
- [ ] Refresh task table after success
- [ ] Update summary cards
- [ ] Connect to "Bắt đầu đóng gói" button

**Files Created:** `src/layout/manage-packaging/components/StartPackagingModal.jsx`  
**Files Modified:** `src/layout/manage-packaging/components/PackagingTaskTable.jsx`  
**Estimated Time:** 8 hours

---

### **Day 7: QualityCheckModal**
**Goal:** Implement quality inspection workflow

**Tasks:**
- [ ] Create `src/layout/manage-packaging/components/QualityCheckModal.jsx`
- [ ] Add form with inspection checklist:
  - Items correct (checkbox)
  - Packaging secure (checkbox)
  - Labels attached (checkbox)
  - Temperature check (checkbox for fresh/frozen items)
- [ ] Add photo upload component (Ant Design `<Upload>`)
  - Max 3 photos
  - Preview uploaded images
- [ ] Add notes textarea
- [ ] Add Pass/Fail radio buttons
- [ ] Implement `handleQualityCheck()` submission
- [ ] Show loading state
- [ ] Show success/error messages
- [ ] Refresh table after submission
- [ ] Add "Kiểm tra chất lượng" button to table (visible for QUALITY_CHECK status)

**Files Created:** `src/layout/manage-packaging/components/QualityCheckModal.jsx`  
**Files Modified:** `src/layout/manage-packaging/components/PackagingTaskTable.jsx`  
**Estimated Time:** 8 hours

---

### **Day 8: PackagingEmployeeList Component**
**Goal:** Show real-time employee status and availability

**Tasks:**
- [ ] Create `src/layout/manage-packaging/components/PackagingEmployeeList.jsx`
- [ ] Fetch employees from API
- [ ] Enhance employee card display:
  - Avatar with online indicator
  - Name + role
  - Status badge (AVAILABLE/BUSY/BREAK/OFFLINE) with colors
  - Current task (if busy)
  - Task progress bar (if busy)
  - Today's stats (orders completed, avg time)
- [ ] Add click handler to view employee detail
- [ ] Add loading skeleton
- [ ] Replace static employee list in `ManagePackaging.jsx`
- [ ] Auto-refresh employee status every 30 seconds

**Files Created:** `src/layout/manage-packaging/components/PackagingEmployeeList.jsx`  
**Files Modified:** `src/layout/manage-packaging/ManagePackaging.jsx`  
**Estimated Time:** 6-8 hours

---

### **Day 9: EmployeeDetailModal**
**Goal:** View employee performance and task history

**Tasks:**
- [ ] Create `src/layout/manage-packaging/components/EmployeeDetailModal.jsx`
- [ ] Add sections:
  - **Employee Info** (avatar, name, role, shift time)
  - **Today's Performance** (orders completed, avg time, on-time rate)
  - **Task History** (table with order ID, start time, end time, duration)
  - **Weekly Stats** (chart showing daily performance)
- [ ] Fetch employee task history on modal open
- [ ] Add "Phân công nhiệm vụ" button (if employee is AVAILABLE)
- [ ] Connect to employee card click

**Files Created:** `src/layout/manage-packaging/components/EmployeeDetailModal.jsx`  
**Files Modified:** `src/layout/manage-packaging/components/PackagingEmployeeList.jsx`  
**Estimated Time:** 8 hours

---

### **Day 10: Enhanced Task Card UI**
**Goal:** Add visual indicators and better UX to task cards (if using card view instead of table)

**Tasks:**
- [ ] Add priority indicator (colored dot: red/yellow/green)
- [ ] Add countdown timer for deadline
  - Show "2h 15m còn lại" if > 1 hour
  - Show "45m còn lại" if < 1 hour
  - Show "Quá hạn 30m" in red if overdue
- [ ] Add order type badge (FRESH/FROZEN/DRY) with icons
- [ ] Add special instructions icon (if present)
- [ ] Make status badge more prominent with icons
- [ ] Add hover effect on cards
- [ ] Implement context-aware action buttons:
  - WAITING → "Bắt đầu đóng gói" (primary button)
  - PACKAGING → "Đang xử lý..." (disabled, with spinner)
  - QUALITY_CHECK → "Kiểm tra chất lượng" (warning button)
  - READY_FOR_DELIVERY → "Sẵn sàng" (success badge)

**Files Modified:** `src/layout/manage-packaging/components/PackagingTask.jsx`  
**Estimated Time:** 6 hours  
**Note:** Skip if using table view from Day 3

---

### **Day 11: Packaging Instructions Panel**
**Goal:** Provide helpful guidelines to packaging staff

**Tasks:**
- [ ] Fetch packaging instructions from API
- [ ] Replace placeholder "Hướng dẫn đóng gói" with functional component
- [ ] Implement collapsible panels (Ant Design `<Collapse>`):
  - 🥬 Sản phẩm tươi sống
  - ❄️ Sản phẩm đông lạnh
  - 📦 Sản phẩm khô
- [ ] Add step-by-step instructions for each category
- [ ] Add "Xem video hướng dẫn" links
- [ ] Make panel sticky when scrolling
- [ ] Add print button for physical reference

**Files Modified:** `src/layout/manage-packaging/ManagePackaging.jsx`  
**Files Created:** `src/layout/manage-packaging/components/PackagingInstructions.jsx` (optional)  
**Estimated Time:** 4-6 hours

---

### **Day 12: Visual Polish & Responsiveness**
**Goal:** Improve overall UI/UX and ensure consistency

**Tasks:**
- [ ] Add smooth transitions for modal open/close
- [ ] Implement skeleton loading for all data fetches
- [ ] Add empty states with illustrations:
  - No tasks: "🎉 Tất cả đơn hàng đã được đóng gói!"
  - No employees: "Chưa có nhân viên đóng gói"
  - Search no results: "Không tìm thấy đơn hàng"
- [ ] Add tooltips for icon buttons
- [ ] Ensure Vietnamese text is consistent
- [ ] Fix responsive layout for tablets (768px-1024px)
- [ ] Test all modals on different screen sizes
- [ ] Add keyboard shortcuts:
  - Ctrl/Cmd + K: Focus search
  - Esc: Close modals
- [ ] Add page transitions when navigating

**Files Modified:** All components  
**Estimated Time:** 6-8 hours

---

### **Day 13: Advanced Filtering & Sorting**
**Goal:** Power user features for finding tasks

**Tasks:**
- [ ] Add multi-select filter (filter by multiple statuses)
- [ ] Add employee filter dropdown (show tasks assigned to specific employee)
- [ ] Add date range filter (show tasks within date range)
- [ ] Add weight range filter (< 1kg, 1-5kg, > 5kg)
- [ ] Add "Chỉ hiển thị quá hạn" toggle
- [ ] Add "Chỉ hiển thị ưu tiên cao" toggle
- [ ] Save filter preferences to localStorage
- [ ] Add "Lưu bộ lọc" feature (save custom filter sets)
- [ ] Implement advanced sorting:
  - Deadline (ascending/descending)
  - Priority (high → low)
  - Created time (newest/oldest)
  - Weight (heavy → light)

**Files Modified:** 
- `src/layout/manage-packaging/ManagePackaging.jsx`
- `src/layout/manage-packaging/components/PackagingTaskTable.jsx`  
**Estimated Time:** 8 hours

---

### **Day 14: Real-time Updates & Notifications**
**Goal:** Keep data fresh without manual refresh

**Tasks:**
- [ ] Implement auto-refresh for task table (every 30 seconds)
- [ ] Implement auto-refresh for employee list (every 30 seconds)
- [ ] Implement auto-refresh for summary cards (every 30 seconds)
- [ ] Add "Last updated" timestamp display
- [ ] Add manual refresh button with loading spinner
- [ ] Add notification dot when new tasks arrive
- [ ] Add toast notification for:
  - New urgent task (priority = HIGH, deadline < 2 hours)
  - Task overdue
  - Employee becomes available
- [ ] Implement optimistic UI updates:
  - When starting task, immediately show as PACKAGING
  - When completing task, immediately update status
- [ ] Add retry logic for failed requests

**Files Modified:** All components  
**Estimated Time:** 8 hours

---

### **Day 15: Performance Metrics & Analytics**
**Goal:** Show actionable insights to managers

**Tasks:**
- [ ] Add "Analytics" tab/section
- [ ] Implement charts (using Recharts, already installed):
  - Tasks completed per hour (line chart)
  - Average packaging time by employee (bar chart)
  - On-time delivery rate (donut chart)
  - Status distribution (pie chart)
- [ ] Add time range selector (Today/This Week/This Month)
- [ ] Display key metrics:
  - Total tasks completed
  - Average packaging time
  - On-time rate percentage
  - Busiest hour of the day
- [ ] Add employee leaderboard (top performers)
- [ ] Add export to Excel button

**Files Created:** `src/layout/manage-packaging/components/PackagingAnalytics.jsx`  
**Files Modified:** `src/layout/manage-packaging/ManagePackaging.jsx`  
**Estimated Time:** 8 hours

---

### **Day 16: Accessibility & Error Handling**
**Goal:** Ensure usability for all users and graceful failures

**Tasks:**
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works:
  - Tab through all buttons/inputs
  - Enter to submit forms
  - Esc to close modals
- [ ] Add focus indicators (blue outline on focused elements)
- [ ] Test with screen reader (optional)
- [ ] Implement comprehensive error handling:
  - Network timeout (show retry button)
  - 401 Unauthorized (redirect to login)
  - 403 Forbidden (show permission error)
  - 404 Not Found (show helpful message)
  - 500 Server Error (show "Vui lòng thử lại sau")
- [ ] Add error boundary component
- [ ] Add global error toast handler
- [ ] Log errors to console for debugging

**Files Modified:** All components  
**Files Created:** `src/components/ErrorBoundary.jsx` (if not exists)  
**Estimated Time:** 6 hours

---

### **Day 17: Mobile Optimization (Optional)**
**Goal:** Make packaging management accessible on tablets/phones

**Tasks:**
- [ ] Test on mobile viewport (375px, 414px)
- [ ] Convert table to card list on mobile
- [ ] Make summary cards stack vertically on mobile
- [ ] Adjust font sizes for readability
- [ ] Increase button sizes for touch (min 44px height)
- [ ] Implement swipe gestures:
  - Swipe right on task → open detail
  - Swipe left on task → show actions
- [ ] Add bottom navigation for mobile
- [ ] Test on real iOS/Android devices

**Files Modified:** All components  
**Estimated Time:** 8 hours

---

### **Day 18: Final Polish & Testing**
**Goal:** Bug fixes, refinement, and quality assurance

**Tasks:**
- [ ] User acceptance testing (UAT) with real warehouse staff
- [ ] Fix any UI glitches or alignment issues
- [ ] Test all user flows:
  - View task → Start packaging → Complete → Quality check
  - Filter tasks → Search → Sort
  - View employee details → Assign task
- [ ] Test error scenarios:
  - No internet connection
  - API timeout
  - Invalid data from API
- [ ] Performance testing:
  - Test with 100+ tasks
  - Check memory leaks
  - Measure initial load time
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Code cleanup:
  - Remove console.logs
  - Remove commented code
  - Add JSDoc comments
- [ ] Update CLAUDE.md with new packaging module patterns

**Files Modified:** All components, CLAUDE.md  
**Estimated Time:** 8 hours

---

## Task Summary

**Total Tasks:** 18 days  
**Estimated Total Time:** ~130-145 hours  
**Sprint Duration:** 3.5-4 weeks (with buffer)

### Priority Breakdown:
- **Critical (Must-Have):** Days 1-8 (Core functionality)
- **Important (Should-Have):** Days 9-14 (Enhanced UX)
- **Nice-to-Have:** Days 15-18 (Polish & optimization)

### Dependencies:
- Day 1 must complete before all others (Service layer)
- Days 2-4 can run in parallel (different components)
- Days 5-7 (Modals) depend on Day 3 (Table)
- Days 13-14 depend on Days 2-4
- Days 17-18 can be done after core features are stable

---

## 5. Technical Considerations

### **5.1 Similar to Existing Modules**
Follow patterns from:
- `src/layout/manage-warehouse/components/ProductBatchTable.jsx` — table structure, pagination
- `src/layout/manage-warehouse/components/ProductBatchDetailModal.jsx` — modal pattern
- `src/services/productBatchService.js` — service structure

### **5.2 Dependencies (Already Installed)**
- Ant Design — `Table`, `Modal`, `Form`, `Select`, `DatePicker`, `Upload`
- dayjs — date formatting, countdown calculation
- Axios — API calls via `axiosInstance`

### **5.3 State Management**
- Local component state for UI (modals, selected items)
- No need for Redux (auth already handled globally)
- Consider React Query for better caching (already installed: `@tanstack/react-query`)

### **5.4 Error Handling**
Always check API response:
```javascript
if (response.data.type === 'GOOD') {
  // Success
} else if (response.data.type === 'SKIP_AS_GOOD') {
  // Empty state
} else {
  // Error
  message.error(response.data.message);
}
```

---

## 6. Additional Recommendations

### **6.1 WebSocket for Real-time Updates**
Consider adding WebSocket connection for:
- Task status changes
- Employee availability changes
- New orders arriving
- Urgent deadline alerts

### **6.2 Barcode Scanner Integration**
For faster packaging workflow:
- Scan order barcode to open task
- Scan product barcodes to verify items
- Scan completion to trigger quality check

### **6.3 Mobile Responsive**
Current layout is desktop-focused. Consider:
- Responsive breakpoints for tablets
- Mobile view for warehouse floor staff
- Touch-friendly buttons for scanning devices

### **6.4 Accessibility**
- Add ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode for warehouse lighting

---

## 7. Summary

**Current State:** Static prototype with hard-coded data  
**Target State:** Fully functional packaging management system with:
- Real-time task tracking
- Employee assignment & monitoring
- Quality control workflow
- Performance analytics
- Search & filter capabilities

**Key APIs Needed:** 8 endpoints
1. GET /api/packaging/tasks (with pagination/filters)
2. GET /api/packaging/tasks/{taskId}
3. POST /api/packaging/tasks/{taskId}/start
4. PUT /api/packaging/tasks/{taskId}/complete
5. POST /api/packaging/tasks/{taskId}/quality-check
6. GET /api/packaging/stats
7. GET /api/employees/packaging
8. GET /api/employees/{employeeId}/tasks
9. GET /api/packaging/instructions (optional)

**Estimated Effort:** 4 weeks (1 developer)  
**Priority:** High (critical for warehouse operations)

---

# PART 2: PACKAGING EMPLOYEE PERSPECTIVE

**Date:** 2026-04-09  
**Focus:** Employee-facing interface for warehouse floor staff  
**Purpose:** Design and implement packaging workflow from employee point of view

---

## 1. Employee Needs Analysis

### 1.1 Current Manager-Side Implementation (Completed)
- ✅ Task queue management
- ✅ Employee monitoring dashboard
- ✅ Task assignment workflow
- ✅ Quality check oversight
- ✅ Real-time status tracking

### 1.2 Missing Employee-Side Features
The current implementation is **100% manager-focused**. Packaging employees need:

#### **Critical Needs:**
1. **Personal Task Queue** - See only MY assigned tasks, not all tasks
2. **Task Execution Workflow** - Step-by-step packaging process
3. **Simple Actions** - Start, pause, complete tasks with one tap
4. **Mobile-First UI** - Tablets/phones on warehouse floor, not desktop
5. **Barcode Scanning** - Quick order/product verification
6. **Real-time Status** - Automatic updates without manual refresh

#### **Secondary Needs:**
7. **Personal Performance** - My stats, not team stats
8. **Break Management** - Clock in/out for breaks
9. **Help/Support** - Report issues, request assistance
10. **Packaging Instructions** - Product-specific guidelines

---

## 2. User Personas

### **Persona 1: Experienced Packaging Staff**
- **Name:** Nguyễn Thị Cẩm (5 years experience)
- **Needs:** 
  - Fast workflow (minimize clicks)
  - Batch processing multiple orders
  - Performance tracking
- **Pain Points:**
  - Switching between paper lists and system
  - Unclear priority when multiple orders assigned

### **Persona 2: New Employee**
- **Name:** Trần Văn Nam (2 months experience)
- **Needs:**
  - Clear step-by-step instructions
  - Visual packaging guides
  - Error prevention
- **Pain Points:**
  - Forgetting steps (ice packs, labels)
  - Uncertain about special requirements

### **Persona 3: Team Lead/Supervisor**
- **Name:** Lê Hoàng Duy (shift supervisor)
- **Needs:**
  - Quick overview of team status
  - Ability to reassign urgent tasks
  - Quality check authority
- **Pain Points:**
  - Can't see who needs help
  - Manual task distribution

---

## 3. Employee Interface Structure

### 3.1 New Routes Needed

```
/packaging/employee              # Employee dashboard (default)
/packaging/employee/task/:taskId # Active task execution
/packaging/employee/my-stats     # Personal performance
/packaging/employee/instructions # Packaging guidelines
/packaging/employee/help         # Support/report issue
```

### 3.2 Page Breakdown

#### **A. Employee Dashboard** (`/packaging/employee`)
**Purpose:** Personal task queue and quick actions

**Sections:**
1. **Header Bar**
   - Employee name + avatar
   - Clock in/out button
   - Current status badge (Working/Break/Idle)
   - Today's stats summary

2. **My Tasks Queue**
   - Assigned to me only
   - Sorted by priority/deadline
   - Color-coded urgency (red/yellow/green)
   - Quick start button on each task

3. **Active Task Card** (if working)
   - Current order details
   - Progress indicator
   - Time elapsed
   - Quick actions: Pause, Complete, Help

4. **Bottom Navigation**
   - Tasks (home)
   - Instructions
   - My Stats
   - Help

#### **B. Task Execution Page** (`/packaging/employee/task/:taskId`)
**Purpose:** Step-by-step packaging workflow

**Flow:**
1. **Order Summary**
   - Customer info
   - Items list with checkboxes
   - Special instructions (highlighted)
   - Packaging requirements

2. **Step 1: Item Collection**
   - Checklist of products to pick
   - Barcode scanner integration
   - Warehouse location hints
   - Mark each item as collected

3. **Step 2: Packaging Process**
   - Box size recommendation
   - Ice pack quantity (if needed)
   - Insulation requirements
   - Fragile handling warnings

4. **Step 3: Labeling**
   - Print shipping label button
   - Attach all required labels
   - Photo upload (optional)

5. **Step 4: Self Quality Check**
   - Quick checklist (4-5 items)
   - Temperature check (if fresh/frozen)
   - Final photo
   - Submit for supervisor QC

#### **C. My Stats Page** (`/packaging/employee/my-stats`)
**Purpose:** Personal performance tracking

**Metrics:**
- Today: Orders completed, avg time, accuracy
- This week: Daily chart, total orders, on-time %
- This month: Trends, achievements, areas to improve
- Leaderboard: Rank among team (optional, gamification)

#### **D. Instructions Page** (`/packaging/employee/instructions`)
**Purpose:** Quick reference guides

**Content:**
- Product-specific packaging rules
- Box size guide (visual)
- Temperature requirements chart
- Special handling procedures
- FAQs

---

## 4. UI/UX Design Principles for Warehouse Floor

### 4.1 Mobile-First Design
- **Target Device:** 10" tablets (iPad-sized)
- **Orientation:** Portrait mode (easier to hold)
- **Touch Targets:** Minimum 48x48px (3rem x 3rem)
- **Font Size:** Base 18px (1.125rem) - readable at arm's length

### 4.2 Simplified Color System
- 🔴 **Red:** Urgent/overdue tasks
- 🟡 **Yellow:** High priority
- 🟢 **Green:** Normal priority
- 🔵 **Blue:** Current active task
- ⚪ **Gray:** Completed/inactive

### 4.3 Big Button Design
All action buttons should be:
- **Large:** Minimum 3rem height
- **High Contrast:** Dark text on bright backgrounds
- **Icon + Text:** Visual + label for clarity
- **Haptic Feedback:** Vibrate on tap (mobile)

### 4.4 Minimal Text, Maximum Icons
Replace text with icons where possible:
- ✅ Checkmark = Complete
- ⏸️ Pause = Break
- 📷 Camera = Photo upload
- 🔍 Search = Barcode scan
- ❓ Question = Help

### 4.5 Error Prevention
- **Confirmation dialogs** for destructive actions
- **Auto-save** task progress
- **Offline mode** with sync when connected
- **Undo option** for recent actions

---

## 5. Technical Requirements

### 5.1 New APIs Needed

#### **1. GET /api/packaging/employee/my-tasks**
**Purpose:** Fetch tasks assigned to logged-in employee

**Query Params:**
- `status` (optional): ASSIGNED | IN_PROGRESS | COMPLETED
- `date` (optional): ISO date string (default: today)

**Response:**
```json
{
  "type": "GOOD",
  "detail": {
    "employeeId": 45,
    "employeeName": "Nguyễn Thị Cẩm",
    "currentStatus": "WORKING",
    "activeTask": {
      "taskId": 123,
      "orderId": "DH-8901",
      "startedAt": "2026-04-09T08:30:00Z",
      "timeElapsed": 420
    },
    "assignedTasks": [
      {
        "taskId": 124,
        "orderId": "DH-8902",
        "priority": "HIGH",
        "deadline": "2026-04-09T12:00:00Z",
        "itemCount": 5,
        "orderType": "FROZEN",
        "assignedAt": "2026-04-09T08:00:00Z"
      }
    ],
    "todayStats": {
      "completed": 3,
      "inProgress": 1,
      "pending": 2,
      "avgTimePerOrder": 18.5
    }
  }
}
```

#### **2. POST /api/packaging/employee/tasks/{taskId}/start**
**Purpose:** Employee starts working on assigned task

**Request Body:**
```json
{
  "location": "Warehouse A - Zone 2",
  "deviceId": "TABLET-05"
}
```

**Response:**
```json
{
  "type": "GOOD",
  "detail": {
    "taskId": 123,
    "status": "IN_PROGRESS",
    "startedAt": "2026-04-09T08:30:00Z",
    "estimatedDuration": 20,
    "items": [
      {
        "productDetailId": 567,
        "productName": "Cá hồi Na Uy",
        "quantity": 2,
        "unit": "KILOGRAM",
        "warehouseLocation": "Kho A - Ngăn 3 - Tầng 2",
        "barcode": "8934567890123",
        "requiresRefrigeration": true,
        "collected": false
      }
    ],
    "packagingRequirements": {
      "boxSize": "MEDIUM",
      "needsIcePack": true,
      "icePackCount": 4,
      "needsInsulation": true,
      "fragile": false
    }
  }
}
```

#### **3. PUT /api/packaging/employee/tasks/{taskId}/items/{productDetailId}/collect**
**Purpose:** Mark individual item as collected/checked

**Request Body:**
```json
{
  "barcode": "8934567890123",
  "collectedAt": "2026-04-09T08:35:00Z"
}
```

#### **4. POST /api/packaging/employee/tasks/{taskId}/pause**
**Purpose:** Pause task (break, emergency)

**Request Body:**
```json
{
  "reason": "BREAK" // BREAK | HELP_NEEDED | EMERGENCY
}
```

#### **5. POST /api/packaging/employee/tasks/{taskId}/complete**
**Purpose:** Employee marks task as complete, ready for QC

**Request Body:**
```json
{
  "completedAt": "2026-04-09T09:00:00Z",
  "duration": 30,
  "selfCheckPassed": true,
  "photos": [
    { "url": "...", "type": "PACKAGE_FRONT" },
    { "url": "...", "type": "PACKAGE_LABEL" }
  ],
  "notes": "Đã hoàn thành, chờ kiểm tra chất lượng"
}
```

#### **6. POST /api/packaging/employee/status**
**Purpose:** Update employee status (break, available, offline)

**Request Body:**
```json
{
  "status": "BREAK", // AVAILABLE | BREAK | OFFLINE
  "timestamp": "2026-04-09T10:00:00Z"
}
```

#### **7. GET /api/packaging/employee/my-stats**
**Purpose:** Personal performance metrics

**Query Params:**
- `period`: today | week | month
- `startDate`, `endDate` (optional)

**Response:**
```json
{
  "type": "GOOD",
  "detail": {
    "employeeId": 45,
    "period": "week",
    "stats": {
      "ordersCompleted": 43,
      "averageTimePerOrder": 17.5,
      "onTimeRate": 0.95,
      "accuracyRate": 0.98,
      "dailyBreakdown": [
        { "date": "2026-04-08", "orders": 8, "avgTime": 18.2 },
        { "date": "2026-04-09", "orders": 3, "avgTime": 16.5 }
      ]
    },
    "ranking": {
      "position": 2,
      "totalEmployees": 12,
      "topMetric": "accuracy"
    }
  }
}
```

#### **8. POST /api/packaging/employee/help**
**Purpose:** Request assistance or report issue

**Request Body:**
```json
{
  "taskId": 123,
  "issueType": "MISSING_ITEM" | "DAMAGED_PRODUCT" | "UNCLEAR_INSTRUCTION" | "EQUIPMENT_ISSUE",
  "description": "Không tìm thấy sản phẩm tại vị trí kho A-3-2",
  "priority": "NORMAL" | "URGENT"
}
```

---

## 6. Implementation Plan - Employee Side

### **Phase 1: Core Employee Dashboard (Week 1)**

#### Day 1: Setup & Routing
- [ ] Create new route `/packaging/employee`
- [ ] Create folder structure: `src/layout/packaging-employee/`
- [ ] Setup protected route (role: PACKAGING_STAFF)
- [ ] Create base layout component with bottom navigation

#### Day 2: My Tasks Queue Component
- [ ] Create `MyTasksQueue.jsx` component
- [ ] Fetch assigned tasks API integration
- [ ] Task card component (simplified, mobile-friendly)
- [ ] Priority color coding (red/yellow/green)
- [ ] Empty state when no tasks

#### Day 3: Active Task Card
- [ ] Create `ActiveTaskCard.jsx` component
- [ ] Real-time timer display
- [ ] Progress indicator
- [ ] Quick action buttons (Pause, Complete, Help)
- [ ] Auto-refresh every 5 seconds

#### Day 4: Employee Status Management
- [ ] Clock in/out functionality
- [ ] Status toggle (Working/Break/Idle)
- [ ] Break timer component
- [ ] Status update API integration

#### Day 5: Dashboard Polish & Testing
- [ ] Header with employee info
- [ ] Today's stats summary cards
- [ ] Responsive design adjustments
- [ ] Touch interaction testing
- [ ] Pull-to-refresh gesture

---

### **Phase 2: Task Execution Workflow (Week 2)**

#### Day 6: Task Execution Page Structure
- [ ] Create `/packaging/employee/task/:taskId` route
- [ ] Create `TaskExecution.jsx` main component
- [ ] Multi-step wizard layout (Stepper component)
- [ ] Order summary section
- [ ] Navigation between steps

#### Day 7: Step 1 - Item Collection
- [ ] Product checklist component
- [ ] Warehouse location display
- [ ] Item checkbox interactions
- [ ] Mark item as collected API
- [ ] Progress tracking

#### Day 8: Barcode Scanner Integration
- [ ] Install barcode scanner library (`react-qr-barcode-scanner` or similar)
- [ ] Camera permission handling
- [ ] Barcode input field (manual entry fallback)
- [ ] Scan-to-verify product flow
- [ ] Sound/vibration feedback on scan

#### Day 9: Step 2 - Packaging Process
- [ ] Packaging requirements display
- [ ] Box size visual guide
- [ ] Ice pack counter
- [ ] Special instructions alert
- [ ] Checklist for packaging materials

#### Day 10: Step 3 - Labeling & Photo Upload
- [ ] Print label button integration
- [ ] Photo capture component (use device camera)
- [ ] Multiple photo upload (max 3)
- [ ] Image preview before upload
- [ ] Upload progress indicator

---

### **Phase 3: Quality Check & Completion (Week 3)**

#### Day 11: Self Quality Check
- [ ] Create `SelfQualityCheck.jsx` component
- [ ] Employee checklist (simplified, 4-5 items)
- [ ] Temperature verification (if applicable)
- [ ] Photo requirement enforcement
- [ ] Pass/fail logic

#### Day 12: Task Completion Flow
- [ ] Complete task button
- [ ] Confirmation dialog
- [ ] Duration calculation
- [ ] Success animation/feedback
- [ ] Auto-redirect to next task

#### Day 13: Pause & Resume Functionality
- [ ] Pause task modal
- [ ] Reason selection (break, help needed, etc.)
- [ ] Resume task from paused state
- [ ] Time tracking during pause
- [ ] Pause history log

#### Day 14: Error Handling & Offline Mode
- [ ] Network error detection
- [ ] Offline data caching (IndexedDB or localStorage)
- [ ] Queue actions for sync when online
- [ ] Sync status indicator
- [ ] Conflict resolution

#### Day 15: Help & Support Feature
- [ ] Create help request modal
- [ ] Issue type selection
- [ ] Photo attachment for issues
- [ ] Submit help request API
- [ ] Real-time notification to supervisors

---

### **Phase 4: Personal Stats & Gamification (Week 4)**

#### Day 16: My Stats Page
- [ ] Create `/packaging/employee/my-stats` route
- [ ] Today's performance cards
- [ ] Weekly chart (Recharts library)
- [ ] Monthly trends
- [ ] Fetch personal stats API

#### Day 17: Leaderboard & Achievements
- [ ] Team ranking component
- [ ] Achievement badges (optional)
- [ ] Streak tracking (days worked)
- [ ] Milestone celebrations
- [ ] Share stats feature (optional)

#### Day 18: Instructions & Guidelines
- [ ] Create `/packaging/employee/instructions` route
- [ ] Product-specific guides (searchable)
- [ ] Box size visual chart
- [ ] Temperature requirements table
- [ ] Video tutorials (optional)
- [ ] FAQs accordion

#### Day 19: Polish & Accessibility
- [ ] Dark mode toggle (for low-light warehouse)
- [ ] Large text mode (accessibility)
- [ ] Voice commands (experimental)
- [ ] Haptic feedback on all actions
- [ ] Sound effects toggle

#### Day 20: Testing & Deployment
- [ ] Cross-device testing (iPad, Android tablets)
- [ ] Performance optimization
- [ ] Real warehouse floor testing
- [ ] User feedback collection
- [ ] Production deployment

---

## 7. Mobile UI Components Library

### 7.1 Custom Components Needed

#### **BigButton Component**
```jsx
<BigButton
  icon={<CheckCircleOutlined />}
  label="Hoàn thành"
  variant="success" // success, danger, primary, secondary
  size="large"
  onClick={handleComplete}
  loading={submitting}
/>
```

#### **TaskCard Component (Mobile)**
```jsx
<TaskCard
  orderId="DH-8901"
  priority="HIGH"
  deadline="2026-04-09T12:00:00Z"
  itemCount={5}
  orderType="FROZEN"
  onStart={handleStart}
  urgent={true}
/>
```

#### **ProgressTimer Component**
```jsx
<ProgressTimer
  startTime="2026-04-09T08:30:00Z"
  estimatedDuration={20}
  onComplete={handleTimeUp}
  showAlert={true}
/>
```

#### **BarcodeScanner Component**
```jsx
<BarcodeScanner
  onScan={handleBarcodeScan}
  expectedBarcode="8934567890123"
  allowManualEntry={true}
  successSound={true}
/>
```

#### **ItemChecklist Component**
```jsx
<ItemChecklist
  items={orderItems}
  onItemCheck={handleItemCheck}
  showLocations={true}
  enableScan={true}
/>
```

---

## 8. State Management

### 8.1 Redux Slices Needed

#### **EmployeeSlice**
```javascript
const employeeSlice = createSlice({
  name: 'employee',
  initialState: {
    profile: null,
    status: 'IDLE', // IDLE, WORKING, BREAK, OFFLINE
    currentTask: null,
    assignedTasks: [],
    stats: null
  },
  reducers: {
    setStatus,
    setCurrentTask,
    updateTaskProgress,
    completeTask,
    fetchMyTasks
  }
});
```

#### **TaskExecutionSlice**
```javascript
const taskExecutionSlice = createSlice({
  name: 'taskExecution',
  initialState: {
    currentStep: 1,
    orderDetails: null,
    collectedItems: [],
    photos: [],
    selfCheckPassed: false,
    startTime: null,
    pausedDuration: 0
  },
  reducers: {
    startTask,
    collectItem,
    nextStep,
    prevStep,
    uploadPhoto,
    pauseTask,
    resumeTask,
    submitTask
  }
});
```

---

## 9. API Integration Summary

### Employee-Side APIs (8 endpoints)

| Method | Endpoint | Purpose | Priority |
|--------|----------|---------|----------|
| GET | `/api/packaging/employee/my-tasks` | Fetch my assigned tasks | Critical |
| POST | `/api/packaging/employee/tasks/{id}/start` | Start task | Critical |
| PUT | `/api/packaging/employee/tasks/{id}/items/{itemId}/collect` | Mark item collected | High |
| POST | `/api/packaging/employee/tasks/{id}/pause` | Pause task | High |
| POST | `/api/packaging/employee/tasks/{id}/complete` | Complete task | Critical |
| POST | `/api/packaging/employee/status` | Update my status | Medium |
| GET | `/api/packaging/employee/my-stats` | Personal performance | Low |
| POST | `/api/packaging/employee/help` | Request help | Medium |

---

## 10. Success Metrics

### 10.1 User Adoption
- ✅ 80%+ employees actively use the system
- ✅ Average 5+ logins per shift per employee
- ✅ Less than 10% reliance on paper lists

### 10.2 Efficiency
- ✅ 20% reduction in average packaging time
- ✅ 30% faster item location via barcode scanning
- ✅ 50% reduction in packaging errors

### 10.3 User Satisfaction
- ✅ 4.5+ star rating in employee surveys
- ✅ Less than 5% help requests per day
- ✅ 90%+ completion of self-quality checks

---

## 11. Future Enhancements

### Voice Commands
- "Start next task"
- "Mark item collected"
- "Request help"

### AR/Smart Glasses Integration
- Heads-up display for item locations
- Hands-free barcode scanning
- Real-time instruction overlay

### AI-Powered Assistance
- Smart packing recommendations
- Predictive task assignment
- Anomaly detection (missing items, wrong products)

### Wearable Integration
- Smartwatch quick actions
- Fitness band break reminders
- Ring scanner compatibility

---

## 12. Summary: Employee vs Manager Perspective

| Feature | Manager Side (Current) | Employee Side (New) |
|---------|----------------------|---------------------|
| **View** | All tasks, all employees | My tasks only |
| **Device** | Desktop/laptop | Tablet/phone |
| **Actions** | Assign, monitor, approve | Execute, complete, report |
| **UI Style** | Data tables, analytics | Big buttons, simple cards |
| **Updates** | 30-second auto-refresh | Real-time (5-second refresh) |
| **Complexity** | High (many filters, stats) | Low (minimal options) |
| **Primary Goal** | Oversight & coordination | Task completion |

**Estimated Total Effort:** 4 weeks (1 developer)  
**Priority:** High (equal to manager side)  
**Deployment:** Phased rollout (pilot with 2-3 employees first)

