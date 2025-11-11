# ML Integration - Implementation Summary

## ✅ What Was Built

A complete ML microservice has been integrated into your Civic Issue Reporting System with the following features:

### 1. **Category Prediction** 🎯
- Analyzes uploaded images using color histograms and features
- Processes text descriptions using TF-IDF vectorization
- Combines image + text features for classification
- Predicts one of 5 categories:
  - Garbage Issue
  - Road Damage / Pothole
  - Street Light Failure
  - Water Leakage
  - Sewer Overflow
- Returns confidence score (0.0-1.0)

### 2. **Duplicate Detection** 🔍
- Location-based filtering (100m radius)
- Image similarity using perceptual hashing (pHash)
- Text similarity using TF-IDF + cosine similarity
- Combined similarity threshold: 0.80 (80%)
- Returns duplicate issue ID if found

### 3. **Priority Assignment** ⚡
- Rule-based priority calculation
- Factors considered:
  - Category severity (1-4 scale)
  - Sensitive location detection (hospitals, schools, etc.)
  - Duplicate/repeated reports
- Priority levels: Low, Medium, High, Critical

### 4. **Image Authenticity Check** 🔐
- EXIF metadata validation (GPS, timestamp)
- Perceptual hash checking against known fakes
- Image property validation (resolution, format)
- Returns authenticity boolean + confidence

---

## 📁 Files Created

### ML Service (`ml-service/`)

```
ml-service/
├── app/
│   ├── main.py                    # FastAPI server with /predict endpoint
│   ├── category_predictor.py     # ML model for category classification
│   ├── duplicate_detector.py     # Duplicate detection logic
│   ├── priority_assigner.py      # Priority calculation rules
│   └── authenticity_checker.py   # Image authenticity verification
├── utils/
│   └── generate_dataset.py       # Synthetic dataset generator
├── data/                          # Training data (generated)
│   ├── images/                   # Synthetic images
│   └── training_data.json        # Training metadata
├── models/                        # Trained model files (generated)
│   ├── category_model.pkl
│   ├── text_vectorizer.pkl
│   └── label_encoder.pkl
├── requirements.txt               # Python dependencies
├── train.py                       # Training script
├── start.sh                       # Quick start script
├── .gitignore
└── README.md
```

### Backend Integration

**Modified:**
- `backend/controllers/issueController.js` - Updated to call ML service

**Environment:**
- `backend/.env` - ML_API_URL configured

### Documentation

**Created:**
- `ML_INTEGRATION_GUIDE.md` - Complete setup and usage guide
- `ML_IMPLEMENTATION_SUMMARY.md` - This file
- `ml-service/README.md` - ML service documentation
- `run-all.sh` - Quick start script for all services

---

## 🚀 How to Run

### Quick Start in VS Code

Open 3 terminals in VS Code:

**Terminal 1 - ML Service:**
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python train.py
cd app && python main.py
```
✅ Running on http://localhost:8000

**Terminal 2 - Backend:**
```bash
cd backend
npm install
npm run dev
```
✅ Running on http://localhost:9000

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```
✅ Running on http://localhost:5173

---

## 🔄 Integration Flow

### User Reports Issue

1. **Frontend** → Uploads image, enters description, location
2. **Backend** → Receives form data
3. **Backend** → Uploads image to Cloudinary
4. **Backend** → Calls ML Service:
   ```json
   POST http://localhost:8000/predict
   {
     "imageURL": "https://cloudinary.com/.../image.jpg",
     "description": "Large pothole on Main Street",
     "latitude": 40.7128,
     "longitude": -74.0060
   }
   ```
5. **ML Service** → Processes request:
   - Downloads image from Cloudinary URL
   - Extracts image features (color histograms)
   - Extracts text features (TF-IDF)
   - Predicts category with confidence
   - Checks for duplicates in existing data
   - Assigns priority based on rules
   - Verifies image authenticity
6. **ML Service** → Returns predictions:
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
7. **Backend** → Stores issue with ML predictions
8. **Frontend** → Displays success with auto-filled category

---

## 🎯 Key Features in Action

### Auto Category Prediction
- User doesn't need to select category
- ML predicts based on image + description
- Fallback to "other" if confidence < 0.70

### Smart Duplicate Detection
- Prevents duplicate reports for same issue
- Adds user as "supporter" to existing issue
- Considers location + image + text similarity

### Priority-Based Routing
- Critical issues flagged immediately
- Admins can prioritize based on ML suggestions
- Sensitive locations (hospitals, schools) get higher priority

### Authenticity Verification
- Detects potentially fake/downloaded images
- Checks for manipulated photos
- Validates EXIF metadata

---

## 📊 Training Data

The system includes a synthetic dataset generator:
- Generates 25 sample images (configurable)
- Creates realistic issue descriptions
- Assigns GPS coordinates
- Adds EXIF metadata to images
- Trains lightweight ML model

**To generate more data:**
```python
# Edit utils/generate_dataset.py
generate_dataset(num_samples=50, output_dir='data')
```

Then retrain:
```bash
python train.py
```

---

## 🔧 Configuration

### ML Service Thresholds

