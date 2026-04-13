## Order Processing Workflow (Technical Specification)

### 1. Service Architecture & Event Definitions
* **ecommerce-service:** Manages customer-facing order lifecycle.
* **back-office-service:** Manages internal fulfillment and employee assignments.
* **product-storage-service:** Manages physical inventory, picking, and stock-item linking.

---

### 2. The Step-by-Step Flow

#### Phase 1: Order Initiation & Confirmation
1.  **Creation:** `ecommerce-service` converts a Cart to an Order. Initial Status: `PENDING`.
2.  **Manual Verification:** An employee checks `product-storage-service` for stock availability.
3.  **Confirmation:** Employee updates `ecommerce-service` status to `CONFIRMED`.
4.  **Broadcast:** `ecommerce-service` publishes two events:
    * `OrderConfirmed` (Consumed by `back-office-service`)
    * `OrderPickRequested` (Consumed by `product-storage-service`)

#### Phase 2: Fulfillment & Picking
1.  **Back-Office Initialization:** `back-office-service` creates a detailed order entity.
2.  **Packaging Start:** When an Employee see a CONFIRMED order, he/she choose it to start packaging for that order --> Employee sets status to `PACKAGING` in the `back-office-service`.
3.  **Picking (Inventory):** `product-storage-service` allows item picking **only while** the status is `PACKAGING`. 
    * The employee links `order-items` to specific `product-details`.
4.  **Progress Tracking:** As items are linked, `product-storage-service` calculates progress:
    $$\text{Progress} = \left( \frac{\text{Linked Items}}{\text{Total Items}} \right) \times 100$$
    * It calls `back-office-service` to update the `packaging_progress` property.
5.  **Completion:** Once $100\%$ linked, `product-storage-service` updates the `back-office-service` status to `READY-FOR-DELIVERY`.

#### Phase 3: Delivery & Finalization
1.  **Dispatch:** A delivery employee in `back-office-service` changes status to `DELIVERING`.
    * *Trigger:* Publishes `OrderDelivering` event to `ecommerce-service` to update the customer UI.
2.  **Drop-off:** Once delivered, status is updated to `DELIVERED` in `back-office-service`.
    * *Trigger:* Publishes `OrderDelivered` event to `ecommerce-service`.
3.  **Customer Receipt:** The customer clicks "Received Order" on the UI.
    * *Final Transition:* `ecommerce-service` updates status to `RECEIVED`.