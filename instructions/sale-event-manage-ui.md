# Sale Event Management — Front-End Implementation Guide

This document is for the front-end developer implementing the sale-event management screens in the back-office UI. It covers screen layout, required APIs, request/response shapes, and UI behaviour notes.

Base URL for all API calls: `http://localhost:9300`

All responses follow the envelope:
```json
{
  "type": "GOOD | SKIP_AS_GOOD | WARN | ERROR",
  "code": "200 OK | 201 CREATED | ...",
  "message": "...",
  "detail": <payload>,
  "timestamp": "2026-04-28T10:00:00"
}
```
`detail` holds the actual data. `SKIP_AS_GOOD` means success with no content (empty list, etc.).

---

## Screens Overview

```
Sale Events
├── [List screen]       — table of all events, create button, search/filter bar
├── [Create / Edit]     — form to create or edit an event (with banner upload)
└── [Detail / Manage]   — view one event, manage products assigned to it
    ├── [Product list]  — table of products in the event
    ├── [Add product]   — search available batch-details and assign them
    └── [Edit product]  — change discount, maxQty, maxBuy for an assigned product
```

---

## 1. Sale Event List Screen

### Layout

- Search bar (name keyword, activeYn toggle, date range pickers for beginDate / endDate)
- Table columns: `ID | Name | Active | Enabled | Begin Date | End Date | Priority | Actions`
- Actions per row: **Edit**, **Enable**, **Cancel**, **Delete**, **Open** (go to detail/manage screen)
- Top-right: **+ Create Event** button

### APIs

#### 1.1 List all events (paginated)

```
GET {{ecommerce-url}}/api/sale-events?page=1&size=20
```

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get active sale events success",
  "detail": [
    {
      "saleEventId": 1,
      "name": "Flash Sale Cuối Tuần",
      "description": "Giảm giá đặc biệt cuối tuần cho thực phẩm tươi sống",
      "img": "https://example.com/flash-sale.jpg",
      "displayPriority": 1,
      "beginDate": "2025-01-01T00:00:00",
      "endDate": "2099-12-31T23:59:59",
      "products": [
        {
          "batchId": "9",
          "productGeneralId": 27,
          "name": "Sườn Cừu Cao Cấp",
          "description": "Sườn cừu cao cấp nướng BBQ",
          "img": "https://pub-0365edd1781141cdb68675969c7cdb87.r2.dev/5fe95e6c-c064-49c4-8712-1c8f54472502.jpg",
          "originPrice": 99000.0000,
          "salePrice": 54000,
          "disVal": 45,
          "maxQty": 4,
          "curQty": 4,
          "maxBuy": 2
        },
        {
          "batchId": "1",
          "productGeneralId": 1,
          "name": "Gà Ta Nguyên Con",
          "description": "Gà ta thả vườn tươi ngon, thịt chắc thơm ngon",
          "img": "https://pub-0365edd1781141cdb68675969c7cdb87.r2.dev/5fe95e6c-c064-49c4-8712-1c8f54472502.jpg",
          "originPrice": 100000.0000,
          "salePrice": 90000,
          "disVal": 10,
          "maxQty": 5,
          "curQty": 3,
          "maxBuy": 3
        }
      ]
    },
    {
      "saleEventId": 2,
      "name": "Khuyến Mãi Tháng 5",
      "description": "Sự kiện tháng 5",
      "img": null,
      "displayPriority": 2,
      "beginDate": "2025-01-01T00:00:00",
      "endDate": "2099-12-31T23:59:59",
      "products": []
    }
  ],
  "timestamp": "2026-04-28T01:36:55.070733829"
}
```

#### 1.2 Search / filter events

```
GET {{ecommerce-url}}/api/sale-events/search
  ?searchString=
  &activeYn=Y          (optional: Y / N)
  &enableYn=Y          (optional: Y / N)
  &beginDate=          (optional: ISO datetime, e.g. 2026-04-01T00:00:00)
  &endDate=            (optional: ISO datetime)
  &page=1
  &size=20
