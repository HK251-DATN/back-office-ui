# Storage Management - UI Developer Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Entity Relationships](#entity-relationships)
3. [UI Design Guidelines](#ui-design-guidelines)
4. [API Reference](#api-reference)
5. [Implementation Workflows](#implementation-workflows)
6. [Code Examples](#code-examples)

---

## System Overview

### What is Storage Management?

The storage management system allows warehouse employees to:
- Manage multiple warehouses
- Track storage tools (racks and fridges) in each warehouse
- Monitor storage capacity and usage
- Assign products to specific storage locations
- View detailed information about each storage unit

### Key Concepts

**Warehouse** → A physical warehouse location
- Contains multiple storage tools (racks and fridges)
- Tracks overall capacity and usage

**Storage Tool** → A physical storage unit (either a rack or fridge)
- Has a type: RACK or FRIDGE
- Has a status: ACTIVE, INACTIVE, FULL, or IN_MAINTAINANCE
- Belongs to one warehouse
- Links to detailed information (Rack or Fridge entity)

**Rack** → A shelving unit for regular storage
- Has multiple levels (shelves)
- Each level can store products

**Fridge** → A refrigerated storage unit
- Has temperature monitoring
- Used for perishable products

**Rack Level** → Individual shelf on a rack
- Tracks usage percentage
- Can store products

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                          WAREHOUSE                               │
│  • warehouseId: 1                                               │
│  • address: "123 Main St"                                       │
│  • usagePercentage: 65                                          │
│  • numOfFridge: 3                                               │
│  • numOfRack: 5                                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ has many
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STORAGE TOOL                                │
│  • storageToolId: 10                                            │
│  • toolType: RACK | FRIDGE                                      │
│  • status: ACTIVE | INACTIVE | FULL | IN_MAINTAINANCE          │
│  • usagePercentage: 70                                          │
│  • warehouseId: 1                                               │
└─────────────┬──────────────────────┬────────────────────────────┘
              │                      │
    if RACK   │                      │  if FRIDGE
              ▼                      ▼
┌──────────────────────┐   ┌──────────────────────┐
│       RACK           │   │      FRIDGE          │
│  • rackId: 5         │   │  • fridgeId: 3       │
│  • numOfLevel: 5     │   │  • curTemp: -5       │
│  • storageToolId: 10 │   │  • minTemp: -10      │
└──────────┬───────────┘   │  • maxTemp: 0        │
           │               │  • storageToolId: 11 │
           │ has many      └──────────────────────┘
           ▼
┌──────────────────────┐
│    RACK LEVEL        │
│  • rackLevelId: 25   │
│  • usagePercentage: 60│
│  • rackId: 5         │
└──────────────────────┘
```

---

## UI Design Guidelines

### Recommended Screen Structure

#### 1. **Warehouse List Screen**

**Purpose:** Overview of all warehouses

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Warehouses                                    [+ New]   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │ Warehouse #1 - 123 Main St         📊 65% Full   │   │
│  │ Fridges: 3 | Racks: 5              [View Detail] │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Warehouse #2 - 456 Oak Ave         📊 45% Full   │   │
│  │ Fridges: 2 | Racks: 8              [View Detail] │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [1] [2] [3] ... [Next]                                 │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- List all warehouses with pagination
- Show usage percentage with visual indicator (progress bar)
- Display summary info (number of fridges/racks)
- Click to view warehouse details

---

#### 2. **Warehouse Detail Screen**

**Purpose:** Manage storage tools in a specific warehouse

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Warehouses                                   │
│                                                          │
│  Warehouse #1 - 123 Main St                             │
│  Overall Usage: ████████░░ 65%                          │
├─────────────────────────────────────────────────────────┤
│  Storage Tools                           [+ Add Storage]│
│                                                          │
│  Filters: [All] [Racks] [Fridges] [Active Only]        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🗄️ Rack #10 (Storage Tool #10)     ✅ ACTIVE     │   │
│  │ 5 Levels | Usage: 70%             [View Details] │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ❄️ Fridge #3 (Storage Tool #11)    ✅ ACTIVE     │   │
│  │ Temp: -5°C (Range: -10 to 0)      [View Details] │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🗄️ Rack #12 (Storage Tool #12)    🔴 FULL        │   │
│  │ 5 Levels | Usage: 100%            [View Details] │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- Filter by type (Rack/Fridge) and status
- Show status with color coding:
  - 🟢 ACTIVE (green)
  - ⚪ INACTIVE (gray)
  - 🔴 FULL (red)
  - 🟡 IN_MAINTAINANCE (yellow)
- Display key metrics (usage, temperature, etc.)
- Click to drill down into specific storage tool

---

#### 3. **Rack Detail Screen**

**Purpose:** Manage individual rack and its levels

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Warehouse                                    │
│                                                          │
│  Rack #10 (Storage Tool #10)                            │
│  Status: ✅ ACTIVE | Overall Usage: 70%                 │
│  Warehouse: #1 - 123 Main St                            │
├─────────────────────────────────────────────────────────┤
│  Rack Levels (5 levels)                  [+ Add Level]  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Level 5 (Top)          Usage: ██░░░░ 40%         │   │
│  │ Level ID: 25           [View Products] [Edit]    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Level 4                Usage: ████░░ 70%         │   │
│  │ Level ID: 24           [View Products] [Edit]    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Level 3                Usage: ██████ 90%         │   │
│  │ Level ID: 23           [View Products] [Edit]    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Level 2                Usage: ███░░░ 50%         │   │
│  │ Level ID: 22           [View Products] [Edit]    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Level 1 (Bottom)       Usage: ████░░ 60%         │   │
│  │ Level ID: 21           [View Products] [Edit]    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- Show all levels in the rack (top to bottom)
- Display usage for each level
- Link to products stored on each level
- Edit level information
- Visual progress bars for usage

---

#### 4. **Fridge Detail Screen**

**Purpose:** Monitor fridge temperature and status

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Warehouse                                    │
│                                                          │
│  Fridge #3 (Storage Tool #11)                           │
│  Status: ✅ ACTIVE | Overall Usage: 75%                 │
│  Warehouse: #1 - 123 Main St                            │
├─────────────────────────────────────────────────────────┤
│  Temperature Monitoring                                 │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Current Temperature                       │   │
│  │                                                   │   │
│  │              -5°C                                 │   │
│  │                                                   │   │
│  │  Min: -10°C  ├─────●─────┤  Max: 0°C            │   │
│  │              └───────────┘                        │   │
│  │                                                   │   │
│  │  Status: ✅ Within Range                          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Products Stored                        [View All]      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🥩 Fresh Beef - 500g                             │   │
│  │ Quantity: 50 units                               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🥛 Organic Milk - 1L                             │   │
│  │ Quantity: 30 units                               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [Settings] [Maintenance Log]                           │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- Large temperature display
- Visual indicator showing current temp in relation to min/max
- Status indicator (within range, too cold, too warm)
- List of products stored in fridge
- Links to settings and maintenance

---

#### 5. **Add/Edit Storage Tool Modal**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Add Storage Tool to Warehouse #1                    [×]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Type:  ⚪ Rack   ⚪ Fridge                              │
│                                                          │
│  Status:                                                 │
│  [▼ Select Status      ]                                │
│  • ACTIVE                                               │
│  • INACTIVE                                             │
│  • FULL                                                 │
│  • IN_MAINTAINANCE                                      │
│                                                          │
│  Usage Percentage:                                       │
│  [50        ] %                                          │
│                                                          │
│  Last Maintenance Date:                                  │
│  [2026-03-15    ] 📅                                    │
│                                                          │
│  ─────────── If Rack Selected ───────────               │
│  Number of Levels:                                       │
│  [5             ]                                        │
│                                                          │
│  ─────────── If Fridge Selected ─────────               │
│  Current Temperature (°C):                               │
│  [-5            ]                                        │
│                                                          │
│  Min Temperature (°C):                                   │
│  [-10           ]                                        │
│                                                          │
│  Max Temperature (°C):                                   │
│  [0             ]                                        │
│                                                          │
│              [Cancel]  [Save Storage Tool]              │
└─────────────────────────────────────────────────────────┘
```

---

## API Reference

**Base URL:** `http://localhost:9200`

### Common Response Format

All endpoints return this structure:

```json
{
  "type": "GOOD" | "ERROR" | "WARN" | "SKIP_AS_GOOD",
  "code": "200",
  "message": "Success message",
  "detail": { /* data */ },
  "timestamp": "2026-04-05T12:00:00"
}
```

---

### Warehouse APIs

#### 1. Get All Warehouses

```
GET /api/warehouse?pageNum=1&pageSize=20
```

**Query Parameters:**
- `pageNum` (optional, default: 1): Page number (1-based)
- `pageSize` (optional, default: 20): Items per page

**Response:**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Get all warehouses successfully",
  "detail": [
    {
      "warehouseId": 1,
      "address": "123 Main St, City Center",
      "usagePercentage": 65,
      "numOfFridge": 3,
      "numOfRack": 5
    },
    {
      "warehouseId": 2,
      "address": "456 Oak Ave, Industrial Park",
      "usagePercentage": 45,
      "numOfFridge": 2,
      "numOfRack": 8
    }
  ],
  "timestamp": "2026-04-05T12:00:00"
}
```

---

#### 2. Get Single Warehouse

```
GET /api/warehouse/{warehouseId}
```

**Response:**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Read warehouse successfully",
  "detail": {
    "warehouseId": 1,
    "address": "123 Main St, City Center",
    "usagePercentage": 65,
    "numOfFridge": 3,
    "numOfRack": 5
  },
  "timestamp": "2026-04-05T12:00:00"
}
```

---

#### 3. Create Warehouse

```
POST /api/warehouse
Content-Type: application/json
```

**Request Body:**
```json
{
  "address": "789 Pine St, North District",
  "usagePercentage": 0,
  "numOfFridge": 0,
  "numOfRack": 0
}
```

**Response:**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Create warehouse successfully",
  "detail": {
    "warehouseId": 3,
    "address": "789 Pine St, North District",
    "usagePercentage": 0,
    "numOfFridge": 0,
    "numOfRack": 0
  },
  "timestamp": "2026-04-05T12:00:00"
}
```

---

#### 4. Update Warehouse

```
PUT /api/warehouse/{warehouseId}
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "address": "789 Pine St, North District - Building A",
  "usagePercentage": 10,
  "numOfFridge": 1,
  "numOfRack": 2
}
```

---

#### 5. Delete Warehouse

```
DELETE /api/warehouse/{warehouseId}
```

---

### Storage Tool APIs

#### 1. Get All Storage Tools

```
GET /api/storage-tool?pageNum=1&pageSize=20
```

**Response:**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Get all storageTools successfully",
  "detail": [
    {
      "storageToolId": 10,
      "lastMaintainanceDate": "2026-03-01",
      "status": "ACTIVE",
      "usagePercentage": 70,
      "warehouseId": 1,
      "toolType": "RACK"
    },
    {
      "storageToolId": 11,
      "lastMaintainanceDate": "2026-03-15",
      "status": "ACTIVE",
      "usagePercentage": 75,
      "warehouseId": 1,
      "toolType": "FRIDGE"
    },
    {
      "storageToolId": 12,
      "lastMaintainanceDate": "2026-02-20",
      "status": "FULL",
      "usagePercentage": 100,
      "warehouseId": 1,
      "toolType": "RACK"
    }
  ],
  "timestamp": "2026-04-05T12:00:00"
}
```

**Status Values:**
- `ACTIVE` - Operating normally, can accept products
- `INACTIVE` - Not in use
- `FULL` - At capacity, cannot accept more products
- `IN_MAINTAINANCE` - Under repair, cannot be used

**Tool Type Values:**
- `RACK` - Regular shelving storage
- `FRIDGE` - Refrigerated storage

---

#### 2. Get Storage Tool by ID

```
GET /api/storage-tool/{storageToolId}
```

---

#### 3. Create Storage Tool

```
POST /api/storage-tool
Content-Type: application/json
```

**Request Body:**
```json
{
  "lastMaintainanceDate": "2026-04-01",
  "status": "ACTIVE",
  "usagePercentage": 0,
  "warehouseId": 1,
  "toolType": "RACK"
}
```

**Important:** After creating a StorageTool:
- If `toolType = RACK`, create a corresponding `Rack` entity
- If `toolType = FRIDGE`, create a corresponding `Fridge` entity

---

#### 4. Update Storage Tool

```
PUT /api/storage-tool/{storageToolId}
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "status": "IN_MAINTAINANCE",
  "lastMaintainanceDate": "2026-04-05"
}
```

---

#### 5. Delete Storage Tool

```
DELETE /api/storage-tool/{storageToolId}
```

---

### Rack APIs

#### 1. Get All Racks

```
GET /api/rack?pageNum=1&pageSize=20
```

**Response:**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Get all racks successfully",
  "detail": [
    {
      "rackId": 5,
      "numOfLevel": 5,
      "storageToolId": 10
    },
    {
      "rackId": 6,
      "numOfLevel": 4,
      "storageToolId": 12
    }
  ],
  "timestamp": "2026-04-05T12:00:00"
}
```

---

#### 2. Get Rack by ID

```
GET /api/rack/{rackId}
```

---

#### 3. Create Rack

```
POST /api/rack
Content-Type: application/json
```

**Request Body:**
```json
{
  "numOfLevel": 5,
  "storageToolId": 10
}
```

**Important:**
- The `storageToolId` must exist
- The `storageToolId` must not already be associated with another Rack or Fridge
- After creating a Rack with 5 levels, you should create 5 RackLevel entities

---

#### 4. Update Rack

```
PUT /api/rack/{rackId}
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "numOfLevel": 6
}
```

**Warning:** If you increase `numOfLevel`, you may need to create additional RackLevel entities.

---

#### 5. Delete Rack

```
DELETE /api/rack/{rackId}
```

---

### Fridge APIs

#### 1. Get All Fridges

```
GET /api/fridge?pageNum=1&pageSize=20
```

**Response:**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Get all fridges successfully",
  "detail": [
    {
      "fridgeId": 3,
      "curTemp": -5,
      "minTemp": -10,
      "maxTemp": 0,
      "storageToolId": 11
    },
    {
      "fridgeId": 4,
      "curTemp": 2,
      "minTemp": 0,
      "maxTemp": 5,
      "storageToolId": 13
    }
  ],
  "timestamp": "2026-04-05T12:00:00"
}
```

