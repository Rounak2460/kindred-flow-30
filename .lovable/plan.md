

# Plan: Test Email Verification Flow

## Problem
You want to test whether the verification email actually arrives at your `anmol.gupta24@iimb.ac.in` inbox now that the domain `iimbdigimitra.org` is verified on Resend.

## Approach
Instead of deleting your entire account (which requires modifying reserved auth tables), I will:

1. **Reset your verification status** - Set `email_verified = false` on your profile via a database migration
2. **Clear any existing verification codes** for your user
3. **After reset**: When you log in, the app will detect you're unverified and show the OTP screen, triggering a real email to `anmol.gupta24@iimb.ac.in`

This tests the exact same email sending path without needing to re-create your account.

## Changes

### Database Migration (one-time)
```sql
-- Reset verification for testing
UPDATE profiles SET email_verified = false WHERE user_id = 'a4500ac3-6dad-49eb-a4e8-6a73044dab9a';
DELETE FROM verification_codes WHERE user_id = 'a4500ac3-6dad-49eb-a4e8-6a73044dab9a';
```

### No code changes needed
The existing `Auth.tsx` already handles the flow: on login, if `email_verified` is false, it shows the verify screen and calls `send-verification-code`, which now sends from `noreply@iimbdigimitra.org`.

## Testing Steps (for you)
1. After I apply the migration, refresh the page or log out and back in
2. You should land on the "Verify Your Email" screen
3. Check your `anmol.gupta24@iimb.ac.in` inbox for the 6-digit code
4. Reply here whether the email arrived or not
5. If it arrived, enter the code to complete verification

