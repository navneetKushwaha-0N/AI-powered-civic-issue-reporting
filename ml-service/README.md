# ML Microservice for Civic Issue System

AI-powered category prediction, duplicate detection, priority assignment, and authenticity checking.

## Features

1. **Category Prediction** - Classifies issues into 5 categories using image + text features
2. **Duplicate Detection** - Finds similar reports within 100m using location + image + text similarity
3. **Priority Assignment** - Assigns Low/Medium/High/Critical based on severity and context
4. **Image Authenticity** - Verifies images using EXIF metadata and perceptual hashing

## Setup

### 1. Create Virtual Environment

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Generate Dataset & Train Models

```bash
python train.py
```

This will:
- Generate 25 synthetic images with metadata
- Train category prediction model
- Save models to `models/` directory
- Create `data/training_data.json` and `data/images/`

### 4. Start ML Service

```bash
cd app
python main.py
```

Or with uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Service runs on **http://localhost:8000**

## API Endpoints

### POST /predict

Main prediction endpoint.

**Request:**
```json
{
  "imageURL": "https://cloudinary.com/image.jpg",
  "description": "Large pothole on Main Street",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
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

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "duplicate_detector_issues": 25
}
```

### GET /stats

Service statistics.

**Response:**
```json
{
  "category_model": {
    "trained": true,
    "categories": [...]
  },
  "duplicate_detector": {
    "total_issues": 25,
    "location_radius": 100,
    "similarity_threshold": 0.8
  },
  "thresholds": {
    "category_confidence": 0.7,
    "duplicate_similarity": 0.8,
    "location_radius_meters": 100
  }
}
```

## Configuration

Key thresholds (hardcoded in code):
- Category confidence: 0.70
- Duplicate similarity: 0.80
- Location radius: 100 meters

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test prediction (with local file)
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "imageURL": "file:///path/to/test/image.jpg",
    "description": "Test issue description",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

## Categories

1. Garbage Issue
2. Road Damage / Pothole
3. Street Light Failure
4. Water Leakage
5. Sewer Overflow

## Priority Levels

- **Critical** - High severity + sensitive location + duplicate
- **High** - High severity or multiple factors
- **Medium** - Moderate severity
- **Low** - Standard issues

## Architecture

```
ml-service/
├── app/
│   ├── main.py                    # FastAPI server
│   ├── category_predictor.py     # Category classification
│   ├── duplicate_detector.py     # Duplicate detection
│   ├── priority_assigner.py      # Priority assignment
│   └── authenticity_checker.py   # Image verification
├── utils/
│   └── generate_dataset.py       # Dataset generator
├── data/
│   ├── images/                   # Generated images
│   └── training_data.json        # Training metadata
├── models/                        # Trained model files
├── requirements.txt
├── train.py                       # Training script
└── README.md
```

## Development

### Add More Training Data

Edit `utils/generate_dataset.py` and increase `num_samples`:

```python
generate_dataset(num_samples=50, output_dir='data')
```

### Retrain Models

```bash
python train.py
```

### View Logs

```bash
# Start with logging
uvicorn app.main:app --log-level debug
```

## Integration with Backend

The Node.js backend should call this service when creating new issues:

```javascript
const mlResponse = await axios.post('http://localhost:8000/predict', {
  imageURL: cloudinaryUrl,
  description: issueDescription,
  latitude: lat,
  longitude: lng
});

const { category, confidence, isDuplicate, duplicateIssueId, priority, authentic } = mlResponse.data;
```

## Troubleshooting

**ImportError: No module named 'cv2'**
```bash
pip install opencv-python
```

**Model not loading**
```bash
# Retrain models
python train.py
```

**Port 8000 already in use**
```bash
# Use different port
uvicorn app.main:app --port 8001
```

## License

MIT