**Temperature Units:** Celsius (°C)

---

#### 2. Get Fridge by ID

```
GET /api/fridge/{fridgeId}
```

---

#### 3. Create Fridge

```
POST /api/fridge
Content-Type: application/json
```

**Request Body:**
```json
{
  "curTemp": -5,
  "minTemp": -10,
  "maxTemp": 0,
  "storageToolId": 11
}
```

**Validation:**
- The `storageToolId` must exist
- The `storageToolId` must not already be associated with another Fridge or Rack
- ⚠️ Currently no validation on temperature range (will be added in future)

**Recommended Client-Side Validation:**
```javascript
// Check that minTemp < maxTemp
if (minTemp >= maxTemp) {
  alert("Min temperature must be less than max temperature");
  return;
}

// Check that curTemp is within range
if (curTemp < minTemp || curTemp > maxTemp) {
  alert("Current temperature must be within min/max range");
  return;
}
```

---

#### 4. Update Fridge

```
PUT /api/fridge/{fridgeId}
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "curTemp": -6,
  "minTemp": -10,
  "maxTemp": 0
}
```

---

#### 5. Delete Fridge

```
DELETE /api/fridge/{fridgeId}
```

---

### Rack Level APIs

#### 1. Get All Rack Levels

```
GET /api/rack-level?pageNum=1&pageSize=20
```