Edit in `app/main.py` and respective module files:

```python
# Category confidence threshold
CONFIDENCE_THRESHOLD = 0.70

# Duplicate detection
LOCATION_RADIUS_METERS = 100
SIMILARITY_THRESHOLD = 0.80

# Priority factors
category_severity = {
    "Sewer Overflow": 4,
    "Water Leakage": 3,
    "Road Damage / Pothole": 3,
    "Garbage Issue": 2,
    "Street Light Failure": 2
}
```

---

## 🧪 Testing

### Test ML Service Directly

```bash
# Health check
curl http://localhost:8000/health

# Stats
curl http://localhost:8000/stats

# Predict (with file URL)
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "imageURL": "file:///path/to/image.jpg",
    "description": "Test description",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

### Test Through Application

1. Go to http://localhost:5173
2. Register/Login
3. Report an issue with image
4. Check browser Network tab for ML predictions
5. Verify issue shows predicted category

---

## 📈 Model Performance

Current model (trained on synthetic data):
- **Training samples:** 25
- **Categories:** 5
- **Features:** 199 (99 image + 100 text)
- **Model:** Random Forest Classifier
- **Expected accuracy:** ~60-70% on synthetic data

**To improve accuracy:**
1. Collect real-world data
2. Increase training samples
3. Fine-tune feature extraction
4. Consider deep learning (CNN + LSTM)

---

## 🚧 Limitations & Future Improvements

### Current Limitations
- Small training dataset (synthetic)
- Simple feature extraction (color histograms)
- Rule-based priority assignment
- Limited authenticity checks

### Suggested Improvements
1. **Collect Real Data**
   - Gather actual civic issue images
   - Label by category
   - Retrain model

2. **Deep Learning**
   - Use pre-trained CNN (ResNet, MobileNet)
   - BERT for text classification
   - Multi-modal fusion

3. **Advanced Features**
   - Object detection (detect potholes, garbage)
   - OCR for text in images
   - Time-series analysis for issue trends

4. **Scalability**
   - GPU acceleration
   - Model caching
   - Batch processing

5. **Monitoring**
   - Track prediction accuracy
   - Log confidence scores
   - A/B testing for models

---

## 🐛 Troubleshooting

### ML Service Won't Start
**Problem:** Import errors, missing dependencies
**Solution:**
```bash
cd ml-service
source venv/bin/activate
pip install -r requirements.txt
```

### Backend Can't Connect to ML
**Problem:** `ML API error: connect ECONNREFUSED`
**Solution:**
- Check ML service is running: `curl http://localhost:8000/health`
- Verify `ML_API_URL=http://localhost:8000/predict` in `backend/.env`

### Category Shows "other"
**Problem:** ML predictions not working
**Solution:**
- Check backend logs for ML API errors
- Test ML endpoint directly with curl
- Verify model is trained: `ls ml-service/models/`

### Low Prediction Confidence
**Problem:** All predictions < 0.70
**Solution:**
- Retrain with more data: `python train.py`
- Adjust confidence threshold in `app/main.py`

---

## 📚 Documentation

- **ML Service:** `ml-service/README.md`
- **Integration Guide:** `ML_INTEGRATION_GUIDE.md`
- **Backend API:** Check existing backend docs
- **Frontend:** Check existing frontend docs

---

## ✅ Checklist

- [x] ML service created with FastAPI
- [x] Category prediction implemented
- [x] Duplicate detection implemented
- [x] Priority assignment implemented
- [x] Image authenticity check implemented
- [x] Dataset generator created
- [x] Training script created
- [x] Backend integration completed
- [x] Documentation written
- [x] Quick start scripts created
- [ ] Test with real data
- [ ] Deploy to production
- [ ] Monitor performance

---

## 🎓 Technologies Used

### ML Service
- **FastAPI** - Web framework
- **scikit-learn** - ML models, TF-IDF
- **OpenCV** - Image processing
- **Pillow** - Image handling
- **imagehash** - Perceptual hashing
- **piexif** - EXIF metadata
- **geopy** - Distance calculations
- **NumPy/Pandas** - Data processing

### Integration
- **axios** - HTTP client (backend)
- **Node.js** - Backend runtime
- **MongoDB** - Database
- **Cloudinary** - Image hosting

---

## 👨‍💻 Next Steps

1. **Run the system:**
   ```bash
   ./run-all.sh  # or open 3 terminals manually
   ```

2. **Test functionality:**
   - Report issues
   - Check predictions
   - Test duplicate detection

3. **Customize:**
   - Adjust thresholds
   - Add more categories
   - Improve models

4. **Deploy:**
   - Deploy ML service (Railway/Render)
   - Update backend ML_API_URL
   - Test production

---

## 📞 Support

For issues or questions:
1. Check `ML_INTEGRATION_GUIDE.md`
2. Review logs in each service
3. Test services independently
4. Verify environment variables

**Service Status:**
- ✅ ML Service implemented
- ✅ Backend integrated
- ✅ Frontend ready
- ⬜ Production deployment

---

**Implementation completed successfully! 🎉**

All ML features are now integrated and ready for testing in VS Code.
