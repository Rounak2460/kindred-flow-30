

# Profile Editing + Gossip Central Section

## Overview

Two major features to add:

1. **Editable Profile** -- Let users personalize their profile by editing name, batch, section, and bio
2. **Gossip Central** -- A voluntary, anonymous gossip section with extra-stringent moderation

---

## Part 1: Editable Profile

### What Changes

Add an "Edit Profile" mode to the existing Profile page where users can update their personal information. The profiles table already supports `name`, `batch`, `section` via RLS UPDATE policy (`auth.uid() = user_id`), so no database migration is needed for basic fields.

**However**, we need to add a `bio` column to the `profiles` table so users can write a short personal description.

### Database Migration

```sql
ALTER TABLE public.profiles ADD COLUMN bio text NOT NULL DEFAULT '';
```

### Profile Page Changes (`src/pages/Profile.tsx`)

- Add an "Edit" button (pencil icon) next to the profile header
- When editing, fields become editable inputs: name, batch, section, bio
- Save button calls `supabase.from("profiles").update(...)` with the new values
- After save, call `refreshProfile()` from AuthContext to sync state
- Bio displays below the name/handle when not editing
- Batch and section become editable text inputs
- Add a subtle character limit indicator for bio (160 chars max)

### AuthContext Update (`src/contexts/AuthContext.tsx`)

- Add `bio` to the Profile interface and fetchProfile select query

---

## Part 2: Gossip Central

### Concept

A separate, voluntary anonymous discussion space with:
- **Opt-in only**: Users must explicitly join Gossip Central from a dedicated page
- **Maximum anonymity**: Handles rotate per-post (unlike main feed where handles are consistent per user). No user identity is ever revealed.
- **Stringent moderation**: Enhanced AI moderation prompt based on IIMB media policy and civic decency -- stricter than the main feed

### Database Changes

**1. Add `gossip_member` column to profiles:**

```sql
ALTER TABLE public.profiles ADD COLUMN gossip_member boolean NOT NULL DEFAULT false;
```

**2. Create `gossip_posts` table:**

```sql
CREATE TABLE public.gossip_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  body text NOT NULL,
  upvote_count integer NOT NULL DEFAULT 0,
  downvote_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  moderation_status text NOT NULL DEFAULT 'pending',
  moderation_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gossip_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved gossip
CREATE POLICY "Anyone can read gossip" ON public.gossip_posts
  FOR SELECT USING (true);

-- Authenticated gossip members can post
CREATE POLICY "Members can create gossip" ON public.gossip_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete own gossip
CREATE POLICY "Users can delete own gossip" ON public.gossip_posts
  FOR DELETE USING (auth.uid() = user_id);
```

**3. Create `gossip_comments` table:**

```sql
CREATE TABLE public.gossip_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gossip_id uuid NOT NULL REFERENCES public.gossip_posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.gossip_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL,
  upvote_count integer NOT NULL DEFAULT 0,
  downvote_count integer NOT NULL DEFAULT 0,
  moderation_status text NOT NULL DEFAULT 'pending',
  moderation_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gossip_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gossip comments" ON public.gossip_comments
  FOR SELECT USING (true);

CREATE POLICY "Members can comment on gossip" ON public.gossip_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gossip comments" ON public.gossip_comments
  FOR DELETE USING (auth.uid() = user_id);
```

### New Files

| File | Purpose |
|------|---------|
| `src/pages/Gossip.tsx` | Gossip Central main page with opt-in gate, feed, and post creation |
| `src/hooks/useGossip.ts` | React Query hooks for gossip posts and comments |
| `supabase/functions/moderate-gossip/index.ts` | Stricter moderation edge function for gossip content |

### Gossip Page (`src/pages/Gossip.tsx`)

- **Gate screen**: If user is not a gossip member, show an onboarding card explaining the rules (anonymity, strict moderation, IIMB media policy compliance), with a "Join Gossip Central" button that sets `gossip_member = true` on their profile
- **Feed**: Simple anonymous posts (no titles, just body text -- like a confessions page). Each post shows a randomly generated handle (different per post, not tied to user identity)
- **Post creation**: Inline text input at the top of the feed -- "What's the tea?" placeholder
- **Comments**: Threaded comments, also fully anonymous with rotating handles
- **Design**: Distinct visual identity -- slightly different accent color (purple/violet tint) to differentiate from the main feed

### Gossip Moderation (`supabase/functions/moderate-gossip/index.ts`)

Enhanced moderation prompt that adds IIMB-specific media policy rules:

- No identifying information about any individual (even first names with context)
- No unverified rumors about faculty, staff, or specific students
- No content that could constitute defamation under Indian law
- No content targeting protected characteristics
- No sharing of private conversations, screenshots, or confidential information
- No content that could damage IIMB's institutional reputation with false claims
- Stricter threshold: reject on lower confidence (if confidence < 0.7, reject)

### Routing Changes (`src/App.tsx`)

- Add `/gossip` route inside AppLayout

### Navigation Updates

- Add "Gossip" option to the category tabs or as a separate nav item
- Add gossip icon to BottomNav (replace "Top/Leaderboard" with "Gossip" or add as 6th item)

### Anonymity for Gossip (`src/lib/anonymity.ts`)

- Add a `generateGossipHandle(userId, postId)` function that uses BOTH userId AND postId as salt, so the same user gets different handles on different posts -- true anonymity within the gossip section

---

## Implementation Order

1. Database migration (add `bio` to profiles, create gossip tables)
2. Update AuthContext to include `bio`
3. Build editable Profile page
4. Create gossip moderation edge function
5. Build gossip hooks and page
6. Update routing and navigation
7. Test end-to-end

---

## Technical Notes

- Gossip posts intentionally have NO title field -- just body text, keeping it casual and confession-style
- The `user_id` is stored in `gossip_posts` for RLS/deletion purposes but is NEVER exposed to the client in queries (the select statement will exclude it or the UI will never display it)
- Vote functionality on gossip uses the existing `votes` table with `target_type = 'gossip_post'` or `'gossip_comment'`
- The gossip moderation function is separate from the main one to allow independent prompt tuning without affecting main feed moderation

