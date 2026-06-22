# Astra Auth System Specification (v3.0)

As a Senior Backend Engineer, I have rebuilt the authentication flow to be resilient, secure, and Express 5 compatible.

## 1) Root Cause Analysis (RCA)
- **Middleware Clash**: `express-mongo-sanitize` and `xss-clean` were attempting to overwrite read-only properties in Express 5, leading to `TypeError` crashes.
- **Payload Vulnerability**: Routes accepted unlimited body sizes.
- **Status Inconsistency**: Users could bypass verification checks in some scenarios.
- **Race Conditions**: Signup wasn't checking for existing users atomically before creation.

## 2) Fixed Auth Flow
- **Standard**: JWT via Authorization Bearer Header.
- **Persistent Session**: Refresh Token via HttpOnly, Secure, SameSite Cookie.
- **Rotation**: Refresh tokens are deleted and regenerated on every refresh to prevent family reuse.
- **Session Cleanup**: Automatic daily TTL cleanup and max-session limits (5 per user).

## 3) Signup Logic
- **Validation**: Checks for missing fields and email format.
- **Password**: Uses `zxcvbn` for entropy checking. Only score 3+ allowed.
- **Safety**: Atomic check for duplicates via Mongoose Unique Index + Controller logic.

## 4) Login Logic
- **Security**: Incremental lock (5 attempts = 30min lockout).
- **Session Tracking**: Links specific `deviceId` to tokens in the database.

## 5) API Implementation Guide

### POST /api/v1/auth/signup
```json
{
  "email": "user@gmail.com",
  "password": "StrongPassword!2026",
  "deviceId": "Chrome_Win11"
}
```

### POST /api/v1/auth/login
```json
{
  "email": "user@gmail.com",
  "password": "StrongPassword!2026",
  "deviceId": "Chrome_Win11"
}
```

### POST /api/v1/auth/social-login
```json
{
  "provider": "google",
  "email": "shokry@gmail.com",
  "deviceId": "Mobile_App"
}
```

## 6) Testing Checklist (Postman)
- [ ] **Signup Duplicate**: Attempt to signup with same email (Should return 400).
- [ ] **Brute Force**: Attempt login 6 times with wrong password (Should return 423 Locked).
- [ ] **Expired Access Token**: Wait for token expiry, attempt `/me` (Should return 401).
- [ ] **Refresh Family Reuse**: Attempt to use a refresh token twice (Should invalidate family).
- [ ] **Logout**: Call `/logout` and verify `refreshToken` cookie is cleared.

## 7) Production Hardening
1. Change `JWT_SECRET` in `.env` to a 64-character random string.
2. Set `NODE_ENV=production` in deployment.
3. Enable `trust proxy` in Express if behind Nginx/Cloudflare.
4. Replace `sendEmail` mock credentials with a real AWS SES or SendGrid key.
