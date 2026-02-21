

# Comprehensive UI/UX Overhaul -- Final Professional Version

## Logo Fix

The current `DMLogo.tsx` uses a single combined image (`dm-logo.png`) with `object-position` to show light/dark variants. This approach is fragile and the current asset appears broken. The user has now provided **two separate logo images** (light and dark).

**Fix:**
- Copy `user-uploads://image-2.png` to `src/assets/dm-logo-light.png` (crimson DM on white -- for light theme)
- Copy `user-uploads://image-3.png` to `src/assets/dm-logo-dark.png` (white DM on dark -- for dark theme)
- Rewrite `DMLogo.tsx` to import both images and conditionally render based on `resolvedTheme`
- Remove the old `object-position` hack entirely

## Search: Inline Dropdown Instead of Separate Dialog

The user reports the search "opens elsewhere not in same bar." Currently `AISearchDialog` opens as a floating modal at `top-[12vh]`. The fix is to anchor results directly below the search bar in the Navbar as a dropdown.

**Fix:**
- Convert the Navbar search button into an expandable inline input
- Show search results as a dropdown anchored directly below the search bar (not a floating dialog)
- Keep the same two-tier search logic (instant DB + AI deep search)
- On mobile, keep the full-screen approach but position it from the top bar

## Identified UI/UX Problems and Fixes

### Dark-Mode Color Issues (Critical)

1. **PostCard flair colors are light-mode only** -- `bg-blue-50 text-blue-700 border-blue-200` etc. appear washed out or invisible in dark mode
   - Fix: Change to opacity-based colors: `bg-blue-500/10 text-blue-400 border-blue-500/20`

2. **CreditsPrompt uses `font-bold`** instead of project standard `font-semibold`
   - Fix: Change to `font-semibold`

3. **Subreddit page uses `rounded-lg`** instead of project standard `rounded-xl`
   - Fix: Standardize all card borders to `rounded-xl`

4. **Subreddit page uses `max-w-5xl`** which breaks the narrow-feed layout
   - Fix: Change to `max-w-2xl` to match the rest of the app

### Typography and Spacing

5. **NotFound page has `min-h-screen`** which conflicts with AppLayout's own min-h-screen, causing double viewport
   - Fix: Remove `min-h-screen`, use padding instead

6. **NotFound page uses `bg-muted`** background which clashes with AppLayout's `bg-background`
   - Fix: Remove the background, use transparent

7. **AuthGuardDialog says "Only @iimb.ac.in" but Auth page accepts @gmail.com too**
   - Fix: Update the copy to "IIMB or affiliated email"

8. **PostCard body strip removes markdown characters crudely** with regex `/[*#_]/g` which strips underscores from normal text
   - Fix: Use a more targeted regex that only strips markdown formatting sequences

### Component Consistency

9. **FilterPills use `rounded-full`** while CategoryTabs use `rounded-lg`
   - Fix: Standardize FilterPills to `rounded-lg`

10. **SortBar uses `rounded-full`** while everything else uses `rounded-lg`
    - Fix: Change to `rounded-lg`

11. **BottomNav has a "Built by Ronnie T" text** taking space in the navigation area -- looks unprofessional
    - Fix: Remove from BottomNav (it already exists in the desktop footer)

12. **BottomNav has unused `searchOpen` state** -- the search dialog in BottomNav is never triggered
    - Fix: Clean up the dead code

13. **QuickActionCard has nested `<button>` inside `<button>`** -- invalid HTML, causes accessibility issues
    - Fix: Change outer element to `<div>` with `onClick` and `role="button"`

### Search UX

14. **Search dialog backdrop `bg-foreground/20`** looks muddy in light mode
    - Fix: Use `bg-black/40` for consistent overlay

15. **Search dialog `showAIHint` is always true** (`instantResults.length >= 0` is always true)
    - Fix: Only show when there's a query AND results exist: `instantResults.length > 0`

16. **Search input placeholder too long on mobile** -- "Search posts, courses, companies..." truncates
    - Fix: Shorten to "Search..."

### Page-Level Issues

17. **Subreddit page sidebar only shows on `lg:` screens** but the main content area is `max-w-5xl` which looks stretched
    - Fix: With `max-w-2xl`, remove the sidebar entirely (it duplicates Home page info)

18. **Profile page `max-w-lg`** while rest of app is `max-w-2xl` -- inconsistent width
    - Fix: Change to `max-w-2xl` for consistency

