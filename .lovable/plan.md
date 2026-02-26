

# Plan: Delete Dummy Posts from Database

## Problem
15 seed/dummy posts exist in the `posts` table with fake user IDs (`00000000-aaaa-bbbb-cccc-*`). These show on the community feed with no profile names (network requests confirm empty responses for these user IDs).

## Dummy Posts to Delete (15 total)
All posts where `user_id::text LIKE '00000000-aaaa-bbbb-cccc-%'`:
- "Esade Barcelona — The exchange I almost didn't apply for"
- "Marketing Management Mid Term 2024 — Pattern analysis"
- "NUS Singapore — the practical guide"
- "Weekend getaways under ₹5000 from Bangalore"
- "Microeconomics End Term 2024 — with solutions and analysis"
- "Best study spots ranked — from a night owl"
- "Ultimate food guide for new PGP students — save this post"
- "Goldman Sachs IBD — Summer Analyst honest breakdown"
- "Bain vs BCG — did both interviews, got one offer"
- "HEC Paris exchange — A semester that changed my perspective"
- "Operations Management — The underrated core"
- "McKinsey Summer Internship — What they don't tell you in PPTs"
- "Which marketing electives are actually useful?"
- "Honest review of Corporate Finance with Prof. Srinivasan"
- "Data Science elective is being revamped"

## Implementation
1. **SQL migration**: Delete all posts, comments, and votes associated with fake user IDs (`00000000-aaaa-bbbb-cccc-%`). Also delete the fake profile entries if any exist.

Single migration with:
```sql
DELETE FROM votes WHERE user_id::text LIKE '00000000-aaaa-bbbb-cccc-%';
DELETE FROM comments WHERE user_id::text LIKE '00000000-aaaa-bbbb-cccc-%';
DELETE FROM comments WHERE post_id::text LIKE '00000000-0000-0000-0000-0000000000%';
DELETE FROM posts WHERE user_id::text LIKE '00000000-aaaa-bbbb-cccc-%';
DELETE FROM profiles WHERE user_id::text LIKE '00000000-aaaa-bbbb-cccc-%';
```

No frontend code changes needed — once the rows are gone, the feed will only show real user posts.

