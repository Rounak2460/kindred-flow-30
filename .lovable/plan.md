

# Premium Light Mode Redesign: IIMB White + Red

## Design Philosophy

Inspired by Apple's design language: white space as a feature, not emptiness. Every element breathes. IIMB's institutional red (#B71C1C / crimson-800) used sparingly as a signature accent -- on CTAs, active states, and key moments only. The rest is a symphony of whites, warm grays, and subtle shadows.

Think: Apple.com meets The Economist meets a premium B-school portal.

## Color System Overhaul

### CSS Variables (`src/index.css`)

Switch from dark charcoal to a warm white palette:

| Token | Current (Dark) | New (Light Premium) |
|-------|---------------|-------------------|
| background | 240 6% 7% (near-black) | 0 0% 99% (off-white) |
| foreground | 240 5% 93% | 0 0% 12% (near-black text) |
| card | 240 5% 10% | 0 0% 100% (pure white) |
| card-foreground | 240 5% 93% | 0 0% 12% |
| primary | 4 80% 56% (orange-red) | 0 72% 36% (IIMB crimson #B71C1C) |
| primary-foreground | white | white |
| secondary | 240 5% 14% | 0 0% 96% (light gray) |
| secondary-foreground | 240 5% 85% | 0 0% 40% |
| muted | 240 5% 14% | 0 0% 96% |
| muted-foreground | 240 5% 45% | 0 0% 55% |
| accent | 240 5% 16% | 0 0% 97% |
| border | 240 5% 14% | 0 0% 91% (subtle gray) |
| destructive | same | same |
| surface | dark | 0 0% 98% |
| upvote | 16 100% 50% | 0 72% 36% (IIMB red) |
| downvote | blue | 220 60% 50% |

### Typography

Keep Inter (sans) and Instrument Serif (headings) -- they're already premium. Add subtle tracking adjustments in CSS for headings.

## Files to Modify (Complete List)

### 1. `src/index.css` -- Color variables + utility classes
- Replace all CSS variable values with the light palette above
- Update `.glass` utility: white/90 backdrop blur instead of dark
- Update `.card-hover`: subtle shadow lift instead of dark bg change
- Update `.shimmer`: light gray gradient

### 2. `src/components/layout/Navbar.tsx` -- Premium white navbar
- White background with barely-visible bottom border
- IIMB logo stays, brand name in near-black
- Search pill: light gray bg (#f5f5f5), darker on hover
- Active buttons: IIMB red accents
- Avatar ring: red accent
- Dropdown: white bg with subtle shadow

### 3. `src/components/layout/BottomNav.tsx` -- Light bottom bar
- White bg with top border
- Active tab: IIMB red
- Post button: red circle with white icon
- Inactive: gray-500

### 4. `src/components/layout/AppLayout.tsx` -- Add footer with "Built by" credit
- Add a footer component below main content with:
  - "Built by Ronnie T (PGP 2026)"
  - LinkedIn icon linking to https://www.linkedin.com/in/rounak-tikmani-a79635169/
  - Minimal, centered, small text, muted

### 5. `src/components/layout/ExploreSheet.tsx` -- Light sheet
- White bg, subtle borders
- Icon containers: red/10 bg with red icons

### 6. `src/pages/Home.tsx` -- Premium dashboard
- Clean white canvas
- FeedWelcome hero: white card with thin red left border accent (instead of gradient bg)
- StatCards: white with very subtle shadow, red icon accent
- QuickAccess cards: white with thin border, red icon, hover shadow lift
- Feed section: clean dividers

### 7. `src/components/feed/FeedWelcome.tsx` -- Elegant hero
- White bg with subtle IIMB red left accent bar
- IIMB logo placement (small, beside "IIM Bangalore" text)
- "Join with IIMB Email" button in solid IIMB red
- Clean, minimal, no gradient blob

### 8. `src/components/feed/PostCard.tsx` -- White post cards
- Pure white bg, thin gray border
- Hover: subtle shadow elevation (no bg change)
- Flair colors: toned down for light mode (lighter bgs, darker text)
- Vote buttons: red for upvote, blue for downvote
- Category text: muted gray

### 9. `src/components/feed/VoteButtons.tsx` -- Light vote UI
- Light gray pill bg
- Upvote active: IIMB red
- Downvote active: blue-600
- Score text: dark

### 10. `src/components/feed/CategoryTabs.tsx` -- Light pills
- Active: red bg, white text
- Inactive: white bg, gray border, gray text

### 11. `src/components/feed/SortBar.tsx` -- Light dropdown
- White bg trigger with gray border
- Active sort: red text

### 12. `src/components/feed/LeaderboardWidget.tsx` -- White leaderboard
- White card, subtle border
- Trophy/flame icons: IIMB red
- Hover rows: light gray

### 13. `src/components/feed/SkeletonCard.tsx` -- Light skeletons
- Light gray pulse blocks on white

### 14. `src/components/feed/CommentItem.tsx` -- Light comments
- White bg, subtle left border for nesting

### 15. `src/components/shared/StatCard.tsx` -- Premium stat cards
- White bg, subtle shadow (no gradient)
- Icon: IIMB red
- Clean number + label

### 16. `src/components/shared/QuickAccessCard.tsx` -- Clean access cards
- White bg, thin border
- Red icon
- Hover: shadow-soft + slight border-red

### 17. `src/components/shared/FilterPills.tsx` -- Light filter pills
- Active: red bg, white text
- Inactive: white bg, gray border

### 18. `src/components/shared/StarRating.tsx` -- Keep yellow stars (universal)

### 19. `src/components/shared/RatingBar.tsx` -- Red progress bar

### 20. `src/pages/Auth.tsx` -- Premium auth page
- Left panel: clean white with subtle IIMB red accent line
- IIMB logo prominent
- Form inputs: white bg with light gray border
- CTA buttons: solid IIMB red
- OTP slots: white with red focus ring

### 21. `src/pages/Profile.tsx` -- Light profile
- White card, subtle shadow
- Gradient header: light red tint
- Stats: white bg with border
- Edit mode: clean inputs

### 22. `src/pages/Gossip.tsx` -- Light gossip
- Violet accents stay (differentiator for anonymous section)
- But cards: white bg instead of dark
- Borders: gray instead of violet/dark

### 23. `src/pages/PostDetail.tsx` -- Light post detail
- White article card with subtle shadow
- Clean typography on white
- Comment area: white with light border

### 24. `src/pages/Submit.tsx` -- Light submit wizard
- White cards for community selection
- Clean inputs on white
- Red CTA buttons

### 25. `src/pages/Academics.tsx`, `Exchange.tsx`, `Internships.tsx`, `ExamPapers.tsx`, `CampusLife.tsx` -- All section pages
- White card grids
- Red icon accents
- Hover shadows instead of border color changes

### 26. `src/pages/CourseDetail.tsx`, `ExchangeDetail.tsx`, `InternshipDetail.tsx` -- Detail pages
- White bg
- Rating bars: red indicator
- Clean review cards

### 27. `src/components/search/AISearchDialog.tsx` -- Premium search modal
- White dialog with subtle shadow
- Sparkle icon: IIMB red
- Results: white bg, hover light gray
- Category pills: adjusted for light mode

### 28. `src/components/AuthGuardDialog.tsx` -- Light auth guard
- White dialog
- Shield icon: red bg tint
- Red CTA button

### 29. `src/components/feed/CreditsPrompt.tsx` -- Light credits prompt
- White card, red accent border
- Red CTA

### 30. `tailwind.config.ts` -- Shadow adjustments
- Update `shadow-soft`, `shadow-elevated`, `shadow-glow`, `shadow-card-hover` for light mode (lighter, more subtle shadows)

### 31. `src/components/ui/progress.tsx` -- Already uses `--primary`, will auto-update

## IIMB Logo Placement

- Navbar: existing `digitalmitra-logo.png` stays as brand mark
- FeedWelcome hero: Add small IIMB crest/badge next to "IIM Bangalore" text
- Auth page: IIMB logo on the brand panel
- Using the existing `src/assets/digitalmitra-logo.png` asset

## Footer Credit

Added to `AppLayout.tsx`, always visible at bottom of every page:

```
Built by Ronnie T (PGP 2026)  [LinkedIn icon]
```

- Tiny text (text-xs), muted gray
- LinkedIn icon links to https://www.linkedin.com/in/rounak-tikmani-a79635169/
- Centered, with generous top margin
- Professional and understated

## Design Principles Applied

1. **White space is the design** -- generous padding, no clutter
2. **Red is earned** -- only on CTAs, active states, icons. Never as background fills
3. **Shadows over borders** -- cards use subtle shadows for depth, not heavy borders
4. **Typography hierarchy** -- Instrument Serif for headings creates editorial elegance
5. **Micro-interactions** -- hover states are shadow lifts, not color changes
6. **Consistency** -- every page follows the same white + red + gray palette

## Implementation Order

1. CSS variables + Tailwind config (foundation)
2. Layout components (Navbar, BottomNav, AppLayout with footer)
3. Shared components (StatCard, QuickAccessCard, FilterPills, etc.)
4. Feed components (PostCard, VoteButtons, CategoryTabs, etc.)
5. Page-level updates (Home, Auth, Profile, Gossip, etc.)
6. Section pages (Academics, Exchange, Internships, etc.)
7. Search dialog + auth guard