19. **Home page's mobile FAB overlaps with BottomNav** -- `bottom-20` may not account for safe area
    - Fix: Adjust to `bottom-24` for safe clearance

20. **ExploreSheet grid is `grid-cols-1`** which wastes space
    - Fix: Keep as-is (it's a bottom sheet, single column is correct for touch targets)

### Interaction Issues

21. **PostCard entire card is wrapped in `<Link>`** but has nested `<button>` click handlers -- `e.stopPropagation` prevents link navigation sometimes
    - Fix: Keep but ensure all nested buttons properly stop propagation (already done)

22. **Theme toggle shows "Theme" text only on `sm:` screens** but the label is small and easy to miss
    - Fix: Always show icon, remove text label, keep the popover for selection

23. **Notification panel `max-h-96` is hardcoded** which may clip on small screens
    - Fix: Use `max-h-[calc(100vh-8rem)]` for responsive height

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/assets/dm-logo-light.png` | Light theme logo (crimson DM on white) |
| `src/assets/dm-logo-dark.png` | Dark theme logo (white DM on dark) |

## Files to Modify

| File | Key Changes |
|------|-------------|
| `src/components/DMLogo.tsx` | Use two separate logo images, conditional on theme |
| `src/components/layout/Navbar.tsx` | Inline search with dropdown results below the bar |
| `src/components/search/AISearchDialog.tsx` | Refactor to dropdown panel anchored to search bar |
| `src/components/feed/PostCard.tsx` | Dark-mode-safe flair colors |
| `src/components/layout/BottomNav.tsx` | Remove "Built by" text, remove dead search code |
| `src/components/feed/CreditsPrompt.tsx` | `font-bold` to `font-semibold` |
| `src/components/shared/FilterPills.tsx` | `rounded-full` to `rounded-lg` |
| `src/components/feed/SortBar.tsx` | `rounded-full` to `rounded-lg` |
| `src/pages/Subreddit.tsx` | `max-w-5xl` to `max-w-2xl`, remove sidebar, `rounded-lg` to `rounded-xl` |
| `src/pages/NotFound.tsx` | Remove `min-h-screen` and `bg-muted` |
| `src/pages/Profile.tsx` | `max-w-lg` to `max-w-2xl` |
| `src/pages/Home.tsx` | FAB `bottom-20` to `bottom-24` |
| `src/components/AuthGuardDialog.tsx` | Fix email domain copy |
| `src/components/NotificationPanel.tsx` | Responsive max-height |
| `src/components/home/QuickActionCard.tsx` | Fix nested button HTML |
| `src/components/ThemeToggle.tsx` | Remove "Theme" text label, keep clean icon |

## Technical Details

### DMLogo with two separate images

```typescript
import { useTheme } from "next-themes";
import logoLight from "@/assets/dm-logo-light.png";
import logoDark from "@/assets/dm-logo-dark.png";

export default function DMLogo({ size = 32, className = "" }: DMLogoProps) {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === "dark" ? logoDark : logoLight;
  return (
    <div className={className} style={{ width: size, height: size, flexShrink: 0 }}>
      <img src={src} alt="Digi Mitra" style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable={false} />
    </div>
  );
}
```

### Inline Search Dropdown

Instead of a fixed-position modal, the search will render as a positioned dropdown below the search input in the Navbar:

```typescript
// In Navbar.tsx - the search area becomes:
<div className="flex-1 flex justify-center relative" ref={searchContainerRef}>
  {searchOpen ? (
    <div className="relative w-full max-w-xs">
      <input autoFocus value={query} onChange={...} className="w-full ..." />
      {/* Dropdown anchored below */}
      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border bg-card shadow-elevated max-h-[60vh] overflow-y-auto z-50">
        {/* results here */}
      </div>
    </div>
  ) : (
    <button onClick={() => setSearchOpen(true)} className="...">Search...</button>
  )}
</div>
```

### Dark-mode-safe flair colors

Replace all hardcoded light-mode flair colors:
```typescript
const FLAIR_COLORS: Record<string, string> = {
  "Course Review": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Experience Diary": "bg-violet-500/10 text-violet-500 border-violet-500/20",
  "Company Review": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Interview Prep": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Question": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  "Food & Cafes": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Study Spots": "bg-teal-500/10 text-teal-500 border-teal-500/20",
  "End Term": "bg-rose-500/10 text-rose-500 border-rose-500/20",
  "Pro Tip": "bg-lime-500/10 text-lime-500 border-lime-500/20",
};
```

