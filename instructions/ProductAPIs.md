# API Guide for UI Developers - Product Batch Processing

## Table of Contents
1. [What This Feature Does](#what-this-feature-does)
2. [Key Concepts](#key-concepts)
3. [The Complete User Flow](#the-complete-user-flow)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
6. [Common Errors and How to Handle Them](#common-errors-and-how-to-handle-them)

---

## What This Feature Does

**In Simple Terms:**
When a warehouse receives a large batch of products (e.g., 10kg of rice), this feature automatically splits it into individual sellable units (e.g., 500g bags). The system calculates how many individual products can be created from the batch and generates them automatically.

**Example Scenario:**
- Warehouse receives: **10 kg of rice** (this is a Product Batch)
- Each sellable bag contains: **500 grams** (this is defined in Product General)
- System automatically creates: **20 individual rice bags** (these are Product Details)
- Each bag gets its own ID, price, and storage location

---

## Key Concepts

### 1. **Product General** (Product Template)
Think of this as the "product blueprint" that defines what a product is.
- **Example:** "Organic Rice - 500g bag"
- Contains: name, image, description, category, unit (GRAM), unit quantity (500)
- Created by the Product Management service (usually already exists)

### 2. **Product Batch** (Bulk Shipment)
The large shipment that arrives at the warehouse.
- **Example:** "10 kg of rice delivered from supplier XYZ"
- Contains: quantity (10), unit (KILOGRAM), received date, expiry date, supplier info

### 3. **Product Detail** (Individual Item)
The actual sellable product sitting on a shelf.
- **Example:** "One 500g rice bag on Rack #5, priced at $5"
- Contains: price, storage location, status (STORED, PICKED, etc.), batch reference

### 4. **The Magic: Batch Processing**
The system automatically:
1. Converts units (10 kg → 10,000 grams)
2. Calculates how many items fit (10,000g ÷ 500g = 20 items)
3. Creates 20 individual Product Detail records
4. Assigns them all to the same batch, storage location, and price

---

## The Complete User Flow

### Screen 1: Create Product Batch
**When:** A warehouse manager receives a new shipment

**User Actions:**
1. Select the product category (Sub-subcategory)
2. Enter batch details:
   - Quantity (e.g., 10)
   - Unit (e.g., KILOGRAM)
   - Received date
   - Expiry date
   - Supplier/Provider
   - Notes (optional)
3. Click "Create Batch"

### Screen 2: Process Batch into Product Details
**When:** After creating the batch, ready to put products on shelves

**User Actions:**
1. View the batch details
2. Select a Product General (the template for individual products)
3. Enter product details:
   - Price per unit
   - Storage location (Storage Tool - which rack/fridge)
   - Initial status (usually "STORED")
   - Initial rating (numOfStar, usually 0)
4. Click "Process Batch"
5. **System automatically creates multiple Product Details**

### Screen 3: View Product Details
**When:** See all individual products created from the batch

**User Actions:**
1. View list of all product details
2. Each item shows:
   - Product name (from Product General)
   - Price
   - Storage location
   - Status
   - Batch information

---

## API Endpoints Reference

**Base URL:** `http://localhost:9200`

### Common Response Format

All API responses follow this structure:

```json
{
  "type": "GOOD",           // "GOOD" | "ERROR" | "WARN" | "SKIP_AS_GOOD"
  "code": "200",
  "message": "Success message here",
  "detail": { ... },        // The actual data
  "timestamp": "2026-04-05T10:30:00"
}
```

---

### 1. Create Product Batch

**Endpoint:** `POST /api/product-batch`

**Purpose:** Register a new batch shipment that arrived at the warehouse

**Request Body:**
```json
{
  "quantity": 10,
  "unit": "KILOGRAM",
  "note": "Organic rice from Vietnam",
  "receivedAt": "2026-04-05T09:00:00",
  "expiredAt": "2026-10-05T00:00:00",
  "providerId": 123,
  "subSubcategoryId": 5
}
```

**Field Descriptions:**
- `quantity` (number, required): Amount of product in the batch
- `unit` (string, required): Unit of measurement
  - Allowed values: `"KILOGRAM"`, `"GRAM"`, `"LITER"`, `"MILLILITER"`, `"PIECE"`, `"DOZEN"`, `"PACK"`, `"BOX"`, `"BOTTLE"`
- `note` (string, optional): Additional information about the batch
- `receivedAt` (datetime, required): When the batch was received
- `expiredAt` (datetime, required): When the batch expires
- `providerId` (number, required): ID of the supplier/provider
- `subSubcategoryId` (number, required): Product category ID

**Success Response (200 OK):**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Create productBatch successfully",
  "detail": {
    "batchId": 42,
    "quantity": 10,
    "unit": "KILOGRAM",
    "note": "Organic rice from Vietnam",
    "receivedAt": "2026-04-05T09:00:00",
    "expiredAt": "2026-10-05T00:00:00",
    "providerId": 123,
    "subSubcategoryId": 5,
    "createdAt": "2026-04-05T10:30:00",
    "updatedAt": "2026-04-05T10:30:00"
  },
  "timestamp": "2026-04-05T10:30:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "type": "ERROR",
  "code": "400",
  "message": "Error description here",
  "detail": null,
  "timestamp": "2026-04-05T10:30:00"
}
```

---

### 2. Get All Product Batches

**Endpoint:** `GET /api/product-batch?pageNum=1&pageSize=20`

**Purpose:** List all batches (with pagination)

**Query Parameters:**
- `pageNum` (number, optional, default: 1): Page number (starts from 1)
- `pageSize` (number, optional, default: 20): Items per page

**Success Response (200 OK):**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Get all productBatchs successfully",
  "detail": [
    {
      "batchId": 42,
      "quantity": 10,
      "unit": "KILOGRAM",
      "note": "Organic rice from Vietnam",
      "receivedAt": "2026-04-05T09:00:00",
      "expiredAt": "2026-10-05T00:00:00",
      "providerId": 123,
      "subSubcategoryId": 5,
      "createdAt": "2026-04-05T10:30:00",
      "updatedAt": "2026-04-05T10:30:00"
    }
  ],
  "timestamp": "2026-04-05T10:30:00"
}
```

---

### 3. Get Single Product Batch

**Endpoint:** `GET /api/product-batch/{batchId}`

**Purpose:** Get details of a specific batch

**Success Response (200 OK):**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Read productBatch successfully",
  "detail": {
    "batchId": 42,
    "quantity": 10,
    "unit": "KILOGRAM",
    "note": "Organic rice from Vietnam",
    "receivedAt": "2026-04-05T09:00:00",
    "expiredAt": "2026-10-05T00:00:00",
    "providerId": 123,
    "subSubcategoryId": 5,
    "createdAt": "2026-04-05T10:30:00",
    "updatedAt": "2026-04-05T10:30:00"
  },
  "timestamp": "2026-04-05T10:30:00"
}
```

---

### 4. Get Product General Information

**Endpoint:** `GET /api/product-general/{prodGenId}`

**Purpose:** Get product template information (to show what unit size individual products will be)

**Success Response (200 OK):**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Read productGeneral successfully",
  "detail": {
    "prodGenId": 100,
    "name": "Organic Rice - Premium Grade",
    "imgUrl": "https://example.com/rice.jpg",
    "description": "High-quality organic rice",
    "subSubcategoryId": 5,
    "unit": "GRAM",
    "unitQuantity": 500,
    "createdAt": "2026-04-01T10:00:00",
    "updatedAt": "2026-04-01T10:00:00"
  },
  "timestamp": "2026-04-05T10:30:00"
}
```

**Important Fields:**
- `unit`: The unit for individual products (e.g., GRAM)
- `unitQuantity`: How much each individual product contains (e.g., 500)

---

### 4.1 Get All Product Generals

**Endpoint:** `GET /api/product-general?pageNum=1&pageSize=20`

**Purpose:** List all available product templates (with pagination)

**Query Parameters:**
- `pageNum` (number, optional, default: 1): Page number (starts from 1)
- `pageSize` (number, optional, default: 20): Items per page

**Success Response (200 OK):**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Get all productGenerals successfully",
  "detail": [
    {
      "prodGenId": 100,
      "name": "Organic Rice - Premium Grade",
      "imgUrl": "https://example.com/rice.jpg",
      "description": "High-quality organic rice",
      "subSubcategoryId": 5,
      "unit": "GRAM",
      "unitQuantity": 500,
      "createdAt": "2026-04-01T10:00:00",
      "updatedAt": "2026-04-01T10:00:00"
    },
    {
      "prodGenId": 101,
      "name": "Organic Rice - Economy Pack",
      "imgUrl": "https://example.com/rice-economy.jpg",
      "description": "Budget-friendly organic rice",
      "subSubcategoryId": 5,
      "unit": "KILOGRAM",
      "unitQuantity": 1,
      "createdAt": "2026-04-01T10:00:00",
      "updatedAt": "2026-04-01T10:00:00"
    }
  ],
  "timestamp": "2026-04-05T10:30:00"
}
```

**Empty Response (200 OK):**
```json
{
  "type": "SKIP_AS_GOOD",
  "code": "200",
  "message": "No productGeneral exists",
  "detail": null,
  "timestamp": "2026-04-05T10:30:00"
}
```

---

### 4.2 ⭐ Get Suitable Product Generals for a Batch (NEW!)

**Endpoint:** `GET /api/product-general/suitable-for-batch/{batchId}`

**Purpose:** Get only the Product Generals that are compatible with a specific Product Batch. This endpoint automatically filters by:
- Matching category (subSubcategoryId)
- Compatible units (e.g., only shows GRAM/KILOGRAM products for KILOGRAM batches)

**Use Case:** When an employee decides to process a batch, they should call this endpoint to get a pre-filtered list of suitable products instead of showing all products.

**Path Parameters:**
- `batchId` (number, required): The ID of the product batch

**Success Response (200 OK):**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Get suitable product generals successfully",
  "detail": [
    {
      "prodGenId": 100,
      "name": "Organic Rice - Premium Grade",
      "imgUrl": "https://example.com/rice.jpg",
      "description": "High-quality organic rice (500g bags)",
      "subSubcategoryId": 5,
      "unit": "GRAM",
      "unitQuantity": 500,
      "createdAt": "2026-04-01T10:00:00",
      "updatedAt": "2026-04-01T10:00:00"
    },
    {
      "prodGenId": 101,
      "name": "Organic Rice - Economy Pack",
      "imgUrl": "https://example.com/rice-economy.jpg",
      "description": "Budget-friendly organic rice (1kg bags)",
      "subSubcategoryId": 5,
      "unit": "KILOGRAM",
      "unitQuantity": 1,
      "createdAt": "2026-04-01T10:00:00",
      "updatedAt": "2026-04-01T10:00:00"
    }
  ],
  "timestamp": "2026-04-05T10:30:00"
}
```

**No Suitable Products Found (200 OK):**
```json
{
  "type": "SKIP_AS_GOOD",
  "code": "200",
  "message": "No suitable product general found for this batch",
  "detail": null,
  "timestamp": "2026-04-05T10:30:00"
}
```

**Error Response - Batch Not Found (400 Bad Request):**
```json
{
  "type": "ERROR",
  "code": "400",
  "message": "Product batch not found",
  "detail": null,
  "timestamp": "2026-04-05T10:30:00"
}
```

**Why Use This Endpoint:**
- ✅ Prevents category mismatch errors
- ✅ Prevents unit incompatibility errors
- ✅ Improves user experience (employee only sees valid options)
- ✅ Reduces API calls (no need to manually filter on frontend)

**Unit Compatibility Rules:**
- **KILOGRAM** batches → Shows KILOGRAM and GRAM products only
- **GRAM** batches → Shows KILOGRAM and GRAM products only
- **LITER** batches → Shows LITER and MILLILITER products only
- **MILLILITER** batches → Shows LITER and MILLILITER products only
- Other units (PIECE, DOZEN, etc.) → No automatic splitting supported

---

### 5. Get Storage Tools (Racks/Fridges)

**Endpoint:** `GET /api/storage-tool?pageNum=1&pageSize=20`

**Purpose:** List available storage locations to assign products to

**Success Response (200 OK):**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Get all storageTools successfully",
  "detail": [
    {
      "storageToolId": 10,
      "toolType": "RACK",
      "status": "OPERATIONAL",
      "usagePercentage": 45,
      "warehouseId": 1,
      "lastMaintainanceDate": "2026-03-01"
    }
  ],
  "timestamp": "2026-04-05T10:30:00"
}
```

---

### 6. ⭐ PROCESS BATCH (The Key Feature!)

**Endpoint:** `POST /api/product-detail/process-batch`

**Purpose:** Automatically split a batch into multiple individual product details

**Request Body:**
```json
{
  "status": "STORED",
  "price": 5000,
  "numOfStar": 0,
  "storageToolId": 10,
  "batchId": 42,
  "prodGenId": 100
}
```

**Field Descriptions:**
- `status` (string, required): Initial status for all created products
  - Allowed values: `"STORED"`, `"EXPIRED"`, `"PICKED"`, `"IN_TRANSIT"`, `"DELIVERED"`, `"RETURNED"`, `"DISPOSED"`
- `price` (number, required): Price per individual product (in cents or smallest currency unit)
- `numOfStar` (number, required): Initial rating (usually 0)
- `storageToolId` (number, required): Where to store these products (rack or fridge ID)
- `batchId` (number, required): The batch to process
- `prodGenId` (number, required): The product template to use

**What Happens Behind the Scenes:**
1. System validates that batch and product general have matching category
2. System calculates: `Batch: 10 KILOGRAM ÷ Product: 500 GRAM = 20 products`
3. System creates 20 identical ProductDetail records
4. All 20 products get the same price, storage location, and batch reference
5. System publishes an event to the e-commerce service

**Success Response (200 OK):**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Process batch successfully",
  "detail": [
    {
      "prodDetailId": 1001,
      "status": "STORED",
      "price": 5000,
      "numOfStar": 0,
      "storageToolId": 10,
      "batchId": 42,
      "prodGenId": 100,
      "createdAt": "2026-04-05T10:30:00",
      "updatedAt": "2026-04-05T10:30:00"
    },
    {
      "prodDetailId": 1002,
      "status": "STORED",
      "price": 5000,
      "numOfStar": 0,
      "storageToolId": 10,
      "batchId": 42,
      "prodGenId": 100,
      "createdAt": "2026-04-05T10:30:00",
      "updatedAt": "2026-04-05T10:30:00"
    }
    // ... 18 more items (20 total)
  ],
  "timestamp": "2026-04-05T10:30:00"
}
```

