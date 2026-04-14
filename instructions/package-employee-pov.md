# PACKAGING EMPLOYEE PERSPECTIVE

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

### 5.1 APIs

#### 1. APIs to render the order to be packaged table
GET {{back-office-url}}/api/order/admin?status=CONFIRMED

**Query Params:**
- `status`: default is CONFIRMED. These are the confirmed order by another employee, which mean that he/she has confirm that there are enough product in the warehouse to package this order

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
      "status": "CONFIRMED",
      "total_price": null,
      "updated_at": "2026-04-13T00:33:57.213717"
    }
  ],
  "timestamp": "2026-04-13T22:34:24.018052675"
}
```

GET {{ecommerce-url}}/api/orders/admin/order-summary?status=CONFIRMED
**Response:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get all orders summary success",
  "detail": [
    {
      "total_quantity": 3,
      "order_id": 6,
      "num_of_item": 1
    }
  ],
  "timestamp": "2026-04-13T22:41:03.366349269"
}
```

PUT {{back-office-url}}/api/order/:order-id/package
**Purpose:** Employee starts packaging an order, this action change the order status from CONFIRMED to PACKAGING. This also mark that this order will be package by me.

**Response:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Package order successfully",
  "detail": null,
  "timestamp": "2026-04-12T08:49:37.444976504"
}
```

#### 2. APIs for render the table contains orders which I (the employee) has selected to package
GET {{back-office-url}}/api/order/emp/packaging-tasks

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
      "packaging_progress": 33,
      "status": "PACKING",
      "total_price": null,
      "updated_at": "2026-04-14T00:01:20.548549"
    }
  ],
  "timestamp": "2026-04-14T00:34:12.78391674"
}
```

#### 3. APIs for render the view order-to-be-packed detail modal

##### 1. APIs for order detail (Combine 2 APIs):

GET {{ecommerce-url}}/api/orders/admin/:order-id
**Response:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get order detail success",
  "detail": {
    "orderId": 6,
    "buyerId": "2",
    "addressId": 1,
    "status": "CONFIRMED",
    "note": null,
    "type": null,
    "totalPrice": 450000,
    "couponId": null,
    "createdAt": "2026-04-12T13:46:30.239201",
    "updatedAt": "2026-04-13T00:33:56.906483",
    "orderItems": [
      {
        "orderItemId": 5,
        "orderId": 6,
        "batchDetailId": "1",
        "quantity": 3,
        "originalPrice": 150000.00,
        "unitPriceAtPurchase": 150000.00,
        "totalPrice": 450000.00,
        "createdAt": "2026-04-12T13:46:30.253054",
        "updatedAt": null,
        "productName": null
      }
    ]
  },
  "timestamp": "2026-04-14T00:37:19.015960071"
}
```

GET {{back-office-url}}/api/order/:order-id
**Response:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Read order successfully",
  "detail": {
    "confirmedBy": null,
    "orderId": 6,
    "ownedBy": 2,
    "packagedBy": 1,
    "packagingProgress": 33,
    "shippedBy": null,
    "status": "PACKING",
    "totalPrice": null
  },
  "timestamp": "2026-04-14T12:48:13.630749978"
}
```

##### 2. GET {{product-storage-url}}/api/pick-list/:order-id
**Purpose:** Employee view list of order item of order order-id that need to be link with product detail

**Response**:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get pick list for order 6 successfully",
  "detail": [
    {
      "batchDetailId": 1,
      "batchId": 1,
      "buyerId": 2,
      "name": "Gà Ta Nguyên Con",
      "orderId": 6,
      "orderItemId": 7,
      "prodGenId": 1,
      "productDetailId": 3,
      "unit": "KILOGRAM"
    },
    {
      "batchDetailId": 1,
      "batchId": 1,
      "buyerId": 2,
      "name": "Gà Ta Nguyên Con",
      "orderId": 6,
      "orderItemId": 6,
      "prodGenId": 1,
      "productDetailId": null,
      "unit": "KILOGRAM"
    },
    {
      "batchDetailId": 1,
      "batchId": 1,
      "buyerId": 2,
      "name": "Gà Ta Nguyên Con",
      "orderId": 6,
      "orderItemId": 5,
      "prodGenId": 1,
      "productDetailId": null,
      "unit": "KILOGRAM"
    }
  ],
  "timestamp": "2026-04-14T12:44:03.606337677"
}
```

##### 3. GET {{product-storage-url}}/api/pick-list/product-detail-list/:order-item-id
**Purpose**: Get available products for a order-item, use when the want to link a product detail with an order item, this provide a graphical interface for the employee to choose.

**Response**:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get available products for order item 7 successfully",
  "detail": [
    {
      "fridgeId": null,
      "prodDetailId": 3,
      "rackId": 1,
      "status": "STORED",
      "storageToolId": 1,
      "toolType": 1,
      "warehouseAddress": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      "warehouseId": 1
    },
    {
      "fridgeId": null,
      "prodDetailId": 4,
      "rackId": 1,
      "status": "STORED",
      "storageToolId": 1,
      "toolType": 1,
      "warehouseAddress": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      "warehouseId": 1
    },
    {
      "fridgeId": null,
      "prodDetailId": 5,
      "rackId": 1,
      "status": "STORED",
      "storageToolId": 1,
      "toolType": 1,
      "warehouseAddress": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      "warehouseId": 1
    },
    {
      "fridgeId": null,
      "prodDetailId": 6,
      "rackId": 1,
      "status": "STORED",
      "storageToolId": 1,
      "toolType": 1,
      "warehouseAddress": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      "warehouseId": 1
    }
  ]
}
```

##### 4. PUT {{product-storage-url}}/api/pick-list/:order-item-id/link/:product-detail-id
**Purpose:** Mark individual item as collected

**Response**:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Link order item 7 with product detail 3 successfully",
  "detail": null,
  "timestamp": "2026-04-14T00:01:20.229996602"
}
```

**Note**: After PUT {{product-storage-url}}/api/pick-list/:order-item-id/link/:product-detail-id, the order packaging progress will automatically update. So re-call the first api to update the modal

### Useful APIs that are not yet implemented

#### **POST /api/packaging/employee/status**
**Purpose:** Update employee status (break, available, offline)

**Request Body:**
```json
{
  "status": "BREAK", // AVAILABLE | BREAK | OFFLINE
  "timestamp": "2026-04-09T10:00:00Z"
}
```

#### **GET /api/packaging/employee/my-stats**
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

#### **POST /api/packaging/employee/help**
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