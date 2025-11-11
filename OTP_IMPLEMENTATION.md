# OTP Verification Implementation

## Overview
Complete OTP (One-Time Password) verification system for phone number authentication during user registration.

## Features Implemented

### 1. Landing Page (`/`)
- Hero section with "Fix Your City, Together" messaging
- Stats display (2.3K issues resolved, 94% resolution rate, 5.2d avg response)
- 6 feature cards (Smart Detection, Fast Processing, Community Powered, etc.)
- CTA sections with links to registration and dashboard
- Professional footer with links
- Responsive design with Tailwind CSS

### 2. OTP Backend (Backend)

#### New Endpoints:
- **POST `/api/auth/send-otp`** - Send 6-digit OTP to phone number
  - Validates 10-digit phone number
  - Stores OTP with 5-minute expiry
  - Returns OTP in development mode (console.log in production)

- **POST `/api/auth/verify-otp`** - Verify OTP and return token
  - Validates OTP against stored value
  - Checks expiry
  - Returns JWT verification token (15-minute validity)

#### Updated Endpoint:
- **POST `/api/auth/register`** - Now requires `otpVerifiedToken`
  - Validates phone verification token before registration
  - Ensures phone number was verified via OTP

### 3. OTP Modal Component (`OTPModal.jsx`)
- 6-digit OTP input with auto-focus
- Paste support for OTP codes
- Resend OTP with 30-second cooldown
- Error handling and validation
- Clean, centered modal design
- Loading states

### 4. Updated Register Page

#### Phone Verification Flow:
1. User enters 10-digit phone number
2. "Verify" button appears automatically when phone is valid
3. Clicking "Verify" sends OTP and opens modal
4. User enters 6-digit OTP
5. On successful verification:
   - Green checkmark appears next to phone field
   - Phone field becomes disabled (locked)
   - All other fields (Name, Email, Password) become enabled
6. Register button only works after phone verification

#### State Management:
- `isPhoneVerified` - Tracks verification status
- `otpVerifiedToken` - Stores JWT token from backend
- `showOTPModal` - Controls modal visibility
- Phone field resets verification if number changes

### 5. Updated Components

#### Input Component
- Added disabled state support
- Shows gray background and cursor-not-allowed when disabled
- Reduced opacity for visual feedback

#### API Service
- `sendOTP(phone)` - Send OTP to phone number
- `verifyOTP(phone, otp)` - Verify OTP code

## Usage Instructions

### For Development:

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test OTP Flow:**
   - Navigate to `http://localhost:5173/register`
   - Enter a 10-digit phone number (e.g., `1234567890`)
   - Click "Verify" button
   - Check backend console for OTP code
   - Enter OTP in modal
   - Complete registration

### OTP in Development Mode:
The OTP is printed to the backend console and also returned in the API response (only in development). Check the browser console or terminal for:
```
OTP for 1234567890: 123456
```

### Rate Limiting:
- Auth routes: 100 requests per 15 minutes (development)
- Production: 5 requests per 15 minutes
- Configure in `backend/server.js`

## Security Notes

### Current Implementation (Development):
- OTPs stored in memory (Map)
- OTPs expire after 5 minutes
- Verification tokens expire after 15 minutes

### Production Recommendations:
1. **Use Redis** for OTP storage instead of in-memory Map
2. **Integrate SMS service** (Twilio, AWS SNS, etc.) to send actual SMS
3. **Remove OTP from API response** - only send via SMS
4. **Add rate limiting** per phone number
5. **Add phone number verification** against database (check if already registered)
6. **Implement CAPTCHA** to prevent automated abuse

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── OTPModal.jsx          # OTP verification modal
│   │   └── Input.jsx             # Updated with disabled state
│   ├── pages/
│   │   ├── LandingPage.jsx       # Hero landing page
│   │   └── Register.jsx          # Updated with OTP flow
│   ├── services/
│   │   └── api.js                # Added sendOTP, verifyOTP
│   └── App.jsx                   # Updated routes

backend/
├── controllers/
│   └── authController.js         # Added sendOTP, verifyOTP, updated register
└── routes/
    └── authRoutes.js             # Added OTP routes
```

## Testing Scenarios

1. **Happy Path:**
   - Enter valid phone → Verify → Enter correct OTP → Complete registration ✓

2. **Invalid OTP:**
   - Enter valid phone → Verify → Enter wrong OTP → Shows error ✗

3. **Expired OTP:**
   - Wait 5 minutes after sending OTP → Enter OTP → Shows expiry error ✗

4. **Resend OTP:**
   - Request OTP → Click "Resend" → New OTP sent (30s cooldown) ✓

5. **Phone Change After Verification:**
   - Verify phone → Change phone number → Verification resets → Must verify again ✓

6. **Disabled Fields:**
   - Before verification: Name, Email, Password fields disabled
   - After verification: All fields enabled ✓

## UI/UX Features

- **Auto-focus** on first OTP digit
- **Auto-advance** to next digit on input
- **Backspace** moves to previous digit
- **Paste support** for OTP codes
- **Green checkmark** indicates verified phone
- **Disabled visual state** for locked fields
- **Loading states** during API calls
- **Error messages** with clear instructions
- **Resend cooldown** prevents spam

## Next Steps (Optional Enhancements)

1. Add phone number formatting (e.g., (123) 456-7890)
2. Implement SMS service integration (Twilio)
3. Add Redis for OTP storage
4. Add phone number validation against existing users
5. Implement "Remember this device" feature
6. Add 2FA for login (optional)
7. Track failed OTP attempts
8. Add phone number verification for password reset
