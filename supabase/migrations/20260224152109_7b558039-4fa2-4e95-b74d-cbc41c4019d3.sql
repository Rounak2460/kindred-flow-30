
-- Create a helper function (SECURITY DEFINER bypasses RLS, breaking recursion)
CREATE OR REPLACE FUNCTION public.get_my_conversation_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid();
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can read co-participants" ON conversation_participants;

-- Drop the old narrow policy
DROP POLICY IF EXISTS "Users can read own participation" ON conversation_participants;

-- New policy using the helper function
CREATE POLICY "Users can read participants in own conversations"
  ON conversation_participants FOR SELECT
  USING (conversation_id IN (SELECT get_my_conversation_ids()));

-- Update conversations SELECT policy
DROP POLICY IF EXISTS "Users can read own conversations" ON conversations;
CREATE POLICY "Users can read own conversations"
  ON conversations FOR SELECT
  USING (id IN (SELECT get_my_conversation_ids()));

-- Update messages SELECT policy
DROP POLICY IF EXISTS "Users can read messages in own conversations" ON messages;
CREATE POLICY "Users can read messages in own conversations"
  ON messages FOR SELECT
  USING (conversation_id IN (SELECT get_my_conversation_ids()));

-- Update messages INSERT policy
DROP POLICY IF EXISTS "Users can send messages in own conversations" ON messages;
CREATE POLICY "Users can send messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND conversation_id IN (SELECT get_my_conversation_ids()));