**Error Responses:**

**Category Mismatch (400 Bad Request):**
```json
{
  "type": "ERROR",
  "code": "400",
  "message": "SubSubcategory mismatch: ProductBatch has subSubcategoryId=5 but ProductGeneral has subSubcategoryId=8",
  "detail": null,
  "timestamp": "2026-04-05T10:30:00"
}
```

**Batch Not Found (400 Bad Request):**
```json
{
  "type": "ERROR",
  "code": "400",
  "message": "Product batch not found",
  "detail": null,
  "timestamp": "2026-04-05T10:30:00"
}
```

---

### 7. Get All Product Details

**Endpoint:** `GET /api/product-detail?pageNum=1&pageSize=20`

**Purpose:** List all individual products (with pagination)

**Success Response (200 OK):**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Get all productDetails successfully",
  "detail": [
    {
      "prodDetailId": 1001,
      "status": "STORED",
      "price": 5000,
      "numOfStar": 0,
      "storageToolId": 10,
      "batchId": 42,
      "prodGenId": 100,
      "createdAt": "2026-04-05T10:30:00",
      "updatedAt": "2026-04-05T10:30:00"
    }
  ],
  "timestamp": "2026-04-05T10:30:00"
}
```

---

## Step-by-Step Implementation Guide

> **💡 Pro Tip:** Always use the `/api/product-general/suitable-for-batch/{batchId}` endpoint when building the Process Batch screen. This endpoint automatically filters products by category and unit compatibility, preventing common errors and improving user experience!

---

### Step 1: Create "Receive Batch" Screen

**UI Components:**
- Form with fields:
  - Product Category dropdown (fetch from SubSubcategory API)
  - Quantity input (number)
  - Unit dropdown (KILOGRAM, GRAM, LITER, MILLILITER, etc.)
  - Received Date picker
  - Expiry Date picker
  - Supplier/Provider dropdown or input
  - Notes textarea (optional)
- Submit button

**API Calls:**
```javascript
// Create batch
const response = await fetch('http://localhost:9200/api/product-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quantity: 10,
    unit: 'KILOGRAM',
    note: 'Organic rice from Vietnam',
    receivedAt: '2026-04-05T09:00:00',
    expiredAt: '2026-10-05T00:00:00',
    providerId: 123,
    subSubcategoryId: 5
  })
});

