# 🔧 Quick Fix for 500 Error

## What Was the Problem?

The backend Issue model had enum restrictions on the `category` field that didn't include the ML service categories.

## ✅ Fixed!

I've updated `backend/models/Issue.js` to accept ML categories:
- Garbage Issue
- Road Damage / Pothole
- Street Light Failure
- Water Leakage
- Sewer Overflow
- Other

## What You Need to Do

### Step 1: Restart Backend

In **Terminal 2** (Backend):
1. Press `Ctrl + C` to stop the backend
2. Run again:
```bash
npm run dev
```

### Step 2: Test Again

1. Go to http://localhost:5173
2. Try reporting an issue again
3. Upload an image
4. Enter description: "Large pothole on Main Street"
5. Submit

## ✅ Expected Result

The issue should now be created successfully with:
- ✅ Auto-predicted category
- ✅ Confidence score
- ✅ Priority level
- ✅ Authenticity check

## 🔍 Verification

Check the browser console (F12 → Network tab):
- You should see a successful POST to `/api/issues/create`
- Status: 201 Created
- Response includes ML predictions

## Still Having Issues?

### Check ML Service is Running
```bash
curl http://localhost:8000/health
```
Should return:
```json
{"status":"healthy","model_loaded":true,"duplicate_detector_issues":25}
```

### Check Backend Logs
Look at Terminal 2 (Backend) for any error messages.

### Check MongoDB Connection
Make sure your `backend/.env` has valid `MONGODB_URI`

---

## Complete Restart (If Needed)

If you're still having issues, do a complete restart:

**Terminal 1 (ML Service):**
```bash
Ctrl + C
cd ml-service && source venv/bin/activate && cd app && python main.py
```

**Terminal 2 (Backend):**
```bash
Ctrl + C
cd backend && npm run dev
```

**Terminal 3 (Frontend):**
```bash
Ctrl + C
cd frontend && npm run dev
```

---

That's it! The issue should be fixed now. Just restart the backend and try again. 🚀
