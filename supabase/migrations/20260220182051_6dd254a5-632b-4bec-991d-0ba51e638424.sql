
-- Trigger: update karma (credits) on vote insert/update/delete
CREATE OR REPLACE FUNCTION public.update_karma_on_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  karma_change integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    karma_change := NEW.vote_type;
    IF NEW.target_type = 'post' THEN
      SELECT user_id INTO target_user_id FROM posts WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      SELECT user_id INTO target_user_id FROM comments WHERE id = NEW.target_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    karma_change := -OLD.vote_type;
    IF OLD.target_type = 'post' THEN
      SELECT user_id INTO target_user_id FROM posts WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'comment' THEN
      SELECT user_id INTO target_user_id FROM comments WHERE id = OLD.target_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    karma_change := NEW.vote_type - OLD.vote_type;
    IF NEW.target_type = 'post' THEN
      SELECT user_id INTO target_user_id FROM posts WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      SELECT user_id INTO target_user_id FROM comments WHERE id = NEW.target_id;
    END IF;
  END IF;

  IF target_user_id IS NOT NULL AND karma_change != 0 THEN
    UPDATE profiles SET credits = credits + karma_change WHERE user_id = target_user_id;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_karma_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_karma_on_vote();

-- Trigger: update post/comment vote counts
CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.target_type = 'post' THEN
      UPDATE posts SET 
        upvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND target_type = 'post' AND vote_type = 1),
        downvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND target_type = 'post' AND vote_type = -1)
      WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      UPDATE comments SET 
        upvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND target_type = 'comment' AND vote_type = 1),
        downvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND target_type = 'comment' AND vote_type = -1)
      WHERE id = NEW.target_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      UPDATE posts SET 
        upvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = OLD.target_id AND target_type = 'post' AND vote_type = 1),
        downvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = OLD.target_id AND target_type = 'post' AND vote_type = -1)
      WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'comment' THEN
      UPDATE comments SET 
        upvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = OLD.target_id AND target_type = 'comment' AND vote_type = 1),
        downvote_count = (SELECT COUNT(*) FROM votes WHERE target_id = OLD.target_id AND target_type = 'comment' AND vote_type = -1)
      WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER update_vote_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_vote_counts();

-- Trigger: update comment count on posts
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_comment_count_trigger
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_count();

-- Give karma (+5) for creating a post
CREATE OR REPLACE FUNCTION public.reward_post_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET credits = credits + 5 WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reward_post_creation_trigger
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.reward_post_creation();

-- Give karma (+2) for commenting
CREATE OR REPLACE FUNCTION public.reward_comment_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET credits = credits + 2 WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reward_comment_creation_trigger
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.reward_comment_creation();
