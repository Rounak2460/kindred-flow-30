

# Digital Mitra — Implementation Plan

## Vision
A premium, structured knowledge-sharing platform for IIM Bangalore students. Think Apple's editorial clarity meets Notion's clean utility — soft shadows, generous spacing, rounded cards, warm tones, with IIMB red used purposefully for buttons, navigation accents, and badges.

---

## Phase 1: Foundation — Auth, Database & Layout

### Supabase Backend Setup
- **Authentication**: Email-based signup restricted to `@iimb.ac.in` domain with validation
- **Database Schema**: All tables with proper RLS policies
  - `profiles` (auto-created on signup): name, batch, section, credits, free_views_used, founding_contributor flag
  - `courses`, `course_reviews`, `course_review_votes`
  - `exam_papers`, `exam_paper_votes`
  - `exchange_colleges`, `exchange_reviews`
  - `internship_companies`, `internship_reviews`
  - `campus_items`, `campus_tips`, `campus_tip_votes`
- **Credit system**: 5 free views → then 1 credit per content view; earn credits by contributing

### Design System & Global Layout
- **Typography**: Playfair Display for headings, DM Sans for body (loaded via Google Fonts)
- **Color palette**: Warm neutrals as base (#FAFAFA background, white cards), IIMB red for CTAs, active nav items, and key badges
- **Apple-editorial styling**: Soft box shadows, generous padding, 14–16px rounded corners, subtle hover lifts
- **Sticky top navbar**: Semi-transparent with backdrop blur — logo on left, nav tabs center, credit pill + contribute button + user avatar on right
- **Responsive**: Single-column on mobile with hamburger menu
- **Subtle page transitions**: Fade-up animations on load, staggered card entry

---

## Phase 2: Home Page

- **Hero section**: Full-width gradient card (refined, not overly bold) with headline "The Knowledge Layer of IIM Bangalore", two CTAs
- **Stats row**: 4 clean stat cards pulling real counts from Supabase (course reviews, exchange diaries, internship reports, exam papers)
- **Quick access grid**: 3 minimal gradient cards linking to Academics, Exchange, Internships
- **Recent contributions feed**: Clean activity list showing latest contributions across all categories
- **Global search bar**: Searches across all content types (courses, companies, colleges, papers)

---

## Phase 3: Academics (Core Section)

### Course List
- Page header with search bar and filter pills (All, Core, Elective, Finance, Marketing, etc.)
- 2-column card grid — each card showing course code pill, star rating, course name, professor, term, tag badges, review count
- Sort options: Most Recent, Highest Rated, Most Reviews

### Course Detail Page
- Back navigation, header with course info and rating summary
- Rating breakdown with horizontal progress bars (Overall, Difficulty, Relevance, Workload)
- Quick Tips section (top upvoted tips)
- Student reviews with avatar, batch, rating, text, tags, and "found helpful" votes

### Write a Review Form
- Course selector (searchable, with "Add New Course" option)
- Rating sliders for 4 dimensions
- Review text (min 100 chars), tips field, tag selector
- Submit awards +20 credits

---

## Phase 4: Exam Papers

- Filterable list: End Term, Mid Term, Quiz, Case Analysis + course and year filters
- Horizontal card layout: document icon, course info, type badge, uploader, vote count
- Upload form: course selector, year/term/type, PDF upload (Supabase Storage, max 10MB)
- Upload awards +30 credits

---

## Phase 5: Exchange Programs

### College List
- Region filter pills (Europe, Asia, North America, Oceania, South America)
- 2-column card grid with country flag, star rating, college name, location, highlight badges

### College Detail Page
- Header with flag + college name + location + diary count
- 4-card grid: Academics, Living & Costs, Social Life, Travel Opportunities — each with rating bar and summary
- Student diary entries below

### Contribution form: +25 credits

---

## Phase 6: Internship Intel

### Company List
- Domain filter pills (Consulting, Finance, PM, Strategy & Ops, Marketing, Tech, GM)
- 2-column card grid with company logo placeholder, domain badge, stipend, rating, highlights

### Company Detail Page
- Header with logo + company info
- 4-card grid: Work Culture, Learning Curve, Mentorship, PPO Conversion
- Student reports section

### Contribution form: +25 credits

---

## Phase 7: Campus Life

- Horizontal tab categories: Food & Cafes, Study Spots, Weekend Getaways, Gyms & Sports, Transport, Shopping
- 3-column card grid per category: type badge, star rating, name, pro tip, "found useful" count, upvote button
- Contribution form: +5 credits

---

## Phase 8: Contribute Modal & User Profile

### Contribute Modal (accessible from navbar)
- Clean centered modal with 2-column grid of contribution type cards
- Each shows icon, title, description, "+X credits" badge
- Clicking navigates to the relevant form

### User Profile Page
- Editable profile info: name, batch, section, previous work experience
- Stats: total credits, total contributions
- "Founding Contributor" badge (first 25 contributors)
- List of personal contributions with edit/delete
- Contribution streak tracker

---

## Design Improvisation (My Additions)

1. **Soft paywall modal redesign**: Instead of a blocking wall, show a beautifully designed "unlock" card that feels encouraging, not punishing — with a progress indicator showing how close they are to earning credits
2. **Content quality indicators**: Subtle "Verified" badges on reviews from students who actually took the course (matched via enrollment data if available)
3. **Micro-interactions**: Gentle spring animations on card hovers, smooth number counters on stats, skeleton loading states that feel polished
4. **Dark mode support**: Since we're using CSS variables, I'll wire in a dark mode toggle from the start — fits the premium feel
5. **Keyboard navigation**: CMD+K search shortcut for power users to quickly find any content across the platform

