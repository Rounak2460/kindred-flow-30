

# Fix: Magic Link Login Independent of Lovable Login

## Root Cause

The auth flow has a critical mismatch:

1. **Email template** sends a **6-digit OTP code** (`{{ .Token }}`) and says "Enter this code in the app"
2. **Auth UI** says "Click the link in the email to continue" — there is **no OTP input field**
3. The magic link (`{{ .ConfirmationURL }}`) is not in the template, so users only get a code they can't use
4. If a magic link _were_ used, it would redirect through the preview URL which requires Lovable authentication — blocking non-Lovable users entirely

## Fix: Add OTP Code Verification (No Redirect Needed)

Since the email templates already send a 6-digit code, the fix is to add an OTP input field so users can enter the code directly in the app. This eliminates any redirect dependency.

### Changes

**`src/pages/Auth.tsx`** — Replace the "check your inbox" waiting screen with a 6-digit OTP input:

1. In the `verify-otp` step, replace the "Click the link" message with a 6-digit `InputOTP` component (already installed in the project)
2. Add a `verifyOtp` function that calls `supabase.auth.verifyOtp({ email, token, type: 'email' })` for signup, and `type: 'recovery'` for forgot-password
3. On successful verification:
   - For **signup** (`otpMode === "signup"`): move to `set-password` step so user can set their password
   - For **forgot password** (`otpMode === "forgot"`): move to `set-password` step so user can reset
4. Update copy from "Click the link" to "Enter the 6-digit code sent to your email"

**No other files need changes.** The `AuthContext`, email templates, and database are all correct already.

### Technical Details

```
verify-otp step (current):
  "Click the link in the email to continue"
  [no input field]

verify-otp step (fixed):
  "Enter the 6-digit code sent to {email}"
  [  _  _  _  _  _  _  ]   ← InputOTP component
  [Verify Code] button
  Resend link / Back
```

The verification call:
```ts
const { error } = await supabase.auth.verifyOtp({
  email,
  token: otpCode,  // 6-digit code from InputOTP
  type: otpMode === "signup" ? "email" : "recovery",
});
```

On success, `onAuthStateChange` fires automatically, setting the session. Then:
- Signup flow → navigate to `set-password` step
- Forgot flow → navigate to `set-password` step
- Both call `supabase.auth.updateUser({ password })` to finalize

### File Summary

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Add OTP code input field, `verifyOtp()` function, update copy |

No database changes. No template changes. No new files.