```

Example: {{ecommerce-url}}/api/sale-events/search?searchString=Cuối Tuần

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Search sale events success",
  "detail": [
    {
      "saleEventId": 1,
      "name": "Flash Sale Cuối Tuần",
      "description": "Giảm giá đặc biệt cuối tuần cho thực phẩm tươi sống",
      "img": "https://example.com/flash-sale.jpg",
      "displayPriority": 1,
      "activeYn": "N",
      "enabledYn": "Y",
      "beginTime": null,
      "endTime": null,
      "beginDate": "2025-01-01T00:00:00",
      "endDate": "2099-12-31T23:59:59",
      "detail": null,
      "createdAt": "2026-04-27T09:21:38.084653",
      "updatedAt": null,
      "deletedAt": null
    }
  ],
  "timestamp": "2026-04-28T09:00:14.79179346"
}
```

#### 1.3 Cancel event

```
PUT {{ecommerce-url}}/api/sale-events/{id}/cancel
```

Sets `activeYn = N` and `enabledYn = N`. No request body needed.

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Sale event cancelled",
  "detail": {
    "saleEventId": 1,
    "name": "Flash Sale Cuối Tuần",
    "description": "Giảm giá đặc biệt cuối tuần cho thực phẩm tươi sống",
    "img": "https://example.com/flash-sale.jpg",
    "displayPriority": 1,
    "activeYn": "N",
    "enabledYn": "N",
    "beginTime": null,
    "endTime": null,
    "beginDate": "2025-01-01T00:00:00",
    "endDate": "2099-12-31T23:59:59",
    "detail": null,
    "createdAt": "2026-04-27T09:21:38.084653",
    "updatedAt": "2026-04-28T09:01:58.630520781",
    "deletedAt": null
  },
  "timestamp": "2026-04-28T09:01:58.673982545"
}
```

#### 1.4 Enable event

```
PUT {{ecommerce-url}}/api/sale-events/{id}/enable
```

Sets `activeYn = Y` and `enabledYn = Y`. No request body needed.

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Sale event enabled",
  "detail": {
    "saleEventId": 1,
    "name": "Flash Sale Cuối Tuần",
    "description": "Giảm giá đặc biệt cuối tuần cho thực phẩm tươi sống",
    "img": "https://example.com/flash-sale.jpg",
    "displayPriority": 1,
    "activeYn": "Y",
    "enabledYn": "Y",
    "beginTime": null,
    "endTime": null,
    "beginDate": "2025-01-01T00:00:00",
    "endDate": "2099-12-31T23:59:59",
    "detail": null,
    "createdAt": "2026-04-27T09:21:38.084653",
    "updatedAt": "2026-04-28T09:01:58.630520781",
    "deletedAt": null
  },
  "timestamp": "2026-04-28T09:01:58.673982545"
}
```

#### 1.6 View event detail with sale-products

