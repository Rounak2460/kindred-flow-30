

# Complete UI/UX Revamp: Reddit + Knowledge Base Fusion

## Vision

Combine the Reddit-style threaded discussion feed (current) with the structured knowledge-base sections from the uploaded design. The result: a platform where MBA students can both **explore structured data** (course ratings, exchange reviews, internship intel) AND **participate in community discussions** -- all in the current dark-mode design system.

## Architecture Change

Current: Feed-first with category filters
New: **Hub-and-spoke** -- a dashboard home page with quick access to 5 dedicated section pages, PLUS the community feed

```text
Home (Dashboard)
  |-- Feed (community posts, existing)
  |-- /academics (course cards + detail pages)
  |-- /exchange (exchange colleges + detail pages)  
  |-- /internships (company cards + detail pages)
  |-- /exam-papers (filterable paper listings)
  |-- /campus (categorized tips)
  |-- /gossip (existing, anonymous)
  |-- /submit (existing, post wizard)
  |-- /profile (existing, editable)
```

## New Routes and Pages

### 1. Enhanced Home Page (`src/pages/Home.tsx`)

Replace the current feed-only home with a dashboard layout:

- **Hero section** (adapted from uploaded): gradient banner with "The Knowledge Layer of IIM Bangalore" tagline, CTA buttons for "Explore Courses" and "Contribute"
- **Quick Stats bar**: 4 stat cards (Course Reviews, Exchange Diaries, Internship Reports, Exam Papers) -- counts fetched from database
- **Quick Access grid**: 3 gradient cards linking to Academics, Exchange, Internships
- **Recent community posts**: The existing feed (PostCard list) with category tabs and sort, shown below the dashboard widgets
- Keep existing category tabs, sort bar, and post list -- just move them below the new dashboard section

### 2. Academics Page (`src/pages/Academics.tsx`)

A dedicated course exploration page:

- Header: "Academics" with subtitle "Course reviews, tips & study strategies from your peers"
- Filter pills: All, Core, Elective, Finance, Marketing, etc. (from course `category` enum)
- Search input: filter by course name or code
- Course cards grid (2-col desktop, 1-col mobile): Each card shows code, name, professor, term, star rating, review count, tags
- Click a card -> navigate to `/academics/:courseId`
- Data source: `courses` table + `course_reviews` table for ratings

### 3. Course Detail Page (`src/pages/CourseDetail.tsx`)

- Back button to /academics
- Course header card: code, name, professor, term, overall rating
- Rating breakdown panel: Overall, Difficulty, Relevance, Workload (progress bars)
- Quick Tips section (from reviews)
- Student Reviews list: avatar, batch, date, star rating, review text, tags, helpful count
- "Write a Review" button (navigates to /submit or opens a form)
- Data: `courses` table joined with `course_reviews`

### 4. Exchange Page (`src/pages/Exchange.tsx`)

- Header: "Exchange Programs" with subtitle
- Region filter pills: All, Europe, Asia, North America, Oceania
- College cards grid: flag emoji, college name, location, rating, highlights, diary count
- Click -> navigate to `/exchange/:collegeId`
- Data: `exchange_colleges` table

### 5. Exchange Detail Page (`src/pages/ExchangeDetail.tsx`)

- Back button, college header with flag and name
- 4 rating panels: Academics, Living & Costs, Social Life, Travel (from `exchange_reviews` averages)
- Student diaries/reviews list
- Data: `exchange_colleges` + `exchange_reviews`

### 6. Internships Page (`src/pages/Internships.tsx`)

- Header: "Internship Intel"
- Domain filter pills: All, Consulting, Finance, Product Management, Strategy & Ops
- Company cards grid: logo/initials, company name, domain, location, stipend, rating, highlights
- Click -> navigate to `/internships/:companyId`
- Data: `internship_companies` table

### 7. Internship Detail Page (`src/pages/InternshipDetail.tsx`)

- Company header with logo and info
- 4 rating panels: Work Culture, Learning Curve, Mentorship, PPO Conversion
- Intern reviews list
- Data: `internship_companies` + `internship_reviews`

### 8. Exam Papers Page (`src/pages/ExamPapers.tsx`)

