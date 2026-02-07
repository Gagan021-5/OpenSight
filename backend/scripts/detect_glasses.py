import sys
import cv2
import numpy as np
import base64
import json
import mediapipe as mp

def process_image():
    try:
        # 1. READ FROM STDIN (Solves the "Argument too long" error)
        # We read the entire input stream
        input_data = sys.stdin.read().strip()
        
        if not input_data:
            print(json.dumps({"wearingGlasses": False, "error": "No input data"}))
            return

        # Clean base64 header if present
        if "," in input_data:
            input_data = input_data.split(",")[1]

        # Decode Image
        img_bytes = base64.b64decode(input_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            print(json.dumps({"wearingGlasses": False, "error": "Image decode failed"}))
            return

        # 2. MEDIAPIPE SETUP (Better than Haar Cascades)
        mp_face_mesh = mp.solutions.face_mesh
        face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )

        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_img)

        if not results.multi_face_landmarks:
            print(json.dumps({"wearingGlasses": False, "reason": "No face detected"}))
            return

        # 3. GET EYE COORDINATES
        landmarks = results.multi_face_landmarks[0].landmark
        h, w, _ = img.shape

        def get_avg_color(indices):
            # Extract pixels for the eye region
            points = [(int(landmarks[i].x * w), int(landmarks[i].y * h)) for i in indices]
            x_coords = [p[0] for p in points]
            y_coords = [p[1] for p in points]
            
            min_x, max_x = max(0, min(x_coords)), min(w, max(x_coords))
            min_y, max_y = max(0, min(y_coords)), min(h, max(y_coords))
            
            roi = img[min_y:max_y, min_x:max_x]
            if roi.size == 0: return (0, 0, 0)
            
            return np.mean(roi, axis=(0, 1)) # Returns B, G, R

        # MediaPipe Indices for Left/Right Eyes
        LEFT_EYE = [362, 385, 387, 263, 373, 380]
        RIGHT_EYE = [33, 160, 158, 133, 153, 144]

        # Get Colors (OpenCV is BGR)
        l_b, l_g, l_r = get_avg_color(LEFT_EYE)
        r_b, r_g, r_r = get_avg_color(RIGHT_EYE)

        # 4. CHECK LOGIC (Red/Blue Difference)
        # We use a difference threshold (e.g., Red must be 20 units higher than Blue)
        THRESHOLD = 15

        # Check Standard: Left=Red, Right=Blue
        std_left_red = l_r > (l_b + THRESHOLD)
        std_right_blue = r_b > (r_r + THRESHOLD)
        
        # Check Flipped: Left=Blue, Right=Red (Just in case camera is mirrored)
        flip_left_blue = l_b > (l_r + THRESHOLD)
        flip_right_red = r_r > (r_b + THRESHOLD)

        is_wearing = (std_left_red and std_right_blue) or (flip_left_blue and flip_right_red)

        print(json.dumps({
            "wearingGlasses": bool(is_wearing),
            "debug": {
                "L_Red": int(l_r), "L_Blue": int(l_b),
                "R_Red": int(r_r), "R_Blue": int(r_b)
            }
        }))

    except Exception as e:
        print(json.dumps({"wearingGlasses": False, "error": str(e)}))

if __name__ == "__main__":
    process_image()