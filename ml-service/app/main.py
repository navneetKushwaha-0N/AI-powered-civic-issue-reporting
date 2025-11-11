"""
ML Microservice API Server
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import json
import requests
from io import BytesIO
from PIL import Image
import tempfile

from category_predictor import CategoryPredictor
from duplicate_detector import DuplicateDetector
from priority_assigner import PriorityAssigner
from authenticity_checker import AuthenticityChecker

# Initialize FastAPI app
app = FastAPI(title="Civic Issue ML Service", version="1.0.0")

# Initialize ML components
category_predictor = CategoryPredictor()
duplicate_detector = DuplicateDetector(location_radius_meters=100, similarity_threshold=0.80)
priority_assigner = PriorityAssigner()
authenticity_checker = AuthenticityChecker()

# Load models on startup
@app.on_event("startup")
async def load_models():
    """Load trained models"""
    print("🚀 Starting ML Service...")
    
    # Try to load pre-trained models
    model_loaded = category_predictor.load('../models')
    
    if not model_loaded:
        print("⚠️  No pre-trained model found. Run train.py first!")
    
    # Load training data for duplicate detection
    try:
        with open('../data/training_data.json', 'r') as f:
            dataset = json.load(f)
            duplicate_detector.load_existing_issues(dataset)
    except:
        print("⚠️  No training data found for duplicate detection")
    
    print("✅ ML Service ready!")

# Request model
class PredictRequest(BaseModel):
    imageURL: str
    description: str
    latitude: float
    longitude: float

# Response model
class PredictResponse(BaseModel):
    category: str
    confidence: float
    isDuplicate: bool
    duplicateIssueId: Optional[int]
    priority: str
    authentic: bool

def download_image(url: str) -> str:
    """Download image from URL and save to temp file"""
    try:
        # Handle file:// URLs (for testing)
        if url.startswith('file://'):
            return url.replace('file://', '')
        
        # Download from HTTP/HTTPS
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Save to temp file
        img = Image.open(BytesIO(response.content))
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        img.save(temp_file.name, 'JPEG')
        temp_file.close()
        
        return temp_file.name
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not download image: {str(e)}")

@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    """
    Main prediction endpoint
    """
    try:
        # Download image
        image_path = download_image(request.imageURL)
        
        # 1. Category Prediction
        category, confidence = category_predictor.predict(image_path, request.description)
        
        # Check confidence threshold
        if confidence < 0.70:
            category = "Other"  # Fallback category
        
        # 2. Duplicate Detection
        is_duplicate, duplicate_id, similarity = duplicate_detector.check_duplicate(
            image_path, request.description, request.latitude, request.longitude
        )
        
        # 3. Priority Assignment
        priority = priority_assigner.assign_priority(
            category, request.description, request.latitude, request.longitude, is_duplicate
        )
        
        # 4. Authenticity Check
        is_authentic, auth_confidence, auth_details = authenticity_checker.verify_authenticity(image_path)
        
        # Clean up temp file if it was downloaded
        if not request.imageURL.startswith('file://'):
            try:
                os.unlink(image_path)
            except:
                pass
        
        # Return response
        return PredictResponse(
            category=category,
            confidence=round(confidence, 2),
            isDuplicate=is_duplicate,
            duplicateIssueId=duplicate_id,
            priority=priority,
            authentic=is_authentic
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": category_predictor.is_trained,
        "duplicate_detector_issues": len(duplicate_detector.existing_issues)
    }

@app.get("/stats")
async def get_stats():
    """Get service statistics"""
    return {
        "category_model": {
            "trained": category_predictor.is_trained,
            "categories": category_predictor.categories
        },
        "duplicate_detector": duplicate_detector.get_statistics(),
        "thresholds": {
            "category_confidence": 0.70,
            "duplicate_similarity": 0.80,
            "location_radius_meters": 100
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
