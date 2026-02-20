

# Digital Mitra — Implementation Plan (v2: Reddit-style)

## Vision
IIM Bangalore's own Reddit — a threaded knowledge-sharing platform with Apple-editorial design. Categories replace subreddits: Academics, Exchange, Internships, Campus Life, Exam Papers. IIMB red accent, Playfair Display + DM Sans typography.

---

## ✅ Phase 1: Foundation (Complete)
- Lovable Cloud backend with posts, comments, votes tables + RLS
- Design system: warm neutrals, IIMB red, glass navbar, soft shadows
- Auth with @iimb.ac.in domain restriction
- Profiles auto-created on signup

## ✅ Phase 2: Core Reddit UX (Complete)
- Home feed with category tabs, sort (Hot/New/Top), search
- Reddit-style post cards with vote arrows, flairs, context tags
- Thread detail page with markdown rendering
- Threaded comments with nesting, reply UI, vote buttons
- Create thread form with category selection, flairs, context fields
- 10 realistic dummy posts across all categories
- Sample data collection forms page with copy-to-clipboard

## Phase 3: Next Steps
- Wire real Supabase queries (replace mock data with live DB)
- Credit system: earn on contribution, spend on views
- User profile page with contribution history
- Dark mode toggle
- CMD+K search shortcut
- File upload for exam papers
- Founding contributor badges
