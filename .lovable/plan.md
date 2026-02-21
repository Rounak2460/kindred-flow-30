

# Elegant Section Icons, Dark Default Theme, Enhanced Quick Action Cards & New Logo

## 1. Default to Dark Theme

Change `ThemeProvider` in `App.tsx` from `defaultTheme="light"` to `defaultTheme="dark"`. On first visit, users see the dark UI. The existing sun/moon toggle in the navbar lets them switch anytime.

## 2. Redesigned Quick Action Cards (Larger, with One-liners)

The current cards are small and text-only. Redesign `QuickActionCard` to be:

- **Larger**: taller padding (p-5), with a prominent icon area
- **2-column grid on mobile, 3-column on desktop** (instead of 5-column which makes them too cramped)
- **Elegant icon**: Each section gets a styled Lucide icon inside a soft-colored circular container (not emojis)
- **One-liner subtitle**: A short descriptive phrase under each title (e.g., "Courses" -> "Peer-rated reviews", "Exchange" -> "Global diaries")
- **Count badge**: Small pill showing the count
- **"+" button** remains always visible in the corner

Card data in `Home.tsx` updated to include `icon` (Lucide component) and `subtitle` (one-liner string) for each section.

### Icon + Color Assignments

| Section | Lucide Icon | Accent Color | One-liner |
|---------|------------|-------------|-----------|
| Courses | `GraduationCap` | `text-blue-500 bg-blue-500/10` | Peer-rated reviews |
| Exchange | `Globe` | `text-emerald-500 bg-emerald-500/10` | Global diaries |
| Internships | `Briefcase` | `text-amber-500 bg-amber-500/10` | Company intel |
| Papers | `FileText` | `text-violet-500 bg-violet-500/10` | Past exam papers |
| Campus | `MapPin` | `text-rose-500 bg-rose-500/10` | Survival guide |

## 3. Elite Section Icons Across Pages

Add matching Lucide icons to each section page header (Academics, Exchange, Internships, ExamPapers, CampusLife) -- displayed as a small icon next to the h1 title, using the same color scheme as the quick action cards. Also update the `ExploreSheet` to use matching colored icon containers instead of plain gray.

## 4. New SVG Logo

Generate a new logo using the AI image generation edge function. The logo will be a modern, minimal "DM" monogram -- clean geometric letterforms in the IIMB red accent color on a transparent/dark background. This replaces the current `digitalmitra-logo.png` in the navbar, auth page, and feed welcome.

Since AI image generation requires an edge function, I'll instead create an elegant **SVG logo component** directly in code -- a clean "DM" monogram rendered as an inline SVG. This is sharper at all sizes, works perfectly in dark/light mode, and loads instantly (no image file needed).

## 5. Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | `defaultTheme="dark"` |
| `src/components/home/QuickActionCard.tsx` | Larger card with icon, subtitle, accent color |
| `src/pages/Home.tsx` | Update quickActions array with icons, subtitles, colors; 2-col/3-col grid |
| `src/components/layout/Navbar.tsx` | Replace img logo with SVG DM monogram component |
| `src/components/feed/FeedWelcome.tsx` | Replace img logo with SVG monogram |
| `src/pages/Auth.tsx` | Replace img logo with SVG monogram |
| `src/components/layout/ExploreSheet.tsx` | Colored icon containers matching section colors |
| `src/pages/Academics.tsx` | Add GraduationCap icon to header |
| `src/pages/Exchange.tsx` | Add Globe icon to header |
| `src/pages/Internships.tsx` | Add Briefcase icon to header |
| `src/pages/ExamPapers.tsx` | Add FileText icon to header |
| `src/pages/CampusLife.tsx` | Add MapPin icon to header |

### New File

| File | Purpose |
|------|---------|
| `src/components/DMlogo.tsx` | SVG monogram component -- a clean "DM" in a rounded square, using primary color, adaptable to any size |

