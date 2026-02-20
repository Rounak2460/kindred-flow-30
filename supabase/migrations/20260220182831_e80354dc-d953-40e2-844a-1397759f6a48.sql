
-- Add moderation status to posts
ALTER TABLE public.posts 
ADD COLUMN moderation_status text NOT NULL DEFAULT 'pending',
ADD COLUMN moderation_reason text;

-- Add moderation status to comments
ALTER TABLE public.comments 
ADD COLUMN moderation_status text NOT NULL DEFAULT 'pending',
ADD COLUMN moderation_reason text;

-- Update existing posts/comments to approved so they still show
UPDATE public.posts SET moderation_status = 'approved';
UPDATE public.comments SET moderation_status = 'approved';

-- Index for filtering by status
CREATE INDEX idx_posts_moderation_status ON public.posts(moderation_status);
CREATE INDEX idx_comments_moderation_status ON public.comments(moderation_status);
