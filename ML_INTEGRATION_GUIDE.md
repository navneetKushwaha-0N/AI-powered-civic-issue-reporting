# ML Integration Guide

Complete guide to set up and run the Civic Issue System with ML microservice.

## Overview

The system now includes:
1. **Backend** (Node.js/Express) - Port 9000
2. **Frontend** (React/Vite) - Port 5173  
3. **ML Service** (Python/FastAPI) - Port 8000
4. **MongoDB** - Database

## Quick Start (All Services)

### Terminal 1: ML Service

```bash
cd civic-issue-system/ml-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Generate dataset and train models
python train.py

# Start ML service
cd app
python main.py
```

ML Service will be running on **http://localhost:8000**

### Terminal 2: Backend

```bash
cd civic-issue-system/backend

# Install dependencies (if not already done)
npm install

# Make sure .env is configured
# PORT=9000
# ML_API_URL=http://localhost:8000/predict
# (other variables...)

# Start backend
npm run dev
```

Backend will be running on **http://localhost:9000**

### Terminal 3: Frontend

```bash
cd civic-issue-system/frontend

# Install dependencies (if not already done)
npm install

# Start frontend
npm run dev
```

Frontend will be running on **http://localhost:5173**

---

## Step-by-Step Setup

### 1. ML Service Setup

#### Install Python Dependencies

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Generate Training Data

```bash
python train.py
```

This will:
- Generate 25 synthetic images in `data/images/`
- Create `data/training_data.json` with metadata
- Train the category prediction model
- Save models to `models/` directory

Expected output:
```
Generating 25 samples...
  [1/25] Generated: Garbage Issue
  ...
✅ Dataset generated successfully!
Training category prediction model...
✅ Model trained on 25 samples
✅ Model saved to models
```

#### Start ML Service

```bash
cd app
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Test ML Service:**
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "duplicate_detector_issues": 25
}
```

### 2. Backend Setup

#### Update Environment Variables

Edit `backend/.env`:

```bash
PORT=9000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ML_API_URL=http://localhost:8000/predict
CORS_ORIGIN=http://localhost:5173
DUPLICATE_RADIUS_METERS=80
IMAGE_SIMILARITY_THRESHOLD=0.85
```

**Important:** The `ML_API_URL` must point to your running ML service.

#### Start Backend

```bash
cd backend
npm install  # if not already done
npm run dev
```

**Test Backend:**
```bash
curl http://localhost:9000/api/auth/me
```

### 3. Frontend Setup

#### Update Environment Variables

Edit `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:9000/api
```

#### Start Frontend

```bash
cd frontend
npm install  # if not already done
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Testing the Integration

### 1. Register/Login
1. Go to http://localhost:5173
2. Register a new account
3. Login

### 2. Report an Issue
1. Click "Report Issue"
2. Upload an image
3. Click "Auto-Detect My Location"
4. Enter a description (e.g., "Large pothole on Main Street")
5. Submit

**What Happens:**
1. Image uploads to Cloudinary
2. Backend calls ML service at `POST /predict` with:
   - `imageURL`: Cloudinary URL
   - `description`: User's text
   - `latitude`: GPS coordinates
   - `longitude`: GPS coordinates
3. ML service returns:
   - `category`: "Road Damage / Pothole" (predicted)
   - `confidence`: 0.85
   - `isDuplicate`: false
   - `duplicateIssueId`: null
   - `priority`: "High"
   - `authentic`: true
4. Backend stores issue with ML predictions
5. Frontend displays success message

### 3. Check ML Predictions

View the created issue details to see:
- ✅ Auto-predicted category
- ✅ Confidence score
- ✅ Priority level
- ✅ Authenticity status

---

## API Flow

### Request Flow

```
Frontend → Backend → ML Service
```

### Backend to ML Service Request

```http
POST http://localhost:8000/predict
Content-Type: application/json