const result = await response.json();

if (result.type === 'GOOD') {
  const batchId = result.detail.batchId;
  // Save batchId and navigate to next screen
  navigateToProcessScreen(batchId);
}
```

---

### Step 2: Create "Process Batch" Screen

**UI Components:**
- Display batch information (read-only)
  - Show: quantity, unit, received date, expiry date
- Product General selector
  - Dropdown or search to select product template
  - Display selected product's unit and unitQuantity
  - **Show calculation preview:** "This batch will create approximately X products"
- Form fields:
  - Price per product (number input)
  - Storage location dropdown (fetch from Storage Tool API)
  - Status dropdown (default: STORED)
  - Initial rating (default: 0)
- Process button

**Calculation Preview Logic:**
```javascript
// When user selects a product general
const calculateProducts = (batch, productGeneral) => {
  // Only works if units are compatible
  const batchInGrams = batch.unit === 'KILOGRAM' ? batch.quantity * 1000 : batch.quantity;
  const productInGrams = productGeneral.unit === 'GRAM' ? productGeneral.unitQuantity : 
                         productGeneral.unit === 'KILOGRAM' ? productGeneral.unitQuantity * 1000 : 0;
  
  if (productInGrams === 0) {
    return 'Incompatible units - cannot calculate';
  }
  
  const count = Math.floor(batchInGrams / productInGrams);
  return `This will create ${count} products of ${productGeneral.name}`;
};
```

**API Calls:**
```javascript
// Fetch batch details
const batchResponse = await fetch(`http://localhost:9200/api/product-batch/${batchId}`);
const batchData = await batchResponse.json();
const batch = batchData.detail;

