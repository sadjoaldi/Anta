# OTP System Setup Guide

## 📋 Overview

The OTP (One-Time Password) system has been implemented for phone verification during registration and login.

---

## 🔧 Backend Changes

### **1. Database Migration**

Run the migration to add OTP support:

```bash
cd packages/backend/anta-server
npm run migrate:latest
```

This will:
- Add `phone_verified` and `phone_verified_at` columns to `users` table
- Create `otp_codes` table for temporary OTP storage

### **2. Environment Variables**

Add to your `.env` file:

```bash
# OTP Configuration
DEV_BYPASS_OTP=true  # Set to 'false' in production
```

**Important:**
- `DEV_BYPASS_OTP=true` → Bypass OTP verification (for development)
  - Any 4-digit code `1234` will be accepted
  - No SMS sent
  - Perfect for testing outside Guinea
  
- `DEV_BYPASS_OTP=false` → Real OTP (for production)
  - Generate random 4-digit codes
  - Send SMS via provider
  - Requires SMS integration

---

## 📱 API Endpoints

### **Send OTP**

```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone": "+224622000000",
  "purpose": "registration"  // or "login", "reset_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expiresIn": 300
  }
}
```

### **Verify OTP**

```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "+224622000000",
  "code": "1234",
  "purpose": "registration"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP verified successfully",
    "verified": true
  }
}
```

---

## 🎯 Development Mode (Bypass OTP)

When `DEV_BYPASS_OTP=true`:

1. **Send OTP**
   - Always returns success
   - Logs: `🔧 DEV MODE: OTP bypass enabled. Code: 1234 for +224622000000`
   - No actual SMS sent

2. **Verify OTP**
   - Accept any code `1234`
   - Instantly marks as verified

**Perfect for:**
- Testing outside Guinea
- Local development
- CI/CD pipelines

---

## 🚀 Production Mode (Real SMS)

When `DEV_BYPASS_OTP=false`:

1. **Configure SMS Provider**

Edit `src/services/otp.service.ts` line ~43:

```typescript
async function sendSMS(phone: string, code: string): Promise<void> {
  // Integrate your SMS provider here
  // Example: Twilio, AfricasTalking, etc.
  
  const twilioClient = twilio(accountSid, authToken);
  await twilioClient.messages.create({
    body: `Votre code ANTA: ${code}`,
    from: '+1234567890',
    to: phone
  });
}
```

2. **Add SMS credentials to `.env`**

```bash
# SMS Provider (Example: Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🔒 Security Features

- **Expiry**: OTP codes expire after 5 minutes
- **Max Attempts**: 3 attempts per code
- **Rate Limiting**: 1 OTP per phone per 5 minutes
- **One-time use**: Code marked as verified after use
- **Auto cleanup**: Expired codes removed automatically

---

## 🧪 Testing

### **1. Development (with bypass)**

```bash
# Set in .env
DEV_BYPASS_OTP=true

# Any 4-digit code works
curl -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+224622000000",
    "code": "1234",
    "purpose": "registration"
  }'
```

### **2. Production (real SMS)**

```bash
# Set in .env
DEV_BYPASS_OTP=false

# Must use actual SMS code received
```

---

## 📝 Mobile App Integration

Update your mobile auth service:

```typescript
// src/services/auth.service.ts

async sendOTP(phone: string): Promise<void> {
  await apiClient.post('/auth/send-otp', {
    phone,
    purpose: 'registration'
  });
}

async verifyOTP(phone: string, code: string): Promise<void> {
  const response = await apiClient.post('/auth/verify-otp', {
    phone,
    code,
    purpose: 'registration'
  });
  return response.data;
}
```

The frontend OTP screens already have placeholders for these calls:
- `app/auth/verify-otp.tsx` (line 46, 71, 107)
- `src/screens/RegisterScreen.tsx` (line 46)

---

## 🎉 Ready to Use!

1. ✅ Run migration: `npm run migrate:latest`
2. ✅ Add `DEV_BYPASS_OTP=true` to `.env`
3. ✅ Restart backend server
4. ✅ Test with mobile app using code `1234`

For production, set `DEV_BYPASS_OTP=false` and configure SMS provider.