```
GET {{ecommerce-url}}/api/sale-events/:event-id
```

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get sale event success",
  "detail": {
    "saleEventId": 3,
    "name": "Summer Sale 2",
    "description": "...",
    "img": "https://pub-4df933a93a6c4f2c8c9ce81cc96336ac.r2.dev/d6a02a61-ff81-4159-b713-63e5a48a5b9e_vegetable.png",
    "displayPriority": 1,
    "beginDate": "2026-04-01T00:00:00",
    "endDate": "2026-05-31T23:59:59",
    "products": [
      {
        "batchId": "9",
        "productGeneralId": 27,
        "name": "Sườn Cừu Cao Cấp",
        "description": "Sườn cừu cao cấp nướng BBQ",
        "img": "https://pub-0365edd1781141cdb68675969c7cdb87.r2.dev/5fe95e6c-c064-49c4-8712-1c8f54472502.jpg",
        "originPrice": 99000.0000,
        "salePrice": 89000,
        "disVal": 10,
        "maxQty": 1,
        "curQty": 1,
        "maxBuy": 3
      },
      {
        "batchId": "1",
        "productGeneralId": 1,
        "name": "Gà Ta Nguyên Con",
        "description": "Gà ta thả vườn tươi ngon, thịt chắc thơm ngon",
        "img": "https://pub-0365edd1781141cdb68675969c7cdb87.r2.dev/5fe95e6c-c064-49c4-8712-1c8f54472502.jpg",
        "originPrice": 100000.0000,
        "salePrice": 90000,
        "disVal": 10,
        "maxQty": 1,
        "curQty": 1,
        "maxBuy": 3
      }
    ]
  },
  "timestamp": "2026-04-28T09:28:03.41731337"
}
```

#### 1.5 Delete event

```
DELETE {{ecommerce-url}}/api/sale-events/{id}
```

No response body. Show confirmation dialog before calling.

---

## 2. Create / Edit Event Screen

### Layout

- Form fields (all in one page):

| Field             | Type                  | Notes                                          |
|-------------------|-----------------------|------------------------------------------------|
| `name`            | Text input            | Required                                       |
| `description`     | Textarea              | Optional                                       |
| `displayPriority` | Number input          | Controls ordering on storefront                |
| `activeYn`        | Toggle / Select (Y/N) | Whether event is active                        |
| `enabledYn`       | Toggle / Select (Y/N) | Whether event is visible to customers          |
| `beginDate`       | DateTime picker       | Event start date-time                          |
| `endDate`         | DateTime picker       | Event end date-time                            |
| `beginTime`       | Time picker           | Daily start time (for recurring daily windows) |
| `endTime`         | Time picker           | Daily end time                                 |
| Banner image      | File upload           | Upload separately after save (see §2.3)        |

- On create: `POST {{ecommerce-url}}/api/sale-events`, then upload banner if file selected.
- On edit: `PUT {{ecommerce-url}}/api/sale-events/{id}`, then upload banner if a new file is selected.
- After save, redirect to the Detail/Manage screen for that event.

### APIs

#### 2.1 Create event

```
POST {{ecommerce-url}}/api/sale-events
Content-Type: application/json
```

Request body:
```json
{
  "name": "Summer Sale",
  "description": "...",
  "displayPriority": 1,
  "activeYn": "Y",
  "enabledYn": "Y",
  "beginDate": "2026-05-01T00:00:00",
  "endDate": "2026-05-31T23:59:59",
  "beginTime": "08:00:00",
  "endTime": "22:00:00"
}
```

`beginTime` / `endTime` are optional. Send `null` if not needed.

Response:
```json
{
  "type": "GOOD",
  "code": "201 CREATED",
  "message": "Create success",
  "detail": {
    "saleEventId": 3,
    "name": "Summer Sale",
    "description": "...",
    "img": null,
    "displayPriority": 1,
    "activeYn": "Y",
    "enabledYn": "Y",
    "beginTime": "08:00:00",
    "endTime": "22:00:00",
    "beginDate": "2026-05-01T00:00:00",
    "endDate": "2026-05-31T23:59:59",
    "detail": null,
    "createdAt": "2026-04-28T09:02:28.910776925",
    "updatedAt": null,
    "deletedAt": null
  },
  "timestamp": "2026-04-28T09:02:28.927808987"
}
```

#### 2.2 Update event

```
PUT {{ecommerce-url}}/api/sale-events/{id}
Content-Type: application/json
```

Request body: same shape as create. All fields are replaced.

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Update success",
  "detail": {
    "saleEventId": 3,
    "name": "Summer Sale 2",
    "description": "...",
    "img": null,
    "displayPriority": 1,
    "activeYn": "Y",
    "enabledYn": "Y",
    "beginTime": "08:00:00",
    "endTime": "22:00:00",
    "beginDate": "2026-05-01T00:00:00",
    "endDate": "2026-05-31T23:59:59",
    "detail": null,
    "createdAt": "2026-04-28T09:02:28.910777",
    "updatedAt": "2026-04-28T09:03:30.097081242",
    "deletedAt": null
  },
  "timestamp": "2026-04-28T09:03:30.100123104"
}
```

#### 2.3 Upload banner image