// ⭐ NEW: Fetch suitable product general options (for dropdown)
// This endpoint automatically filters by category and unit compatibility!
const productGeneralResponse = await fetch(
  `http://localhost:9200/api/product-general/suitable-for-batch/${batchId}`
);
const productGeneralData = await productGeneralResponse.json();

if (productGeneralData.type === 'SKIP_AS_GOOD') {
  // No suitable products found
  alert('No suitable product templates found for this batch category and unit type.');
  return;
}

const suitableProducts = productGeneralData.detail;

// Fetch storage tools (for dropdown)
const storageResponse = await fetch('http://localhost:9200/api/storage-tool?pageNum=1&pageSize=100');
const storageData = await storageResponse.json();
const storageTools = storageData.detail;

// Process the batch
const processResponse = await fetch('http://localhost:9200/api/product-detail/process-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'STORED',
    price: 5000,
    numOfStar: 0,
    storageToolId: 10,
    batchId: batch.batchId,
    prodGenId: selectedProductGeneral.prodGenId
  })
});

const processResult = await processResponse.json();

if (processResult.type === 'GOOD') {
  const createdProducts = processResult.detail;
  console.log(`Successfully created ${createdProducts.length} products`);
  // Show success message and navigate to product list
}
```

---

### Step 3: Create "Product Details List" Screen

**UI Components:**
- Table/Grid showing all product details
- Columns:
  - Product ID
  - Product Name (fetch from Product General)
  - Price
  - Status
  - Storage Location (fetch from Storage Tool)
  - Batch Info
  - Created Date
- Filters:
  - By status
  - By batch
  - By storage location
- Pagination controls

**API Calls:**
```javascript
// Fetch product details with pagination
const fetchProductDetails = async (pageNum = 1, pageSize = 20) => {
  const response = await fetch(
    `http://localhost:9200/api/product-detail?pageNum=${pageNum}&pageSize=${pageSize}`
  );
  const result = await response.json();
  
  if (result.type === 'GOOD') {
    return result.detail;
  }
  return [];
};

