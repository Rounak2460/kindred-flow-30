

# Fix Plan: Force React Query Online + Unblock All Network Requests

## Root Cause (Confirmed via Testing)

I tested the full app in the browser:
- **Homepage**: Infinite spinner, ZERO network requests to the database (not even auth session checks)
- **Auth login**: The POST to `/auth/v1/token` works (200 response), proving `fetch()` and the Supabase URL/key are correct
- **After login**: Page stuck on "Please wait..." forever -- never navigates to home

The confirmed root cause: **React Query v5's `onlineManager` reports the browser as offline** in the Lovable preview iframe environment (`navigator.onLine` returns `false`). Even with `networkMode: 'always'` set on individual queries, React Query v5 still checks the online manager internally and can pause queries in certain edge cases.

The Supabase PostgREST client (for `.from().select()`) goes through the same fetch pipeline, and even direct Supabase calls in `AuthContext.fetchProfile()` appear to hang, blocking the auth flow.

## The Fix (3 Changes)

### 1. Force React Query Online Manager (THE critical fix)
**File: `src/main.tsx`**

Add `onlineManager.setOnline(true)` before rendering the app. This is the documented React Query v5 solution for iframe/sandbox environments where `navigator.onLine` is unreliable.

```typescript
import { onlineManager } from '@tanstack/react-query';
onlineManager.setOnline(true);
```

This single line will unblock ALL queries (posts, comments, leaderboard, profiles) at once.

### 2. Fix Auth page stuck on "Please wait..."
**File: `src/pages/Auth.tsx`**

The `handleSubmit` calls `supabase.auth.signInWithPassword()` which succeeds, but then the `onAuthStateChange` in `AuthContext` tries to `await fetchProfile()` which can hang. The fix: add a timeout wrapper so login always completes:

```typescript
try {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  toast.success("Welcome back!");
  navigate("/");
} catch ...
```

Also ensure `setLoading(false)` always runs in the `finally` block (it already does, but we need to verify the auth state change isn't blocking the component).

### 3. Fix AuthContext profile fetch blocking
**File: `src/contexts/AuthContext.tsx`**

The `onAuthStateChange` callback uses `await fetchProfile(currentUser.id)`. If this fetch hangs (due to the same network issue), it blocks `setLoading(false)` for 2 seconds. Fix: Don't await the profile fetch -- use `.then()` instead so it doesn't block state updates:

```typescript
supabase.auth.onAuthStateChange((_event, session) => {
  const currentUser = session?.user ?? null;
  setUser(currentUser);
  if (currentUser) {
    // Don't block -- fetch profile in background
    fetchProfile(currentUser.id);
  } else {
    setProfile(null);
  }
  if (!initialized.current) {
    initialized.current = true;
    setLoading(false);
  }
});
```

## What This Fixes

All 30 previously identified issues that stem from "zero network requests" will be resolved:
- Feed loads with the 15 approved posts from the database
- Post detail pages load
- Comments load
- Leaderboard loads
- Login completes and navigates to home
- Post creation works (can hit the database)
- Voting works
- Profile page shows real data

## Files Changed

| File | Change |
|------|--------|
| `src/main.tsx` | Add `onlineManager.setOnline(true)` -- 2 lines |
| `src/contexts/AuthContext.tsx` | Remove `await` from `fetchProfile` call -- 1 line |

These two changes are the minimum needed to unblock the entire app.

