"""
Image authenticity verification using EXIF metadata and perceptual hashing
"""
import piexif
from PIL import Image
import imagehash
from datetime import datetime, timedelta

class AuthenticityChecker:
    def __init__(self):
        self.known_fake_hashes = set()  # Store hashes of known fake images
    
    def check_exif_metadata(self, image_path):
        """Check EXIF metadata for GPS and timestamp"""
        try:
            img = Image.open(image_path)
            exif_dict = piexif.load(img.info.get('exif', b''))
            
            has_gps = bool(exif_dict.get('GPS'))
            has_timestamp = bool(exif_dict.get('Exif', {}).get(piexif.ExifIFD.DateTimeOriginal))
            
            # If image has GPS and timestamp, more likely authentic
            if has_gps and has_timestamp:
                return True, "Has GPS and timestamp metadata"
            elif has_gps or has_timestamp:
                return True, "Has partial metadata"
            else:
                return False, "Missing GPS and timestamp metadata"
                
        except Exception as e:
            # No EXIF data or error reading
            return False, f"No EXIF data: {str(e)}"
    
    def check_perceptual_hash(self, image_path):
        """Check if image hash matches known fake/stock images"""
        try:
            img_hash = imagehash.average_hash(Image.open(image_path))
            
            # Check against known fake hashes
            if str(img_hash) in self.known_fake_hashes:
                return False, "Matches known stock/fake image"
            
            return True, "Unique image hash"
            
        except Exception as e:
            return True, f"Could not check hash: {str(e)}"
    
    def check_file_properties(self, image_path):
        """Check basic file properties"""
        try:
            img = Image.open(image_path)
            
            # Check resolution (very low res might be downloaded thumbnail)
            width, height = img.size
            if width < 400 or height < 400:
                return False, f"Low resolution ({width}x{height}), might be downloaded thumbnail"
            
            # Check file format
            if img.format not in ['JPEG', 'JPG', 'PNG']:
                return False, f"Unusual format: {img.format}"
            
            return True, "File properties acceptable"
            
        except Exception as e:
            return False, f"Error checking file: {str(e)}"
    
    def verify_authenticity(self, image_path):
        """
        Main authenticity verification
        Returns: (is_authentic, confidence, details)
        """
        checks = []
        scores = []
        
        # Check 1: EXIF metadata
        has_exif, exif_msg = self.check_exif_metadata(image_path)
        checks.append(exif_msg)
        scores.append(1.0 if has_exif else 0.0)
        
        # Check 2: Perceptual hash
        unique_hash, hash_msg = self.check_perceptual_hash(image_path)
        checks.append(hash_msg)
        scores.append(1.0 if unique_hash else 0.0)
        
        # Check 3: File properties
        good_props, props_msg = self.check_file_properties(image_path)
        checks.append(props_msg)
        scores.append(1.0 if good_props else 0.0)
        
        # Calculate overall confidence
        confidence = sum(scores) / len(scores)
        
        # Determine authenticity (pass if confidence > 0.5)
        is_authentic = confidence > 0.5
        
        return is_authentic, confidence, checks
    
    def add_known_fake_hash(self, image_path):
        """Add an image hash to known fakes database"""
        try:
            img_hash = imagehash.average_hash(Image.open(image_path))
            self.known_fake_hashes.add(str(img_hash))
        except:
            pass