Call this **after** creating or when the admin picks a new file on the edit screen. The returned `img` URL is saved on the event record automatically — no extra update call needed.

```
POST {{ecommerce-url}}/api/sale-events/{id}/banner
Content-Type: multipart/form-data

Form field: image  (file)
```

Response `detail` — updated SaleEvent with `img` set to the new public URL:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Banner uploaded successfully",
  "detail": {
    "saleEventId": 3,
    "name": "Summer Sale 2",
    "description": "...",
    "img": "https://pub-4df933a93a6c4f2c8c9ce81cc96336ac.r2.dev/d6a02a61-ff81-4159-b713-63e5a48a5b9e_vegetable.png",
    "displayPriority": 1,
    "activeYn": "Y",
    "enabledYn": "Y",
    "beginTime": "08:00:00",
    "endTime": "22:00:00",
    "beginDate": "2026-05-01T00:00:00",
    "endDate": "2026-05-31T23:59:59",
    "detail": null,
    "createdAt": "2026-04-28T09:02:28.910777",
    "updatedAt": "2026-04-28T09:04:19.387489866",
    "deletedAt": null
  },
  "timestamp": "2026-04-28T09:04:19.390647323"
}
```

UI note: Display the current banner image (from `img` field) as a preview. Show a file picker below it. Only call this endpoint when the user picks a new file and confirms.

#### 2.4 Get single event (for edit pre-fill)

```
GET {{ecommerce-url}}/api/sale-events/{id}
```

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get sale event success",
  "detail": {
    "saleEventId": 3,
    "name": "Summer Sale 2",
    "description": "...",
    "img": "https://pub-4df933a93a6c4f2c8c9ce81cc96336ac.r2.dev/d6a02a61-ff81-4159-b713-63e5a48a5b9e_vegetable.png",
    "displayPriority": 1,
    "beginDate": "2026-04-01T00:00:00",
    "endDate": "2026-05-31T23:59:59",
    "products": [
      {
        "batchId": "9",
        "productGeneralId": 27,
        "name": "Sườn Cừu Cao Cấp",
        "description": "Sườn cừu cao cấp nướng BBQ",
        "img": "https://pub-0365edd1781141cdb68675969c7cdb87.r2.dev/5fe95e6c-c064-49c4-8712-1c8f54472502.jpg",
        "originPrice": 99000.0000,
        "salePrice": 89000,
        "disVal": 10,
        "maxQty": 1,
        "curQty": 1,
        "maxBuy": 3
      },
      {
        "batchId": "1",
        "productGeneralId": 1,
        "name": "Gà Ta Nguyên Con",
        "description": "Gà ta thả vườn tươi ngon, thịt chắc thơm ngon",
        "img": "https://pub-0365edd1781141cdb68675969c7cdb87.r2.dev/5fe95e6c-c064-49c4-8712-1c8f54472502.jpg",
        "originPrice": 100000.0000,
        "salePrice": 90000,
        "disVal": 10,
        "maxQty": 1,
        "curQty": 1,
        "maxBuy": 3
      }
    ]
  },
  "timestamp": "2026-04-28T09:28:03.41731337"
}
```

---

## 3. Event Detail / Manage Screen

This is the main screen for managing which products are in a sale event.

### Layout

- Header: event name, date range, active/enabled badges, **Edit Event** button
- Banner preview (from `img` field)
- Section: **Products in this Event**
  - Table columns: `Product Name | Batch ID | Origin Price | Discount % | Sale Price | Max Qty | Remaining Qty | Max Buy/Buyer | Actions`
  - Actions per row: **Edit**, **Remove**
  - Button: **+ Add Products**

### APIs

#### 3.1 Get event with its products (for the header + product list)

Use the public active-events endpoint below only if you want the customer-facing view. For the admin manage screen, fetch the event and its products separately:

- **Event info**: `GET {{ecommerce-url}}/api/sale-events/{id}` (see §2.4)
- **Products in event**: use the public active endpoint for reference, or call the sale-products list and filter by `saleEventId` client-side (see §3.2).

Alternative — public endpoint that returns event + products in one call (read-only, no auth required):