{
  "imageURL": "https://res.cloudinary.com/xyz/image.jpg",
  "description": "Large pothole on Main Street",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### ML Service Response

```json
{
  "category": "Road Damage / Pothole",
  "confidence": 0.91,
  "isDuplicate": false,
  "duplicateIssueId": null,
  "priority": "High",
  "authentic": true
}
```

### Backend Response to Frontend

```json
{
  "success": true,
  "duplicate": false,
  "message": "Issue reported successfully",
  "data": {
    "issue": {
      "_id": "...",
      "category": "Road Damage / Pothole",
      "description": "...",
      "mlConfidence": 0.91,
      "mlPredictions": {
        "priority": "High",
        "authentic": true
      }
    },
    "predictedCategory": "Road Damage / Pothole",
    "confidence": 0.91,
    "priority": "High",
    "authentic": true
  }
}
```

---

## ML Features in Action

### 1. Category Prediction
- Analyzes image colors and text description
- Predicts one of 5 categories:
  - Garbage Issue
  - Road Damage / Pothole
  - Street Light Failure
  - Water Leakage
  - Sewer Overflow

### 2. Duplicate Detection
- Checks within 100m radius
- Compares image similarity (perceptual hashing)
- Compares text similarity (TF-IDF cosine similarity)
- Threshold: 0.80 (80% similar = duplicate)

### 3. Priority Assignment
- **Critical**: Sewer overflow near hospital
- **High**: Water leakage or road damage
- **Medium**: Standard severity issues
- **Low**: Minor issues

### 4. Image Authenticity
- Checks EXIF metadata (GPS, timestamp)
- Validates image properties (resolution, format)
- Detects potential fake/stock images

---

## Troubleshooting

### ML Service Issues

**"No module named 'cv2'"**
```bash
pip install opencv-python
```

**"Model not loaded"**
```bash
cd ml-service
python train.py
```

**Port 8000 already in use**
```bash
# Change port in app/main.py
uvicorn.run(app, host="0.0.0.0", port=8001)

# Update backend .env
ML_API_URL=http://localhost:8001/predict
```

### Backend Issues

**"ML API error: connect ECONNREFUSED"**
- ML service is not running
- Check if http://localhost:8000/health responds

**"Category shows 'other' despite ML service running"**
- Check backend logs for ML API errors
- Verify `ML_API_URL` in backend `.env`
- Test ML endpoint directly with curl

### Frontend Issues

**Category not auto-filling**
- Open browser console for errors
- Check Network tab for API responses
- Verify backend is returning ML predictions

---

## VS Code Setup

### Recommended Extensions
- Python
- ESLint
- Prettier
- Thunder Client (API testing)

### Multi-Terminal Setup

1. Open VS Code in `civic-issue-system/`
2. Open 3 terminals:
   - Terminal 1: `cd ml-service && source venv/bin/activate && cd app && python main.py`
   - Terminal 2: `cd backend && npm run dev`
   - Terminal 3: `cd frontend && npm run dev`

### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Backend",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"]
    },
    {
      "name": "ML Service",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/ml-service/app/main.py",
      "cwd": "${workspaceFolder}/ml-service",
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Production Deployment

### ML Service
Deploy to:
- Railway
- Render
- AWS Lambda (with container)
- Google Cloud Run

Update `ML_API_URL` in backend .env to production URL.

### Backend
Update ML_API_URL to point to deployed ML service.

### Frontend
No changes needed - connects to backend only.

---

## Monitoring

### Check Service Health

```bash
# ML Service
curl http://localhost:8000/health

# ML Service Stats
curl http://localhost:8000/stats

# Backend
curl http://localhost:9000/api/auth/me
```

### View Logs

```bash
# ML Service
# Check terminal output

# Backend
# Check nodemon output

# Frontend  
# Check browser console
```

---

## Next Steps

1. ✅ All services running
2. ✅ Test issue creation with ML
3. ✅ Test duplicate detection
4. ⬜ Add more training data (increase samples in train.py)
5. ⬜ Fine-tune ML thresholds
6. ⬜ Deploy to production

---

## Support

For issues:
1. Check logs in each service
2. Verify all services are running
3. Test each service independently
4. Check environment variables

**Service Ports:**
- Frontend: 5173
- Backend: 9000
- ML Service: 8000
- MongoDB: 27017

All services must be running for full functionality!
