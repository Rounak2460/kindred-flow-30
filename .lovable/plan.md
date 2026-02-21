# Email OTP Authentication with @iimb.ac.in Restriction

## Overview

Replace the current password-based authentication with an email OTP flow. Users enter their @iimb.ac.in email, receive a 6-digit OTP code, and enter it to sign in. No passwords needed. A temporary test bypass will allow a specific test email domain for verification.  
  
Sample email id: [rounak.tikmani24@iimb.ac.in](mailto:rounak.tikmani24@iimb.ac.in)  
Ask me if i got otp while testing and keep updating until i get OTP  
Also allow for both OTP for first time authentication then allow user to login with set password or OTP both.

## Changes

### 1. Redesign Auth Page (`src/pages/Auth.tsx`)

- Remove the login/signup toggle -- OTP flow handles both (new users are auto-created)
- Remove password and name fields
- Two-step flow:
  - **Step 1**: Email input with @iimb.ac.in validation. User enters email and clicks "Send OTP". Calls `supabase.auth.signInWithOtp({ email })`.
  - **Step 2**: 6-digit OTP input using the existing `InputOTP` component. User enters OTP and clicks "Verify". Calls `supabase.auth.verifyOtp({ email, token, type: 'email' })`.
- Add a "Resend OTP" button with a 60-second cooldown timer
- Email validation: must end with `@iimb.ac.in` (plus a temporary test bypass for `@gmail.com` during development -- will be removed later)
- On successful verification, navigate to `/`

### 2. Update AuthGuardDialog (`src/components/AuthGuardDialog.tsx`)

- Remove the separate "Sign Up" and "Log In" buttons -- replace with a single "Sign In with IIMB Email" button since OTP handles both flows
- Keep the @iimb.ac.in messaging

### 3. Handle new users without a name (`src/contexts/AuthContext.tsx`)

- The `handle_new_user` database trigger already creates a profile with `COALESCE(raw_user_meta_data->>'name', '')` so new OTP users get a blank name
- No changes needed to the context, but the Profile page should prompt users to set their name if it's empty

### 4. Add a route for email verification callback (`src/App.tsx`)

- No new route needed -- Supabase OTP verification happens in-page, not via redirect links

### 5. Configure auth settings

- Disable auto-confirm so OTP is actually required (check current setting)
- The OTP flow uses Supabase's built-in email OTP which sends a 6-digit code

## Technical Details

**Step 1 - Send OTP:**

```typescript
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    shouldCreateUser: true,
  },
});
```

**Step 2 - Verify OTP:**

```typescript
const { data, error } = await supabase.auth.verifyOtp({
  email,
  token: otpCode,
  type: 'email',
});
```

**Email validation:**

```typescript
const isValidEmail = (email: string) => {
  return email.endsWith('@iimb.ac.in') || email.endsWith('@gmail.com'); // gmail is temp bypass
};
```

**OTP Input UI** uses the existing `InputOTP`, `InputOTPGroup`, `InputOTPSlot` components from `src/components/ui/input-otp.tsx`.

**Files to modify:**

- `src/pages/Auth.tsx` -- Complete rewrite for OTP flow
- `src/components/AuthGuardDialog.tsx` -- Simplify buttons
- Auth configuration -- Disable auto-confirm if needed

**Auth config change:** Will use the configure-auth tool to ensure email OTP is enabled and auto-confirm is disabled.