**Response:**
```json
{
  "type": "GOOD",
  "code": "200",
  "message": "Get all rackLevels successfully",
  "detail": [
    {
      "rackLevelId": 21,
      "usagePercentage": 60,
      "rackId": 5
    },
    {
      "rackLevelId": 22,
      "usagePercentage": 50,
      "rackId": 5
    },
    {
      "rackLevelId": 23,
      "usagePercentage": 90,
      "rackId": 5
    }
  ],
  "timestamp": "2026-04-05T12:00:00"
}
```

---

#### 2. Get Rack Level by ID

```
GET /api/rack-level/{rackLevelId}
```

---

#### 3. Create Rack Level

```
POST /api/rack-level
Content-Type: application/json
```

**Request Body:**
```json
{
  "usagePercentage": 0,
  "rackId": 5
}
```

**Important:**
- The `rackId` must exist
- ⚠️ Currently no validation on number of levels (will be added in future)
- Recommended: Check that the rack doesn't already have `rack.numOfLevel` levels before creating

**Recommended Client-Side Validation:**
```javascript
// Before creating a new level
const rack = await getRack(rackId);
const existingLevels = await getRackLevelsByRack(rackId);

if (existingLevels.length >= rack.numOfLevel) {
  alert(`Rack already has maximum levels (${rack.numOfLevel})`);
  return;
}
```

