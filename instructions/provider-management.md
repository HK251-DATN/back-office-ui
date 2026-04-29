# Provider Management — Admin UI Implementation Guide

This document covers the admin flow for reviewing and approving newly registered providers: listing pending providers, inspecting their submitted certificates and videos, reviewing individual evidence items, and updating the provider's overall verification status.

---

## Overview: Admin flow

```
GET /api/provider?status=PENDING
        ↓
  Provider list screen (table of pending providers)
        ↓
  Click a provider row
        ↓
  GET /api/provider/{providerId}              (provider profile)
  GET /api/provider/{providerId}/certificates (their cert submissions)
  GET /api/provider/{providerId}/videos       (their video submissions)
        ↓
  Provider detail screen (profile + evidence tabs)
        ↓
  Review each certificate → PUT /api/provider/certificates/{id}/review
  Review each video       → PUT /api/provider/videos/{id}/review
        ↓
  Update overall status   → PUT /api/provider/{providerId}
```

---

## Step 1 — List providers filtered by verification status

**`GET {back-office-service}/api/provider`** — Requires JWT.

Use this to populate the provider management table. Filter to `PENDING` on initial load so staff see only providers awaiting review.

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `status` | string (enum) | _(none — all)_ | Filter by `verificationStatus`. Values: `UNVERIFIED`, `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| `pageNum` | integer | `1` | Page number (1-based) |
| `pageSize` | integer | `20` | Items per page |

**Example request:**
```
GET /api/provider?status=PENDING&pageNum=1&pageSize=20
Authorization: Bearer <accessToken>
```

**Success response — HTTP 200:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Read all providers successfully",
  "detail": [
    {
      "providerId": 3,
      "reputationPoint": 100,
      "verificationStatus": "PENDING",
      "bankId": "VIETCOMBANK",
      "bankNum": "1234567890",
      "userId": 42
    }
  ],
  "timestamp": "2026-04-29T10:00:00"
}
```

**Empty response (`type: SKIP_AS_GOOD`)** — no providers match the filter.

**UI notes:**
- Render a table with columns: Provider ID, User ID, Bank, Verification Status, Actions
- Name and email are available on the detail response (`GET /api/provider/{providerId}`) — clicking a row loads the full profile
- Add a status tab bar or dropdown (`All` / `Pending` / `Approved` / `Rejected` / `Suspended`) that updates the `status` query param

---

## Step 2 — View provider profile

**`GET {back-office-service}/api/provider/{providerId}`** — Requires JWT.

Returns provider account data merged with the linked user's personal information in a single response — no separate user lookup needed.

**Success response — HTTP 200:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Read provider successfully",
  "detail": {
    "providerId": 3,
    "verificationStatus": "PENDING",
    "reputationPoint": 100,
    "bankId": "VIETCOMBANK",
    "bankNum": "1234567890",
    "userId": 42,
    "email": "provider@example.com",
    "fName": "Nguyen",
    "lName": "Van A",
    "avtUrl": "https://pub-954e99f131cf4cc896de1ad360338682.r2.dev/avatar.jpg",
    "dob": "1990-05-15",
    "pNum": "0901234567",
    "gender": "MALE",
    "accStatus": "ACTIVE"
  },
  "timestamp": "2026-04-29T10:00:00"
}
```

---

## Step 3 — Load the provider's submitted evidence

Make both calls in parallel after loading the provider profile.

### 3A — Get submitted certificates

**`GET {back-office-service}/api/provider/{providerId}/certificates`** — Requires JWT.

**Success response — HTTP 200:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get certificates successfully",
  "detail": [
    {
      "certificateId": 1,
      "providerId": 3,
      "certificateType": "VIETGAP",
      "certificateNumber": "VG-2024-001234",
      "issuingAuthority": "Cục Trồng trọt",
      "issuedDate": "2024-01-15",
      "expiryDate": "2026-01-15",
      "documentUrl": "https://pub-b72d8c021b3848f8b4d8805e93e18af6.r2.dev/uuid_cert.jpg",
      "status": "PENDING",
      "reviewedBy": null,
      "reviewNote": null,
      "reviewedAt": null,
      "createdAt": "2026-04-29T10:00:00",
      "updatedAt": "2026-04-29T10:00:00"
    }
  ],
  "timestamp": "2026-04-29T10:00:00"
}
```

**Empty (`type: SKIP_AS_GOOD`)** — provider submitted no certificates.

### 3B — Get submitted videos

**`GET {back-office-service}/api/provider/{providerId}/videos`** — Requires JWT.

