

# Auto-Remove Sample Data After 25 Real Posts

## How It Works

The platform currently shows hardcoded sample data (courses, exchanges, internships, papers, tips, mock posts) as placeholders when database tables are empty. Instead of deleting data from the database (which has none -- samples are frontend-only), we need to stop showing these frontend placeholders once the platform has 25+ real posts.

## Approach: Backend-Driven Flag

Create a simple database function + use the existing `useStats` hook to expose a `totalPosts` count. Each page that currently falls back to sample data will check: if `totalPosts >= 25`, show empty state instead of samples. This is automatic, one-time (once you cross 25, samples never return), and requires zero manual intervention.

---

## Technical Details

### 1. Modify `src/hooks/useStats.ts`

Add `totalPosts` to the stats query -- a simple `COUNT(*)` from the `posts` table. This count is already being fetched in some form; we just need to expose it.

### 2. Create a shared hook: `src/hooks/useShouldShowSamples.ts`

A tiny hook that:
- Calls `useStats()` to get `totalPosts`
- Returns `totalPosts < 25` (or `true` while loading, to avoid flash of empty state)

### 3. Update 6 page files to use the flag

Each page currently has logic like:
```ts
const showSamples = !isLoading && data.length === 0;
const displayData = showSamples ? SAMPLE_DATA : data;
```

Change to:
```ts
const platformHasContent = !shouldShowSamples; // from hook
const showSamples = !isLoading && data.length === 0 && !platformHasContent;
const displayData = showSamples ? SAMPLE_DATA : data;
```

**Files to modify:**
| File | Sample constant used |
|------|---------------------|
| `src/pages/Academics.tsx` | `SAMPLE_COURSES` |
| `src/pages/Exchange.tsx` | `SAMPLE_EXCHANGE` |
| `src/pages/Internships.tsx` | `SAMPLE_INTERNSHIPS` |
| `src/pages/ExamPapers.tsx` | `SAMPLE_PAPERS` |
| `src/pages/CampusLife.tsx` | `SAMPLE_TIPS` |
| `src/pages/CourseDetail.tsx` | `SAMPLE_COURSES` + `SAMPLE_COURSE_REVIEWS` |
| `src/pages/ExchangeDetail.tsx` | `SAMPLE_EXCHANGE` + `SAMPLE_EXCHANGE_REVIEWS` |
| `src/pages/InternshipDetail.tsx` | `SAMPLE_INTERNSHIPS` + `SAMPLE_INTERNSHIP_REVIEWS` |

### 4. Detail pages (`CourseDetail`, `ExchangeDetail`, `InternshipDetail`)

These use `isSample = id?.startsWith("sample-")` to load sample detail data. Once `shouldShowSamples` is false, sample IDs will never appear in listing pages, so users can't navigate to them. But as a safety net, detail pages will also check the flag and show "not found" for sample IDs when the platform has 25+ posts.

### 5. Mock posts in `mock-data.ts`

`MOCK_POSTS` and `MOCK_COMMENTS` are not currently imported anywhere in page files (confirmed by search). They appear unused. No changes needed -- they're already dead code.

---

## Summary

- **No database migration needed** -- sample data lives only in frontend code
- **No edge function needed** -- uses existing stats query
- **Automatic** -- once 25+ posts exist, samples disappear forever
- **No manual intervention** -- purely count-driven
- **1 new file** (`useShouldShowSamples.ts`), **1 modified hook** (`useStats.ts`), **8 modified pages**

