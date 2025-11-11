"""
Duplicate detection using location + image + text similarity
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import imagehash
from PIL import Image
from geopy.distance import geodesic

class DuplicateDetector:
    def __init__(self, location_radius_meters=100, similarity_threshold=0.80):
        self.location_radius = location_radius_meters
        self.similarity_threshold = similarity_threshold
        self.text_vectorizer = TfidfVectorizer(stop_words='english')
        self.existing_issues = []
    
    def add_existing_issue(self, issue_id, image_path, description, latitude, longitude):
        """Add an existing issue to the database"""
        # Calculate perceptual hash
        try:
            img_hash = imagehash.average_hash(Image.open(image_path))
        except:
            img_hash = None
        
        self.existing_issues.append({
            'id': issue_id,
            'image_path': image_path,
            'image_hash': img_hash,
            'description': description,
            'latitude': latitude,
            'longitude': longitude
        })
    
    def load_existing_issues(self, dataset):
        """Load existing issues from dataset"""
        print(f"Loading {len(dataset)} existing issues...")
        for record in dataset:
            img_path = record['imageURL'].replace('file://', '')
            self.add_existing_issue(
                issue_id=record.get('id', 0),
                image_path=img_path,
                description=record['description'],
                latitude=record['latitude'],
                longitude=record['longitude']
            )
        
        # Fit text vectorizer
        if len(self.existing_issues) > 0:
            descriptions = [issue['description'] for issue in self.existing_issues]
            self.text_vectorizer.fit(descriptions)
        
        print(f"✅ Loaded {len(self.existing_issues)} existing issues")
    
    def calculate_location_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two coordinates in meters"""
        return geodesic((lat1, lon1), (lat2, lon2)).meters
    
    def calculate_image_similarity(self, image_path1, image_path2):
        """Calculate perceptual hash similarity between images"""
        try:
            hash1 = imagehash.average_hash(Image.open(image_path1))
            hash2 = imagehash.average_hash(Image.open(image_path2))
            
            # Calculate similarity (0 = identical, higher = more different)
            difference = hash1 - hash2
            
            # Convert to similarity score (0-1, where 1 is identical)
            max_difference = 64  # Max possible difference for average hash
            similarity = 1 - (difference / max_difference)
            
            return similarity
        except Exception as e:
            print(f"Error calculating image similarity: {e}")
            return 0.0
    
    def calculate_text_similarity(self, text1, text2):
        """Calculate cosine similarity between texts"""
        try:
            if len(self.existing_issues) == 0:
                return 0.0
            
            vectors = self.text_vectorizer.transform([text1, text2])
            similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
            return float(similarity)
        except Exception as e:
            print(f"Error calculating text similarity: {e}")
            return 0.0
    
    def check_duplicate(self, image_path, description, latitude, longitude):
        """
        Check if the new issue is a duplicate
        Returns: (is_duplicate, duplicate_issue_id, similarity_score)
        """
        if len(self.existing_issues) == 0:
            return False, None, 0.0
        
        best_match = None
        best_similarity = 0.0
        
        for existing in self.existing_issues:
            # Step 1: Check location proximity
            distance = self.calculate_location_distance(
                latitude, longitude,
                existing['latitude'], existing['longitude']
            )
            
            # Skip if too far
            if distance > self.location_radius:
                continue
            
            # Step 2: Calculate image similarity
            img_similarity = self.calculate_image_similarity(image_path, existing['image_path'])
            
            # Step 3: Calculate text similarity
            text_similarity = self.calculate_text_similarity(description, existing['description'])
            
            # Combined similarity (weighted average)
            combined_similarity = (img_similarity * 0.6 + text_similarity * 0.4)
            
            # Update best match
            if combined_similarity > best_similarity:
                best_similarity = combined_similarity
                best_match = existing['id']
        
        # Determine if duplicate
        is_duplicate = best_similarity >= self.similarity_threshold
        
        return is_duplicate, best_match, float(best_similarity)
    
    def get_statistics(self):
        """Get detector statistics"""
        return {
            'total_issues': len(self.existing_issues),
            'location_radius': self.location_radius,
            'similarity_threshold': self.similarity_threshold
        }
