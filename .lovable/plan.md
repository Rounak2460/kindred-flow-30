

# Logo Redesign, IIMB Branding & Search Overhaul

## 1. Elegant New DM Logo

Replace the crude SVG monogram with a modern, designer-quality logo:

- **Design**: A refined squircle container with a subtle gradient (not flat fill). The "D" letterform is stylized as a geometric half-circle + vertical bar, and the "M" uses clean angular strokes with optical kerning. Remove the random underline bar.
- **Color**: Uses CSS `primary` color with a subtle lighter gradient stop for depth. Works in both dark and light themes.
- **File**: Rewrite `src/components/DMLogo.tsx`

## 2. IIMB Institutional Identity

- **Navbar** (`Navbar.tsx`): Add a small "IIMB" badge/pill next to "Digi Mitra" text
- **Auth page** (`Auth.tsx`): Add "An IIM Bangalore student platform" subtitle under logo
- **FeedWelcome** (`FeedWelcome.tsx`): Keep and refine the existing "IIM Bangalore" label

## 3. Search Overhaul -- Two-Tier Approach

The current search has critical problems:
- Words under 3 characters are ignored (`filter(w => w.length > 2)`), so "Macro" as a single 5-letter word works but partial typing like "Ma" gets no candidates
- Every keystroke triggers an expensive AI edge function call (350ms debounce is too short)
- Searching "Macro" returns empty because the ILIKE filter requires exact case-insensitive substring but doesn't do fuzzy matching

### New architecture: Instant DB search + optional AI refinement

**Tier 1 -- Instant local search (new):** Query the database directly from the client using Supabase `.ilike()` with no minimum character length. This returns results instantly as you type with a 200ms debounce. No AI involved -- pure database substring matching.

**Tier 2 -- AI deep search (on demand):** Keep the AI edge function but only trigger it when the user explicitly presses Enter or clicks a "Deep search" button, or after 1.5 seconds of no typing. This handles semantic queries like "best marketing electives."

### Changes:

**`src/hooks/useAISearch.ts`** -- Rename to `src/hooks/useSearch.ts` with two modes:
- `instantSearch(query)`: Direct Supabase `.or()` ilike query on posts table, returns matches instantly. No minimum word length -- even "M" will match. Uses `.ilike` across title, body, course_code, course_name, company_name, college_name.
- `deepSearch(query)`: The existing AI edge function call for semantic ranking.

**`src/components/search/AISearchDialog.tsx`** -- Complete redesign:
- Cleaner, more polished UI with proper dark-mode colors (current category colors are light-mode-only `bg-blue-50 text-blue-700`)
- Type to see instant results (Tier 1). Results appear immediately.
- Show a subtle "AI refine" button or auto-trigger AI after 1.5s idle
- Better empty state and loading states
- Fix category pill colors to dark-mode-safe (`bg-blue-500/10 text-blue-400`)

**`supabase/functions/ai-search/index.ts`** -- Fix the keyword filter:
- Remove the `w.length > 2` filter so short words still match
- Add trigram/prefix matching: use `ilike.%${k}%` for all keywords regardless of length

## 4. Files to Modify

| File | Changes |
|------|---------|
| `src/components/DMLogo.tsx` | Complete redesign -- premium gradient squircle with refined DM letterforms |
| `src/components/layout/Navbar.tsx` | Add IIMB badge, keep logo swap |
| `src/pages/Auth.tsx` | Add "An IIM Bangalore student platform" subtitle |
| `src/components/feed/FeedWelcome.tsx` | Refine IIMB label styling |
| `src/hooks/useAISearch.ts` | Add instant DB search tier alongside AI search |
| `src/components/search/AISearchDialog.tsx` | Two-tier search UI, dark-mode-safe colors, faster UX |
| `supabase/functions/ai-search/index.ts` | Remove `length > 2` filter, improve keyword matching |

## Technical Details

### Instant search query (client-side)

```typescript
const { data } = await supabase
  .from("posts")
  .select("id, title, category, flair, course_code, course_name, company_name, college_name, created_at, upvote_count, comment_count")
  .eq("moderation_status", "approved")
  .or(`title.ilike.%${query}%,course_code.ilike.%${query}%,course_name.ilike.%${query}%,company_name.ilike.%${query}%,college_name.ilike.%${query}%`)
  .order("upvote_count", { ascending: false })
  .limit(10);
```

This returns results in under 100ms for any partial input -- "M", "Ma", "Mac", "Macro" all work instantly.

### Edge function fix

Change line 40 from:
```typescript
const keywords = query.trim().split(/\\s+/).filter((w) => w.length > 2);
```
to:
```typescript
const keywords = query.trim().split(/\\s+/).filter((w) => w.length > 0);
```

### Search UX flow

1. User types "Ma" -- instant DB results appear in under 200ms
2. User keeps typing "Macro" -- results refine instantly
3. After 1.5s idle or pressing Enter -- AI semantic search triggers for deeper ranking
4. AI results replace/merge with instant results, showing relevance reasons

