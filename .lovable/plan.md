

# Fix Chat Notifications + Improve Section Structure

## Issue 1: Chat Message Notifications

### Problem
There is **no notification trigger for new chat messages**. When someone sends a chat message, the recipient has no notification — they only see it if they open the chat. The "coming back to me" issue means you're getting notified about your own upvotes/comments (which shouldn't happen), and the person who posted doesn't get a chat message notification.

Looking at the existing `notify_on_upvote` trigger, it has a `AND p.user_id != NEW.user_id` guard to prevent self-notifications, which is correct. However, there's **no equivalent trigger for chat messages** at all.

### Fix: Add a `notify_on_message` database trigger

Create a new trigger on the `messages` table that:
1. Looks up the other participant in the conversation
2. Inserts a notification for the recipient (not the sender)
3. Includes a link to the conversation

```sql
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recipient_id uuid;
  sender_name text;
BEGIN
  -- Find the other participant
  SELECT cp.user_id INTO recipient_id
  FROM conversation_participants cp
  WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id != NEW.sender_id
  LIMIT 1;

  IF recipient_id IS NULL THEN RETURN NEW; END IF;

  -- Get sender's name
  SELECT name INTO sender_name
  FROM profiles WHERE user_id = NEW.sender_id;

  INSERT INTO notifications (user_id, type, title, body, post_id)
  VALUES (
    recipient_id,
    'message',
    'New message from ' || COALESCE(sender_name, 'Someone'),
    LEFT(NEW.body, 100),
    NULL
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_notify
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_message();
```

### Frontend: Handle `message` notification type

Update `NotificationPanel.tsx` to:
- Add a `message` icon type (use `MessageCircle`)
- Navigate to `/chat` when clicking a message notification (since `post_id` is NULL)

Update `useNotifications.ts` toast action to navigate to `/chat` for message notifications.

---

## Issue 2: Section Structure & Information Segregation

### Problem
The section pages (Academics, Exchange, Internships, Exam Papers, Campus) work well individually, but there are structural improvements needed:

1. **Community Feed posts for each section aren't linked back to their structured data** — e.g., a course review posted to the feed doesn't link to the course detail page
2. **No sorting options** on section listing pages (Academics, Exchange, Internships) — only filters exist
3. **No review count / "newest first" toggle** on detail pages

### Fixes

**A. Add sorting to section listing pages**

Add a sort control (by rating, by review count, by newest) to:
- `Academics.tsx` — sort courses by rating (default), review count, or newest
- `Exchange.tsx` — same pattern
- `Internships.tsx` — same pattern

Implementation: Add a `SortPills` component or reuse `FilterPills` with sort options, then pass the sort to the hooks which already sort by `avg_rating DESC`.

Update hooks (`useCourses`, `useExchangeColleges`, `useInternshipCompanies`) to accept a sort parameter:
```ts
// useCourses example
let q = supabase.from("courses").select("*");
if (sort === "rating") q = q.order("avg_rating", { ascending: false });
else if (sort === "reviews") q = q.order("review_count", { ascending: false });
else if (sort === "newest") q = q.order("created_at", { ascending: false });
```

**B. Add sort toggle on detail pages for reviews**

On `CourseDetail.tsx`, `InternshipDetail.tsx`, `ExchangeDetail.tsx` — add a "Newest / Top Rated" toggle for reviews.

Update hooks (`useCourseReviews`, `useInternshipReviews`, `useExchangeReviews`) to accept a sort parameter.

**C. Better post-to-section linking in PostCard**

When a post has `course_code` or `course_name`, make the context label clickable to navigate to the relevant section. Update `PostCard.tsx` to link context labels:
- If `course_code` exists → link to `/academics`
- If `company_name` exists → link to `/internships`  
- If `college_name` exists → link to `/exchange`

---

## File Summary

| File | Change |
|------|--------|
| **DB Migration** | Add `notify_on_message()` function and trigger on `messages` table |
| `src/components/NotificationPanel.tsx` | Add `message` type icon, handle click navigation for message notifications (→ `/chat`) |
| `src/hooks/useNotifications.ts` | Handle `message` type in toast action (navigate to `/chat`) |
| `src/pages/Academics.tsx` | Add sort control (Rating / Reviews / Newest) |
| `src/pages/Exchange.tsx` | Add sort control |
| `src/pages/Internships.tsx` | Add sort control |
| `src/hooks/useCourses.ts` | Accept sort parameter |
| `src/hooks/useExchangeColleges.ts` | Accept sort parameter |
| `src/hooks/useInternshipCompanies.ts` | Accept sort parameter |
| `src/pages/CourseDetail.tsx` | Add review sort toggle (Newest / Top Rated) |
| `src/pages/InternshipDetail.tsx` | Add review sort toggle |
| `src/pages/ExchangeDetail.tsx` | Add review sort toggle |
| `src/components/feed/PostCard.tsx` | Make context labels (course/company/college) clickable links to their sections |

