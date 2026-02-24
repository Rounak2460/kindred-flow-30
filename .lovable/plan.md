

# Test Result: Signup Flow Reaches OTP Screen but Email Fails

## What Works

The signup flow is functionally correct:

1. Login page renders properly with email prefix + `@iimb.ac.in` domain
2. "New here? Sign up" switches to Create Account form with email, password, confirm password fields
3. Clicking "Create Account" creates the user (auto-confirm) and transitions to the **Verify Your Email** screen
4. OTP input (6 slots), "Verify Code" button, "Resend code", and "Sign out & go back" all render correctly

## What Fails

**The verification email fails to send.** The Resend error is:

> You can only send testing emails to your own email address (tikmanirounak@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains.

The Resend account is in **test mode** using `onboarding@resend.dev` as the sender. In this mode, Resend only delivers emails to the account owner's own email. Sending to any `@iimb.ac.in` address is blocked.

## Fix Required

You need to **verify a custom sending domain** in Resend:

1. Go to [resend.com/domains](https://resend.com/domains)
2. Add a domain you control (e.g., `digitalmitra.in` or any domain)
3. Add the DNS records Resend provides (MX, TXT, CNAME)
4. Once verified, update the `from` field in `send-verification-code/index.ts` from `"Digi Mitra <onboarding@resend.dev>"` to `"Digi Mitra <noreply@yourdomain.com>"`

Alternatively, for **testing right now**, you can sign up with the email prefix that maps to `tikmanirounak@gmail.com` if that's possible, but for production use with real IIMB emails, domain verification is mandatory.

### Code Change (after domain verification)

**`supabase/functions/send-verification-code/index.ts`** line 101:
```
// Change from:
from: "Digi Mitra <onboarding@resend.dev>",
// To:
from: "Digi Mitra <noreply@yourverifieddomain.com>",
```

No other code changes needed -- the entire flow (signup, OTP screen, verify-code edge function, email_verified flag) is working correctly. The only blocker is the Resend domain verification.

