
-- Remove FK constraint from posts.user_id -> auth.users (we use RLS for access control, not FKs)
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Same for comments
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
