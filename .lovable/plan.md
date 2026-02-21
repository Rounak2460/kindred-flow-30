

# Dynamic Section Views with Tailored Review Cards

## Problem

Every section (Academics, Exchange, Internships, Exam Papers, Campus Life) currently has empty database tables. Clicking sample cards navigates to detail pages that query the DB by sample IDs (e.g., "sample-1") and get nothing back -- showing "Not found". The review cards themselves are plain text blobs that don't surface the structured data each section stores (ratings, stipend, tags, tips, etc.).

## Solution Overview

Create a rich, section-specific review experience by:
1. Adding sample detail data so sample cards have something to show
2. Designing unique review card layouts per section based on each section's data model
3. Fixing detail pages to fall back to sample data when DB is empty
4. Standardizing remaining inconsistencies (max-w, rounded-lg, navigate(-1))

---

## Section-by-Section Review Card Designs

### 1. Academics (CourseDetail) -- "The Report Card"

**Data available per review:** overall_rating, difficulty_rating, relevance_rating, workload_rating, review_text, tags[], tips

**Card layout:**
```text
+------------------------------------------+
| AnonymousHandle              2 days ago   |
| [****-] 4.0  Overall                     |
| +--------+----------+---------+          |
| |Diff 3.5|Relev 4.2 |Work 3.8 |  (mini) |
| +--------+----------+---------+          |
| "Great course for understanding..."       |
| Tip: "Start assignments early"            |
| [Tag] [Tag] [Tag]                        |
+------------------------------------------+
```

- Show 3 sub-ratings as compact colored pills (green/amber/red based on value)
- Tips shown in a highlighted callout box with a lightbulb icon
- Tags as small accent-colored chips

### 2. Exchange (ExchangeDetail) -- "The Travel Diary"

**Data available per review:** academics_rating, living_costs_rating, social_life_rating, travel_rating, review_text

**Card layout:**
```text
+------------------------------------------+
| AnonymousHandle              1 week ago   |
| +------+------+------+------+            |
| |Acad  |Living|Social|Travel|  (4 mini   |
| |4.2   |3.5   |4.8   |4.0  |   bars)    |
| +------+------+------+------+            |
| "The semester at HEC was incredible..."   |
+------------------------------------------+
```

- 4 sub-ratings as a horizontal mini-bar chart row
- Each bar uses its own color (blue/amber/pink/emerald)

### 3. Internships (InternshipDetail) -- "The Intel Report"

**Data available per review:** work_culture_rating, learning_rating, mentorship_rating, ppo_rating, stipend, review_text

**Card layout:**
```text
+------------------------------------------+
| AnonymousHandle              3 days ago   |
| Stipend: 2.5L/mo                         |
| +----------+----------+                  |
| |Culture 4.5|Learn 4.2 |                 |
| |Mentor 3.8 |PPO   4.0 |  (2x2 grid)    |
| +----------+----------+                  |
| "The consulting experience was..."        |
+------------------------------------------+
```

- Stipend shown prominently with a currency icon
- 4 ratings in a compact 2x2 grid with color-coded values
- Each rating has an icon (Building, BookOpen, Users, Award)

### 4. Campus Life -- "The Tip Card" (already exists, enhance)

**Data available per tip:** name, category, rating, tip_text, useful_count

**Enhancement:**
- Add a "thumbs up" interaction button for useful_count
- Show category with matching section color
- Tip text gets a subtle quote-style left border

### 5. Exam Papers -- "The Resource Row" (already good, minor polish)

**Enhancement:**
- Add dark-mode-safe type badge colors (current colors are light-mode only)
- Keep the compact list layout -- it's already well-designed

---

## Sample Detail Data

Create `src/lib/sample-detail-data.ts` with mock reviews for each section so that clicking sample cards shows realistic content:

- 3 sample course reviews (for sample course IDs)
- 3 sample exchange diaries (for sample college IDs)  
- 3 sample internship reviews (for sample company IDs)

Each detail page checks if the ID starts with "sample-" and uses the mock data instead of querying the DB.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/sample-detail-data.ts` | Mock reviews for sample items across all sections |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CourseDetail.tsx` | Sample fallback, rich review cards with sub-rating pills + tip callout |
| `src/pages/ExchangeDetail.tsx` | Sample fallback, horizontal mini-bar ratings per review, max-w-2xl, navigate(-1), rounded-lg |
| `src/pages/InternshipDetail.tsx` | Sample fallback, 2x2 rating grid + stipend badge per review, max-w-2xl, navigate(-1), rounded-lg, font-semibold |
| `src/pages/CampusLife.tsx` | Enhanced tip cards with left-border quote style |
| `src/pages/ExamPapers.tsx` | Dark-mode-safe badge colors |

## Technical Details

### Sample Fallback Pattern (same for all detail pages)

```typescript
// In CourseDetail.tsx
const isSample = courseId?.startsWith("sample-");
const course = isSample 
  ? SAMPLE_COURSES.find(c => c.id === courseId)
  : dbCourse;
const reviews = isSample
  ? SAMPLE_COURSE_REVIEWS[courseId!] || []
  : dbReviews;
```

### Dark-Mode Badge Colors (ExamPapers)

Replace light-only `bg-red-50 text-red-700` with dark-safe `bg-red-500/10 text-red-500 border-red-500/20`.

### Remaining Style Fixes

- ExchangeDetail: `max-w-3xl` to `max-w-2xl`, `font-bold` to `font-semibold`, hardcoded back to `navigate(-1)`, `rounded-full` to `rounded-lg`
- InternshipDetail: same pattern fixes

