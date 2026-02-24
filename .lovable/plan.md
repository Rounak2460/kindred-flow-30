

# Replace Dummy Data with Real T4 Course Data + Add "Ask Mitra Ronnie" AI Chat

## Part 1: Seed Real IIMB T4 Course Data

The T4 Course Selector GitHub repo contains **47 actual IIMB Term 4 elective courses** with rich metadata: faculty names, official codes, areas (domains), demand ratios, peer sentiment reviews, course outlines, and grading breakdowns. Currently the app uses 4 fake sample courses. We will replace ALL dummy/sample data with this real data.

### 1A. Database Migration -- Expand Domain Enum + Seed Courses

The existing `course_domain` enum only has 8 values. The T4 data has 13 areas. We need to add: `public_policy`, `interdisciplinary`, `information_systems`, `language`, `communication`, `entrepreneurship`.

**Migration 1: Expand enum + seed 47 courses**

Map the T4 areas to domains:
- `Strat` → `strategy`
- `Econ` → `economics`
- `PP` → `public_policy` (new)
- `Interdis` → `interdisciplinary` (new)
- `F&A` → `finance`
- `DS` → `analytics`
- `Mktg` → `marketing`
- `POM` → `operations`
- `IS` → `information_systems` (new)
- `Lang` → `language` (new)
- `Mcomm` → `communication` (new)
- `OBHRM` → `hr`
- `Entre` → `entrepreneurship` (new)

Insert all 47 courses with: `code` (official code like CS757), `name`, `professor` (faculty), `term` = "Term 4", `category` = "elective", `domain`, `description` (from outline array joined), `avg_rating` (derived from sentiment: recommended=4.2, caution=3.2, not_recommended=2.5, null=3.5).

### 1B. Seed Course Reviews from T4 Review Text

For courses that have `reviewText` in the T4 data, create a corresponding course review in `course_reviews` using a system user. Each review includes the peer sentiment text, a derived rating, and tags based on sentiment.

### 1C. Replace All Sample/Mock Data Files

**`src/lib/sample-data.ts`**: Replace 4 fake courses with a subset of real T4 courses (for fallback display). Replace fake internship/exchange/papers/tips data with IIMB-specific real data.

**`src/lib/sample-detail-data.ts`**: Replace fake reviews with realistic reviews derived from the T4 course data.

**`src/lib/mock-data.ts`**: Replace 10 generic mock posts with realistic IIMB-specific posts that reference actual T4 courses, real faculty names, and actual course codes.

### 1D. Update Domain Filter Options

**`src/pages/Academics.tsx`**: Add the new domains to `DOMAIN_OPTIONS`: Public Policy, Interdisciplinary, IS, Language, Communication, Entrepreneurship.

## Part 2: "Ask Mitra Ronnie" -- RAG-Powered AI Chat

Build an AI assistant that uses platform content (posts, course reviews, courses, campus tips) as context to answer student queries.

### 2A. Edge Function: `ask-mitra`

Create `supabase/functions/ask-mitra/index.ts`:
- Accepts `{ question: string, history?: { role: string, content: string }[] }`
- Fetches relevant context from the database:
  1. Search `posts` for keyword matches on the question (top 10)
  2. Search `courses` for relevant course info (top 5)
  3. Search `course_reviews` joined with courses for review context (top 5)
  4. Search `campus_tips` for campus-related queries (top 5)
- Builds a system prompt with the retrieved context as RAG
- Calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with streaming
- Returns streamed SSE response

### 2B. Frontend: Chat UI Component

**`src/components/AskMitraChat.tsx`**: A floating chat button (bottom-right on desktop, above FAB on mobile) that opens a slide-up chat panel:
- Chat input with send button
- Message bubbles (user + assistant) with markdown rendering
- Streaming token-by-token display
- "Powered by Digi Mitra AI" footer
- Persisted in session (not across page loads)

**`src/hooks/useAskMitra.ts`**: Hook managing chat state, streaming, and message history.

### 2C. Integration Points

- Add the chat button to `src/pages/Home.tsx` and `src/components/layout/AppLayout.tsx`
- Register the edge function in `supabase/config.toml`
- The AI uses ONLY platform data as context -- no hallucinated answers about courses that don't exist

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/ask-mitra/index.ts` | RAG-powered AI chat edge function |
| `src/components/AskMitraChat.tsx` | Floating chat UI with streaming |
| `src/hooks/useAskMitra.ts` | Chat state + streaming logic |

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/sample-data.ts` | Replace all dummy data with real IIMB T4 course data |
| `src/lib/sample-detail-data.ts` | Replace fake reviews with T4-sourced reviews |
| `src/lib/mock-data.ts` | Replace mock posts with realistic IIMB content referencing real courses |
| `src/pages/Academics.tsx` | Add 6 new domain filter pills |
| `src/components/layout/AppLayout.tsx` | Add AskMitraChat component |
| `supabase/config.toml` | Register `ask-mitra` function |

## Database Migrations

1. Add 6 new values to `course_domain` enum
2. Insert 47 real T4 courses into `courses` table
3. Insert peer reviews from T4 reviewText into `course_reviews`

## Technical Details

### RAG Context Retrieval (in ask-mitra edge function)

```typescript
// Search posts for relevant context
const { data: posts } = await supabase
  .from("posts")
  .select("title, body, category, course_name, company_name")
  .eq("moderation_status", "approved")
  .or(`title.ilike.%${keyword}%,body.ilike.%${keyword}%`)
  .order("upvote_count", { ascending: false })
  .limit(10);

// Get course info
const { data: courses } = await supabase
  .from("courses")
  .select("code, name, professor, domain, description, avg_rating")
  .or(`name.ilike.%${keyword}%,code.ilike.%${keyword}%,description.ilike.%${keyword}%`)
  .limit(5);

// Build RAG context string
const context = [
  ...posts.map(p => `[Post] ${p.title}: ${p.body?.slice(0, 200)}`),
  ...courses.map(c => `[Course] ${c.code} ${c.name} by ${c.professor} (${c.domain}): ${c.description}`),
].join("\n\n");
```

### Streaming Chat Pattern

Uses the standard Lovable AI streaming pattern via SSE, with the system prompt containing RAG context:

```typescript
const systemPrompt = `You are Mitra Ronnie, a helpful AI assistant for IIM Bangalore students on the Digi Mitra platform. 
Answer questions using ONLY the following platform data. If you don't have enough info, say so honestly.

PLATFORM DATA:
${context}`;
```

### Sample Real Course Data (from T4 repo)

```text
CS757 - Corporate Strategy (Prof. Deepak Chandrashekar, Strategy, 1.7x demand)
  "One of the best courses. Concept heavy. Excellent professor. Very useful for placements."

EC747 - Business, Finance & Intl Economy (Prof. Anubha Dhasmana, Economics, 1.6x demand)
  "Practical case study based economics course. WARNING: If you got cooked in Macro, skip this."

DN714 - Zen and Mind Training (Prof. Dinesh Kumar, Interdisciplinary, 2.1x demand)
  "No mid-term or end-term. Very easy to score. Just attend and stay alert."
```

All 47 courses from the T4 selector will be seeded with their real faculty, codes, outlines, grading breakdowns, and peer reviews.

