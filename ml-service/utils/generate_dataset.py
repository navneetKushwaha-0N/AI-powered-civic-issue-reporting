"""
Generate dummy dataset for ML model training
"""
import os
import json
import random
from datetime import datetime, timedelta
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import piexif

# Categories
CATEGORIES = [
    "Garbage Issue",
    "Road Damage / Pothole",
    "Street Light Failure",
    "Water Leakage",
    "Sewer Overflow"
]

# Sample descriptions for each category
DESCRIPTIONS = {
    "Garbage Issue": [
        "Large pile of garbage on the roadside",
        "Overflowing trash bins near the park",
        "Illegal dumping site with household waste",
        "Scattered litter around the bus stop"
    ],
    "Road Damage / Pothole": [
        "Deep pothole causing traffic issues",
        "Cracked road surface near intersection",
        "Large crater in the middle of the road",
        "Damaged asphalt with exposed base"
    ],
    "Street Light Failure": [
        "Street light not working at night",
        "Multiple broken lights on Main Street",
        "Flickering street lamp causing disturbance",
        "Dark area due to non-functional lights"
    ],
    "Water Leakage": [
        "Continuous water leak from underground pipe",
        "Burst water main flooding the street",
        "Leaking fire hydrant wasting water",
        "Water pooling due to pipe damage"
    ],
    "Sewer Overflow": [
        "Manhole overflowing with sewage",
        "Foul smell from blocked drainage",
        "Sewage backup in residential area",
        "Open sewer line contaminating area"
    ]
}

# Sample locations (latitude, longitude) - major cities
LOCATIONS = [
    (40.7128, -74.0060),   # New York
    (34.0522, -118.2437),  # Los Angeles
    (41.8781, -87.6298),   # Chicago
    (29.7604, -95.3698),   # Houston
    (33.4484, -112.0740),  # Phoenix
    (39.9526, -75.1652),   # Philadelphia
    (29.4241, -98.4936),   # San Antonio
    (26.715791, 83.421169),   # Gorakhpur
]

def generate_synthetic_image(category, index, output_dir):
    """Generate a simple synthetic image with category label"""
    # Create image with category-specific color
    colors = {
        "Garbage Issue": (139, 69, 19),
        "Road Damage / Pothole": (105, 105, 105),
        "Street Light Failure": (25, 25, 112),
        "Water Leakage": (30, 144, 255),
        "Sewer Overflow": (85, 107, 47)
    }
    
    img = Image.new('RGB', (640, 480), color=colors.get(category, (128, 128, 128)))
    draw = ImageDraw.Draw(img)
    
    # Add some random shapes to simulate variety
    for _ in range(random.randint(5, 15)):
        x1, y1 = random.randint(0, 600), random.randint(0, 440)
        x2, y2 = x1 + random.randint(20, 100), y1 + random.randint(20, 100)
        shape_color = tuple(random.randint(0, 255) for _ in range(3))
        draw.rectangle([x1, y1, x2, y2], fill=shape_color)
    
    # Add text label
    text = f"{category}\nSample #{index}"
    draw.text((20, 20), text, fill=(255, 255, 255))
    
    # Save with EXIF data
    filename = f"{category.replace(' ', '_').replace('/', '-').lower()}_{index}.jpg"
    filepath = os.path.join(output_dir, filename)
    
    # Add EXIF GPS data
    lat, lng = random.choice(LOCATIONS)
    lat += random.uniform(-0.1, 0.1)
    lng += random.uniform(-0.1, 0.1)
    
    exif_dict = {
        "GPS": {
            piexif.GPSIFD.GPSLatitude: _convert_to_degrees(lat),
            piexif.GPSIFD.GPSLatitudeRef: b'N' if lat >= 0 else b'S',
            piexif.GPSIFD.GPSLongitude: _convert_to_degrees(lng),
            piexif.GPSIFD.GPSLongitudeRef: b'E' if lng >= 0 else b'W',
        }
    }
    
    exif_bytes = piexif.dump(exif_dict)
    img.save(filepath, "jpeg", exif=exif_bytes, quality=85)
    
    return filename, lat, lng

def _convert_to_degrees(value):
    """Convert decimal degrees to degrees, minutes, seconds format"""
    abs_value = abs(value)
    degrees = int(abs_value)
    minutes = int((abs_value - degrees) * 60)
    seconds = int((abs_value - degrees - minutes/60) * 3600 * 100)
    return ((degrees, 1), (minutes, 1), (seconds, 100))

def generate_dataset(num_samples=25, output_dir='data'):
    """Generate complete dummy dataset"""
    # Create output directory
    images_dir = os.path.join(output_dir, 'images')
    os.makedirs(images_dir, exist_ok=True)
    
    dataset = []
    
    print(f"Generating {num_samples} samples...")
    
    for i in range(num_samples):
        # Select random category
        category = random.choice(CATEGORIES)
        
        # Generate image
        filename, lat, lng = generate_synthetic_image(category, i, images_dir)
        
        # Select random description
        description = random.choice(DESCRIPTIONS[category])
        
        # Add some variation to description
        variations = ["", " Please fix urgently", " Reported by citizen", " Needs immediate attention"]
        description += random.choice(variations)
        
        # Create record
        record = {
            "id": i + 1,
            "imageURL": f"file://{os.path.abspath(os.path.join(images_dir, filename))}",
            "description": description,
            "latitude": lat,
            "longitude": lng,
            "category": category,
            "timestamp": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat()
        }
        
        dataset.append(record)
        print(f"  [{i+1}/{num_samples}] Generated: {category}")
    
    # Save dataset to JSON
    dataset_file = os.path.join(output_dir, 'training_data.json')
    with open(dataset_file, 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"\n✅ Dataset generated successfully!")
    print(f"   - Images: {images_dir}")
    print(f"   - Metadata: {dataset_file}")
    print(f"   - Total samples: {len(dataset)}")
    
    # Print category distribution
    print("\nCategory Distribution:")
    for cat in CATEGORIES:
        count = sum(1 for r in dataset if r['category'] == cat)
        print(f"   - {cat}: {count}")
    
    return dataset

if __name__ == "__main__":
    generate_dataset(num_samples=25, output_dir='data')