---

#### 4. Update Rack Level

```
PUT /api/rack-level/{rackLevelId}
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "usagePercentage": 75
}
```

---

#### 5. Delete Rack Level

```
DELETE /api/rack-level/{rackLevelId}
```

---

## Implementation Workflows

### Workflow 1: Display Warehouse List

**Steps:**

1. **Fetch warehouses**
```javascript
const response = await fetch('http://localhost:9200/api/warehouse?pageNum=1&pageSize=20');
const data = await response.json();

if (data.type === 'GOOD') {
  const warehouses = data.detail;
  displayWarehouses(warehouses);
}
```

2. **Display in UI**
```javascript
function displayWarehouses(warehouses) {
  return warehouses.map(warehouse => ({
    id: warehouse.warehouseId,
    title: `Warehouse #${warehouse.warehouseId}`,
    address: warehouse.address,
    usage: warehouse.usagePercentage,
    fridges: warehouse.numOfFridge,
    racks: warehouse.numOfRack
  }));
}
```

---

### Workflow 2: View Warehouse Details with Storage Tools

**Steps:**

1. **Fetch warehouse info**
```javascript
const warehouseId = 1;
const warehouseResponse = await fetch(`http://localhost:9200/api/warehouse/${warehouseId}`);
const warehouseData = await warehouseResponse.json();
const warehouse = warehouseData.detail;
```

2. **Fetch all storage tools** (filter on client side for now)
```javascript
const toolsResponse = await fetch('http://localhost:9200/api/storage-tool?pageNum=1&pageSize=100');
const toolsData = await toolsResponse.json();

