# Event Management API Reference

**Base URL**: `https://{projectId}.supabase.co/functions/v1/make-server-84f9c112/events`  
**KV Store**: `kv_store_84f9c112` (Homepage/Public Data)

---

## 📡 Endpoints Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get all active events |
| GET | `/all` | Admin | Get all events (including inactive) |
| POST | `/` | Admin | Create new event |
| PUT | `/:id` | Admin | Update existing event |
| DELETE | `/:id` | Admin | Delete event |

---

## 🔓 Public Endpoints

### GET / - Get Active Events

**Description**: Trả về tất cả events có `isActive: true`, sorted theo date (sớm nhất trước)

**Request**:
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-84f9c112/events
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "evt_1737673200_a7d3f2",
      "title": "Valentine's Special Event",
      "description": "Join us for a romantic evening...",
      "date": "2026-02-14",
      "time": "7:00 PM - 10:00 PM",
      "location": "Bitcoin Nail Bar - Downtown",
      "imageUrl": "https://images.unsplash.com/photo-xxx",
      "isActive": true,
      "createdAt": "2026-01-23T10:00:00.000Z",
      "updatedAt": "2026-01-23T10:00:00.000Z"
    }
  ]
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Failed to fetch events"
}
```

---

## 🔒 Admin Endpoints

**Authentication**: Tất cả admin endpoints yêu cầu admin token trong header:
```bash
Authorization: Bearer {adminToken}
```

### GET /all - Get All Events (Admin)

**Description**: Trả về tất cả events (bao gồm inactive), sorted theo createdAt (mới nhất trước)

**Request**:
```bash
curl -H "Authorization: Bearer {adminToken}" \
  https://{projectId}.supabase.co/functions/v1/make-server-84f9c112/events/all
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "evt_1737673200_a7d3f2",
      "title": "Valentine's Special Event",
      "isActive": true,
      ...
    },
    {
      "id": "evt_1737586800_b4e5g3",
      "title": "New Year Party",
      "isActive": false,
      ...
    }
  ]
}
```

**Error Responses**:
```json
// 401 Unauthorized
{
  "success": false,
  "error": "Unauthorized"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Failed to fetch events"
}
```

---

### POST / - Create Event (Admin)

**Description**: Tạo event mới với auto-generated ID

**Required Fields**:
- `title` (string)
- `description` (string)
- `date` (string, ISO format: "YYYY-MM-DD")
- `time` (string)
- `location` (string)

**Optional Fields**:
- `imageUrl` (string, default: "")
- `isActive` (boolean, default: true)

**Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Valentine Special Event",
    "description": "Join us for a romantic evening with special nail designs and champagne",
    "date": "2026-02-14",
    "time": "7:00 PM - 10:00 PM",
    "location": "Bitcoin Nail Bar - Downtown",
    "imageUrl": "https://images.unsplash.com/photo-xxx",
    "isActive": true
  }' \
  https://{projectId}.supabase.co/functions/v1/make-server-84f9c112/events
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "evt_1737673200_a7d3f2",
    "title": "Valentine Special Event",
    "description": "Join us for a romantic evening...",
    "date": "2026-02-14",
    "time": "7:00 PM - 10:00 PM",
    "location": "Bitcoin Nail Bar - Downtown",
    "imageUrl": "https://images.unsplash.com/photo-xxx",
    "isActive": true,
    "createdAt": "2026-01-23T10:00:00.000Z",
    "updatedAt": "2026-01-23T10:00:00.000Z"
  }
}
```

**Error Responses**:
```json
// 400 Bad Request
{
  "success": false,
  "error": "Missing required fields: title, description, date, time, location"
}

// 401 Unauthorized
{
  "success": false,
  "error": "Unauthorized"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Failed to create event"
}
```

---

### PUT /:id - Update Event (Admin)

**Description**: Update existing event. Có thể update một hoặc nhiều fields.