```
GET {{ecommerce-url}}/api/sale-events/public/active?page=1&size=10
```

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get active sale events success",
  "detail": [
    {
      "saleEventId": 3,
      "name": "Summer Sale 2",
      "description": "...",
      "img": "https://pub-4df933a93a6c4f2c8c9ce81cc96336ac.r2.dev/d6a02a61-ff81-4159-b713-63e5a48a5b9e_vegetable.png",
      "displayPriority": 1,
      "beginDate": "2026-04-01T00:00:00",
      "endDate": "2026-05-31T23:59:59",
      "products": [
        {
          "batchId": "9",
          "productGeneralId": 27,
          "name": "Sườn Cừu Cao Cấp",
          "description": "Sườn cừu cao cấp nướng BBQ",
          "img": "https://pub-0365edd1781141cdb68675969c7cdb87.r2.dev/5fe95e6c-c064-49c4-8712-1c8f54472502.jpg",
          "originPrice": 99000.0000,
          "salePrice": 89000,
          "disVal": 10,
          "maxQty": 1,
          "curQty": 1,
          "maxBuy": 3
        }
      ]
    },
    {
      "saleEventId": 2,
      "name": "Khuyến Mãi Tháng 5",
      "description": "Sự kiện tháng 5",
      "img": null,
      "displayPriority": 2,
      "beginDate": "2025-01-01T00:00:00",
      "endDate": "2099-12-31T23:59:59",
      "products": []
    }
  ],
  "timestamp": "2026-04-28T09:14:49.818207841"
}
```

Each product in the list:
```json
{
  "batchId": "9",
  "productGeneralId": 27,
  "name": "Sườn Cừu Cao Cấp",
  "description": "Sườn cừu cao cấp nướng BBQ",
  "img": "https://pub-0365edd1781141cdb68675969c7cdb87.r2.dev/5fe95e6c-c064-49c4-8712-1c8f54472502.jpg",
  "originPrice": 99000.0000,
  "salePrice": 89000,
  "disVal": 10,
  "maxQty": 1,
  "curQty": 1,
  "maxBuy": 3
}
```

---

## 4. Add Products to Event

### Flow

1. Admin clicks **+ Add Products**.
2. A modal or side-panel opens with a searchable list of available **batch details** (inventory batches from the warehouse).
3. Admin selects a batch, fills in discount %, max quantity, and optionally max buy per buyer.
4. Clicks **Add** → calls create sale-product API.
5. Table refreshes.

### Layout (modal)

- Search input to filter batch details by name / batch ID
- Table: `Batch ID | Product Name | Available Qty | Unit Price | Select`
- On row select → expand inline form: `Discount % | Max Qty (≤ available) | Max Buy per buyer`
- **Confirm Add** button

### APIs

#### 4.1 Get available batch details

Used to populate the product picker. Returns only batches that:
- Have remaining stock (`quantity > 0`)
- Are **not** currently assigned to any active sale event

```
GET {{ecommerce-url}}/api/batch-details/available-for-sale-event?searchString=&page=1&size=20
```

| Param          | Default | Notes                                 |
|----------------|---------|---------------------------------------|
| `searchString` | `""`    | Filter by product name or description |
| `page`         | `1`     | 1-based page number                   |
| `size`         | `20`    | Results per page                      |

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get available batch details success",
  "detail": [
    {
      "name": "Gà Ta Nguyên Con",
      "description": "Gà ta thả vườn tươi ngon, thịt chắc thơm ngon",
      "quantity": 96,
      "saleEventId": null,
      "salePrice": null,
      "createdAt": "2026-04-27T09:19:24.554724",
      "disVal": null,
      "productGeneralId": 1,
      "img": "https://pub-0365edd1781141cdb68675969c7cdb87.r2.dev/5fe95e6c-c064-49c4-8712-1c8f54472502.jpg",
      "originPrice": 100000.0000,
      "batchId": "1",
      "categoryId": 2,
      "providerId": null,
      "numRate": 0,
      "avgRate": 0.0000
    }
  ],
  "timestamp": "2026-04-28T09:23:12.362530549"
}
```