// Filter to show only tools in this warehouse
const warehouseTools = toolsData.detail.filter(
  tool => tool.warehouseId === warehouseId
);
```

3. **Display tools with filtering**
```javascript
function filterTools(tools, filterType, filterStatus) {
  let filtered = tools;
  
  // Filter by type
  if (filterType !== 'ALL') {
    filtered = filtered.filter(t => t.toolType === filterType);
  }
  
  // Filter by status
  if (filterStatus === 'ACTIVE_ONLY') {
    filtered = filtered.filter(t => t.status === 'ACTIVE');
  }
  
  return filtered;
}

// Example usage
const racks = filterTools(warehouseTools, 'RACK', 'ALL');
const activeFridges = filterTools(warehouseTools, 'FRIDGE', 'ACTIVE_ONLY');
```

---

### Workflow 3: View Rack with All Levels

**Steps:**

1. **Fetch rack info**
```javascript
const rackId = 5;
const rackResponse = await fetch(`http://localhost:9200/api/rack/${rackId}`);
const rackData = await rackResponse.json();
const rack = rackData.detail;
```

2. **Fetch storage tool info** (for status)
```javascript
const toolResponse = await fetch(
  `http://localhost:9200/api/storage-tool/${rack.storageToolId}`
);
const toolData = await toolResponse.json();
const storageTool = toolData.detail;
```

3. **Fetch all rack levels** (filter on client side)
```javascript
const levelsResponse = await fetch('http://localhost:9200/api/rack-level?pageNum=1&pageSize=100');
const levelsData = await levelsResponse.json();

// Filter levels for this rack
const rackLevels = levelsData.detail.filter(
  level => level.rackId === rackId
);

// Sort by level number if you track it, or just display as is
```

4. **Display rack with levels**
```javascript
function displayRackWithLevels(rack, storageTool, levels) {
  return {
    rackId: rack.rackId,
    storageToolId: rack.storageToolId,
    status: storageTool.status,
    usagePercentage: storageTool.usagePercentage,
    numOfLevel: rack.numOfLevel,
    levels: levels.map(level => ({
      rackLevelId: level.rackLevelId,
      usagePercentage: level.usagePercentage
    }))
  };
}
```

---

### Workflow 4: Create New Storage Tool (Rack)

**Steps:**

1. **Create Storage Tool entity**
```javascript
async function createRackStorage(warehouseId, numLevels) {
  // Step 1: Create StorageTool
  const toolResponse = await fetch('http://localhost:9200/api/storage-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lastMaintainanceDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      usagePercentage: 0,
      warehouseId: warehouseId,
      toolType: 'RACK'
    })
  });
  
  const toolData = await toolResponse.json();
  if (toolData.type !== 'GOOD') {
    throw new Error(toolData.message);
  }
  
  const storageTool = toolData.detail;
  const storageToolId = storageTool.storageToolId;
  
  // Step 2: Create Rack entity
  const rackResponse = await fetch('http://localhost:9200/api/rack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      numOfLevel: numLevels,
      storageToolId: storageToolId
    })
  });
  
  const rackData = await rackResponse.json();
  if (rackData.type !== 'GOOD') {
    throw new Error(rackData.message);
  }
  
  const rack = rackData.detail;
  
  // Step 3: Create RackLevel entities
  const levels = [];
  for (let i = 0; i < numLevels; i++) {
    const levelResponse = await fetch('http://localhost:9200/api/rack-level', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usagePercentage: 0,
        rackId: rack.rackId
      })
    });
    
    const levelData = await levelResponse.json();
    if (levelData.type === 'GOOD') {
      levels.push(levelData.detail);
    }
  }
  
  return {
    storageTool,
    rack,
    levels
  };
}

