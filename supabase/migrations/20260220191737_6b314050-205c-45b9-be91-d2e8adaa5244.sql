
-- Fix: All write policies were RESTRICTIVE, which blocks writes when no PERMISSIVE policy exists.
-- Recreate them as PERMISSIVE.

-- POSTS
DROP POLICY IF EXISTS "Authenticated can create posts" ON public.posts;
CREATE POLICY "Authenticated can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS
DROP POLICY IF EXISTS "Authenticated can create comments" ON public.comments;
CREATE POLICY "Authenticated can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- VOTES
DROP POLICY IF EXISTS "Authenticated can vote" ON public.votes;
CREATE POLICY "Authenticated can vote" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can change own vote" ON public.votes;
CREATE POLICY "Users can change own vote" ON public.votes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own vote" ON public.votes;
CREATE POLICY "Users can remove own vote" ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- PROFILES
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- CONTENT_VIEWS
DROP POLICY IF EXISTS "Users can read own views" ON public.content_views;
CREATE POLICY "Users can read own views" ON public.content_views FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log views" ON public.content_views;
CREATE POLICY "Users can log views" ON public.content_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- COURSES
DROP POLICY IF EXISTS "Authenticated can read courses" ON public.courses;
CREATE POLICY "Authenticated can read courses" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can insert courses" ON public.courses;
CREATE POLICY "Authenticated can insert courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can update courses" ON public.courses;
CREATE POLICY "Creators can update courses" ON public.courses FOR UPDATE USING (auth.uid() = created_by);

-- COURSE_REVIEWS
DROP POLICY IF EXISTS "Authenticated can read reviews" ON public.course_reviews;
CREATE POLICY "Authenticated can read reviews" ON public.course_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON public.course_reviews;
CREATE POLICY "Users can create reviews" ON public.course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.course_reviews;
CREATE POLICY "Users can update own reviews" ON public.course_reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.course_reviews;
CREATE POLICY "Users can delete own reviews" ON public.course_reviews FOR DELETE USING (auth.uid() = user_id);

-- COURSE_REVIEW_VOTES
DROP POLICY IF EXISTS "Authenticated can read votes" ON public.course_review_votes;
CREATE POLICY "Authenticated can read votes" ON public.course_review_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can vote" ON public.course_review_votes;
CREATE POLICY "Users can vote" ON public.course_review_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own vote" ON public.course_review_votes;
CREATE POLICY "Users can remove own vote" ON public.course_review_votes FOR DELETE USING (auth.uid() = user_id);

-- CAMPUS_TIPS
DROP POLICY IF EXISTS "Authenticated can read tips" ON public.campus_tips;
CREATE POLICY "Authenticated can read tips" ON public.campus_tips FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create tips" ON public.campus_tips;
CREATE POLICY "Users can create tips" ON public.campus_tips FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tips" ON public.campus_tips;
CREATE POLICY "Users can update own tips" ON public.campus_tips FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tips" ON public.campus_tips;
CREATE POLICY "Users can delete own tips" ON public.campus_tips FOR DELETE USING (auth.uid() = user_id);

-- CAMPUS_TIP_VOTES
DROP POLICY IF EXISTS "Authenticated can read tip votes" ON public.campus_tip_votes;
CREATE POLICY "Authenticated can read tip votes" ON public.campus_tip_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can vote on tips" ON public.campus_tip_votes;
CREATE POLICY "Users can vote on tips" ON public.campus_tip_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own tip vote" ON public.campus_tip_votes;
CREATE POLICY "Users can remove own tip vote" ON public.campus_tip_votes FOR DELETE USING (auth.uid() = user_id);

-- EXAM_PAPERS
DROP POLICY IF EXISTS "Authenticated can read papers" ON public.exam_papers;
CREATE POLICY "Authenticated can read papers" ON public.exam_papers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can upload papers" ON public.exam_papers;
CREATE POLICY "Users can upload papers" ON public.exam_papers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own papers" ON public.exam_papers;
CREATE POLICY "Users can delete own papers" ON public.exam_papers FOR DELETE USING (auth.uid() = user_id);

-- EXAM_PAPER_VOTES
DROP POLICY IF EXISTS "Authenticated can read paper votes" ON public.exam_paper_votes;
CREATE POLICY "Authenticated can read paper votes" ON public.exam_paper_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can vote on papers" ON public.exam_paper_votes;
CREATE POLICY "Users can vote on papers" ON public.exam_paper_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own paper vote" ON public.exam_paper_votes;
CREATE POLICY "Users can remove own paper vote" ON public.exam_paper_votes FOR DELETE USING (auth.uid() = user_id);

-- EXCHANGE_COLLEGES
DROP POLICY IF EXISTS "Authenticated can read colleges" ON public.exchange_colleges;
CREATE POLICY "Authenticated can read colleges" ON public.exchange_colleges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add colleges" ON public.exchange_colleges;
CREATE POLICY "Users can add colleges" ON public.exchange_colleges FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can update colleges" ON public.exchange_colleges;
CREATE POLICY "Creators can update colleges" ON public.exchange_colleges FOR UPDATE USING (auth.uid() = created_by);

-- EXCHANGE_REVIEWS
DROP POLICY IF EXISTS "Authenticated can read exchange reviews" ON public.exchange_reviews;
CREATE POLICY "Authenticated can read exchange reviews" ON public.exchange_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create exchange reviews" ON public.exchange_reviews;
CREATE POLICY "Users can create exchange reviews" ON public.exchange_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own exchange reviews" ON public.exchange_reviews;
CREATE POLICY "Users can update own exchange reviews" ON public.exchange_reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own exchange reviews" ON public.exchange_reviews;
CREATE POLICY "Users can delete own exchange reviews" ON public.exchange_reviews FOR DELETE USING (auth.uid() = user_id);

-- INTERNSHIP_COMPANIES
DROP POLICY IF EXISTS "Authenticated can read companies" ON public.internship_companies;
CREATE POLICY "Authenticated can read companies" ON public.internship_companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add companies" ON public.internship_companies;
CREATE POLICY "Users can add companies" ON public.internship_companies FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can update companies" ON public.internship_companies;
CREATE POLICY "Creators can update companies" ON public.internship_companies FOR UPDATE USING (auth.uid() = created_by);

-- INTERNSHIP_REVIEWS
DROP POLICY IF EXISTS "Authenticated can read internship reviews" ON public.internship_reviews;
CREATE POLICY "Authenticated can read internship reviews" ON public.internship_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create internship reviews" ON public.internship_reviews;
CREATE POLICY "Users can create internship reviews" ON public.internship_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own internship reviews" ON public.internship_reviews;
CREATE POLICY "Users can update own internship reviews" ON public.internship_reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own internship reviews" ON public.internship_reviews;
CREATE POLICY "Users can delete own internship reviews" ON public.internship_reviews FOR DELETE USING (auth.uid() = user_id);
