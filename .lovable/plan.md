

# Comprehensive Fix Plan: 30 Issues Identified and Resolved

## ROOT CAUSE: Supabase Client Not Making Any Network Requests

The #1 blocker is that **zero fetch/XHR requests** are being made from the browser to Supabase. The database has 15 approved posts and 7 comments, the backend works (verified via edge function test), but the Supabase JS client in the browser is completely silent -- no auth session checks, no data queries, no post submissions. Everything downstream (empty feed, broken posting, broken voting) stems from this.

The most likely cause: React Query's `networkMode` default combined with how the browser sandbox handles `navigator.onLine`. Even though `networkMode: 'always'` was added to `QueryClient` defaults, it doesn't apply to direct Supabase calls (like `auth.getSession()`, `auth.signInWithPassword()`, or `supabase.from().insert()`). Additionally, each individual `useQuery` call needs `networkMode: 'always'` explicitly as a belt-and-suspenders fix.

---

## All 30 Issues (Grouped by Priority)

### CRITICAL: App-Breaking (Issues 1-6)

1. **Feed shows infinite spinner -- usePosts query never fires**
   - `usePosts` needs `networkMode: 'always'` directly on its `useQuery` call
   - File: `src/hooks/usePosts.ts`

2. **Post detail page shows infinite spinner -- usePost query never fires**
   - Same fix needed for `usePost`
   - File: `src/hooks/usePosts.ts`

3. **Comments never load -- useComments query never fires**
   - Same fix needed for `useComments`
   - File: `src/hooks/useComments.ts`

4. **Leaderboard query never fires**
   - Same fix needed for leaderboard `useQuery`
   - File: `src/components/feed/LeaderboardWidget.tsx`

5. **Submit page "Post" button hangs forever on "Posting..."**
   - `supabase.auth.getSession()` hangs (never resolves), so `setLoading(false)` never runs
   - Fix: Add timeout/error handling, and also wrap auth check with try-catch + fallback
   - File: `src/pages/Submit.tsx`

6. **Auth page login/signup may hang silently**
   - Same issue: `supabase.auth.signInWithPassword()` and `signUp()` can hang
   - Fix: Add timeout handling
   - File: `src/pages/Auth.tsx`

### HIGH: Major Functionality Broken (Issues 7-14)

7. **No error states anywhere -- infinite spinners instead of error messages**
   - Home, PostDetail, Subreddit pages all show spinner forever on failure
   - Fix: Add `isError` + retry button to all pages
   - Files: `src/pages/Home.tsx`, `src/pages/PostDetail.tsx`, `src/pages/Subreddit.tsx`

8. **QueryClient missing mutation networkMode**
   - `defaultOptions` only covers `queries`, not `mutations`
   - Fix: Add `mutations: { networkMode: 'always' }` to QueryClient
   - File: `src/App.tsx`

9. **Auth restricts to @iimb.ac.in emails only -- can't test**
   - `validateEmail()` blocks all non-IIMB emails
   - Fix: Remove restriction or make it a soft warning
   - File: `src/pages/Auth.tsx`

10. **Submit body labeled "optional" but validated as required**
    - Form validation checks `!body` but placeholder says "Text (optional)"
    - Fix: Make body truly optional by removing from validation
    - File: `src/pages/Submit.tsx`

11. **usePost uses `.single()` which throws on no results**
    - Should use `.maybeSingle()` to gracefully handle missing posts
    - File: `src/hooks/usePosts.ts`

12. **VoteButtons double-counts: local state + parent hook both adjust score**
    - `VoteButtons` manages its own `localScore` state AND the parent `useVote` hook manages `score`. Both adjust on click, causing the score to jump by 2 instead of 1
    - Fix: Remove local score management from VoteButtons, just use props
    - File: `src/components/feed/VoteButtons.tsx`

13. **Mobile search in Navbar doesn't work**
    - Mobile search input has no `onKeyDown` handler (desktop one does)
    - File: `src/components/layout/Navbar.tsx`

14. **Home page doesn't read `?q=` search param from URL**
    - Navbar search navigates to `/?q=...` but Home doesn't read `searchParams`
    - File: `src/pages/Home.tsx`

### MEDIUM: UX/Data Issues (Issues 15-22)

15. **No password reset flow**
    - No "Forgot Password" link on auth page, no `/reset-password` route
    - Files: `src/pages/Auth.tsx`, new `src/pages/ResetPassword.tsx`, `src/App.tsx`

16. **"Save" button is purely cosmetic -- no persistence**
    - Save state resets on page refresh; not stored anywhere
    - Low priority: Just make it honest (show toast saying "Coming soon") or remove

17. **Comment sort buttons (best/new/top) are cosmetic -- no actual sorting**
    - PostDetail has `commentSort` state but never uses it to sort comments
    - File: `src/pages/PostDetail.tsx`

18. **"More" button (...) on posts and comments does nothing**
    - No dropdown menu, no click handler
    - Files: `src/components/feed/PostCard.tsx`, `src/components/feed/CommentItem.tsx`

19. **Bell notification button does nothing**
    - No notification system, just an empty button
    - File: `src/components/layout/Navbar.tsx`

20. **Image and Link buttons in Submit toolbar do nothing**
    - No image upload or link insertion functionality
    - File: `src/pages/Submit.tsx`

21. **Profile page has no post history**
    - Just shows stats; no list of user's own posts
    - File: `src/pages/Profile.tsx`