// Usage
try {
  const result = await createRackStorage(1, 5);
  console.log('Created rack successfully:', result);
  alert('Rack created with 5 levels!');
} catch (error) {
  console.error('Failed to create rack:', error);
  alert('Error: ' + error.message);
}
```

---

### Workflow 5: Create New Storage Tool (Fridge)

**Steps:**

```javascript
async function createFridgeStorage(warehouseId, curTemp, minTemp, maxTemp) {
  // Client-side validation
  if (minTemp >= maxTemp) {
    throw new Error('Min temperature must be less than max temperature');
  }
  
  if (curTemp < minTemp || curTemp > maxTemp) {
    throw new Error('Current temperature must be within min/max range');
  }
  
  // Step 1: Create StorageTool
  const toolResponse = await fetch('http://localhost:9200/api/storage-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lastMaintainanceDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      usagePercentage: 0,
      warehouseId: warehouseId,
      toolType: 'FRIDGE'
    })
  });
  
  const toolData = await toolResponse.json();
  if (toolData.type !== 'GOOD') {
    throw new Error(toolData.message);
  }
  
  const storageTool = toolData.detail;
  const storageToolId = storageTool.storageToolId;
  
  // Step 2: Create Fridge entity
  const fridgeResponse = await fetch('http://localhost:9200/api/fridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      curTemp: curTemp,
      minTemp: minTemp,
      maxTemp: maxTemp,
      storageToolId: storageToolId
    })
  });
  
  const fridgeData = await fridgeResponse.json();
  if (fridgeData.type !== 'GOOD') {
    throw new Error(fridgeData.message);
  }
  
  return {
    storageTool,
    fridge: fridgeData.detail
  };
}