> **Note**: `batchId` is the value to send as `batchId` in the add-product call (§4.2). `quantity` is the available stock — `maxQty` cannot exceed this. `originPrice` is the base unit price in VND used to compute the sale price server-side.

#### 4.2 Add product to event

```
POST {{ecommerce-url}}/api/sale-products
Content-Type: application/json
```

Request body:
```json
{
  "saleEventId": "3",
  "batchId": "1",
  "disVal": "10",
  "maxQty": "1",
  "maxBuy": "3"
}
```

| Field         | Required | Notes                                                     |
|---------------|----------|-----------------------------------------------------------|
| `saleEventId` | Yes      | ID of the event                                           |
| `batchId`     | Yes      | `batchDetailId` from batch-details list                   |
| `disVal`      | Yes      | Discount percentage, 0–100                                |
| `maxQty`      | Yes      | Must be ≥ 1 and ≤ batch's available `quantity`            |
| `maxBuy`      | No       | Max units a single buyer can purchase; omit for unlimited |

`salePrice` is calculated server-side: `round(originPrice × (100 - disVal) / 100)` to nearest 1000 VND. No need to send it.

Response:
```json
{
  "type": "GOOD",
  "code": "201 CREATED",
  "message": "Create success",
  "detail": {
    "saleEventId": 3,
    "batchId": "1",
    "disVal": 10,
    "salePrice": 90000,
    "maxQty": 1,
    "curQty": 1,
    "maxBuy": 3,
    "createdAt": "2026-04-28T09:23:55.493899561",
    "updatedAt": null,
    "deletedAt": null
  },
  "timestamp": "2026-04-28T09:23:55.521635975"
}
```

**Error cases to handle**:
- `400` — product already in this event (`"Product is already in this sale event"`)
- `400` — `maxQty` exceeds batch stock
- `404` — batch not found

---

## 5. Edit Product in Event

### Layout

Inline edit row or small modal with:
- `disVal` — number input 0–100
- `maxQty` — number input (cannot exceed batch stock)
- `maxBuy` — number input (optional)

### APIs

#### 5.1 Get sale product (pre-fill modal)

Call this when the admin opens the edit modal for a product to populate the existing values.

```
GET {{ecommerce-url}}/api/sale-products/{saleEventId}/{batchId}
```

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get saleProduct success",
  "detail": {
    "saleEventId": 3,
    "batchId": "9",
    "disVal": 10,
    "salePrice": 89000,
    "maxQty": 1,
    "curQty": 1,
    "maxBuy": 3,
    "createdAt": "2026-04-28T09:09:40.016374",
    "updatedAt": null,
    "deletedAt": null
  },
  "timestamp": "2026-04-28T09:39:32.349172906"
}
```

Use `disVal`, `maxQty`, and `maxBuy` from `detail` to pre-fill the form fields.

#### 5.2 Update sale product

```
PUT {{ecommerce-url}}/api/sale-products/{saleEventId}/{batchId}
Content-Type: application/json
```

All three fields are optional — send only the ones you want to change:

```json
{
  "disVal": 15,
  "maxQty": 80,
  "maxBuy": 3
}
```

| Field    | Type    | Required | Constraints                               |
|----------|---------|----------|-------------------------------------------|
| `disVal` | Integer | No       | 0–100; triggers `salePrice` recalculation |
| `maxQty` | Long    | No       | ≥ 1; see stock validation rules below     |
| `maxBuy` | Long    | No       | Max units a single buyer can purchase     |

**`maxQty` validation rules (server-side):**
- `newMaxQty > oldMaxQty`: the delta must not exceed the available `batchDetail.quantity` (rejects if insufficient stock)
- `newMaxQty < oldMaxQty`: allowed only if `newMaxQty ≥ already-sold quantity` (`oldMaxQty − curQty`); the freed delta is returned to batch stock
- `newMaxQty = oldMaxQty`: no stock change

**Side effects on `batchDetail.quantity` and `curQty`:**
- Increasing `maxQty` by N → `batchDetail.quantity -= N`, `curQty += N`
- Decreasing `maxQty` by N → `batchDetail.quantity += N`, `curQty -= N`

Response:
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Update success",
  "detail": {
    "saleEventId": 3,
    "batchId": "9",
    "disVal": 20,
    "salePrice": 79000,
    "maxQty": 1,
    "curQty": 1,
    "maxBuy": 3,
    "createdAt": "2026-04-28T09:09:40.016374",
    "updatedAt": "2026-04-28T09:40:32.414014232",
    "deletedAt": null
  },
  "timestamp": "2026-04-28T09:40:32.44072069"
}
```

