
-- Function to notify chat message recipient
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recipient_id uuid;
  sender_name text;
BEGIN
  -- Find the other participant (not the sender)
  SELECT cp.user_id INTO recipient_id
  FROM conversation_participants cp
  WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id != NEW.sender_id
  LIMIT 1;

  IF recipient_id IS NULL THEN RETURN NEW; END IF;

  -- Get sender's display name
  SELECT name INTO sender_name
  FROM profiles WHERE user_id = NEW.sender_id;

  INSERT INTO notifications (user_id, type, title, body, post_id)
  VALUES (
    recipient_id,
    'message',
    'New message from ' || COALESCE(NULLIF(sender_name, ''), 'Someone'),
    LEFT(NEW.body, 100),
    NULL
  );

  RETURN NEW;
END;
$$;

-- Trigger on messages table
CREATE TRIGGER on_message_notify
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_message();
