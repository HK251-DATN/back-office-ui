## Order Confirmation UI

### 1. Sidebar & Navigation
* **New Menu Item:** Add a tab titled **"Order Management"** to the primary navigation sidebar.
* **Default View:** Clicking this tab should load the "Order List" table.

### 2. Order List Table
This table displays all orders:
* **Columns:**
    * **Order ID:** Unique identifier from `ecommerce-service`.
    * **Customer:** Combined field: `Buyer ID` — `Buyer Name`.
    * **Total Value:** The currency amount of the order.
    * **Status:** Current lifecycle stage (filtered to show `CREATED`, `CONFIRMED`, `PACKING`, `READY_FOR_PICKUP`, `SHIPPING`, `DELIVERY`, `COMPLETED`).
    * **SKU Count:** The number of unique product types in the order.
    * **Total Quantity:** The sum of all items across all product types.
    * **Actions:** A "View Details" button.
    
Using the endpoint: GET {{back-office-url}}/api/order/admin, with the request header containing Authentication: Bearer <token>
Response: {
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get all orders successfully",
  "detail": [
    {
      "email": "buyer@gmail.com",
      "f_name": "Fbuyer",
      "l_name": "Lbuyer",
      "order_id": "5",
      "owned_by": "2",
      "status": "DELIVERY",
      "total_price": null,
      "updated_at": "2026-04-12T09:03:40.853289"
    },
    {
      "email": "buyer@gmail.com",
      "f_name": "Fbuyer",
      "l_name": "Lbuyer",
      "order_id": "6",
      "owned_by": "2",
      "status": "CREATED",
      "total_price": null,
      "updated_at": "2026-04-12T13:46:30.85445"
    }
  ],
  "timestamp": "2026-04-12T23:58:35.174440768"
}
And the endpoint: GET {{ecommerce-url}}/api/orders/admin/order-summary, with the request header containing Authentication: Bearer <token>
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get all orders summary success",
  "detail": [
    {
      "order_id": 6,
      "total_quantity": 3,
      "num_of_item": 1
    },
    {
      "order_id": 5,
      "total_quantity": 2,
      "num_of_item": 1
    }
  ],
  "timestamp": "2026-04-12T23:58:26.150688677"
}

### 3. Order Confirmation Modal
When an employee clicks "View Details" on an order with the status `CREATED`:
* **Trigger:** Open a modal window.
* **Data Fetching:**
    * Retrieve the list of `order-items` from the `ecommerce-service`.
    * Cross-reference each item with the `product-storage-service` to fetch real-time "Available Stock".
* **Display Table:**
    * **Product Name/SKU**
    * **Quantity Ordered**
    * **Quantity in Warehouse** (Highlighted in **Red** if Warehouse < Ordered).
* **Action Logic:**
    * **Confirm Button:** Only enabled if all items have sufficient stock. Clicking this updates the `ecommerce-service` status to `CONFIRMED`.
    * **Cancel/Close:** Closes the modal without changes.
    
Using the endpoint: GET {{ecommerce-url}}/api/orders/admin/:order-id with the request header containing Authentication: Bearer <token> to get the order detail and order items
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get order detail success",
  "detail": {
    "orderId": 6,
    "buyerId": "2",
    "addressId": 1,
    "status": "PENDING",
    "note": null,
    "type": null,
    "totalPrice": 450000,
    "couponId": null,
    "createdAt": "2026-04-12T13:46:30.239201",
    "updatedAt": null,
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
  "timestamp": "2026-04-13T00:10:48.341840428"
}

using the endpoint: GET {{product-storage-url}}/api/product-detail/quantity/:batch-id with the request header containing Authentication: Bearer <token> to get the current quantity of the product in warehouse.
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get product detail quantity successfully",
  "detail": 98,
  "timestamp": "2026-04-12T23:58:07.217705005"
}

if the quantity is sufficient, use the endpoint PUT {{ecommerce-url}}/api/orders/:order-id/confirm with the request header containing Authentication: Bearer <token> to change the order status from CREATED to CONFIRMED