---

## 6. Remove Product from Event

#### 6.1 Delete sale product

```
DELETE {{ecommerce-url}}/api/sale-products/{saleEventId}/{batchId}
```

No request body. Show a confirmation prompt before calling.

No response body on success (`detail: null`).

---

## 7. Common UI Behaviour Notes

### activeYn / enabledYn

Both are `"Y"` / `"N"` strings (not booleans). An event is visible to customers only when both are `"Y"` and the current datetime is within `beginDate`–`endDate`.

### Sale price display

Always display `salePrice` (pre-calculated by server) next to `originPrice` with the discount badge. Do not calculate it client-side.

### Remaining stock (`curQty`)

`curQty` starts equal to `maxQty` and decreases as customers purchase. Show a warning badge when `curQty / maxQty < 0.2` (less than 20% remaining).

### Error handling

Check `type` in the response envelope:
- `GOOD` — success, use `detail`
- `SKIP_AS_GOOD` — success, no data (render empty state)
- `WARN` — show a warning toast with `message`, the operation may have partially succeeded
- `ERROR` — show error toast with `message`, operation failed

### Authentication

All admin endpoints require a JWT in the `Authorization: Bearer <token>` header. The public endpoint (`{{ecommerce-url}}/api/sale-events/public/active`) does not require auth.

---

## 8. Entity Field Reference

### SaleEvent

| Field             | Type          | Notes                                 |
|-------------------|---------------|---------------------------------------|
| `saleEventId`     | Long          | Auto-generated PK                     |
| `name`            | String        | Required                              |
| `description`     | String        |                                       |
| `img`             | String (URL)  | Set via banner upload endpoint        |
| `displayPriority` | Long          | Lower = higher priority on storefront |
| `activeYn`        | String        | `"Y"` / `"N"`                         |
| `enabledYn`       | String        | `"Y"` / `"N"`                         |
| `beginTime`       | LocalTime     | Daily window start (`HH:mm:ss`)       |
| `endTime`         | LocalTime     | Daily window end (`HH:mm:ss`)         |
| `beginDate`       | LocalDateTime | Event overall start                   |
| `endDate`         | LocalDateTime | Event overall end                     |
| `createdAt`       | LocalDateTime | Auto-set                              |
| `updatedAt`       | LocalDateTime | Auto-set                              |

### SaleProduct

| Field         | Type    | Notes                                                         |
|---------------|---------|---------------------------------------------------------------|
| `saleEventId` | Long    | Composite PK (part 1)                                         |
| `batchId`     | String  | Composite PK (part 2), references `BatchDetail.batchDetailId` |
| `disVal`      | Integer | Discount percentage 0–100                                     |
| `salePrice`   | Integer | Calculated by server, VND rounded to nearest 1000             |
| `maxQty`      | Long    | Total units allocated to this sale                            |
| `curQty`      | Long    | Remaining units available                                     |
| `maxBuy`      | Long    | Max units per buyer (null = unlimited)                        |

### BatchDetail (product picker source)

| Field              | Type       | Notes                                  |
|--------------------|------------|----------------------------------------|
| `batchDetailId`    | String     | Use as `batchId` in sale-product calls |
| `productGeneralId` | Long       | Links to product name/image            |
| `quantity`         | Integer    | Available stock — cap `maxQty` to this |
| `price`            | BigDecimal | Original unit price in VND             |
