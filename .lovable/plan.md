

# Digital Mitra -- Complete UI/UX Redesign

## Design Philosophy

Strip away the heavy Reddit clone aesthetic. Replace it with a **clean, airy, content-first experience** that feels more like Arc Browser meets Linear meets Notion -- minimal chrome, beautiful typography, micro-interactions that feel alive, and generous whitespace that lets content breathe. The dark theme stays but becomes more refined with subtle gradients and depth.

---

## What Changes (and Why)

### 1. Color System Overhaul

The current palette feels flat. Introduce a richer dark theme with subtle warm undertones and a multi-layered surface system:

- Background becomes a slightly warmer dark (not pure cold grey)
- Cards get a subtle glass-morphism effect with faint border glow on hover
- Primary accent stays IIMB red but gets a companion gradient (red to warm orange) for CTAs and highlights
- Introduce an "ink" color for body text that's slightly warmer than pure white -- easier on eyes

### 2. Typography Upgrade

Replace IBM Plex Sans with **Inter** (for UI) and **Instrument Serif** (for display headings). This creates a premium editorial contrast -- serifs for titles feel scholarly (fits IIM context), while Inter is the gold standard for UI readability.

### 3. Navbar -- From Cluttered Bar to Minimal Header

Current: Dense 48px bar crammed with logo, search, icons, buttons.

New design:
- 56px height with more breathing room
- Logo wordmark simplified to just "dm" monogram + "digitalmitra" in clean sans
- Search becomes a compact pill that expands on click (like Spotlight)
- Right side: just avatar circle (logged in) or single "Join" button (logged out)
- Remove the separate Forms icon from navbar (move to profile dropdown or sidebar)
- Add a floating "+" FAB (floating action button) on mobile for creating posts

### 4. Home Feed -- Content-First Cards

Current: Reddit-style dense cards with vote buttons inline.

New design:
- **Remove the duplicate search bar** on the home page (navbar search is enough)
- Category tabs become **pill chips** with emoji icons in a horizontally scrollable row -- more playful and tappable
- Sort controls collapse into a single dropdown button ("Hot" with chevron) instead of 3 separate buttons
- Post cards get a complete redesign:
  - Larger title text (17px semibold) with more vertical padding
  - Body preview gets 2 lines max with a gradient fade-out instead of hard truncation
  - Vote buttons move to the left gutter (vertical strip) on desktop, stay horizontal on mobile
  - Metadata (category, time, author) becomes a single subtle line with dot separators
  - Flair badges get category-specific colors (not all red)
  - On hover: card lifts slightly with a soft shadow + border brightens
  - Pinned posts get a subtle top-edge gradient highlight instead of a text label
- **Remove the sidebar entirely on desktop** -- move leaderboard and communities into the feed as inline cards (every 5th position) or into a collapsible sheet. This makes the layout single-column and focused, like Twitter/Threads.
- Add a "Welcome" hero section for logged-out users at the top of the feed with tagline and CTA

### 5. Post Detail Page -- Reading Experience

Current: Basic card with inline everything.

New design:
- Full-width content area (max-w-2xl) with generous padding
- Title rendered in Instrument Serif at 28px -- feels like reading a blog post
- Author line becomes a mini avatar + handle + time row
- Body text gets proper paragraph spacing (1.75 line-height) and rendered markdown
- Vote + action buttons become a **sticky bottom bar** on mobile (like Reddit app) and a **floating side pill** on desktop
- Comment input becomes a more inviting design -- rounded card with avatar and placeholder "Share your thoughts..."
- Comments get subtle left-border threading lines (like GitHub discussions) instead of just indentation
- Add smooth scroll-to-comments when clicking the comment count

### 6. Submit Page -- Guided Flow

Current: Wall of form fields.

New design:
- Step-by-step wizard flow:
  - Step 1: Pick community (large tappable cards with icons)
  - Step 2: Write content (clean editor with floating toolbar)
  - Step 3: Add metadata (flair, course code etc.)
- Progress indicator at top (3 dots)
- Title input becomes a large borderless "What's on your mind?" style input
- Body becomes a minimal editor with subtle formatting hints
- Submit button gets a satisfying micro-animation on success

### 7. Auth Page -- Welcoming Entry

Current: Basic card form.

New design:
- Split layout on desktop: left side has brand illustration/gradient mesh + tagline, right side has the form
- On mobile: full-screen form with gradient background peek at top
- OTP input slots get a subtle bounce animation when each digit is entered
- Step transitions use smooth crossfade animations
- Add a progress stepper showing "Email > Verify > Password" for signup flow

