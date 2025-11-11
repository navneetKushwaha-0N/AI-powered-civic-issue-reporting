#!/usr/bin/env python3
"""
Training script for ML models
"""
import sys
import os
import json

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from utils.generate_dataset import generate_dataset
from app.category_predictor import CategoryPredictor

def main():
    print("=" * 60)
    print("CIVIC ISSUE ML MODEL TRAINING")
    print("=" * 60)
    
    # Step 1: Generate dummy dataset
    print("\n📊 Step 1: Generating dummy dataset...")
    dataset = generate_dataset(num_samples=25, output_dir='data')
    
    # Step 2: Train category prediction model
    print("\n🤖 Step 2: Training category prediction model...")
    predictor = CategoryPredictor()
    predictor.train(dataset)
    
    # Step 3: Save model
    print("\n💾 Step 3: Saving trained model...")
    predictor.save('models')
    
    # Step 4: Test prediction
    print("\n🧪 Step 4: Testing model...")
    test_sample = dataset[0]
    img_path = test_sample['imageURL'].replace('file://', '')
    category, confidence = predictor.predict(img_path, test_sample['description'])
    
    print(f"\nTest Prediction:")
    print(f"  - True Category: {test_sample['category']}")
    print(f"  - Predicted: {category}")
    print(f"  - Confidence: {confidence:.2f}")
    
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETE!")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("  1. Review generated images in data/images/")
    print("  2. Start ML service: cd app && python main.py")
    print("  3. Test API: curl http://localhost:8000/health")
    print("\n")

if __name__ == "__main__":
    main()
