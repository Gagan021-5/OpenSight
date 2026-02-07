#!/usr/bin/env python3
"""
Red/Blue Glasses Detection Script
Detects if user is wearing red/blue glasses by analyzing color channel intensity over eyes.
"""

import sys
import json
import cv2
import numpy as np
import base64

def detect_glasses(base64_image):
    """
    Detect if user is wearing red/blue glasses by analyzing color channels.
    
    Args:
        base64_image: Base64 encoded image string
    
    Returns:
        dict: {"wearingGlasses": bool, "confidence": float, "details": str}
    """
    try:
        # Decode base64 image
        if base64_image.startswith('data:image'):
            # Remove data URL prefix
            header, encoded = base64_image.split(',', 1)
            image_data = base64.b64decode(encoded)
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            # Direct base64 string
            image_data = base64.b64decode(base64_image)
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"wearingGlasses": False, "confidence": 0.0, "details": "Failed to load image"}
        
        # Convert to RGB (OpenCV uses BGR)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Load face and eye cascade classifiers
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        # Detect faces
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return {"wearingGlasses": False, "confidence": 0.0, "details": "No face detected"}
        
        # Use the largest face found
        largest_face = max(faces, key=lambda f: f[2] * f[3])
        (x, y, w, h) = largest_face
        
        # Extract face region
        face_roi = img_rgb[y:y+h, x:x+w]
        face_gray = gray[y:y+h, x:x+w]
        
        # Detect eyes in face
        eyes = eye_cascade.detectMultiScale(face_gray)
        
        if len(eyes) < 2:
            return {"wearingGlasses": False, "confidence": 0.0, "details": "Less than 2 eyes detected"}
        
        # Sort eyes by x-coordinate (left eye first)
        eyes = sorted(eyes, key=lambda e: e[0])
        
        # Take the two largest eyes (in case of false detections)
        if len(eyes) > 2:
            eyes = sorted(eyes, key=lambda e: e[2] * e[3], reverse=True)[:2]
            eyes = sorted(eyes, key=lambda e: e[0])  # Re-sort by position
        
        # Extract eye regions
        left_eye = eyes[0]
        right_eye = eyes[1]
        
        left_eye_roi = face_roi[left_eye[1]:left_eye[1]+left_eye[3], left_eye[0]:left_eye[0]+left_eye[2]]
        right_eye_roi = face_roi[right_eye[1]:right_eye[1]+right_eye[3], right_eye[0]:right_eye[0]+right_eye[2]]
        
        # Calculate average color intensities for each eye
        def analyze_eye_color(eye_roi):
            if eye_roi.size == 0:
                return (0, 0, 0)
            
            # Calculate mean color values, avoiding outliers
            # Use median instead of mean to be more robust to lighting
            median_color = np.median(eye_roi.reshape(-1, 3), axis=0)
            return tuple(median_color.astype(int))
        
        left_color = analyze_eye_color(left_eye_roi)
        right_color = analyze_eye_color(right_eye_roi)
        
        # Extract RGB values
        left_r, left_g, left_b = left_color
        right_r, right_g, right_b = right_color
        
        # Calculate color dominance for each eye
        # Red dominance: how much more red than green and blue
        # Blue dominance: how much more blue than green and red
        
        left_red_dominance = left_r - (left_g + left_b) / 2
        left_blue_dominance = left_b - (left_g + left_r) / 2
        
        right_red_dominance = right_r - (right_g + right_b) / 2
        right_blue_dominance = right_b - (right_g + right_r) / 2
        
        # Detection logic:
        # Case 1: Left eye has red filter, right eye has blue filter
        case1_confidence = 0
        if left_red_dominance > 10 and right_blue_dominance > 10:
            case1_confidence = min(left_red_dominance, right_blue_dominance) / 50.0
        
        # Case 2: Left eye has blue filter, right eye has red filter
        case2_confidence = 0
        if left_blue_dominance > 10 and right_red_dominance > 10:
            case2_confidence = min(left_blue_dominance, right_red_dominance) / 50.0
        
        # Take the maximum confidence from both cases
        max_confidence = max(case1_confidence, case2_confidence)
        
        # Normalize confidence to 0-1 range
        confidence = min(max_confidence, 1.0)
        
        # Determine if wearing glasses (threshold can be adjusted)
        is_wearing_glasses = confidence > 0.3
        
        # Create detailed report
        details = f"Left eye RGB: {left_color}, Right eye RGB: {right_color}"
        details += f" | Left red dominance: {left_red_dominance:.1f}, Left blue dominance: {left_blue_dominance:.1f}"
        details += f" | Right red dominance: {right_red_dominance:.1f}, Right blue dominance: {right_blue_dominance:.1f}"
        
        return {
            "wearingGlasses": is_wearing_glasses,
            "confidence": confidence,
            "details": details,
            "leftEyeColor": left_color,
            "rightEyeColor": right_color
        }
        
    except Exception as e:
        return {
            "wearingGlasses": False, 
            "confidence": 0.0, 
            "details": f"Error: {str(e)}"
        }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "error": "Usage: python detect_glasses.py <base64_image>"
        }))
        sys.exit(1)
    
    base64_image = sys.argv[1]
    result = detect_glasses(base64_image)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