### 8. Profile Page -- Personal Dashboard

Current: Basic info card.

New design:
- Activity streak / contribution graph (like GitHub's green squares) showing posting activity
- Stats become large, bold metric cards with subtle background patterns
- Add "Your Posts" tab showing user's own submissions
- The sign out button moves to a settings gear icon

### 9. Micro-interactions and Polish

- Page transitions: fade-in with 200ms ease-out on route changes using framer-motion (already installed)
- Skeleton loading states instead of a spinner -- show card-shaped placeholders that shimmer
- Toast notifications get custom styling to match the theme
- Scroll-based navbar: slightly shrinks/blurs on scroll for more content space
- Vote button: satisfying scale bounce on click
- Card hover: subtle translateY(-2px) with shadow expansion

### 10. Mobile Excellence

- Bottom tab navigation (Home, Search, Create, Leaderboard, Profile) replaces the hamburger menu
- Swipe gestures on post cards (swipe right to upvote, left to save)
- Pull-to-refresh on feed
- Haptic-feeling button press animations

---

## Technical Implementation Plan

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/layout/BottomNav.tsx` | Mobile bottom tab navigation |
| `src/components/layout/PageTransition.tsx` | Framer-motion route transition wrapper |
| `src/components/feed/PostCardNew.tsx` | Redesigned post card component |
| `src/components/feed/FeedWelcome.tsx` | Hero section for logged-out users |
| `src/components/feed/InlineCommunityCard.tsx` | Community card that appears inline in feed |
| `src/components/ui/skeleton-card.tsx` | Shimmer loading skeleton for post cards |

### Files to Modify
| File | Changes |
|------|---------|
| `src/index.css` | New color tokens, typography imports (Inter + Instrument Serif), glass effects, animation utilities |
| `tailwind.config.ts` | Updated font families, new animation keyframes (shimmer, lift, bounce), extended shadows |
| `src/components/layout/Navbar.tsx` | Simplified header, expandable search, cleaner right side |
| `src/components/layout/AppLayout.tsx` | Add PageTransition wrapper, bottom nav for mobile |
| `src/pages/Home.tsx` | Single-column layout, new category pills, inline cards, welcome hero |
| `src/pages/PostDetail.tsx` | Reading-optimized layout, sticky action bar, threaded comments |
| `src/pages/Submit.tsx` | Step-by-step wizard flow |
| `src/pages/Auth.tsx` | Split layout, animated step transitions |
| `src/pages/Profile.tsx` | Dashboard-style layout with activity |
| `src/components/feed/PostCard.tsx` | Redesigned card with hover lift, gradient preview, refined typography |
| `src/components/feed/CategoryTabs.tsx` | Pill chips with emojis |
| `src/components/feed/SortBar.tsx` | Collapse to dropdown |
| `src/components/feed/VoteButtons.tsx` | Bounce animation, refined styling |
| `src/components/feed/CommentItem.tsx` | Thread lines, refined spacing |
| `src/components/feed/LeaderboardWidget.tsx` | Inline card variant for feed |

### Key Design Tokens (CSS Variables)
```
--background: 240 6% 7%         (deeper, warmer dark)
--card: 240 5% 10%              (slightly elevated)
--card-hover: 240 5% 12%        (hover state)
--surface: 240 5% 9%            (in-between layer)
--border: 240 5% 14%            (subtler borders)
--muted-foreground: 240 5% 45%  (softer muted text)
--foreground: 240 5% 93%        (warmer white)
--primary: 4 80% 56%            (IIMB red stays)
--primary-gradient: linear-gradient(135deg, hsl(4 80% 56%), hsl(25 90% 55%))
```

### Animation Additions
```
shimmer: background position slide for skeleton loading
card-lift: translateY(-2px) + shadow expansion
vote-bounce: scale(1.2) then back to 1
fade-up: opacity 0 > 1 + translateY(8px > 0)
```

---

## What This Achieves

- **Delight**: Micro-animations and polish make every interaction feel responsive and alive
- **Focus**: Single-column layout eliminates sidebar distraction, puts content front and center
- **Identity**: Serif headings + refined dark theme create a distinctive, premium feel unlike any other student platform
- **Accessibility**: Larger touch targets, better contrast, clearer hierarchy
- **Mobile-first**: Bottom nav, swipe gestures, and responsive layouts make mobile the primary experience

