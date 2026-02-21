
-- Fix overly permissive INSERT policy
DROP POLICY "Authenticated can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);