// For each product detail, you might need to fetch product general info
const enrichProductDetails = async (productDetails) => {
  const enriched = await Promise.all(
    productDetails.map(async (detail) => {
      const pgResponse = await fetch(
        `http://localhost:9200/api/product-general/${detail.prodGenId}`
      );
      const pgData = await pgResponse.json();
      
      return {
        ...detail,
        productName: pgData.detail.name,
        productImage: pgData.detail.imgUrl
      };
    })
  );
  return enriched;
};
```

---

## Common Errors and How to Handle Them

### Error 1: Category Mismatch
**Error Message:**
```
SubSubcategory mismatch: ProductBatch has subSubcategoryId=5 but ProductGeneral has subSubcategoryId=8
```

**Cause:** You selected a Product General that doesn't match the batch's category

**✅ BEST SOLUTION - Use the new endpoint:**
```javascript
// This endpoint automatically filters by category!
const response = await fetch(
  `http://localhost:9200/api/product-general/suitable-for-batch/${batchId}`
);
```

**Alternative Solution (if not using the new endpoint):**
```javascript
const matchingProducts = allProductGenerals.filter(
  pg => pg.subSubcategoryId === batch.subSubcategoryId
);
```

---

### Error 2: Incompatible Units
**Error Message:**
```
Incompatible units: cannot convert KILOGRAM to PIECE
```

**Cause:** Trying to process a batch with incompatible units

**Compatible Unit Pairs:**
- KILOGRAM ↔ GRAM
- LITER ↔ MILLILITER

**✅ BEST SOLUTION - Use the new endpoint:**
```javascript
// This endpoint automatically filters by unit compatibility!
const response = await fetch(
  `http://localhost:9200/api/product-general/suitable-for-batch/${batchId}`
);
```

**Alternative Solution (manual filtering):**
```javascript
const areUnitsCompatible = (unit1, unit2) => {
  const massUnits = ['KILOGRAM', 'GRAM'];
  const volumeUnits = ['LITER', 'MILLILITER'];
  
  const inMass = massUnits.includes(unit1) && massUnits.includes(unit2);
  const inVolume = volumeUnits.includes(unit1) && volumeUnits.includes(unit2);
  
  return inMass || inVolume;
};
```

---

### Error 3: Batch Not Found
**Error Message:**
```
Product batch not found
```

**Cause:** Invalid `batchId`

**UI Solution:**
- Validate that batch exists before showing process screen
- Show error message and redirect to batch list

---

### Error 4: Empty Response
**Response Type:** `SKIP_AS_GOOD`

**Cause:** No data exists

**UI Solution:**
- Show empty state UI
- "No batches found. Create your first batch!"

**Code:**
```javascript
if (result.type === 'SKIP_AS_GOOD') {
  // Show empty state
  showEmptyState(result.message);
}
```

---

## UI/UX Recommendations

### 1. Batch Processing Confirmation
Before processing, show a confirmation dialog:
```
You are about to create approximately 20 products from this batch:
- Product: Organic Rice - Premium Grade (500g)
- Price per unit: $50.00
- Storage location: Rack #10
- Total products: 20

