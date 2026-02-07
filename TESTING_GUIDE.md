# Testing Guide for Trust & Safety Features

## 1. Test Python Script
```bash
cd backend/scripts
python detect_glasses.py "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
```

## 2. Test Node.js Route
```bash
# Start backend
cd backend
npm run dev

# Test endpoint
curl -X POST http://localhost:5000/api/verify-glasses \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'
```

## 3. Test Frontend Integration
1. Install dependencies:
   ```bash
   cd frontend && npm install react-webcam@7.1.1
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Navigate to game page and verify:
   - Safety modal appears on first load
   - Calibration panel opens with settings button
   - Session timer counts down from 20:00
   - Glasses detection activates every 5 seconds
   - Game pauses when glasses not detected

## 4. Camera Permissions
- Ensure browser has camera permissions
- Test with and without red/blue glasses
- Verify detection confidence levels

## 5. Break Time Functionality
- Wait 20 minutes or modify timer for testing
- Verify break overlay appears
- Test 20-20-20 rule display
