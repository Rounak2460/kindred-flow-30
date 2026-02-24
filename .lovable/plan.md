

# Complete Fix Prompt Implementation Plan

This plan implements ALL changes from the uploaded `lovable-fix-prompt.md` across 16+ files. Nothing is skipped.

---

## FIX 1: Auth -- @iimb.ac.in only + Magic Link (not OTP)

### File: `src/pages/Auth.tsx` (Major rewrite)

**1a.** Change email validator from `email.endsWith("@iimb.ac.in") || email.endsWith("@gmail.com")` to `email.endsWith("@iimb.ac.in")` only.

**1b.** Replace the entire `verify-otp` step. Remove `InputOTP` import, remove `verifyOtp` function, remove the OTP input UI. Replace with a "Check your inbox" screen showing:
- Animated mail icon
- "We've sent a login link to {email}"
- "Click the link in the email to continue. Check spam if needed."
- "Resend link" button with cooldown timer
- "Back" button
- No code input -- Supabase magic links auto-verify via redirect

**1c.** Update all descriptive text:
- `stepDescription` for `"signup-email"`: "We'll send a login link to your inbox"
- `stepDescription` for `"forgot-otp"`: "We'll send a reset link to your inbox"
- `stepDescription` for `"verify-otp"`: "Check your inbox -- we sent a login link to {email}"
- Button text: "Send OTP" becomes "Send Link"
- Bottom note: "Only @iimb.ac.in emails are accepted"

**1d.** Remove `otp` state, remove `InputOTP` import, remove `verifyOtp` callback. The `verify-otp` step becomes a passive "check inbox" confirmation with no input.

### File: `src/components/AuthGuardDialog.tsx`
- Change description text to: "Sign in with your @iimb.ac.in email to {action}. Only IIMB students can participate."
- Change bottom note to: "Only @iimb.ac.in emails accepted"

---

## FIX 2: Dual-Posting System -- Reviews appear in BOTH structured tables AND common feed

### File: `src/pages/Submit.tsx` (Major rewrite)

Replace the entire submit page with a multi-mode flow that branches by category:

**For "academics":**
1. Course selector (searchable dropdown from `courses` table, with "Add new course" option)
2. Rating step: 4 star ratings (Overall, Difficulty, Relevance, Workload) using new `StarRatingInput`
3. Review text (min 100 chars), optional tips, optional tags
4. On submit: Insert into `course_reviews` AND `posts` (dual-write)

**For "exchange":**
1. College selector (from `exchange_colleges`, or add new)
2. 4 ratings: Academics, Living & Costs, Social Life, Travel
3. Review text (min 150 chars)
4. On submit: Insert into `exchange_reviews` AND `posts`

**For "internships":**
1. Company selector (from `internship_companies`, or add new)
2. 4 ratings: Work Culture, Learning, Mentorship, PPO
3. Stipend input, review text (min 150 chars)
4. On submit: Insert into `internship_reviews` AND `posts`

**For "papers":**
1. Course selector
2. Exam type, year, title, file upload (PDF via Supabase Storage)
3. On submit: Insert into `exam_papers` AND `posts`

**For "campus":**
1. Sub-category selector, place name, rating, tip text (min 50 chars)
2. On submit: Insert into `campus_tips` AND `posts`

**For general:** Keep existing title + body + flair flow for discussion posts.

### Navigation updates:

**`src/pages/CourseDetail.tsx`:**
- "Write Review" button navigates to `/submit?category=academics&courseId={courseId}`
- Back button: `navigate("/academics")` with text "← Academics"

**`src/pages/ExchangeDetail.tsx`:**
- "Write Diary" button navigates to `/submit?category=exchange&collegeId={collegeId}`
- Back button: `navigate("/exchange")` with text "← Exchange Programs"

**`src/pages/InternshipDetail.tsx`:**
- "Write Review" button navigates to `/submit?category=internships&companyId={companyId}`
- Back button: `navigate("/internships")` with text "← Internships"

### Database: Auto-update rating triggers

Create a migration with triggers to auto-update `avg_rating` and `review_count` on `courses`, `exchange_colleges`, and `internship_companies` when reviews are inserted/updated/deleted.

```sql
CREATE OR REPLACE FUNCTION update_course_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses SET
    avg_rating = (SELECT COALESCE(AVG(overall_rating), 0) FROM course_reviews WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)),
    review_count = (SELECT COUNT(*) FROM course_reviews WHERE course_id = COALESCE(NEW.course_id, OLD.course_id))
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Similar for exchange_colleges and internship_companies
```

---

## FIX 3: Comprehensive UX Fixes

### 3a. Default to light theme
**`src/App.tsx`:** Change `defaultTheme="dark"` to `defaultTheme="light"`

### 3b. Profile interface (already done)
**`src/contexts/AuthContext.tsx`:** Already has `bio` and `gossip_member` in the Profile interface. No change needed.

### 3c. Fix back navigation
- **`CourseDetail.tsx`:** `navigate(-1)` → `navigate("/academics")`, text "← Academics"
- **`ExchangeDetail.tsx`:** `navigate(-1)` → `navigate("/exchange")`, text "← Exchange Programs"
- **`InternshipDetail.tsx`:** `navigate(-1)` → `navigate("/internships")`, text "← Internships"

### 3d. Bottom nav: Explore → Sections
**`src/components/layout/BottomNav.tsx`:**
- Change icon from `Compass` to `LayoutGrid`
- Change label from "Explore" to "Sections"

