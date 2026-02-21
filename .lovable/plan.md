

# Multi-Mode Auth: OTP Signup + Password/OTP Login

## Overview

Redesign the auth page to support three modes:
- **New users**: Enter email, receive 6-digit OTP, verify it, then set a password to complete signup
- **Returning users**: Login with email + password
- **Forgot password**: Send OTP to email, verify it, reset password

## User Flows

### Flow 1: First-time Sign Up
1. User enters @iimb.ac.in email, clicks "Send OTP"
2. Receives 6-digit OTP via email
3. Enters OTP on the verification screen
4. After verification, prompted to set a password
5. Account created, navigated to home

### Flow 2: Returning User Login
1. User enters email + password
2. Clicks "Sign In"
3. Authenticated and navigated to home

### Flow 3: Forgot Password
1. User clicks "Forgot password?" on login screen
2. Enters email, receives 6-digit OTP
3. Enters OTP to verify identity
4. Sets new password
5. Authenticated and navigated to home

## Technical Details

### Auth Page Steps (state machine)

The page will have 5 steps managed by a `step` state:

```
"login"        -> Email + password form (default for returning users)
"signup-email"  -> Email input + "Send OTP" (for new users)
"verify-otp"   -> 6-digit OTP input
"set-password"  -> Password creation form (after OTP verification)
"forgot-otp"   -> Email input for forgot password OTP
```

### Supabase API Calls

**Send OTP (signup or forgot password):**
```typescript
await supabase.auth.signInWithOtp({
  email,
  options: { shouldCreateUser: true },
});
```

**Verify OTP:**
```typescript
await supabase.auth.verifyOtp({
  email,
  token: otpCode,
  type: 'email',
});
```

**Set password (after OTP verification, user is now signed in):**
```typescript
await supabase.auth.updateUser({ password });
```

**Login with password:**
```typescript
await supabase.auth.signInWithPassword({ email, password });
```

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Complete rewrite with multi-step flow: login, signup-email, verify-otp, set-password, forgot-otp |
| `src/components/AuthGuardDialog.tsx` | No changes needed (already simplified) |

### Auth.tsx Structure

The page starts on a "login" screen with:
- Email + password fields
- "Sign In" button
- "New here? Sign up with OTP" link (goes to signup-email)
- "Forgot password?" link (goes to forgot-otp)

**signup-email step**: Email input with @iimb.ac.in validation, "Send OTP" button. On success, moves to verify-otp with `mode: "signup"`.

**forgot-otp step**: Same email input, "Send OTP" button. On success, moves to verify-otp with `mode: "forgot"`.

**verify-otp step**: 6-digit `InputOTP` component. On successful `verifyOtp`, moves to set-password.

**set-password step**: Password + confirm password fields. Calls `supabase.auth.updateUser({ password })`. On success, navigates to `/`.

### OTP is single-use by default
Supabase OTPs are automatically invalidated after use -- no extra work needed. Each code can only be verified once.

### Email validation
Keeps the existing `@iimb.ac.in` restriction with temporary `@gmail.com` bypass.