22. **Profile batch/section fields are always empty -- no way to edit**
    - No edit profile functionality
    - File: `src/pages/Profile.tsx`

### LOW: Polish/Cleanup (Issues 23-30)

23. **AuthContext race condition: `getSession` and `onAuthStateChange` both fire**
    - Can cause double profile fetches and potential state conflicts
    - Fix: Only use `onAuthStateChange` as source of truth, remove manual `getSession` call
    - File: `src/contexts/AuthContext.tsx`

24. **CreditsPrompt has broken math: `5 - freeViewsRemaining > 5 ? 5 : 5`**
    - Always evaluates to `5` regardless; pointless ternary
    - File: `src/components/feed/CreditsPrompt.tsx`

25. **Mock data in `mock-data.ts` still uses `mock-*` IDs that don't exist in DB**
    - Frontend doesn't use mock data anymore (queries DB), but file is still imported for `CATEGORIES`, `FLAIRS`, `timeAgo`
    - The mock posts/comments are dead code

26. **`generateAnonHandle` ignores the `_salt` parameter**
    - The salt parameter was designed for per-context anonymity but is unused
    - File: `src/lib/anonymity.ts`

27. **No loading skeleton for post cards -- just a spinner**
    - Would look much better with skeleton cards
    - Files: `src/pages/Home.tsx`, `src/pages/Subreddit.tsx`

28. **Subreddit page community "not found" for valid communities beyond the 5 hardcoded**
    - `SUBREDDIT_INFO` only has 5 entries; any other category shows "not found"
    - File: `src/pages/Subreddit.tsx`

29. **No dark/light mode toggle despite `next-themes` being installed**
    - Theme system is installed but never exposed to users

30. **`college_name` missing from Post interface (already has it -- verified)**
    - Actually this is fine; keeping as a verification note

---

## Implementation Plan (Prioritized)

### Phase 1: Fix the Supabase Client (Fixes 1-6, 8)

**Step 1: Add `networkMode: 'always'` to every query hook**
- `src/hooks/usePosts.ts`: Add to both `usePosts` and `usePost`; change `.single()` to `.maybeSingle()` (Issue 11)
- `src/hooks/useComments.ts`: Add to `useComments`
- `src/components/feed/LeaderboardWidget.tsx`: Add to leaderboard query
- `src/App.tsx`: Add `mutations: { networkMode: 'always' }` to QueryClient defaults

**Step 2: Add error handling to Submit page**
- `src/pages/Submit.tsx`: Wrap `getSession()` in try-catch with timeout, make body optional

**Step 3: Fix Auth page**
- `src/pages/Auth.tsx`: Remove `@iimb.ac.in` email restriction, add error handling

### Phase 2: Fix UI/UX Issues (Fixes 7, 12-14)

**Step 4: Add error states to all feed pages**
- `src/pages/Home.tsx`: Add `isError` + retry UI; read `?q=` from URL
- `src/pages/PostDetail.tsx`: Add error state
- `src/pages/Subreddit.tsx`: Add error state

**Step 5: Fix VoteButtons double-counting**
- `src/components/feed/VoteButtons.tsx`: Remove internal score/vote state management, just render from props

**Step 6: Fix mobile search**
- `src/components/layout/Navbar.tsx`: Add `onKeyDown` to mobile search input

### Phase 3: Polish (Fixes 15-24)

**Step 7: Fix comment sorting**
- `src/pages/PostDetail.tsx`: Apply sort to comments array

**Step 8: Fix misc issues**
- `src/components/feed/CreditsPrompt.tsx`: Fix broken math
- `src/contexts/AuthContext.tsx`: Fix race condition
- Remove or disable non-functional buttons (bell, more, image/link in submit) with "Coming soon" toasts

---

## Technical Details

### Query hook fix pattern (Step 1):
```typescript
export function usePosts(category, sort, search) {
  return useQuery({
    queryKey: ["posts", category, sort, search],
    networkMode: 'always',
    retry: 2,
    queryFn: async () => { /* existing */ },
  });
}
```

### Error state pattern (Step 4):
```typescript
const { data: posts = [], isLoading, isError, refetch } = usePosts(category, sort, search);
// In JSX:
{isError ? (
  <div className="text-center py-16 bg-card border border-border rounded-lg">
    <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
    <p className="text-xs text-muted-foreground mb-3">Could not load posts</p>
    <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-full">
      Try Again
    </Button>
  </div>
) : isLoading ? (/* spinner */) : (/* posts */)}
```

### VoteButtons fix (Step 5):
```typescript
// Remove all internal state. Just render score and userVote from props directly.
// Let the parent useVote hook be the single source of truth.
export default function VoteButtons({ score, userVote, onUpvote, onDownvote, size, horizontal }) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  // No localVote, no localScore, no useEffect sync
  const handleUpvote = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    onUpvote();
  };
  // ... render score directly, color based on userVote
}
```

### Submit fix (Step 2):
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!category || !title) { // body is now optional
    toast.error("Please select a community and add a title");
    return;
  }
  setLoading(true);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to create a post");
      navigate("/auth");
      return;
    }
    // ... insert post
  } catch (error) {
    toast.error(error.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};
```

### Home page search param reading (Step 4):
```typescript
const [searchParams] = useSearchParams();
const urlSearch = searchParams.get("q") || "";
// Initialize search state from URL
const [search, setSearch] = useState(urlSearch);
useEffect(() => { setSearch(urlSearch); }, [urlSearch]);
```

