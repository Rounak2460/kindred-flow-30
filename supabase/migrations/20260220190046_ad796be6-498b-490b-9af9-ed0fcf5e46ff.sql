UPDATE auth.users 
SET email_confirmed_at = now(),
    updated_at = now()
WHERE id = 'c909d8cc-bf0d-4609-bcfe-09f0d60101c4';