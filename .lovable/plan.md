
# Comprehensive Bug Fix Plan

## Issues Found

### 1. CRITICAL: Post feed stuck on infinite loading spinner
The `usePosts` React Query hook may hang due to React Query v5's default `networkMode: 'online'` behavior, which pauses queries if `navigator.onLine` is `false`. Additionally, there is no error handling -- if the query silently fails, the spinner shows forever. Fix by adding `networkMode: 'always'` to the QueryClient defaults and adding error boundaries/retry limits.

### 2. Dead import in Home.tsx
`useVote` is imported on line 13 but never used. While not a runtime error, it adds unnecessary bundle weight and confusion.

### 3. Comment voting is non-functional
In `CommentItem.tsx`, the `VoteButtons` component receives `onUpvote={() => {}}` and `onDownvote={() => {}}` -- empty no-op functions. Votes on comments do nothing. Need to integrate the `useVote` hook for comments.

### 4. Missing `file_url` in Post interface
The `Post` interface in `usePosts.ts` is missing the `file_url` field that exists in the database, causing a type mismatch.

### 5. Profile page route missing
The navbar links to `/profile` but no route or page exists for it, resulting in a 404.

---

## Implementation Plan

### Step 1: Fix QueryClient configuration to prevent hanging queries
**File: `src/App.tsx`**
- Configure `QueryClient` with `defaultOptions` that include `networkMode: 'always'` and reasonable `retry: 2` / `staleTime` settings
- This ensures queries fire regardless of `navigator.onLine` and don't silently hang

### Step 2: Remove dead import from Home.tsx
**File: `src/pages/Home.tsx`**
- Remove unused `useVote` import on line 13

### Step 3: Fix comment voting
**File: `src/components/feed/CommentItem.tsx`**
- Import and integrate `useVote` hook with `targetType: "comment"` and `targetId: comment.id`
- Wire `VoteButtons` `onUpvote` and `onDownvote` to the `vote` function
- Call `loadVote()` on mount via `useEffect`

### Step 4: Add `file_url` to Post interface
**File: `src/hooks/usePosts.ts`**
- Add `file_url: string | null;` to the `Post` interface

### Step 5: Create Profile page
**Files: `src/pages/Profile.tsx` (new), `src/App.tsx`**
- Create a basic profile page showing: user name, anonymous handle, karma/credits, founding contributor badge, batch/section info
- Add the `/profile` route to App.tsx
- Gate behind authentication (redirect to /auth if not logged in)

---

## Technical Details

**QueryClient fix (Step 1):**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Comment voting fix (Step 3):**
```typescript
const { score, userVote, vote, loadVote } = useVote(comment.id, "comment", initialScore);
useEffect(() => { loadVote(); }, [loadVote]);
// ...
<VoteButtons score={score} userVote={userVote} onUpvote={() => vote(1)} onDownvote={() => vote(-1)} size="sm" horizontal />
```

**Profile page (Step 5):**
- Shows profile card with avatar initials, name, anonymous handle
- Displays credits, founding contributor badge, batch/section
- Logout button
- Protected route requiring authentication