### 3e. Gossip discoverable on desktop
**`src/components/layout/Navbar.tsx`:**
- The Gossip icon button gets a tooltip and shows "Gossip" text next to the icon on desktop

### 3f. Fix ExamPapers sample data
**`src/pages/ExamPapers.tsx`:**
- For sample papers, make them non-clickable (use `<div>` instead of `<a>`)
- Add a subtle "(sample)" badge

### 3g. PostCard body markdown -- already fixed in previous iteration with targeted regex. Confirmed working.

### 3h. Add "Can't find your course?" prompt
**`src/pages/Academics.tsx`:**
- When search has results = 0 and search is non-empty, show: "Can't find your course? [Add it →]" linking to `/submit?category=academics&newCourse=true`

### 3i. Show credit count on mobile
**`src/components/layout/Navbar.tsx`:**
- On mobile, show a small pill with coin icon + credit count next to the logo

### 3j. Forms page → Contribution hub
**`src/pages/Forms.tsx`:** Rewrite to show a grid of "Contribute" cards linking to proper submit forms:
- Course Review → `/submit?category=academics` (+20 credits)
- Exam Paper → `/submit?category=papers` (+30 credits)
- Exchange Diary → `/submit?category=exchange` (+25 credits)
- Internship Report → `/submit?category=internships` (+25 credits)
- Campus Tip → `/submit?category=campus` (+5 credits)
- Keep the Google Forms section at bottom under an accordion

### 3k. Star rating input component
**Create `src/components/shared/StarRatingInput.tsx`:**
- Interactive 5-star rating input (click to set 1-5)
- Hollow stars that fill on hover and click
- Returns selected value via `onChange` prop

### 3l. Empty state improvements
- Consistent empty states across all sections with larger icons, encouraging copy, and CTA buttons
- Already partially done; will ensure consistency in Academics, ExamPapers, Exchange, Internships, CampusLife pages

### 3m. Profile page -- remove `as any` casts
**`src/pages/Profile.tsx`:**
- Line 23: `(profile as any).bio` → `profile.bio`
- Line 41: `(profile as any).bio` → `profile.bio`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/shared/StarRatingInput.tsx` | Interactive 5-star rating input component |

## Files to Modify

| File | Key Changes |
|------|-------------|
| `src/pages/Auth.tsx` | @iimb.ac.in only, magic link flow, remove OTP UI |
| `src/pages/Submit.tsx` | Major rewrite with category-specific review forms + dual-posting |
| `src/pages/CourseDetail.tsx` | Fix back nav → `/academics`, fix Write Review link with courseId |
| `src/pages/ExchangeDetail.tsx` | Fix back nav → `/exchange`, fix Write Diary link with collegeId |
| `src/pages/InternshipDetail.tsx` | Fix back nav → `/internships`, fix Write Review link with companyId |
| `src/pages/Academics.tsx` | Add "Can't find course?" empty-search prompt |
| `src/pages/ExamPapers.tsx` | Make sample papers non-clickable, add "(sample)" badge |
| `src/pages/Forms.tsx` | Rewrite as contribution hub with submit form links |
| `src/pages/Profile.tsx` | Remove `as any` casts |
| `src/App.tsx` | `defaultTheme="dark"` → `defaultTheme="light"` |
| `src/components/AuthGuardDialog.tsx` | Fix email domain text |
| `src/components/layout/Navbar.tsx` | Mobile credits pill, Gossip label on desktop |
| `src/components/layout/BottomNav.tsx` | Compass→LayoutGrid, "Explore"→"Sections" |

## Database Migration

One migration to create auto-update triggers for `courses.avg_rating`/`review_count`, `exchange_colleges.avg_rating`/`review_count`, and `internship_companies.avg_rating`/`review_count` when reviews are inserted/updated/deleted.

## Technical Details

### Dual-Write Pattern (in Submit.tsx)

```typescript
// After inserting structured review:
const { data: reviewData } = await supabase
  .from("course_reviews")
  .insert({ course_id, user_id, overall_rating, difficulty_rating, ... })
  .select("id")
  .single();

// Also insert into posts feed:
await supabase.from("posts").insert({
  user_id,
  category: "academics",
  title: `Review: ${courseName} (${courseCode})`,
  body: reviewText,
  flair: "Course Review",
  course_code: courseCode,
  course_name: courseName,
  moderation_status: "approved",
});
```

### StarRatingInput Component

```typescript
interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}
// Renders 5 clickable stars with hover preview
// Uses lucide Star icon, filled vs outline based on value
```

### Auto-Update Trigger (SQL)

```sql
CREATE OR REPLACE FUNCTION update_course_avg_rating()
RETURNS TRIGGER AS $$
DECLARE target_id uuid;
BEGIN
  target_id := COALESCE(NEW.course_id, OLD.course_id);
  UPDATE courses SET
    avg_rating = (SELECT COALESCE(AVG(overall_rating), 0) FROM course_reviews WHERE course_id = target_id),
    review_count = (SELECT COUNT(*) FROM course_reviews WHERE course_id = target_id)
  WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER update_course_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON course_reviews
FOR EACH ROW EXECUTE FUNCTION update_course_avg_rating();
```

Similar triggers for `exchange_reviews` → `exchange_colleges` and `internship_reviews` → `internship_companies`.

