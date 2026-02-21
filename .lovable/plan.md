
# Logo Image Swap, Theme Popup & Notifications

## 1. Use the Uploaded Logo Image (Light/Dark Variants)

The user has provided a professional logo image with both light-mode (crimson DM on white) and dark-mode (white DM on dark) versions. Instead of trying to replicate it in SVG, we will use the actual image.

**Approach:** Since the image contains both variants side-by-side, we need to handle this carefully. We will copy the uploaded image to `src/assets/` and update `DMLogo.tsx` to render the image. To support light/dark switching, the component will use `next-themes` `useTheme()` to pick the correct visual treatment:

- Copy `user-uploads://image.png` to `src/assets/dm-logo.png`
- Rewrite `DMLogo.tsx` to render an `<img>` tag with the uploaded logo
- Since the image has both variants in one file, we will use CSS `object-position` to show only the left half (light) or right half (dark) based on the current theme
- Alternatively, we can crop them into two separate images -- but using a single image with CSS clipping is cleaner

**Files using DMLogo (all auto-update):** Navbar, Auth page, FeedWelcome

## 2. Theme Selection Popup (Apparent + Visible)

Replace the tiny icon-only toggle with a proper theme selection popup/popover:

- **ThemeToggle.tsx**: Replace the single button with a `Popover` that opens on click
- Shows two clear options: "Light" and "Dark" with visual previews (sun/moon icons + labels)
- Active theme gets a highlighted border/check mark
- Bigger, more visible trigger button with label text (not just an icon)
- Smooth transition animation when switching

**Design:**
```text
+---------------------------+
|  [Sun] Light Mode    [x]  |
|  [Moon] Dark Mode   [ok]  |
+---------------------------+
```

## 3. In-App Notification System

Create a notification system that alerts users when activity happens on their posts.

### Database

Create a `notifications` table:
- `id` (uuid, PK)
- `user_id` (uuid, references profiles)
- `type` (text: 'comment', 'upvote', 'reply')
- `title` (text)
- `body` (text)
- `post_id` (uuid, nullable, references posts)
- `is_read` (boolean, default false)
- `created_at` (timestamptz)

RLS policies:
- Users can only SELECT their own notifications
- Users can UPDATE (mark read) their own notifications
- INSERT allowed for authenticated users (triggered by app logic)

### Database Trigger

Create a trigger function that auto-inserts a notification when:
- Someone comments on a user's post
- Someone upvotes a user's post or comment

### Frontend

- **`src/hooks/useNotifications.ts`**: Hook to fetch unread notifications count + list, mark as read
- **`src/components/NotificationBell.tsx`**: Bell icon in Navbar with unread badge count
- **`src/components/NotificationPanel.tsx`**: Dropdown panel showing recent notifications with links to the relevant post
- Add Supabase Realtime subscription on the notifications table so new notifications appear instantly
- **Navbar.tsx**: Add the NotificationBell next to theme toggle

## Files to Create

| File | Purpose |
|------|---------|
| `src/assets/dm-logo.png` | Copy of uploaded logo image |
| `src/hooks/useNotifications.ts` | Fetch, subscribe, mark-read notifications |
| `src/components/NotificationBell.tsx` | Bell icon with unread count badge |
| `src/components/NotificationPanel.tsx` | Dropdown list of notifications |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/DMLogo.tsx` | Swap SVG for the uploaded image, theme-aware display |
| `src/components/ThemeToggle.tsx` | Replace icon button with a popover showing Light/Dark options with labels |
| `src/components/layout/Navbar.tsx` | Add NotificationBell to the header actions |

## Technical Details

### DMLogo with theme-aware image cropping

```typescript
import { useTheme } from "next-themes";
import logoImg from "@/assets/dm-logo.png";

export default function DMLogo({ size = 32 }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <div style={{ width: size, height: size, overflow: "hidden" }}>
      <img
        src={logoImg}
        alt="Digi Mitra"
        style={{
          width: size * 2,
          height: size,
          objectFit: "cover",
          objectPosition: isDark ? "right" : "left",
        }}
      />
    </div>
  );
}
```

### Notification trigger (SQL)

```sql
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS trigger AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, post_id)
  SELECT p.user_id, 'comment', 'New comment on your post',
    'Someone commented on "' || p.title || '"', p.id
  FROM posts p WHERE p.id = NEW.post_id
  AND p.user_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_notify
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();
```

### Realtime subscription

```typescript
supabase.channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Add to local state, show toast
  })
  .subscribe();
```
