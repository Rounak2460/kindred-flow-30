
-- Create verification_codes table (service role only, no public RLS)
CREATE TABLE public.verification_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS but add NO policies (only service role can access)
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Index for lookups
CREATE INDEX idx_verification_codes_user_id ON public.verification_codes (user_id);
CREATE INDEX idx_verification_codes_expires ON public.verification_codes (expires_at);

-- Add email_verified to profiles
ALTER TABLE public.profiles ADD COLUMN email_verified boolean NOT NULL DEFAULT false;
