

# Verified: Auth Magic Link Flow ✓

The `/auth` page is working correctly:
- **Login screen**: Email + password with "Sign In" button
- **Sign up screen**: Shows "Create Account", "We'll send a login link to your inbox", "Send Link" button, "Only @iimb.ac.in emails accepted"
- **No OTP input** anywhere -- the verify step shows a "Check your inbox" passive screen with animated MailCheck icon, resend with cooldown, and back button
- **Email restriction**: `isValidEmail` only accepts `@iimb.ac.in`

---

# Add Real-Time Notification Toasts

The realtime subscription in `useNotifications.ts` already captures new notifications via Supabase postgres_changes. We just need to show a sonner toast when a new notification arrives.

## Change

### File: `src/hooks/useNotifications.ts`

In the realtime `INSERT` callback (line 74-77), after adding the notification to state, also fire a `toast()` from sonner:

```typescript
import { toast } from "sonner";

// Inside the postgres_changes callback:
(payload) => {
  const newNotif = payload.new as Notification;
  setNotifications((prev) => [newNotif, ...prev]);
  setUnreadCount((c) => c + 1);
  // Show toast for new notification
  toast(newNotif.title, {
    description: newNotif.body,
    action: newNotif.post_id ? {
      label: "View",
      onClick: () => window.location.href = `/post/${newNotif.post_id}`,
    } : undefined,
  });
}
```

This is a one-line addition to the existing realtime handler. When someone upvotes your post or comments on it, you'll see a toast pop up immediately with the notification title/body and a "View" action button that navigates to the post.

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useNotifications.ts` | Add `toast()` call in realtime INSERT callback + import `toast` from sonner |

No database changes needed -- the `notifications` table already has realtime enabled via the existing subscription, and the `notify_on_comment` and `notify_on_upvote` database triggers already insert notifications.

