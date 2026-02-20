-- Fix SELECT policies to be PERMISSIVE so anonymous users can view content

-- Posts: allow anyone to read
DROP POLICY IF EXISTS "Anyone can read posts" ON public.posts;
CREATE POLICY "Anyone can read posts" ON public.posts FOR SELECT USING (true);

-- Comments: allow anyone to read
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);

-- Profiles: allow anyone to read (needed for leaderboard etc)
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT USING (true);

-- Votes: allow anyone to read
DROP POLICY IF EXISTS "Anyone can read votes" ON public.votes;
CREATE POLICY "Anyone can read votes" ON public.votes FOR SELECT USING (true);