// Usage
try {
  const result = await createFridgeStorage(1, -5, -10, 0);
  console.log('Created fridge successfully:', result);
  alert('Fridge created!');
} catch (error) {
  console.error('Failed to create fridge:', error);
  alert('Error: ' + error.message);
}
```

---

### Workflow 6: Update Fridge Temperature

**Steps:**

```javascript
async function updateFridgeTemperature(fridgeId, newTemp) {
  // Step 1: Get current fridge data
  const fridgeResponse = await fetch(`http://localhost:9200/api/fridge/${fridgeId}`);
  const fridgeData = await fridgeResponse.json();
  const fridge = fridgeData.detail;
  
  // Step 2: Validate new temperature
  if (newTemp < fridge.minTemp || newTemp > fridge.maxTemp) {
    throw new Error(
      `Temperature ${newTemp}°C is outside range [${fridge.minTemp}, ${fridge.maxTemp}]`
    );
  }
  
  // Step 3: Update fridge
  const updateResponse = await fetch(`http://localhost:9200/api/fridge/${fridgeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      curTemp: newTemp
    })
  });
  
  const updateData = await updateResponse.json();
  if (updateData.type !== 'GOOD') {
    throw new Error(updateData.message);
  }
  
  return updateData.detail;
}

// Usage
try {
  const updated = await updateFridgeTemperature(3, -6);
  console.log('Temperature updated:', updated);
  alert('Temperature updated successfully!');
} catch (error) {
  console.error('Failed to update temperature:', error);
  alert('Error: ' + error.message);
}
```

---

### Workflow 7: Check Fridge Temperature Status

**Helper function to determine if fridge is operating correctly:**

```javascript
function getFridgeTemperatureStatus(fridge) {
  const { curTemp, minTemp, maxTemp } = fridge;
  
  // Calculate percentage within range
  const range = maxTemp - minTemp;
  const position = curTemp - minTemp;
  const percent = (position / range) * 100;
  
  // Determine status
  if (curTemp < minTemp) {
    return {
      status: 'CRITICAL',
      color: 'red',
      message: `Too cold! ${curTemp}°C is below minimum ${minTemp}°C`,
      icon: '❄️❄️❄️'
    };
  }
  
  if (curTemp > maxTemp) {
    return {
      status: 'CRITICAL',
      color: 'red',
      message: `Too warm! ${curTemp}°C is above maximum ${maxTemp}°C`,
      icon: '🔥'
    };
  }
  
  if (percent < 20 || percent > 80) {
    return {
      status: 'WARNING',
      color: 'orange',
      message: `Approaching range limit at ${curTemp}°C`,
      icon: '⚠️'
    };
  }
  
  return {
    status: 'OK',
    color: 'green',
    message: `Operating normally at ${curTemp}°C`,
    icon: '✅'
  };
}

// Usage
const fridge = { curTemp: -5, minTemp: -10, maxTemp: 0 };
const status = getFridgeTemperatureStatus(fridge);
console.log(status);
// Output: { status: 'OK', color: 'green', message: 'Operating normally at -5°C', icon: '✅' }
```

---

## Code Examples

### Complete React Component Example: Warehouse List

```javascript
import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:9200';

function WarehouseList() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchWarehouses();
  }, [currentPage]);

  async function fetchWarehouses() {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/warehouse?pageNum=${currentPage}&pageSize=${pageSize}`
      );
      const data = await response.json();

      if (data.type === 'GOOD') {
        setWarehouses(data.detail);
      } else if (data.type === 'SKIP_AS_GOOD') {
        setWarehouses([]);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch warehouses: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function getUsageColor(percentage) {
    if (percentage >= 90) return 'red';
    if (percentage >= 70) return 'orange';
    return 'green';
  }

  if (loading) return <div>Loading warehouses...</div>;
  if (error) return <div className="error">{error}</div>;
  if (warehouses.length === 0) return <div>No warehouses found.</div>;

  return (
    <div className="warehouse-list">
      <h1>Warehouses</h1>
      
      {warehouses.map(warehouse => (
        <div key={warehouse.warehouseId} className="warehouse-card">
          <h2>Warehouse #{warehouse.warehouseId}</h2>
          <p className="address">{warehouse.address}</p>
          
          <div className="usage-bar">
            <div 
              className="usage-fill" 
              style={{ 
                width: `${warehouse.usagePercentage}%`,
                backgroundColor: getUsageColor(warehouse.usagePercentage)
              }}
            />
            <span>{warehouse.usagePercentage}% Full</span>
          </div>
          
          <div className="stats">
            <span>❄️ Fridges: {warehouse.numOfFridge}</span>
            <span>🗄️ Racks: {warehouse.numOfRack}</span>
          </div>
          
          <button onClick={() => viewWarehouse(warehouse.warehouseId)}>
            View Details
          </button>
        </div>
      ))}
      
      <div className="pagination">
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

function viewWarehouse(warehouseId) {
  // Navigate to warehouse detail page
  window.location.href = `/warehouse/${warehouseId}`;
}

export default WarehouseList;
```

---

### Complete React Component Example: Rack Detail

```javascript
import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:9200';

function RackDetail({ rackId }) {
  const [rack, setRack] = useState(null);
  const [storageTool, setStorageTool] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRackDetails();
  }, [rackId]);

  async function fetchRackDetails() {
    try {
      // Fetch rack
      const rackRes = await fetch(`${API_BASE}/api/rack/${rackId}`);
      const rackData = await rackRes.json();
      const rackInfo = rackData.detail;
      setRack(rackInfo);

      // Fetch storage tool
      const toolRes = await fetch(`${API_BASE}/api/storage-tool/${rackInfo.storageToolId}`);
      const toolData = await toolRes.json();
      setStorageTool(toolData.detail);

      // Fetch all rack levels (filter for this rack)
      const levelsRes = await fetch(`${API_BASE}/api/rack-level?pageNum=1&pageSize=100`);
      const levelsData = await levelsRes.json();
      const rackLevels = levelsData.detail.filter(l => l.rackId === rackId);
      setLevels(rackLevels);
    } catch (err) {
      console.error('Error fetching rack details:', err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status) {
    const badges = {
      ACTIVE: { text: 'Active', color: 'green', icon: '✅' },
      INACTIVE: { text: 'Inactive', color: 'gray', icon: '⚪' },
      FULL: { text: 'Full', color: 'red', icon: '🔴' },
      IN_MAINTAINANCE: { text: 'Maintenance', color: 'orange', icon: '🔧' }
    };
    return badges[status] || badges.ACTIVE;
  }

  if (loading) return <div>Loading rack details...</div>;
  if (!rack || !storageTool) return <div>Rack not found</div>;

  const statusBadge = getStatusBadge(storageTool.status);

  return (
    <div className="rack-detail">
      <button onClick={() => window.history.back()}>← Back</button>
      
      <h1>Rack #{rack.rackId}</h1>
      <h2>Storage Tool #{rack.storageToolId}</h2>
      
      <div className="status-bar">
        <span className={`badge ${statusBadge.color}`}>
          {statusBadge.icon} {statusBadge.text}
        </span>
        <span className="usage">
          Overall Usage: {storageTool.usagePercentage}%
        </span>
      </div>
      
      <div className="levels-section">
        <h3>Rack Levels ({rack.numOfLevel} levels)</h3>
        
        {levels.length === 0 ? (
          <p>No levels created yet.</p>
        ) : (
          <div className="levels-list">
            {levels.map((level, index) => (
              <div key={level.rackLevelId} className="level-card">
                <div className="level-info">
                  <h4>Level {levels.length - index}</h4>
                  <span className="level-id">ID: {level.rackLevelId}</span>
                </div>
                
                <div className="level-usage">
                  <div className="usage-bar">
                    <div 
                      className="usage-fill"
                      style={{ width: `${level.usagePercentage}%` }}
                    />
                  </div>
                  <span>{level.usagePercentage}%</span>
                </div>
                
                <div className="level-actions">
                  <button>View Products</button>
                  <button>Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {levels.length < rack.numOfLevel && (
          <button className="add-level" onClick={addNewLevel}>
            + Add Level
          </button>
        )}
      </div>
    </div>
  );

  async function addNewLevel() {
    try {
      const response = await fetch(`${API_BASE}/api/rack-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usagePercentage: 0,
          rackId: rackId
        })
      });
      
      const data = await response.json();
      if (data.type === 'GOOD') {
        alert('Level added successfully!');
        fetchRackDetails(); // Refresh
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Failed to add level: ' + err.message);
    }
  }
}

export default RackDetail;
```

---

## Common Pitfalls and Solutions

### Pitfall 1: Missing StorageTool when creating Rack/Fridge

**Problem:**
```javascript
// ❌ WRONG - Creating Rack without StorageTool
const rack = await createRack({ numOfLevel: 5, storageToolId: 999 });
// Error: StorageTool 999 doesn't exist
```

**Solution:**
```javascript
// ✅ CORRECT - Create StorageTool first
const tool = await createStorageTool({ toolType: 'RACK', ... });
const rack = await createRack({ numOfLevel: 5, storageToolId: tool.storageToolId });
```

---

### Pitfall 2: Creating too many RackLevels

**Problem:**
```javascript
// ❌ WRONG - No validation
// Rack has numOfLevel = 5, but creating 10 levels
for (let i = 0; i < 10; i++) {
  await createRackLevel({ rackId: 5 });
}
```

**Solution:**
```javascript
// ✅ CORRECT - Check before creating
const rack = await getRack(5);
const existingLevels = await getRackLevels(5);

if (existingLevels.length < rack.numOfLevel) {
  await createRackLevel({ rackId: 5 });
} else {
  alert('Rack already has maximum levels');
}
```

---

### Pitfall 3: Not filtering by warehouse

**Problem:**
```javascript
// ❌ WRONG - Shows all storage tools from all warehouses
const tools = await getAllStorageTools();
displayTools(tools); // Confusing for users!
```

**Solution:**
```javascript
// ✅ CORRECT - Filter by warehouse
const allTools = await getAllStorageTools();
const warehouseTools = allTools.filter(t => t.warehouseId === currentWarehouseId);
displayTools(warehouseTools);
```

---

### Pitfall 4: Invalid fridge temperature

**Problem:**
```javascript
// ❌ WRONG - No validation
await updateFridge(3, { curTemp: 100 }); // Way too warm for a fridge!
```

**Solution:**
```javascript
// ✅ CORRECT - Validate temperature
const fridge = await getFridge(3);
const newTemp = 100;

if (newTemp < fridge.minTemp || newTemp > fridge.maxTemp) {
  alert(`Temperature must be between ${fridge.minTemp} and ${fridge.maxTemp}°C`);
  return;
}

await updateFridge(3, { curTemp: newTemp });
```

---

## Quick Reference: Status & Type Values

### StorageTool Status
```javascript
const STORAGE_STATUSES = {
  ACTIVE: 'Operating normally',
  INACTIVE: 'Not in use',
  FULL: 'At capacity',
  IN_MAINTAINANCE: 'Under repair'
};

// UI Display
function getStatusIcon(status) {
  const icons = {
    ACTIVE: '✅',
    INACTIVE: '⚪',
    FULL: '🔴',
    IN_MAINTAINANCE: '🔧'
  };
  return icons[status];
}
```

### StorageTool Type
```javascript
const STORAGE_TYPES = {
  RACK: 'Regular shelving',
  FRIDGE: 'Refrigerated storage'
};

// UI Display
function getTypeIcon(type) {
  return type === 'RACK' ? '🗄️' : '❄️';
}
```

---

## Summary Checklist

When building storage management UI:

- [ ] ✅ Always create StorageTool before creating Rack/Fridge
- [ ] ✅ Validate temperature ranges for fridges (client-side)
- [ ] ✅ Check rack level count before adding new levels
- [ ] ✅ Filter storage tools by warehouse
- [ ] ✅ Show status with color coding
- [ ] ✅ Display usage with progress bars
- [ ] ✅ Handle pagination correctly (1-based page numbers)
- [ ] ✅ Provide clear error messages
- [ ] ✅ Show loading states
- [ ] ✅ Implement proper error handling