**Success response — HTTP 200:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Get videos successfully",
  "detail": [
    {
      "videoId": 1,
      "providerId": 3,
      "videoType": "GARDEN_FARM",
      "videoUrl": "https://pub-1b4c6325308a40f68dc9dca3d1771fbd.r2.dev/uuid_video.mp4",
      "description": "Vườn rau hữu cơ tại Đà Lạt",
      "status": "PENDING",
      "reviewedBy": null,
      "reviewNote": null,
      "reviewedAt": null,
      "createdAt": "2026-04-29T10:00:00",
      "updatedAt": "2026-04-29T10:00:00"
    }
  ],
  "timestamp": "2026-04-29T10:00:00"
}
```

**Empty (`type: SKIP_AS_GOOD`)** — provider submitted no videos.

**UI notes for the detail screen:**
- Show two tabs: **Certificates** and **Videos**
- For certificates: render each item as a card with type badge, cert number, issuing authority, date range, a link/thumbnail to `documentUrl`, and current `status` badge
- For videos: embed a `<video>` player using `videoUrl`, show video type label and description
- If both tabs are empty, show a notice: "This provider has not submitted any evidence yet"

---

## Step 4 — Review a certificate

**`PUT {back-office-service}/api/provider/certificates/{certificateId}/review`** — Requires JWT.

The reviewer's identity is taken from the JWT — no need to send an employee ID.

**Request body:**
```json
{
  "status": "APPROVED",
  "reviewNote": ""
}
```

| Field        | Type          | Required | Description                                      |
|--------------|---------------|----------|--------------------------------------------------|
| `status`     | string (enum) | Yes      | `APPROVED` or `REJECTED`                         |
| `reviewNote` | string        | No       | Required when rejecting — explains what is wrong |

**Success response — HTTP 200:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Certificate reviewed successfully",
  "detail": {
    "certificateId": 1,
    "providerId": 3,
    "certificateType": "VIETGAP",
    "certificateNumber": "VG-2024-001234",
    "issuingAuthority": "Cục Trồng trọt",
    "issuedDate": "2024-01-15",
    "expiryDate": "2026-01-15",
    "documentUrl": "https://pub-b72d8c021b3848f8b4d8805e93e18af6.r2.dev/uuid_cert.jpg",
    "status": "APPROVED",
    "reviewedBy": 7,
    "reviewNote": "",
    "reviewedAt": "2026-04-29T11:00:00",
    "createdAt": "2026-04-29T10:00:00",
    "updatedAt": "2026-04-29T11:00:00"
  },
  "timestamp": "2026-04-29T11:00:00"
}
```

---

## Step 5 — Review a video

**`PUT {back-office-service}/api/provider/videos/{videoId}/review`** — Requires JWT.

**Request body:**
```json
{
  "status": "REJECTED",
  "reviewNote": "Video quá tối, không nhìn thấy rõ khu vực chế biến"
}
```

**Success response — HTTP 200:** Same shape as certificate review response, with video fields.

---

## Step 6 — Update the provider's overall verification status

After reviewing all evidence items, the staff member manually sets the provider's final status.

**`PUT {back-office-service}/api/provider/{providerId}`** — Requires JWT.

**Request body** (only include fields to change — null fields are ignored):
```json
{
  "verificationStatus": "APPROVED"
}
```

| Field                | Type          | Description                                                  |
|----------------------|---------------|--------------------------------------------------------------|
| `verificationStatus` | string (enum) | `UNVERIFIED`, `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| `reputationPoint`    | integer       | Override reputation score                                    |
| `bankId`             | string (enum) | Correct bank if needed                                       |
| `bankNum`            | string        | Correct bank account number if needed                        |

**Success response — HTTP 200:**
```json
{
  "type": "GOOD",
  "code": "200 OK",
  "message": "Update provider successfully",
  "detail": {
    "providerId": 3,
    "reputationPoint": 100,
    "verificationStatus": "APPROVED",
    "bankId": "VIETCOMBANK",
    "bankNum": "1234567890",
    "userId": 42
  },
  "timestamp": "2026-04-29T11:00:00"
}
```

**UI notes:**
- Place an **Approve** button and a **Reject** button prominently on the provider detail screen
- Reject button should open a modal where the staff member writes a rejection reason before confirming — this reason is advisory (stored on individual cert/video `reviewNote`); the provider sees it via their submissions screen
- After updating status, refresh the provider detail and redirect back to the list if needed

---

## Recommended UI layout for the provider detail screen

```
┌─────────────────────────────────────────────────────────────┐
│  Provider #3                            [PENDING badge]     │
│  User ID: 42  ·  Bank: VIETCOMBANK  ·  Account: 123...     │
├─────────────────────────────────────────────────────────────┤
│  [Certificates tab]   [Videos tab]                          │
├─────────────────────────────────────────────────────────────┤
│  Certificate #1                         [PENDING]           │
│  Type: VietGAP  ·  Cert#: VG-2024-001234                   │
│  Issued by: Cục Trồng trọt  ·  Valid: 2024-01-15 → 2026-01-15 │
│  [View document ↗]                                          │
│  [Approve]  [Reject ▾ with note]                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ─────────────── Final decision ─────────────────           │
│  [✓ Approve provider]       [✗ Reject provider]            │
└─────────────────────────────────────────────────────────────┘
```

---

## API summary

| Method | Endpoint                                  | Purpose                                |
|--------|-------------------------------------------|----------------------------------------|
| `GET`  | `/api/provider?status=PENDING`            | List providers, filter by status       |
| `GET`  | `/api/provider/{providerId}`              | Get provider profile                   |
| `GET`  | `/api/provider/{providerId}/certificates` | Get all certs submitted by provider    |
| `GET`  | `/api/provider/{providerId}/videos`       | Get all videos submitted by provider   |
| `PUT`  | `/api/provider/certificates/{id}/review`  | Approve or reject a certificate        |
| `PUT`  | `/api/provider/videos/{id}/review`        | Approve or reject a video              |
| `PUT`  | `/api/provider/{providerId}`              | Set final provider verification status |

---

## Error response shape

```json
{
  "type": "ERROR",
  "code": "400 BAD_REQUEST",
  "message": "<reason>",
  "detail": null,
  "timestamp": "2026-04-29T10:00:00"
}
```

| Endpoint                                     | Common errors                                          |
|----------------------------------------------|--------------------------------------------------------|
| `GET /api/provider/{providerId}`             | Provider not found                                     |
| `PUT /api/provider/certificates/{id}/review` | Certificate not found, invalid `status` value          |
| `PUT /api/provider/videos/{id}/review`       | Video not found, invalid `status` value                |
| `PUT /api/provider/{providerId}`             | Provider not found, invalid `verificationStatus` value |
