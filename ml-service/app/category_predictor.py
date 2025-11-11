"""
Category prediction using image + text features
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from PIL import Image
import cv2

class CategoryPredictor:
    def __init__(self):
        self.text_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.label_encoder = LabelEncoder()
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.categories = [
            "Garbage Issue",
            "Road Damage / Pothole",
            "Street Light Failure",
            "Water Leakage",
            "Sewer Overflow"
        ]
        self.is_trained = False
    
    def extract_image_features(self, image_path):
        """Extract simple color histogram features from image"""
        try:
            # Load image
            img = cv2.imread(image_path)
            if img is None:
                # If file path, try PIL
                img = np.array(Image.open(image_path))
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            
            # Resize to standard size
            img = cv2.resize(img, (128, 128))
            
            # Calculate color histograms for each channel
            hist_features = []
            for i in range(3):  # BGR channels
                hist = cv2.calcHist([img], [i], None, [32], [0, 256])
                hist = cv2.normalize(hist, hist).flatten()
                hist_features.extend(hist)
            
            # Calculate mean color
            mean_color = cv2.mean(img)[:3]
            hist_features.extend(mean_color)
            
            return np.array(hist_features)
        except Exception as e:
            print(f"Error extracting image features: {e}")
            # Return zero features if failed
            return np.zeros(99)
    
    def extract_text_features(self, text):
        """Extract TF-IDF features from text"""
        if not self.is_trained:
            return np.zeros(100)
        return self.text_vectorizer.transform([text]).toarray()[0]
    
    def combine_features(self, image_path, text):
        """Combine image and text features"""
        img_features = self.extract_image_features(image_path)
        text_features = self.extract_text_features(text)
        return np.concatenate([img_features, text_features])
    
    def train(self, dataset):
        """Train the model on dataset"""
        print("Training category prediction model...")
        
        # Extract features
        X = []
        y = []
        
        for record in dataset:
            # Get image path (handle file:// URLs)
            img_path = record['imageURL'].replace('file://', '')
            
            # Extract image features
            img_features = self.extract_image_features(img_path)
            
            # Temporarily store for text vectorizer fitting
            X.append({
                'img_features': img_features,
                'text': record['description']
            })
            y.append(record['category'])
        
        # Fit text vectorizer
        texts = [x['text'] for x in X]
        self.text_vectorizer.fit(texts)
        
        # Now combine features
        X_combined = []
        for x in X:
            text_features = self.text_vectorizer.transform([x['text']]).toarray()[0]
            combined = np.concatenate([x['img_features'], text_features])
            X_combined.append(combined)
        
        X_combined = np.array(X_combined)
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Train model
        self.model.fit(X_combined, y_encoded)
        self.is_trained = True
        
        print(f"✅ Model trained on {len(dataset)} samples")
        return self
    
    def predict(self, image_path, text):
        """Predict category and confidence"""
        if not self.is_trained:
            return "Garbage Issue", 0.5
        
        # Extract and combine features
        features = self.combine_features(image_path, text)
        features = features.reshape(1, -1)
        
        # Predict
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        
        # Get category and confidence
        category = self.label_encoder.inverse_transform([prediction])[0]
        confidence = float(probabilities[prediction])
        
        return category, confidence
    
    def save(self, model_dir='models'):
        """Save trained model"""
        os.makedirs(model_dir, exist_ok=True)
        joblib.dump(self.model, os.path.join(model_dir, 'category_model.pkl'))
        joblib.dump(self.text_vectorizer, os.path.join(model_dir, 'text_vectorizer.pkl'))
        joblib.dump(self.label_encoder, os.path.join(model_dir, 'label_encoder.pkl'))
        print(f"✅ Model saved to {model_dir}")
    
    def load(self, model_dir='models'):
        """Load trained model"""
        try:
            self.model = joblib.load(os.path.join(model_dir, 'category_model.pkl'))
            self.text_vectorizer = joblib.load(os.path.join(model_dir, 'text_vectorizer.pkl'))
            self.label_encoder = joblib.load(os.path.join(model_dir, 'label_encoder.pkl'))
            self.is_trained = True
            print(f"✅ Model loaded from {model_dir}")
            return True
        except Exception as e:
            print(f"⚠️  Could not load model: {e}")
            return False
