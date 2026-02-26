

# Plan: Populate Database with Real Course Data from Excel Guides

## Overview
Extract all course and review data from the two Excel files (Term 1 Guide and Term 2 Guide by "Manish Janu") and populate the database with real courses, detailed course reviews, and discussion posts. Remove all dummy/sample data from the codebase.

## Data Extracted from Excel Files

### Term 1 Courses (Core, 6 courses)
1. **DS-1** (Decision Sciences 1) - Prof. Anand Deo - CP/Quizzes 10, Project 15, Mid 35, End 40
2. **OD** (Organization Design) - Prof. Sushanta Mishra - Quiz 20, Mid 35, End 30, Project 15
3. **Microeconomics** - Prof. Manaswini Bhalla - Quiz 10, Mid 35, End 35, Project 20
4. **AFD** (Accounting for Decision Making) - Prof. Srinivasan Rangan - Quiz 15, Mid 25, End 35, Project 25
5. **Marketing Management** - Prof. Mayank Nagpal - CP 20, Project 30, Mid 25, End 25
6. **ABC** (Analytical & Business Communication) - Prof. Malvika Harita - Monologue 35, PPT 35, Project 30

### Term 2 Courses (Core, 5 courses)
1. **Corporate Strategy** - Prof. Sai Chittaranjan Kalubandi - CP 20, Quiz 20, Mid 15, End 20, Project 25
2. **Corporate Finance** - Prof. Shashidhar Murthy - Quizzes 10, Mid 40, End 40, Bloomberg 4, Connect 6
3. **DS-2** (Decision Sciences 2) - Prof. Jitamitra Desai - Cases 20, Mid 40, End 40
4. **HRDM** - Prof. Neha Bellamkonda - Quizzes 30, End 40, Project 15, CP 5, Reflection 10
5. **Operations Management** - Prof. Krishna Sundar - Case writeups 25, Game 10, CP 10, Mid 25, End 30

## Implementation Steps

### 1. Database Migration
Single SQL migration that:
- Creates a "Manish Janu" profile entry with a fixed UUID (bypassing RLS via migration)
- Inserts 11 core courses (Term 1 + Term 2) into the `courses` table with `category = 'core'`
- Inserts detailed course reviews for each course (one long review per course containing the comprehensive tips/advice from the Excel) into `course_reviews`
- Creates discussion posts in the `posts` table for the "general guide" content (Term 1 intro/strategy guide, grading system explanation) as valuable community posts

### 2. Remove Sample Data from Frontend
- **`src/lib/sample-data.ts`**: Clear `SAMPLE_COURSES` array (set to empty `[]`), keep other sample arrays as-is since they serve different sections
- **`src/lib/sample-detail-data.ts`**: Clear `SAMPLE_COURSE_REVIEWS` (set to empty `{}`)
- Alternatively, since post count is 28 (above 25 threshold), samples already won't show — but we should still clean them to avoid confusion

### 3. Create Posts from Guide Content
Create 2-3 high-value posts from the non-course-specific content:
- **"The Complete IIMB First Year Academic Strategy Guide"** — the intro/strategy section from Term 1 Guide
- **"How Grades Work at IIMB — GPA, DML, DHL Explained"** — the grading section
- **"Term 2 Course Survival Guide"** — Term 2 overview tips

These go into the `posts` table with `category = 'academics'`, `flair = 'Pro Tip'`, attributed to Manish Janu, `is_anonymous = false`.

### 4. Review Content Strategy
Each of the 11 courses gets one comprehensive review containing:
- Professor personality/teaching style summary
- Evaluation breakdown with weights
- Component-by-component tips (CP, Quiz, Mid, End, Project)
- Specific exam strategies and insider tips
- Difficulty assessment
- Overall rating (derived from the tone of the review)

### Technical Details

**Manish Janu user_id**: Will use a fixed UUID `'11111111-1111-1111-1111-111111111111'` created via migration (inserts directly into profiles table bypassing RLS).

**Course domain mapping**: Term 1/2 core courses will use existing domains:
- DS-1, DS-2 → `analytics`
- OD, HRDM → `hr`
- Economics → `economics`
- AFD, Corp Finance → `finance`
- Marketing → `marketing` (not in enum, will use `general`)
- Corp Strategy → `strategy`
- OM → `operations`
- ABC → `communication`

**Ratings**: Derived from the review tone — courses praised get 4+, mixed reviews get 3-3.5.

