

## Plan: Update Resend Sender Address

**What changes:**
One line in `supabase/functions/send-verification-code/index.ts` — change the `from` field from `"Digi Mitra <onboarding@resend.dev>"` to `"Digi Mitra <noreply@iimbdigimitra.org>"`.

**File:** `supabase/functions/send-verification-code/index.ts`, line 101

```
// From:
from: "Digi Mitra <onboarding@resend.dev>",

// To:
from: "Digi Mitra <noreply@iimbdigimitra.org>",
```

The edge function will be redeployed automatically. After this, verification emails will be delivered to real `@iimb.ac.in` inboxes.