This action cannot be undone. Continue?
[Cancel] [Process Batch]
```

### 2. Progress Indicator
Show loading state during batch processing:
```
Processing batch...
Creating 20 product details...
⏳ Please wait, this may take a moment.
```

### 3. Success Feedback
After successful processing:
```
✅ Successfully created 20 products from batch #42
- View all products
- Process another batch
- Return to batch list
```

### 4. Batch Status Indicator
Add visual indicators:
- 🟢 Processed (has product details)
- 🟡 Pending (created but not processed)
- 🔴 Expired

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    WAREHOUSE MANAGER                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: CREATE BATCH                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • Select category: Rice                             │    │
│  │  • Quantity: 10                                      │    │
│  │  • Unit: KILOGRAM                                    │    │
│  │  • Received: 2026-04-05                              │    │
│  │  • Expiry: 2026-10-05                                │    │
│  │  • Supplier: Supplier XYZ                            │    │
│  │  [Create Batch]                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  POST /api/product-batch                                     │
│  Response: { batchId: 42, ... }                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: PROCESS BATCH                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Batch #42: 10 KILOGRAM of Rice                      │    │
│  │  ───────────────────────────────────────────────────│    │
│  │  • Select product: Organic Rice 500g                 │    │
│  │  • Preview: Will create ~20 products                 │    │
│  │  • Price per unit: $50.00                            │    │
│  │  • Storage: Rack #10                                 │    │
│  │  • Status: STORED                                    │    │
│  │  [Process Batch]                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  POST /api/product-detail/process-batch                      │
│  Response: [ {prodDetailId: 1001}, ...20 items ]             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: VIEW PRODUCTS                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ID    │ Product        │ Price │ Location │ Status  │    │
│  │  ──────┼────────────────┼───────┼──────────┼─────────│    │
│  │  1001  │ Organic Rice   │ $50   │ Rack #10 │ STORED  │    │
│  │  1002  │ Organic Rice   │ $50   │ Rack #10 │ STORED  │    │
│  │  1003  │ Organic Rice   │ $50   │ Rack #10 │ STORED  │    │
│  │  ...   │ ...            │ ...   │ ...      │ ...     │    │
│  │  1020  │ Organic Rice   │ $50   │ Rack #10 │ STORED  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  GET /api/product-detail?pageNum=1&pageSize=20               │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Enum Values

### ProductStatus
- `STORED` - In warehouse storage
- `EXPIRED` - Past expiry date
- `PICKED` - Selected for an order
- `IN_TRANSIT` - Being delivered
- `DELIVERED` - Delivered to customer
- `RETURNED` - Returned by customer
- `DISPOSED` - Thrown away/discarded

### Unit
**Mass Units (compatible):**
- `KILOGRAM`
- `GRAM`

**Volume Units (compatible):**
- `LITER`
- `MILLILITER`

**Count Units (not compatible with mass/volume):**
- `PIECE`
- `DOZEN`
- `PACK`
- `BOX`
- `BOTTLE`

---