**Request**:
```bash
curl -X PUT \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Valentine Special Event - UPDATED",
    "isActive": false
  }' \
  https://{projectId}.supabase.co/functions/v1/make-server-84f9c112/events/evt_1737673200_a7d3f2
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "evt_1737673200_a7d3f2",
    "title": "Valentine Special Event - UPDATED",
    "description": "Join us for a romantic evening...",
    "date": "2026-02-14",
    "time": "7:00 PM - 10:00 PM",
    "location": "Bitcoin Nail Bar - Downtown",
    "imageUrl": "https://images.unsplash.com/photo-xxx",
    "isActive": false,
    "createdAt": "2026-01-23T10:00:00.000Z",
    "updatedAt": "2026-01-23T11:30:00.000Z"
  }
}
```

**Error Responses**:
```json
// 404 Not Found
{
  "success": false,
  "error": "Event not found"
}

// 401 Unauthorized
{
  "success": false,
  "error": "Unauthorized"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Failed to update event"
}
```

---

### DELETE /:id - Delete Event (Admin)

**Description**: Hard delete event khỏi KV store

**Request**:
```bash
curl -X DELETE \
  -H "Authorization: Bearer {adminToken}" \
  https://{projectId}.supabase.co/functions/v1/make-server-84f9c112/events/evt_1737673200_a7d3f2
```

**Response**:
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Error Responses**:
```json
// 404 Not Found
{
  "success": false,
  "error": "Event not found"
}

// 401 Unauthorized
{
  "success": false,
  "error": "Unauthorized"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Failed to delete event"
}
```

---

## 📊 Data Schema

### Event Object
```typescript
interface Event {
  id: string;              // Auto-generated: evt_{timestamp}_{random}
  title: string;           // Event name
  description: string;     // Event description
  date: string;           // ISO format: "YYYY-MM-DD"
  time: string;           // "7:00 PM - 10:00 PM"
  location: string;       // "Bitcoin Nail Bar - Downtown"
  imageUrl: string;       // URL to event image
  isActive: boolean;      // Show/hide from public
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
}
```

### KV Store Keys
- **Pattern**: `event:{eventId}`
- **Example**: `event:evt_1737673200_a7d3f2`
- **Table**: `kv_store_84f9c112`

---

## 🧪 Testing Examples

### Test 1: Create Sample Event
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "This is a test event",
    "date": "2026-03-01",
    "time": "6:00 PM - 9:00 PM",
    "location": "Test Location"
  }' \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/events
```

### Test 2: Get All Active Events (Public)
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/events
```

### Test 3: Update Event Status
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}' \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/events/EVENT_ID
```

### Test 4: Delete Event
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/events/EVENT_ID
```

---

## 🔐 Authentication Details

### Getting Admin Token
Admin token được lưu trong KV store với key `admin_auth_token` trong table `kv_store_89edbd69`.

### Validation Flow
```typescript
// Backend validation
const authHeader = c.req.header('Authorization');
const token = authHeader?.split(' ')[1];

const adminTokenData = await kv.get('kv_store_89edbd69', 'admin_auth_token');
const isAdmin = adminTokenData?.value === token;
```

---

## 📝 Notes

1. **Event ID Format**: `evt_{timestamp}_{random6chars}`
2. **Date Format**: ISO 8601 date only (YYYY-MM-DD)
3. **Time Format**: Free text, e.g., "7:00 PM - 10:00 PM"
4. **Active Events**: Only events với `isActive: true` hiển thị trên public endpoint
5. **Sort Order**: 
   - Public endpoint: Sort by date (sớm nhất trước)
   - Admin endpoint: Sort by createdAt (mới nhất trước)
6. **Hard Delete**: DELETE endpoint xóa hoàn toàn khỏi database (không soft delete)

---

## 🔗 Related Files

- Backend Implementation: `/supabase/functions/server/events.tsx`
- Main Server Routes: `/supabase/functions/server/index.tsx`
- KV Store Helper: `/supabase/functions/server/kv_store.tsx`
- Implementation Guide: `/docs/04-changelogs/EVENT_MANAGEMENT_SYSTEM.md`

---

**Last Updated**: January 23, 2026  
**API Version**: 1.0.0
