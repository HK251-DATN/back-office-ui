# Delivery Employee Interface

Employee-facing interface for delivery drivers to manage delivery tasks.

## Overview

This module implements the delivery workflow from the employee's perspective, allowing delivery drivers to:
- View orders ready for delivery
- Accept delivery tasks
- View customer and delivery information
- Mark orders as delivered
- Track delivery progress

## Features Implemented

### ✅ Core Functionality

1. **Ready for Delivery Table**
   - Shows all orders with READY_FOR_PICKUP status
   - Displays customer info, delivery address, and order value
   - Combined API calls to fetch order + delivery information
   - "Start Delivery" action to claim orders
   - Click-to-call phone numbers
   - Click-to-map addresses
   - COD amount display

2. **My Delivery Tasks Table**
   - Shows orders currently being delivered (SHIPPING status)
   - Real-time delivery task tracking
   - "Delivered" action button with confirmation
   - Optional delivery notes
   - Auto-refresh every 30 seconds
   - COD collection tracking

3. **Order Detail Modal**
   - Comprehensive order information
   - Customer details with click-to-call
   - Full delivery address with maps integration
   - Payment information (COD)
   - Special delivery instructions
   - Optional start delivery action

### 🎨 Mobile-First Design

- Large touch targets (min 3rem / 48px height)
- Click-to-call phone numbers
- Click-to-map delivery addresses
- High contrast colors for outdoor visibility
- Responsive layout for tablets/phones
- Touch-friendly interactions

## File Structure

```
src/layout/delivery-employee/
├── DeliveryEmployee.jsx           # Main container component
├── DeliveryEmployee.css           # Mobile-first styling
├── README.md                      # This file
└── components/
    ├── ReadyForDeliveryTable.jsx  # Shows orders ready to deliver
    ├── MyDeliveryTasksTable.jsx   # Shows employee's tasks
    └── OrderDetailModal.jsx       # Order details display
```

## API Integration

All API calls are centralized in `src/services/deliveryEmployeeService.js`:

### Implemented Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/order/admin?status=READY_FOR_PICKUP` | GET | Get orders ready for delivery |
| `/api/orders/admin/delivery/:orderId` | GET | Get delivery info for order |
| `/api/order/:orderId/ship` | PUT | Start delivery (accept task) |
| `/api/order/emp/delivering-tasks` | GET | Get employee's delivery tasks |
| `/api/order/:orderId/deliver` | PUT | Complete delivery |

### Combined Data Fetching

The service implements smart data fetching:
- `getReadyOrdersWithDeliveryInfo()` - Fetches orders + enriches each with delivery info
- `getMyTasksWithDeliveryInfo()` - Fetches tasks + enriches each with delivery info

This ensures the UI has all necessary data in a single call.

## Usage

### 1. Access the Interface

Navigate to `/delivery/employee` or click "Nhiệm vụ giao hàng" in the sidebar.

### 2. Accept a Delivery Task

1. Go to "Đơn hàng sẵn sàng" tab
2. Review order details (customer, address, amount)
3. Click "Chi tiết" to see full information (optional)
4. Click "Bắt đầu giao" button
5. Confirm acceptance
6. Order moves to "Nhiệm vụ của tôi" tab

### 3. Complete a Delivery

1. Go to "Nhiệm vụ của tôi" tab
2. Find the delivered order
3. Click "Đã giao hàng" button
4. Add delivery notes (optional)
5. Confirm completion
6. Order marked as delivered

## UI Components

### Color Coding

- 🔵 **Blue**: Ready for delivery, primary actions
- 🟢 **Green**: Success, completed deliveries, payment amounts
- 🟡 **Orange**: COD payment badges
- ⚪ **Gray**: Inactive, disabled states

### Interactive Elements

1. **Phone Numbers**: Click to call directly
2. **Addresses**: Click to open Google Maps
3. **Order Values**: Prominently displayed for COD collection
4. **Refresh Buttons**: Manual refresh with success feedback

### Button Sizes

All action buttons use `size="large"` with minimum 3rem (48px) height for easy tapping on mobile devices.

## Mobile Optimization

