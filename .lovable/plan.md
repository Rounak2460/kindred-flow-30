

# Fix Auth Typing Bug + Full Digi Mitra Redesign

## BUG FIX: Auth Email Input Loses Focus

**Root cause**: `EmailPrefixInput` is defined as a component **inside** the `Auth` component (line 118). Every time `emailPrefix` state changes, React re-renders `Auth`, which creates a **new** `EmailPrefixInput` component identity, causing React to unmount and remount the input — destroying focus.

**Fix**: Replace the `EmailPrefixInput` component definition with inline JSX directly where it's used (lines 177, 197). Delete lines 118-133.

---

## REDESIGN: Collapse to 4 Screens

This is a large-scale restructuring. Here's what changes:

### Phase 1: Delete Dead Code

**Files to delete:**
- `src/components/layout/ExploreSheet.tsx`
- `src/components/home/QuickActionCard.tsx`
- `src/components/feed/FeedWelcome.tsx`
- `src/components/feed/LeaderboardWidget.tsx`
- `src/components/feed/CategoryTabs.tsx`
- `src/components/feed/SortBar.tsx`
- `src/pages/Forms.tsx`
- `src/pages/Academics.tsx`
- `src/pages/Exchange.tsx`
- `src/pages/Internships.tsx`
- `src/pages/ExamPapers.tsx`
- `src/pages/CampusLife.tsx`

### Phase 2: Rewrite Home (Screen 1)

**`src/pages/Home.tsx`** — Strip to: 4 filter tabs (All / Courses / Careers / Life) + subtle sort toggle (New / Top) + feed. No welcome banner, no quick actions, no leaderboard, no explore heading.

- "Courses" filters `category IN ('academics', 'papers')`
- "Careers" filters `category IN ('internships', 'placements')`
- "Life" filters `category IN ('campus', 'exchange', 'marketplace', 'events')`
- Sort: just two text toggles "New" and "Top" inline, no separate SortBar
- Feed cards with `gap-3` spacing, clean design
- FAB stays as `+` circle on mobile

### Phase 3: Create Search Page (Screen 2)

**`src/pages/SearchPage.tsx`** (new file, route: `/search`)
- Full-screen search with auto-focused input
- Groups results by type: Courses, Careers, Posts
- Recent searches stored in localStorage
- Subtle "Deep search" AI button after 2 seconds if results are sparse
- Uses existing `useSearch` hook + adds queries for courses, companies, exchange colleges

### Phase 4: Rewrite Submit (Screen 3)

**`src/pages/Submit.tsx`** — Remove step-1 category picker. Start with title + body. Tag bar at bottom (Course / Career / Life). Structured fields appear only after tagging via progressive disclosure. Anonymous toggle always visible.

### Phase 5: Rewrite Profile (Screen 4)

**`src/pages/Profile.tsx`** — Add 3 tabs: Posts (your contributions), Saved (bookmarks), Settings (edit profile, theme toggle, logout). Show contribution level badge.

### Phase 6: Navigation Overhaul

**`src/components/layout/BottomNav.tsx`** — 4 items only:
```text
Home    Search    +    You
```
Remove ExploreSheet import. Remove "Sections" tab. The `+` is a filled circle with no label.

**`src/components/layout/Navbar.tsx`** — Simplify to: logo + search + create button + avatar. Remove ThemeToggle (moves to Profile settings), Forms icon, IIMB badge. Search icon on mobile navigates to `/search` instead of inline dropdown.

### Phase 7: Update Routes

**`src/App.tsx`** — Remove routes for `/forms`, `/academics`, `/exchange`, `/internships`, `/exam-papers`, `/campus`. Add `/search`. Keep detail routes (`/course/:id`, `/exchange/:id`, `/internships/:companyId`, `/post/:id`).

### Phase 8: New Database Tables

4 new tables via migration:
1. **`placement_companies`** — company data for careers tab
2. **`interview_experiences`** — round-by-round interview data with JSONB `round_details`
3. **`bookmarks`** — save any content (user_id + content_type + content_id, unique)
4. **`polls` + `poll_votes`** — inline polls attached to posts

Profile additions: `career_track`, `current_term`, `interests`, `onboarding_complete` columns.

Posts addition: `metadata JSONB DEFAULT '{}'` column for marketplace/event data.

All tables with RLS policies as specified in the redesign doc.

### Phase 9: New Hooks

- **`src/hooks/useBookmarks.ts`** — toggle bookmark, fetch user's bookmarks
- **`src/hooks/useInterviewExperiences.ts`** — fetch experiences for a company

### Phase 10: Visual Cleanup

Apply across all components:
- Remove `shadow-soft`, `shadow-elevated`, `shadow-glow` classes
- Remove colored icon backgrounds — use monochrome
- Remove gradient banner on profile
- Max 2 visual indicators per card
- Cards: `p-5`, `border border-border/50`, no shadows, `gap-3` between feed cards
- Flair tags: neutral `bg-muted text-muted-foreground` only
- Primary color only for: active tab indicator, FAB, CTA buttons

### Phase 11: PostCard Updates

**`src/components/feed/PostCard.tsx`** — Add bookmark icon, support poll rendering (via metadata), marketplace listing rendering, `active:scale-[0.98]` tap feedback, cleaner visual hierarchy.

---

## Files Summary

| Action | Files |
|--------|-------|
| **Delete** | ExploreSheet, QuickActionCard, FeedWelcome, LeaderboardWidget, CategoryTabs, SortBar, Forms, Academics, Exchange, Internships, ExamPapers, CampusLife (12 files) |
| **Create** | SearchPage.tsx, useBookmarks.ts, useInterviewExperiences.ts (3 files) |
| **Rewrite** | Home.tsx, Submit.tsx, Profile.tsx, BottomNav.tsx, Navbar.tsx (5 files) |
| **Modify** | App.tsx (routes), PostCard.tsx (bookmark + visual), Auth.tsx (typing fix) |
| **DB Migration** | 4 new tables + profile columns + posts metadata column |

This is a large change set. I'll implement it systematically, starting with the typing bug fix and deletions, then the rewrites.

