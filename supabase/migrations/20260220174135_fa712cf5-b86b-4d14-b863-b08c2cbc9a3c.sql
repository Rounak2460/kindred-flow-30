
-- ========================================
-- ENUMS
-- ========================================
CREATE TYPE public.course_category AS ENUM ('core', 'elective');
CREATE TYPE public.course_domain AS ENUM ('finance', 'marketing', 'strategy', 'operations', 'economics', 'analytics', 'hr', 'general');
CREATE TYPE public.exam_type AS ENUM ('end_term', 'mid_term', 'quiz', 'case_analysis');
CREATE TYPE public.exchange_region AS ENUM ('europe', 'asia', 'north_america', 'oceania', 'south_america');
CREATE TYPE public.internship_domain AS ENUM ('consulting', 'finance', 'pm', 'strategy_ops', 'marketing', 'tech', 'gm');
CREATE TYPE public.campus_category AS ENUM ('food_cafes', 'study_spots', 'weekend_getaways', 'gyms_sports', 'transport', 'shopping');
CREATE TYPE public.contribution_type AS ENUM ('course_review', 'exam_paper', 'exchange_review', 'internship_review', 'campus_tip');

-- ========================================
-- HELPER FUNCTIONS
-- ========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ========================================
-- PROFILES
-- ========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  batch TEXT NOT NULL DEFAULT '',
  section TEXT NOT NULL DEFAULT '',
  credits INTEGER NOT NULL DEFAULT 0,
  free_views_used INTEGER NOT NULL DEFAULT 0,
  founding_contributor BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ========================================
-- COURSES
-- ========================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  professor TEXT NOT NULL DEFAULT '',
  term TEXT NOT NULL DEFAULT '',
  category public.course_category NOT NULL DEFAULT 'elective',
  domain public.course_domain NOT NULL DEFAULT 'general',
  description TEXT NOT NULL DEFAULT '',
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Authenticated can read courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update courses" ON public.courses FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- ========================================
-- COURSE REVIEWS
-- ========================================
CREATE TABLE public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  difficulty_rating INTEGER NOT NULL CHECK (difficulty_rating BETWEEN 1 AND 5),
  relevance_rating INTEGER NOT NULL CHECK (relevance_rating BETWEEN 1 AND 5),
  workload_rating INTEGER NOT NULL CHECK (workload_rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  tips TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_course_reviews_updated_at BEFORE UPDATE ON public.course_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Authenticated can read reviews" ON public.course_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create reviews" ON public.course_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.course_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.course_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========================================
-- COURSE REVIEW VOTES
-- ========================================
CREATE TABLE public.course_review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.course_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);
ALTER TABLE public.course_review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read votes" ON public.course_review_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote" ON public.course_review_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON public.course_review_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========================================
-- EXAM PAPERS
-- ========================================
CREATE TABLE public.exam_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  exam_type public.exam_type NOT NULL,
  year INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read papers" ON public.exam_papers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upload papers" ON public.exam_papers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own papers" ON public.exam_papers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========================================
-- EXAM PAPER VOTES
-- ========================================
CREATE TABLE public.exam_paper_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES public.exam_papers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(paper_id, user_id)
);
ALTER TABLE public.exam_paper_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read paper votes" ON public.exam_paper_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote on papers" ON public.exam_paper_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own paper vote" ON public.exam_paper_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========================================
-- EXCHANGE COLLEGES
-- ========================================
CREATE TABLE public.exchange_colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region public.exchange_region NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exchange_colleges ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_exchange_colleges_updated_at BEFORE UPDATE ON public.exchange_colleges
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Authenticated can read colleges" ON public.exchange_colleges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add colleges" ON public.exchange_colleges FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update colleges" ON public.exchange_colleges FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- ========================================
-- EXCHANGE REVIEWS
-- ========================================
CREATE TABLE public.exchange_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES public.exchange_colleges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  academics_rating INTEGER NOT NULL CHECK (academics_rating BETWEEN 1 AND 5),
  living_costs_rating INTEGER NOT NULL CHECK (living_costs_rating BETWEEN 1 AND 5),
  social_life_rating INTEGER NOT NULL CHECK (social_life_rating BETWEEN 1 AND 5),
  travel_rating INTEGER NOT NULL CHECK (travel_rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exchange_reviews ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_exchange_reviews_updated_at BEFORE UPDATE ON public.exchange_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Authenticated can read exchange reviews" ON public.exchange_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create exchange reviews" ON public.exchange_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exchange reviews" ON public.exchange_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exchange reviews" ON public.exchange_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========================================
-- INTERNSHIP COMPANIES
-- ========================================
CREATE TABLE public.internship_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain public.internship_domain NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  avg_stipend TEXT NOT NULL DEFAULT '',
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.internship_companies ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_internship_companies_updated_at BEFORE UPDATE ON public.internship_companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Authenticated can read companies" ON public.internship_companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add companies" ON public.internship_companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update companies" ON public.internship_companies FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- ========================================
-- INTERNSHIP REVIEWS
-- ========================================
CREATE TABLE public.internship_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.internship_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_culture_rating INTEGER NOT NULL CHECK (work_culture_rating BETWEEN 1 AND 5),
  learning_rating INTEGER NOT NULL CHECK (learning_rating BETWEEN 1 AND 5),
  mentorship_rating INTEGER NOT NULL CHECK (mentorship_rating BETWEEN 1 AND 5),
  ppo_rating INTEGER NOT NULL CHECK (ppo_rating BETWEEN 1 AND 5),
  stipend TEXT NOT NULL DEFAULT '',
  review_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.internship_reviews ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_internship_reviews_updated_at BEFORE UPDATE ON public.internship_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Authenticated can read internship reviews" ON public.internship_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create internship reviews" ON public.internship_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own internship reviews" ON public.internship_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own internship reviews" ON public.internship_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========================================
-- CAMPUS TIPS
-- ========================================
CREATE TABLE public.campus_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category public.campus_category NOT NULL,
  name TEXT NOT NULL,
  tip_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  useful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campus_tips ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_campus_tips_updated_at BEFORE UPDATE ON public.campus_tips
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Authenticated can read tips" ON public.campus_tips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create tips" ON public.campus_tips FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tips" ON public.campus_tips FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tips" ON public.campus_tips FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========================================
-- CAMPUS TIP VOTES
-- ========================================
CREATE TABLE public.campus_tip_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id UUID NOT NULL REFERENCES public.campus_tips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tip_id, user_id)
);
ALTER TABLE public.campus_tip_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read tip votes" ON public.campus_tip_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote on tips" ON public.campus_tip_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own tip vote" ON public.campus_tip_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========================================
-- CONTENT VIEW LOG (for credit system)
-- ========================================
CREATE TABLE public.content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type public.contribution_type NOT NULL,
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);
ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own views" ON public.content_views FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can log views" ON public.content_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ========================================
-- EXAM PAPERS STORAGE BUCKET
-- ========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('exam-papers', 'exam-papers', false);

CREATE POLICY "Authenticated can upload papers" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'exam-papers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated can read papers" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'exam-papers');

CREATE POLICY "Users can delete own papers" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'exam-papers' AND auth.uid()::text = (storage.foldername(name))[1]);