### Responsive Breakpoints

- **Desktop** (>768px): Full table view with all columns
- **Tablet** (640px-768px): Adjusted font sizes, compact spacing
- **Mobile** (<640px): Optimized layout, larger touch targets

### Touch Interactions

- Minimum 48x48px touch targets
- Active state feedback (scale animation)
- High contrast for outdoor visibility
- Click-to-call and click-to-map for quick actions

## User Permissions

Currently accessible by:
- `ADMIN` role
- `EMPLOYEE` role

To add more roles, update the ProtectedRoute in `AppRouter.jsx`.

## Differences from Packaging Employee

| Feature | Packaging Employee | Delivery Employee |
|---------|-------------------|-------------------|
| **Workflow** | Complex (product linking) | Simple (start/complete) |
| **Sub-tasks** | Multiple per order | None |
| **Progress** | Percentage-based | Binary (shipping/delivered) |
| **External** | Internal warehouse | External customer |
| **Critical Info** | Product locations | Customer address, phone |
| **Mobile Features** | Barcode scanning | Maps, phone calls |

## API Response Handling

### Combined Data Structure

After fetching, each order/task has this structure:

```javascript
{
  // Original order data
  order_id: "6",
  email: "buyer@gmail.com",
  f_name: "Fbuyer",
  l_name: "Lbuyer",
  status: "READY_FOR_PICKUP",
  packaging_progress: 100,
  updated_at: "2026-04-14T13:10:36.324865",
  
  // Enriched delivery info
  deliveryInfo: {
    receiver_name: "Fbuyer Lbuyer",
    receiver_p_num: "0901234567",
    detail: "123 Nguyễn Văn Linh",
    commune: "Phường Tân Phú",
    district: "Quận 7",
    province: "TP.HCM",
    total_price: 450000,
    note: "Gọi trước 15 phút"
  }
}
```

## Statistics Dashboard

### Ready for Delivery Tab:
- Tổng đơn hàng (Total orders)
- Sẵn sàng giao (Ready for delivery)
- Tổng giá trị COD (Total COD amount)

### My Delivery Tasks Tab:
- Nhiệm vụ của tôi (My tasks count)
- Đang giao (Currently shipping)
- Cần thu tiền (Total COD to collect)

## Error Handling

### Common Scenarios:

1. **No orders available**: Empty state with friendly message
2. **API error**: Error message with retry button
3. **Network timeout**: "Mất kết nối, vui lòng thử lại"
4. **Order already taken**: Handled by backend, shows error
5. **Missing delivery info**: Gracefully shows "-" for missing data

## Future Enhancements

Not implemented in current version (from plan):
- [ ] Photo proof of delivery upload
- [ ] Customer signature capture
- [ ] GPS tracking
- [ ] Route optimization
- [ ] Delivery performance metrics
- [ ] Push notifications
- [ ] Real-time location sharing
- [ ] Cash collection reconciliation

## Testing Checklist

- [x] Orders load in "Ready for Delivery" tab
- [x] Combined API calls fetch delivery info
- [x] "Start Delivery" accepts order successfully
- [x] Order moves to "My Tasks" after acceptance
- [x] Order details modal displays correctly
- [x] "Delivered" button marks order as complete
- [x] Statistics update correctly
- [x] Refresh buttons work with success messages
- [x] Click-to-call works (opens phone app)
- [x] Click-to-map opens Google Maps
- [x] Responsive on tablets/phones
- [x] Vietnamese labels display correctly
- [x] Error messages show properly

## Development Notes

### State Management

- Local component state (useState) for UI state
- No Redux needed (auth handled globally)
- API calls trigger data refresh

### Performance

- Combined API calls reduce round trips
- Auto-refresh limited to 30 seconds
- Pagination on tables (10 items per page)
- Modal data loaded on-demand

### Error Handling

- Try-catch blocks around all API calls
- User-friendly error messages in Vietnamese
- Console logs for debugging
- Graceful degradation for missing delivery info

## Credits

Implemented based on the specification in:
`instructions/delivery-employee-pov.md`

Created: 2026-04-14
Pattern: Similar to packaging-employee implementation
