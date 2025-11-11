# 🚀 VS Code Quick Start Guide

## Running All Services in VS Code

### Prerequisites
✅ Python 3 installed
✅ Node.js installed  
✅ MongoDB running (or using MongoDB Atlas)
✅ VS Code open in `/Users/mollenmist/civic-issue-system/`

---

## Open 3 Terminal Windows in VS Code

**Click:** Terminal → New Terminal (or press `Ctrl + Shift + \``)

Do this **3 times** to have 3 terminal windows.

---

## Terminal 1: ML Service (Port 8000)

```bash
cd ml-service
source venv/bin/activate
cd app
python main.py
```

**Expected Output:**
```
🚀 Starting ML Service...
✅ Model loaded from ../models
Loading 25 existing issues...
✅ Loaded 25 existing issues
✅ ML Service ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test it:**
Open browser → http://localhost:8000/health

---

## Terminal 2: Backend (Port 9000)

```bash
cd backend
npm run dev
```

**Expected Output:**
```
[nodemon] starting `node server.js`
🗄️  MongoDB Connected
🚀 Server running on port 9000
```

**Test it:**
Open browser → http://localhost:9000/api/auth/me

---

## Terminal 3: Frontend (Port 5173)

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open it:**
Browser → http://localhost:5173

---

## ✅ All Services Running!

You should now have:
- 🤖 ML Service: http://localhost:8000
- 🔧 Backend API: http://localhost:9000
- 🎨 Frontend App: http://localhost:5173

---

## Test the Integration

1. **Go to:** http://localhost:5173
2. **Register** a new account
3. **Login** with your credentials
4. **Report an Issue:**
   - Click "Report Issue"
   - Upload an image
   - Click "Auto-Detect My Location"
   - Enter description: "Large pothole on Main Street"
   - Submit

5. **Check ML Predictions:**
   - Category should be auto-predicted
   - Check browser DevTools → Network tab
   - Look for ML API response

---

## Troubleshooting

### ML Service Issues

**Problem:** `ModuleNotFoundError: No module named 'cv2'`
```bash
cd ml-service
source venv/bin/activate
pip install opencv-python
```

**Problem:** `Model not loaded`
```bash
cd ml-service
source venv/bin/activate
python train.py
```

---

### Backend Issues

**Problem:** `ML API error: connect ECONNREFUSED`
**Solution:** Make sure ML service (Terminal 1) is running
```bash
curl http://localhost:8000/health
```

**Problem:** `MongoDB connection error`
**Solution:** Check `.env` file has correct `MONGODB_URI`

---

### Frontend Issues

**Problem:** `Network Error`
**Solution:** Make sure backend (Terminal 2) is running
```bash
curl http://localhost:9000/api/auth/me
```

---

## Stop Services

Press `Ctrl + C` in each terminal to stop the services.

---

## Quick Restart

If you closed VS Code and want to restart:

**Terminal 1 (ML):**
```bash
cd ml-service && source venv/bin/activate && cd app && python main.py
```

**Terminal 2 (Backend):**
```bash
cd backend && npm run dev
```

**Terminal 3 (Frontend):**
```bash
cd frontend && npm run dev
```

---

## Service Health Checks

```bash
# ML Service
curl http://localhost:8000/health

# ML Service Stats
curl http://localhost:8000/stats

# Backend (should return 401 Unauthorized - that's correct!)
curl http://localhost:9000/api/auth/me
```

---

## VS Code Extensions (Recommended)

1. **Python** - Microsoft
2. **ESLint** - Microsoft
3. **Prettier** - Prettier
4. **Thunder Client** - Thunder Client (for API testing)
5. **GitLens** - GitLens

---

## Project Structure

```
civic-issue-system/
├── ml-service/          # Python/FastAPI ML Service
│   ├── app/            # ML modules
│   ├── data/           # Training data (generated)
│   ├── models/         # Trained models (generated)
│   └── venv/           # Python virtual env
├── backend/            # Node.js/Express API
│   ├── controllers/    # Route handlers
│   ├── models/         # MongoDB models
│   └── routes/         # API routes
└── frontend/           # React/Vite UI
    ├── src/
    └── public/
```

---

## Environment Variables

### Backend (.env)
```bash
PORT=9000
ML_API_URL=http://localhost:8000/predict
MONGODB_URI=your-mongodb-uri
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-secret
JWT_SECRET=your-jwt-secret
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:9000/api
```

---

## 🎉 You're Ready!

All services are configured and ready to run. Just open the 3 terminals and start each service!

For detailed documentation, see:
- `ML_INTEGRATION_GUIDE.md` - Complete ML setup
- `ML_IMPLEMENTATION_SUMMARY.md` - Feature overview
- `ml-service/README.md` - ML service docs
