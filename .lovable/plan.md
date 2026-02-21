
# Digi Mitra -- Complete UX & Brand Revamp

## Brand Changes

- **Name**: "digitalmitra" becomes **"Digi Mitra"** everywhere (navbar, auth, footer, welcome hero, forms, meta title)
- **Logo**: Keep existing `digitalmitra-logo.png` asset but update all alt text and surrounding text to "Digi Mitra"
- **Tagline**: "Your Campus Companion" (warm, approachable, fun)

## Typography Upgrade

Replace the current Inter + Instrument Serif with a more distinctive, modern pairing:

- **Headings**: **DM Serif Display** -- elegant, warm, slightly playful (more character than Instrument Serif)
- **Body**: **DM Sans** -- clean, geometric, highly readable (more modern than Inter, pairs perfectly with DM Serif Display)
- Both are Google Fonts, free, and the "DM" prefix is a nice coincidence with "Digi Mitra"

Update `src/index.css` font import and `tailwind.config.ts` font family definitions.

## Home Page UX Redesign

The current home page has a good structure but feels flat. The new flow:

### 1. Welcome Hero (logged-out users)
- Warmer copy: "Your Campus Companion" with a waving hand emoji
- Subtitle: "Course reviews, internship intel, exam papers & campus tips -- all anonymous, all honest"
- Two CTAs: "Get Started" (primary) and "Browse First" (ghost, scrolls to feed)
- Add a subtle animated gradient dot pattern behind the text for visual interest

### 2. Quick Actions Row (NEW -- replaces stat cards for logged-in users)
When logged in, replace the static stat cards with **actionable cards** that each have a "+" add button:

| Card | Navigate To | Add Action |
|------|-----------|------------|
| "Courses" with review count | /academics | "Add Review" -> /submit?category=academics |
| "Exchange" with diary count | /exchange | "Add Diary" -> /submit?category=exchange |
| "Internships" with report count | /internships | "Add Review" -> /submit?category=internships |
| "Exam Papers" with paper count | /exam-papers | "Upload" -> /submit?category=papers |
| "Campus Tips" with tip count | /campus | "Add Tip" -> /submit?category=campus |

These are horizontal scrollable cards on mobile, 5-column grid on desktop. Each card has:
- An emoji icon (not Lucide -- more personality)
- Section name
- Count badge
- Small "+" button in corner

### 3. Trending / Featured Section (NEW)
A horizontal scroll of 3-4 "featured" post cards (pinned or highest-voted) shown as compact highlight cards with title + vote count + category pill. Gives the page life even with few posts.

### 4. Community Feed (existing, refined)
- Keep category tabs and sort bar
- Add a floating "+" FAB on mobile (in addition to bottom nav) for faster posting
- Show the LeaderboardWidget in a sidebar on desktop (not inline after 4th post)

## Section Pages -- Add "Contribute" Flow

Each section page (Academics, Exchange, Internships, Exam Papers, Campus Life) currently shows empty states. Fix this by:

1. **Empty state with personality**: Instead of "No courses found", show an illustration-style empty state with a fun message and a prominent "Be the first to add" CTA button
2. **"+" button in header**: Each section page gets a prominent "Add" button next to the title that navigates to the submit page pre-filled with the right category
3. **Sample data cards**: Add hardcoded "example" entries that show what a filled section looks like, marked with a subtle "Example" badge, so users understand the format

## Sample Data for Sections

Add a `src/lib/sample-data.ts` file with example entries for each section that display when database tables are empty:

- **Courses**: 4 sample courses (Corporate Finance, Brand Management, Data Science, Microeconomics) with ratings
- **Exchange**: 3 sample colleges (HEC Paris, NUS Singapore, Bocconi) with ratings
- **Internships**: 3 sample companies (McKinsey, Goldman Sachs, Google) with ratings
- **Exam Papers**: 3 sample papers with course codes
- **Campus Tips**: 4 sample tips (food spot, study spot, transport, gym)

These display with a subtle "Sample" badge and a banner: "These are examples. Add your own to make this useful!"

## Navigation Refinements

### Navbar
- Update brand text to "Digi Mitra" (with a space, proper casing)
- Make the "+" Post button more prominent with a slight scale animation on hover

### Bottom Nav
- Keep current 5-tab layout (Home, Explore, Post, Gossip, Profile)
- Add a subtle badge dot on Gossip tab when new posts exist (future feature prep)

### Explore Sheet
- Add emoji icons before each section name for personality
- Add counts next to each section (e.g., "Academics (12 reviews)")

## Updated Files List

### Modified Files (~15):

1. **`src/index.css`** -- New Google Fonts import (DM Serif Display + DM Sans)
2. **`tailwind.config.ts`** -- Update font family definitions
3. **`index.html`** -- Update page title to "Digi Mitra"
4. **`src/pages/Home.tsx`** -- Redesigned dashboard with Quick Actions, trending section
5. **`src/components/feed/FeedWelcome.tsx`** -- Warmer hero with new brand name
6. **`src/components/layout/Navbar.tsx`** -- "Digi Mitra" brand text
7. **`src/components/layout/BottomNav.tsx`** -- "Digi Mitra" in mobile footer
8. **`src/components/layout/AppLayout.tsx`** -- "Digi Mitra" in desktop footer
9. **`src/components/layout/ExploreSheet.tsx`** -- Emoji icons + counts
10. **`src/pages/Auth.tsx`** -- "Digi Mitra" branding
11. **`src/pages/Academics.tsx`** -- Add button, sample data fallback, better empty state
12. **`src/pages/Exchange.tsx`** -- Add button, sample data fallback
13. **`src/pages/Internships.tsx`** -- Add button, sample data fallback
14. **`src/pages/ExamPapers.tsx`** -- Add button, sample data fallback
15. **`src/pages/CampusLife.tsx`** -- Add button, sample data fallback
16. **`src/pages/Forms.tsx`** -- "Digi Mitra" reference
17. **`src/components/shared/StatCard.tsx`** -- Redesign as QuickActionCard
18. **`src/components/shared/QuickAccessCard.tsx`** -- Add "+" button and counts

### New Files (~2):
1. **`src/lib/sample-data.ts`** -- Sample entries for all sections
2. **`src/components/home/QuickActionCard.tsx`** -- New actionable section card component

## Design Philosophy

- **Emojis > Lucide icons** for section identifiers (more fun, more personality)
- **Action-oriented** -- every card should invite contribution, not just browsing
- **Warm & approachable** -- DM Sans + DM Serif Display feel friendly and professional
- **Show, don't tell** -- sample data demonstrates the value proposition immediately
- **Progressive disclosure** -- simple surface, depth on demand
