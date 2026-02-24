
-- Add new columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS career_track text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS current_term text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

-- Add metadata JSONB to posts for marketplace/event/poll data
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Bookmarks table
CREATE TABLE public.bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Placement companies
CREATE TABLE public.placement_companies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  domain text NOT NULL DEFAULT 'general',
  description text NOT NULL DEFAULT '',
  avg_package text NOT NULL DEFAULT '',
  roles text[] NOT NULL DEFAULT '{}',
  review_count integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.placement_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read placement companies" ON public.placement_companies FOR SELECT USING (true);
CREATE POLICY "Authenticated can add companies" ON public.placement_companies FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update companies" ON public.placement_companies FOR UPDATE USING (auth.uid() = created_by);

-- Interview experiences
CREATE TABLE public.interview_experiences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.placement_companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT '',
  year integer NOT NULL DEFAULT 2025,
  result text NOT NULL DEFAULT 'selected',
  round_details jsonb NOT NULL DEFAULT '[]',
  tips text NOT NULL DEFAULT '',
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.interview_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read experiences" ON public.interview_experiences FOR SELECT USING (true);
CREATE POLICY "Authenticated can add experiences" ON public.interview_experiences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experiences" ON public.interview_experiences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experiences" ON public.interview_experiences FOR DELETE USING (auth.uid() = user_id);

-- Polls
CREATE TABLE public.polls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL DEFAULT '{}',
  ends_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Authenticated can create polls" ON public.polls FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Poll votes
CREATE TABLE public.poll_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  option_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read poll votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated can vote" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change vote" ON public.poll_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove vote" ON public.poll_votes FOR DELETE USING (auth.uid() = user_id);
