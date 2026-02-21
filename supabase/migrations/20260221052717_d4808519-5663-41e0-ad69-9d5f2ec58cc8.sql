
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  post_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Allow inserts from triggers (SECURITY DEFINER functions bypass RLS)
-- Also allow authenticated users to insert for flexibility
CREATE POLICY "Authenticated can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: notify on comment
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, post_id)
  SELECT p.user_id, 'comment', 'New comment on your post',
    'Someone commented on "' || p.title || '"', p.id
  FROM posts p WHERE p.id = NEW.post_id
  AND p.user_id != NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_notify
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Trigger: notify on upvote
CREATE OR REPLACE FUNCTION public.notify_on_upvote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.vote_type = 1 THEN
    IF NEW.target_type = 'post' THEN
      INSERT INTO notifications (user_id, type, title, body, post_id)
      SELECT p.user_id, 'upvote', 'Your post was upvoted',
        'Someone upvoted "' || p.title || '"', p.id
      FROM posts p WHERE p.id = NEW.target_id
      AND p.user_id != NEW.user_id;
    ELSIF NEW.target_type = 'comment' THEN
      INSERT INTO notifications (user_id, type, title, body, post_id)
      SELECT c.user_id, 'upvote', 'Your comment was upvoted',
        'Someone upvoted your comment', c.post_id
      FROM comments c WHERE c.id = NEW.target_id
      AND c.user_id != NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_upvote_notify
AFTER INSERT ON public.votes
FOR EACH ROW EXECUTE FUNCTION public.notify_on_upvote();
