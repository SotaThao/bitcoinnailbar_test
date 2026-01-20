# 🔔 Real-time Check-in Notifications Setup

## ✅ What's Been Implemented

This system automatically notifies the Admin Dashboard when a customer checks in via the Kiosk QR scanner.

### Features:
- 🔄 **Real-time updates** using Supabase Realtime
- 🎉 **Toast notifications** with customer details
- 🔃 **Auto-refresh** appointments list
- 📱 **Mobile-friendly** notifications

---

## ⚙️ Enable Supabase Realtime (Required)

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Navigate to **Database** → **Replication**

### Step 2: Enable Realtime for Table
1. Find the table: `kv_store_84f9c112`
2. Toggle **Enable Realtime** to ON
3. Click **Save**

### Step 3: Verify (Optional)
Run this SQL in the SQL Editor to confirm:
```sql
SELECT schemaname, tablename, pkey_cols, replica_identity 
FROM pg_publication_tables 
WHERE tablename = 'kv_store_84f9c112';
```

---

## 🧪 Testing the Feature

### Test Flow:
1. **Admin Dashboard:** Open `/admin/appointments` in one browser tab
2. **Kiosk:** Open `/admin/check-in` in another tab (or device)
3. **Action:** Scan a QR code or enter phone number to check in
4. **Result:** Admin dashboard should show:
   - 🎉 Toast notification with customer details
   - 🔄 Appointments list auto-refreshes
   - ✅ Status changes from "Pending" to "Confirmed"

### Expected Toast Message:
```
🎉 New Check-in!
━━━━━━━━━━━━━━━━
👤 John Doe
📞 (713) 555-1234
💅 Manicure, Pedicure
⏰ 2:30 PM
```

---

## 🔍 Troubleshooting

### Notifications not showing?

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for `[REALTIME]` logs
   - Should see: `✅ Successfully subscribed to check-in notifications`

2. **Check Server Logs:**
   - Look for: `✅ [CHECK-IN] Notification event saved`

3. **Verify Realtime is enabled:**
   - Run the SQL query from Step 3 above
   - Should return 1 row

4. **Check Network Tab:**
   - Look for WebSocket connection to Supabase
   - URL should contain `/realtime/`

### Fallback Option (If Realtime Fails):
The app will still work without real-time updates. Simply:
- Refresh the page manually (F5)
- Or use the "Refresh" button if added

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Kiosk QR Scan  │
└────────┬────────┘
         │ POST /check-in
         ▼
┌─────────────────────────┐
│  Server                 │
│  1. Update appointment  │
│  2. Save notification   │
│     to KV store         │
└────────┬────────────────┘
         │
         │ Supabase Realtime
         │ (Postgres Changes)
         ▼
┌─────────────────────────┐
│  Admin Dashboard        │
│  1. Receive event       │
│  2. Show toast          │
│  3. Refresh list        │
└─────────────────────────┘
```

---

## 📝 Technical Details

### Server Changes:
- **File:** `/supabase/functions/server/index.tsx`
- **Endpoint:** `POST /make-server-84f9c112/check-in`
- **Action:** Saves notification to `notification:checkin:{timestamp}` key

### Frontend Changes:
- **Hook:** `/src/app/hooks/useRealtimeNotifications.ts` (future)
- **Component:** `/src/app/components/admin/Appointments.tsx`
- **Library:** `@supabase/supabase-js` + `sonner` (toast)

### Database Keys:
- **Appointments:** `appointment:{timestamp}`
- **Notifications:** `notification:checkin:{timestamp}`

---

## 🎯 Next Steps (Optional Enhancements)

- [ ] Add sound notification
- [ ] Add desktop notification API
- [ ] Add "Mark All as Read" for notifications
- [ ] Add notification history panel
- [ ] Add email/SMS alerts for check-ins

---

## 🆘 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review browser console logs
3. Verify Supabase Realtime is enabled
4. Test with a fresh browser session

---

**Last Updated:** January 20, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
