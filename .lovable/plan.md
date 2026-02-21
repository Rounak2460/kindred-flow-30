

# Speed Up AI Search -- Hybrid Approach

## Problem

The current search fetches **500 posts** from the database and sends them all to the AI model on every query. This creates two bottlenecks:
- Large database fetch (500 rows with body text)
- Massive AI prompt (processing 500 post summaries is slow)

## Solution: Two-Stage Hybrid Search

Instead of sending everything to the AI, use a **fast database pre-filter first**, then send only the top candidates to AI for semantic ranking.

```text
User Query
    |
    v
[Stage 1: Postgres full-text + ILIKE search] --> ~40 candidates (fast, <100ms)
    |
    v
[Stage 2: AI semantic ranking on 40 posts]   --> 8 best results (fast, ~1-2s vs current ~4-5s)
    |
    v
Results returned to UI
```

## Changes

### 1. Edge Function (`supabase/functions/ai-search/index.ts`)

- **Stage 1 -- Database pre-filter**: Use Postgres `ILIKE` across title, body, flair, course_code, course_name, company_name, college_name to get ~50 keyword-matching candidates. Also fetch the 20 most recent posts as fallback context (for intent-based queries where keywords don't match directly).
- **Stage 2 -- AI ranking**: Send only these ~50 candidates (not 500) to the AI model. Truncate body to 80 chars instead of 150.
- **Faster model**: Switch from `google/gemini-3-flash-preview` to `google/gemini-2.5-flash-lite` -- this is a simple ranking task, not complex reasoning. The lite model is 3-5x faster.
- **Add `max_tokens: 1024`** to limit response size and speed up generation.

### 2. Client debounce (`src/components/search/AISearchDialog.tsx`)

- Reduce debounce from 600ms to 350ms for snappier feel.

### 3. Instant keyword results (`src/hooks/useAISearch.ts`)

- Show instant local keyword matches from a lightweight client-side cache while AI results load (progressive enhancement). On first open, fetch a slim index (id, title, category) of recent posts and filter client-side for immediate suggestions. AI results replace them when ready.

---

## Technical Details

### Edge Function -- New Query Strategy

```typescript
// Stage 1: Get keyword candidates (fast)
const keywords = query.split(/\s+/).filter(w => w.length > 2);
const ilikeFilter = keywords.map(k =>
  `title.ilike.%${k}%,body.ilike.%${k}%,flair.ilike.%${k}%,course_code.ilike.%${k}%,course_name.ilike.%${k}%,company_name.ilike.%${k}%,college_name.ilike.%${k}%`
).join(",");

const { data: candidates } = await supabase
  .from("posts")
  .select("id, title, body, category, flair, course_code, course_name, company_name, college_name, created_at, upvote_count, comment_count")
  .eq("moderation_status", "approved")
  .or(ilikeFilter)
  .order("upvote_count", { ascending: false })
  .limit(40);

// Also get 10 recent popular posts as fallback
const { data: recent } = await supabase
  .from("posts")
  .select("id, title, body, category, flair, course_code, course_name, company_name, college_name, created_at, upvote_count, comment_count")
  .eq("moderation_status", "approved")
  .order("created_at", { ascending: false })
  .limit(10);

// Deduplicate and merge
const allPosts = deduplicateById([...candidates, ...recent]);
```

Then send only these ~50 posts to the AI model instead of 500. Body truncated to 80 chars.

### Model Switch

```typescript
model: "google/gemini-2.5-flash-lite"  // was gemini-3-flash-preview
```

### Expected Speed Improvement

| Metric | Before | After |
|--------|--------|-------|
| DB fetch | 500 posts, ~200ms | ~50 posts, ~50ms |
| AI prompt size | ~25K tokens | ~3K tokens |
| AI response time | ~3-5s | ~0.5-1.5s |
| Client debounce | 600ms | 350ms |
| **Total perceived** | **~4-6s** | **~1-2.5s** |

### Files Modified

| File | Change |
|------|--------|
| `supabase/functions/ai-search/index.ts` | Two-stage hybrid search, faster model, smaller prompt |
| `src/components/search/AISearchDialog.tsx` | Reduce debounce to 350ms |

