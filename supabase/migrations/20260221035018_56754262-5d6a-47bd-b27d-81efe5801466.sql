
-- Add bio column to profiles
ALTER TABLE public.profiles ADD COLUMN bio text NOT NULL DEFAULT '';

-- Add gossip_member column to profiles
ALTER TABLE public.profiles ADD COLUMN gossip_member boolean NOT NULL DEFAULT false;

-- Create gossip_posts table
CREATE TABLE public.gossip_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  body text NOT NULL,
  upvote_count integer NOT NULL DEFAULT 0,
  downvote_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  moderation_status text NOT NULL DEFAULT 'pending',
  moderation_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gossip_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gossip" ON public.gossip_posts
  FOR SELECT USING (true);

CREATE POLICY "Members can create gossip" ON public.gossip_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gossip" ON public.gossip_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Create gossip_comments table
CREATE TABLE public.gossip_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gossip_id uuid NOT NULL REFERENCES public.gossip_posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.gossip_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL,
  upvote_count integer NOT NULL DEFAULT 0,
  downvote_count integer NOT NULL DEFAULT 0,
  moderation_status text NOT NULL DEFAULT 'pending',
  moderation_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gossip_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gossip comments" ON public.gossip_comments
  FOR SELECT USING (true);

CREATE POLICY "Members can comment on gossip" ON public.gossip_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gossip comments" ON public.gossip_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update comment count on gossip posts
CREATE OR REPLACE FUNCTION public.update_gossip_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gossip_posts SET comment_count = comment_count + 1 WHERE id = NEW.gossip_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gossip_posts SET comment_count = comment_count - 1 WHERE id = OLD.gossip_id;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_gossip_comment_count_trigger
AFTER INSERT OR DELETE ON public.gossip_comments
FOR EACH ROW EXECUTE FUNCTION public.update_gossip_comment_count();

-- Vote count triggers for gossip
CREATE OR REPLACE FUNCTION public.update_gossip_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.target_type = 'gossip_post' THEN
      UPDATE gossip_posts SET 
        upvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND target_type = 'gossip_post' AND vote_type = 1),
        downvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND target_type = 'gossip_post' AND vote_type = -1)
      WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'gossip_comment' THEN
      UPDATE gossip_comments SET 
        upvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND target_type = 'gossip_comment' AND vote_type = 1),
        downvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND target_type = 'gossip_comment' AND vote_type = -1)
      WHERE id = NEW.target_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'gossip_post' THEN
      UPDATE gossip_posts SET 
        upvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = OLD.target_id AND target_type = 'gossip_post' AND vote_type = 1),
        downvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = OLD.target_id AND target_type = 'gossip_post' AND vote_type = -1)
      WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'gossip_comment' THEN
      UPDATE gossip_comments SET 
        upvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = OLD.target_id AND target_type = 'gossip_comment' AND vote_type = 1),
        downvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = OLD.target_id AND target_type = 'gossip_comment' AND vote_type = -1)
      WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER update_gossip_vote_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW EXECUTE FUNCTION public.update_gossip_vote_counts();
