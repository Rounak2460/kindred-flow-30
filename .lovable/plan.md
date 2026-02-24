

# Email Verification Without Lovable's Email Hook

## The Problem
Auto-confirm is enabled, so anyone can type `fake123@iimb.ac.in` and get instant access without proving they own the email. We need real email verification, but Lovable Cloud's email hook intercepts all Supabase Auth emails and sends redirect links that require Lovable login — making built-in OTP/magic-link unusable.

## Solution: Custom Email Verification via Edge Function

Build a standalone verification layer that bypasses Supabase's email system entirely:

1. **Create a `verification_codes` table** to store time-limited 6-digit codes
2. **Create a `send-verification-code` edge function** that generates a code and sends it via Resend (free tier: 100 emails/day, more than enough)
3. **Add an `email_verified` boolean to `profiles`** (default false)
4. **Gate all authenticated actions** behind `email_verified = true`

## Flow

```text
Signup:
  1. User enters email prefix + password + confirm password
  2. Supabase creates account (auto-confirm stays ON so user gets a session)
  3. App immediately shows "Verify your email" screen with OTP input
  4. Edge function sends a 6-digit code to their @iimb.ac.in email via Resend
  5. User enters code → edge function verifies → sets email_verified = true in profiles
  6. User proceeds to homepage

Login:
  1. User signs in with password
  2. If email_verified = false → redirect to verification screen
  3. If email_verified = true → proceed normally
```

## Technical Details

### Database Changes

**New table: `verification_codes`**
- `id` uuid PK
- `user_id` uuid NOT NULL
- `email` text NOT NULL
- `code` text NOT NULL (6-digit)
- `expires_at` timestamptz NOT NULL (now() + 10 minutes)
- `created_at` timestamptz DEFAULT now()
- RLS: service role only (edge function uses service role key)

**Alter `profiles` table:**
- Add `email_verified` boolean DEFAULT false

### New Edge Function: `send-verification-code`

- Generates a random 6-digit code
- Stores it in `verification_codes` (deleting any previous codes for that user)
- Sends email via Resend API (free, no credit card needed)
- Rate-limited: max 1 code per 60 seconds per user

### New Edge Function: `verify-code`

- Accepts `{ code }` from authenticated user
- Looks up code in `verification_codes` where `expires_at > now()`
- If valid: sets `email_verified = true` in profiles, deletes code
- If invalid/expired: returns error

### Frontend Changes

**`Auth.tsx`:**
- After signup success, navigate to `verify-email` step (not homepage)
- After login, check `profile.email_verified` — if false, show verification screen
- Add `verify-email` step with InputOTP component + "Verify" button + "Resend code" with cooldown

**`AuthContext.tsx`:**
- `profile` already includes all profile fields
- Add `email_verified` to the Profile interface and select query

**Gate actions:**
- Update `AuthGuardDialog` or add a new `VerificationGuard` that checks `profile.email_verified` before allowing posts, comments, votes, etc.

### Required Secret

**Resend API Key** — needed for the edge function to send emails. Resend offers a free tier (100 emails/day). The user will need to create a Resend account and provide the API key.

## File Summary

| File | Change |
|------|--------|
| **DB Migration** | Create `verification_codes` table; add `email_verified` to `profiles` |
| `supabase/functions/send-verification-code/index.ts` | New: generate code, store in DB, send via Resend |
| `supabase/functions/verify-code/index.ts` | New: validate code, set `email_verified = true` |
| `supabase/config.toml` | Add function entries |
| `src/pages/Auth.tsx` | Add `verify-email` step with OTP input after signup/login |
| `src/contexts/AuthContext.tsx` | Add `email_verified` to Profile type and query |
| `src/components/AuthGuardDialog.tsx` | Also check `email_verified` before allowing actions |

