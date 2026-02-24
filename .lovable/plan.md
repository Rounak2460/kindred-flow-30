

# Plan: Auto-Verify via Resend Delivery Status

## Problem
Emails from Resend are marked "Delivered" but never appear in @iimb.ac.in inboxes. The current OTP flow is broken, and returning the code in the API response defeats the purpose of verification.

## User's Idea
If Resend accepts the email (200 OK) for a valid @iimb.ac.in address, that confirms the mailbox exists on IIMB's Microsoft 365 server. Since signup is already restricted to @iimb.ac.in, a successful send is sufficient proof that the address belongs to a real IIMB account. No OTP entry needed.

## Security Rationale
- Signup is already domain-locked to `@iimb.ac.in`
- Resend returning 200 means IIMB's mail server accepted the recipient (invalid addresses would bounce/reject)
- This confirms the email prefix maps to a real IIMB mailbox
- Risk: someone could sign up as another student's email. Mitigation: this is an internal trust-based platform; same risk exists with any password-based signup

## Flow (What the User Sees)

```text
[Sign Up] → [Animated Verification Screen]
  Step 1: "Sending verification email..."  (spinner)
  Step 2: "Verifying your IIMB account..." (spinner)
  Step 3: "Verified! Welcome to Digi Mitra" (checkmark)
  → Auto-redirect to home after 2 seconds
```

No OTP input. No code entry. Clean animated progress.

## Changes

### 1. Edge Function: `supabase/functions/send-verification-code/index.ts`
- Rename/repurpose to `verify-email-delivery`
- Send the email via Resend as before
- If Resend returns 200: immediately mark `profiles.email_verified = true` using service role client
- Return `{ verified: true }` to the frontend
- If Resend returns non-200: return `{ verified: false, error: "..." }`
- Remove the `verification_codes` table interaction (no longer needed)

### 2. Frontend: `src/pages/Auth.tsx`
- Replace the OTP input verify screen with an animated progress screen
- On signup: after account creation, call the new edge function
- Show 3 animated steps with delays for UX:
  - "Sending verification email..." (actual API call happens here)
  - "Verifying your IIMB account..." (brief pause)
  - "Verified! Welcome to Digi Mitra" (on success response)
- On success: navigate to home
- On failure: show error with retry option
- Remove all OTP-related state (`otpValue`, `resendCooldown`, etc.)

### 3. Login Flow Update
- On login, if `email_verified` is already `true` → go to home (no change)
- On login, if `email_verified` is `false` → show the same animated verification screen and call the edge function (re-verify)

### 4. Cleanup
- The `verification_codes` table and related code become unused
- Remove `verify-code` edge function calls from frontend
- Keep `verify-code` edge function file for now (can clean up later)

## Summary
- 1 edge function modified (send-verification-code → auto-verify on delivery)
- 1 frontend file updated (Auth.tsx: replace OTP screen with animated progress)
- No new tables or migrations needed
- Simpler, faster signup experience

