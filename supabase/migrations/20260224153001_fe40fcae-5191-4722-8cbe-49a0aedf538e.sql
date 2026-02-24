
CREATE OR REPLACE FUNCTION public.start_conversation(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_uid uuid := auth.uid();
  existing_conv_id uuid;
  new_conv_id uuid;
BEGIN
  IF current_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT cp1.conversation_id INTO existing_conv_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = current_uid 
    AND cp2.user_id = other_user_id
  LIMIT 1;

  IF existing_conv_id IS NOT NULL THEN
    RETURN existing_conv_id;
  END IF;

  INSERT INTO conversations DEFAULT VALUES
  RETURNING id INTO new_conv_id;

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES 
    (new_conv_id, current_uid),
    (new_conv_id, other_user_id);

  RETURN new_conv_id;
END;
$$;
