

# Plan: Remove All Dummy/Sample Data from Frontend

## Problem
Sample data arrays for Exchange, Internships, Exam Papers, Campus Tips, and their detail reviews still contain hardcoded dummy entries. Although the threshold mechanism (31 posts > 25) should hide them, the data still exists and could flash during loading. User wants it fully purged.

## Changes

### 1. Clear all sample arrays in `src/lib/sample-data.ts`
- `SAMPLE_EXCHANGE` → `[]`
- `SAMPLE_INTERNSHIPS` → `[]`
- `SAMPLE_PAPERS` → `[]`
- `SAMPLE_TIPS` → `[]`
(SAMPLE_COURSES is already `[]`)

### 2. Clear all sample review data in `src/lib/sample-detail-data.ts`
- `SAMPLE_EXCHANGE_REVIEWS` → `{}`
- `SAMPLE_INTERNSHIP_REVIEWS` → `{}`
(SAMPLE_COURSE_REVIEWS is already `{}`)

### 3. Remove unused mock data file `src/lib/mock-data.ts`
- `MOCK_POSTS` and `MOCK_COMMENTS` are defined but never imported anywhere — delete the entire file or clear the arrays. Safer to clear the arrays since the file also exports `CATEGORIES`, `FLAIRS`, and `timeAgo` which may be used elsewhere.

### 4. No database changes needed
Real data already exists in the database (31 posts, 20+ courses with reviews). The frontend hooks fetch from the database correctly.

