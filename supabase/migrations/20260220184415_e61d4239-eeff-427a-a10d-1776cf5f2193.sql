
-- Drop potentially existing triggers first, then recreate
DROP TRIGGER IF EXISTS reward_post_creation_trigger ON public.posts;
DROP TRIGGER IF EXISTS reward_comment_creation_trigger ON public.comments;
DROP TRIGGER IF EXISTS update_vote_counts_on_insert ON public.votes;
DROP TRIGGER IF EXISTS update_vote_counts_on_update ON public.votes;
DROP TRIGGER IF EXISTS update_vote_counts_on_delete ON public.votes;
DROP TRIGGER IF EXISTS update_karma_on_insert ON public.votes;
DROP TRIGGER IF EXISTS update_karma_on_update ON public.votes;
DROP TRIGGER IF EXISTS update_karma_on_delete ON public.votes;
DROP TRIGGER IF EXISTS update_comment_count_on_insert ON public.comments;
DROP TRIGGER IF EXISTS update_comment_count_on_delete ON public.comments;
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
DROP TRIGGER IF EXISTS check_founding_trigger ON public.posts;

-- Vote count triggers
CREATE TRIGGER update_vote_counts_on_insert AFTER INSERT ON public.votes FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();
CREATE TRIGGER update_vote_counts_on_update AFTER UPDATE ON public.votes FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();
CREATE TRIGGER update_vote_counts_on_delete AFTER DELETE ON public.votes FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();

-- Karma triggers
CREATE TRIGGER update_karma_on_insert AFTER INSERT ON public.votes FOR EACH ROW EXECUTE FUNCTION public.update_karma_on_vote();
CREATE TRIGGER update_karma_on_update AFTER UPDATE ON public.votes FOR EACH ROW EXECUTE FUNCTION public.update_karma_on_vote();
CREATE TRIGGER update_karma_on_delete AFTER DELETE ON public.votes FOR EACH ROW EXECUTE FUNCTION public.update_karma_on_vote();

-- Comment count triggers
CREATE TRIGGER update_comment_count_on_insert AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();
CREATE TRIGGER update_comment_count_on_delete AFTER DELETE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- Credit rewards (with double credits for early posts)
CREATE OR REPLACE FUNCTION public.reward_post_creation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE total_posts integer; credit_amount integer;
BEGIN
  SELECT COUNT(*) INTO total_posts FROM posts;
  IF total_posts <= 200 THEN credit_amount := 10; ELSE credit_amount := 5; END IF;
  UPDATE profiles SET credits = credits + credit_amount WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reward_post_creation_trigger AFTER INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.reward_post_creation();
CREATE TRIGGER reward_comment_creation_trigger AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.reward_comment_creation();

-- Updated_at triggers
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Founding contributor auto-badge
CREATE OR REPLACE FUNCTION public.check_founding_contributor()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE poster_count integer; already_founding boolean;
BEGIN
  SELECT founding_contributor INTO already_founding FROM profiles WHERE user_id = NEW.user_id;
  IF already_founding IS TRUE THEN RETURN NEW; END IF;
  SELECT COUNT(DISTINCT user_id) INTO poster_count FROM posts;
  IF poster_count <= 50 THEN
    UPDATE profiles SET founding_contributor = true WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_founding_trigger AFTER INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.check_founding_contributor();

-- Handle new user trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$;
