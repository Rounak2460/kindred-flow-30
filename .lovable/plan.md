

# Fix: Send 6-Digit OTP Code Instead of Magic Link

## Problem

Supabase's `signInWithOtp()` shares the same implementation as Magic Links. By default, the email template contains a clickable link (`{{ .ConfirmationURL }}`). To receive a 6-digit code instead, we need to customize the email template to use `{{ .Token }}`.

## Solution

Update `supabase/config.toml` to override the email templates for **Magic Link** and **Recovery** (forgot password) flows, replacing the login link with the 6-digit OTP token.

## Changes

### 1. Update `supabase/config.toml`

Add email template overrides for these two template types:

- **`magic_link`** (used by `signInWithOtp` for signup): Replace the link with `{{ .Token }}` so users receive a 6-digit code.
- **`recovery`** (used by `signInWithOtp` for forgot password with existing users): Same change.

The templates will display the OTP code prominently and instruct the user to enter it in the app.

### 2. No code changes needed

`src/pages/Auth.tsx` already has the correct `InputOTP` component and `verifyOtp` logic. Once the email template sends the code instead of a link, everything will work as designed.

## Technical Details

The relevant `config.toml` additions:

```toml
[auth.email.template.magic_link]
subject = "Your Digital Mitra login code"
content_path = "./supabase/templates/magic_link.html"

[auth.email.template.recovery]
subject = "Your Digital Mitra password reset code"
content_path = "./supabase/templates/recovery.html"
```

The HTML templates will contain the `{{ .Token }}` variable which Supabase replaces with the 6-digit OTP code. Example template body:

```html
<h2>Your verification code</h2>
<p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">{{ .Token }}</p>
<p>Enter this code in Digital Mitra to continue. It expires in 10 minutes.</p>
```

### Files to create/modify

| File | Change |
|------|--------|
| `supabase/config.toml` | Add `[auth.email.template.magic_link]` and `[auth.email.template.recovery]` sections |
| `supabase/templates/magic_link.html` | New file -- OTP email template for signup |
| `supabase/templates/recovery.html` | New file -- OTP email template for password reset |

