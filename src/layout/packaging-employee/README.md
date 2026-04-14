# Packaging Employee Interface

Employee-facing interface for warehouse floor staff to manage packaging tasks.

## Overview

This module implements the packaging workflow from the employee's perspective, allowing warehouse staff to:
- View available orders ready for packaging
- Claim orders to start packaging
- View their assigned packaging tasks
- Execute packaging by linking products to order items
- Track progress in real-time

## Features Implemented

### ✅ Core Functionality

1. **Available Orders Table**
   - Shows all orders with CONFIRMED status
   - Displays customer info, item count, and order summary
   - "Start Packaging" action to claim orders
   - Real-time updates

2. **My Packaging Tasks Table**
   - Shows orders currently being packaged by the employee
   - Progress indicators (0-100%)
   - Color-coded status visualization
   - Auto-refresh every 30 seconds
   - Quick access to task execution

3. **Task Execution Modal**
   - Comprehensive order details view
   - Pick list showing all items to package
   - Product linking workflow
   - Real-time progress tracking

4. **Product Selection Modal**
   - Browse available products for each order item
   - Warehouse location information
   - Storage tool details (rack/fridge)
   - One-click product linking
   - Status filtering

### 🎨 Mobile-First Design

- Large touch targets (min 3rem height)
- Responsive layout for tablets/phones
- High contrast colors for readability
- Optimized for portrait orientation
- Touch-friendly interactions

## File Structure

```
src/layout/packaging-employee/
├── PackagingEmployee.jsx          # Main container component
├── PackagingEmployee.css          # Mobile-first styling
├── README.md                      # This file
└── components/
    ├── AvailableOrdersTable.jsx   # Shows orders ready to package
    ├── MyPackagingTasksTable.jsx  # Shows employee's tasks
    ├── TaskExecutionModal.jsx     # Order details and pick list
    └── ProductSelectionModal.jsx  # Product selection interface
```

## API Integration

All API calls are centralized in `src/services/packagingEmployeeService.js`:

### Implemented Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/order/admin?status=CONFIRMED` | GET | Get available orders |
| `/api/orders/admin/order-summary` | GET | Get order summaries |
| `/api/order/:orderId/package` | PUT | Start packaging order |
| `/api/order/emp/packaging-tasks` | GET | Get my packaging tasks |
| `/api/orders/admin/:orderId` | GET | Get order details (ecommerce) |
| `/api/order/:orderId` | GET | Get order details (back-office) |
| `/api/pick-list/:orderId` | GET | Get pick list for order |
| `/api/pick-list/product-detail-list/:orderItemId` | GET | Get available products |
| `/api/pick-list/:orderItemId/link/:productDetailId` | PUT | Link product to order item |

## Usage

### 1. Access the Interface

Navigate to `/packaging/employee` or click "Nhiệm vụ đóng gói" in the sidebar.

### 2. Claim an Order

1. Go to "Đơn hàng sẵn sàng" tab
2. Find an order with CONFIRMED status
3. Click "Bắt đầu" button
4. Order moves to your task list

### 3. Package an Order

1. Go to "Nhiệm vụ của tôi" tab
2. Click "Chi tiết" on an order
3. In the modal, go to "Danh sách lấy hàng" tab
4. For each order item:
   - Click "Chọn sản phẩm"
   - Select a product with "Đã lưu kho" status
   - Click "Chọn" to link
5. Progress updates automatically
6. When 100% complete, order is ready for next step

## UI Components

### Color Coding

- 🔵 **Blue**: Primary actions, in-progress tasks
- 🟢 **Green**: Completed items, success states
- 🟡 **Orange**: High priority, warnings
- 🔴 **Red**: Urgent, errors
- ⚪ **Gray**: Inactive, disabled states

### Progress Indicators

- **0-33%**: Red - Just started
- **33-66%**: Orange - In progress
- **66-99%**: Blue - Almost done
- **100%**: Green - Complete

### Button Sizes

All action buttons use `size="large"` with minimum 3rem height for easy tapping on mobile devices.

## Mobile Optimization

### Responsive Breakpoints

- **Desktop** (>768px): Full table view with all columns
- **Tablet** (640px-768px): Adjusted font sizes, compact spacing
- **Mobile** (<640px): Optimized layout, larger touch targets

### Touch Interactions

- Minimum 48x48px touch targets
- Active state feedback (scale animation)
- High contrast for visibility
- Scrollable tables with horizontal scroll

## User Permissions

Currently accessible by:
- `ADMIN` role
- `EMPLOYEE` role

To add more roles, update the ProtectedRoute in `AppRouter.jsx`:

```jsx
<Route path="packaging/employee" element={
  <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE", "PACKAGING_STAFF"]}>
    <PackagingEmployee></PackagingEmployee>
  </ProtectedRoute>
} />
```

## Future Enhancements

Based on the original instruction document, future additions could include:

### Phase 2-3 (Not Yet Implemented)
- [ ] Barcode scanner integration
- [ ] Photo upload for packaging verification
- [ ] Self quality check workflow
- [ ] Break management (clock in/out)
- [ ] Help/support request system
- [ ] Real-time notifications

### Phase 4 (Not Yet Implemented)
- [ ] Personal stats and performance tracking
- [ ] Leaderboard and gamification
- [ ] Packaging instructions/guidelines page
- [ ] Voice commands
- [ ] Dark mode toggle

## Styling

The component uses a combination of:
- **Ant Design** components for tables, modals, buttons
- **Tailwind CSS** utility classes for layout
- **Custom CSS** (`PackagingEmployee.css`) for mobile optimizations

### Key CSS Classes

- `.packaging-employee-tabs`: Main container namespace
- Large buttons: `.ant-btn-lg` with custom min-height
- Progress bars: Enhanced `.ant-progress` styling
- Mobile-responsive: Media queries at 640px and 768px

## Testing Checklist

Before deploying, verify:

- [ ] Orders load correctly in Available Orders table
- [ ] "Start Packaging" button claims order successfully
- [ ] My Tasks table shows only employee's orders
- [ ] Task Execution Modal displays order details
- [ ] Pick list loads all order items
- [ ] Product Selection Modal shows available products
- [ ] Product linking updates progress
- [ ] Auto-refresh works (30s interval)
- [ ] Mobile layout is usable on tablets/phones
- [ ] All Vietnamese labels display correctly
- [ ] Error messages show when API fails

## Common Issues

### Order Not Appearing After Start Packaging

**Solution**: The table auto-refreshes. Wait a moment or click "Làm mới" button.

### Progress Not Updating After Linking

**Solution**: The modal refetches data after linking. Check the API response status.

### No Products Available to Link

**Solution**: Verify that products exist in storage with status "STORED" for the batch detail ID.

## Development Notes

### State Management

- Local component state (useState) for UI state
- No Redux needed (auth is handled globally)
- API calls trigger data refresh

### Performance

- Auto-refresh limited to 30 seconds to avoid excessive requests
- Pagination on tables (10 items per page)
- Modal data loaded on-demand

### Error Handling

- Try-catch blocks around all API calls
- User-friendly error messages in Vietnamese
- Console logs for debugging

## Credits

Implemented based on the specification in:
`instructions/package-employee-pov.md`

Created: 2026-04-14