- Header: "Exam Papers" with "Upload Paper" button
- Type filter pills: All, End Term, Mid Term, Quiz, Case Analysis
- Paper listing (list layout, not grid): file icon, course name, code, term, year, type badge, uploader, vote count
- Click -> opens/downloads the paper file
- Data: `exam_papers` table joined with `courses`

### 9. Campus Life Page (`src/pages/CampusLife.tsx`)

- Header: "Campus Life -- The unofficial survival guide"
- Category tabs: Food & Cafes, Study Spots, Weekend Getaways, Gyms & Sports (from `campus_tip_category` enum)
- Tips cards grid (3-col desktop): type badge, rating, name, tip text, useful vote count
- "Add a Tip" button
- Data: `campus_tips` table

## Navigation Overhaul

### Navbar (`src/components/layout/Navbar.tsx`)

No major changes needed -- the existing search, profile menu, and gossip links stay.

### Bottom Nav (`src/components/layout/BottomNav.tsx`)

Change from: Home, Search, Post, Gossip, Profile
Change to: Home, Explore, Post, Gossip, Profile

"Explore" opens a bottom sheet or navigates to a hub page showing all 5 sections (Academics, Exchange, Internships, Exam Papers, Campus Life).

### Home Page Section Navigation

The Quick Access grid on the home page serves as the primary discovery mechanism on desktop.

## New Hooks

| Hook | Purpose |
|------|---------|
| `src/hooks/useCourses.ts` | Fetch courses list with filters, single course detail |
| `src/hooks/useCourseReviews.ts` | Fetch reviews for a course |
| `src/hooks/useExchangeColleges.ts` | Fetch exchange colleges with region filter |
| `src/hooks/useExchangeReviews.ts` | Fetch reviews for a college |
| `src/hooks/useInternshipCompanies.ts` | Fetch companies with domain filter |
| `src/hooks/useInternshipReviews.ts` | Fetch reviews for a company |
| `src/hooks/useExamPapers.ts` | Fetch exam papers with type filter |
| `src/hooks/useCampusTips.ts` | Fetch campus tips by category |
| `src/hooks/useStats.ts` | Fetch aggregate counts for the dashboard |

## Shared Components

| Component | Purpose |
|-----------|---------|
| `src/components/shared/StarRating.tsx` | Reusable star rating display |
| `src/components/shared/RatingBar.tsx` | Horizontal rating progress bar (Overall: 4.3 [====]) |
| `src/components/shared/FilterPills.tsx` | Reusable pill filter bar |
| `src/components/shared/StatCard.tsx` | Dashboard stat card with icon and count |
| `src/components/shared/QuickAccessCard.tsx` | Gradient card linking to a section |

## Design Approach

- **Keep the dark mode** design system (current CSS variables)
- **Adapt the uploaded JSX layouts** into Tailwind + shadcn components
- Cards use `bg-card border-border` instead of white backgrounds
- Gradient accents use `from-primary/20` patterns
- Star ratings and badges use existing component patterns
- All pages use `max-w-3xl mx-auto` for content width consistency
- Animations use existing `fade-up` utility and framer-motion

## Routing Changes (`src/App.tsx`)

Add these routes inside AppLayout:
```
/academics -> Academics
/academics/:courseId -> CourseDetail
/exchange -> Exchange  
/exchange/:collegeId -> ExchangeDetail
/internships -> Internships
/internships/:companyId -> InternshipDetail
/exam-papers -> ExamPapers
/campus -> CampusLife
```

## Implementation Order

1. Shared components (StarRating, RatingBar, FilterPills, StatCard)
2. Data hooks (useCourses, useExchangeColleges, etc.)
3. Dashboard home page enhancement
4. Academics + CourseDetail pages
5. Exchange + ExchangeDetail pages
6. Internships + InternshipDetail pages
7. Exam Papers page
8. Campus Life page
9. Navigation updates (BottomNav explore, routing)
10. End-to-end testing

## Files Summary

**New files (~20):**
- 9 page components
- 8 data hooks
- 4 shared components

**Modified files (~4):**
- `src/App.tsx` (new routes)
- `src/pages/Home.tsx` (dashboard layout)
- `src/components/layout/BottomNav.tsx` (explore tab)
- `src/components/feed/CategoryTabs.tsx` (may link to section pages)

**No database changes needed** -- all required tables already exist with proper RLS policies.

