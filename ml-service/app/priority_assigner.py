"""
Priority assignment based on category, location, and repetition
"""

class PriorityAssigner:
    def __init__(self):
        # Category severity scores
        self.category_severity = {
            "Sewer Overflow": 4,
            "Water Leakage": 3,
            "Road Damage / Pothole": 3,
            "Garbage Issue": 2,
            "Street Light Failure": 2
        }
        
        # Sensitive location keywords
        self.sensitive_keywords = [
            'hospital', 'school', 'clinic', 'medical', 'emergency',
            'college', 'university', 'kindergarten', 'church', 'temple',
            'mosque', 'playground', 'park', 'elderly', 'nursing home'
        ]
    
    def is_sensitive_location(self, description, latitude=None, longitude=None):
        """Check if location is sensitive based on description"""
        description_lower = description.lower()
        return any(keyword in description_lower for keyword in self.sensitive_keywords)
    
    def calculate_repeat_factor(self, location, existing_issues):
        """Calculate how many times issues reported from same location"""
        # This would check against existing_issues database
        # For now, return 0 (no repeats)
        return 0
    
    def assign_priority(self, category, description, latitude, longitude, is_duplicate=False):
        """
        Assign priority: Low, Medium, High, or Critical
        
        Factors:
        1. Category severity (1-4)
        2. Sensitive location (+1 level)
        3. Duplicate/repeated reports (+1 level)
        """
        # Get base severity from category
        base_severity = self.category_severity.get(category, 2)
        
        # Check if sensitive location
        is_sensitive = self.is_sensitive_location(description, latitude, longitude)
        
        # Calculate final priority score
        priority_score = base_severity
        
        if is_sensitive:
            priority_score += 1
        
        if is_duplicate:
            priority_score += 1
        
        # Map score to priority level
        if priority_score >= 5:
            return "Critical"
        elif priority_score >= 4:
            return "High"
        elif priority_score >= 3:
            return "Medium"
        else:
            return "Low"
    
    def get_priority_explanation(self, category, is_sensitive, is_duplicate):
        """Get explanation for priority assignment"""
        reasons = []
        
        severity = self.category_severity.get(category, 2)
        if severity >= 4:
            reasons.append(f"{category} is high severity")
        elif severity >= 3:
            reasons.append(f"{category} is moderate severity")
        
        if is_sensitive:
            reasons.append("Located near sensitive area (hospital/school)")
        
        if is_duplicate:
            reasons.append("Duplicate report increases urgency")
        
        return ", ".join(reasons) if reasons else "Standard priority"
