

# Fix Chat: Infinite Recursion in RLS Policies

## Root Cause

The `conversation_participants` table has two SELECT policies:

1. **"Users can read own participation"** -- `user_id = auth.uid()` (correct, no recursion)
2. **"Users can read co-participants"** -- `EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid())`

Policy #2 queries `conversation_participants` **from within its own RLS policy**, which triggers an infinite recursion loop. This error cascades to all chat operations because reading participants is needed to check access to conversations and messages.

## Fix

### Database Migration

1. **Drop** the recursive "Users can read co-participants" policy on `conversation_participants`
2. **Replace** with a security-definer function that breaks the recursion cycle
3. **Update** the SELECT policy to use the function instead of a direct subquery

```sql
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
DROP POLICY "Users can read co-participants" ON conversation_participants;

-- Replace "Users can read own participation" with a broader policy
-- that lets users see all participants in their conversations
DROP POLICY "Users can read own participation" ON conversation_participants;
CREATE POLICY "Users can read participants in own conversations"
  ON conversation_participants FOR SELECT
  USING (conversation_id IN (SELECT get_my_conversation_ids()));
```

Also update the `conversations` and `messages` SELECT policies to use the same function to avoid potential issues:

```sql
DROP POLICY "Users can read own conversations" ON conversations;
CREATE POLICY "Users can read own conversations"
  ON conversations FOR SELECT
  USING (id IN (SELECT get_my_conversation_ids()));

DROP POLICY "Users can read messages in own conversations" ON messages;
CREATE POLICY "Users can read messages in own conversations"
  ON messages FOR SELECT
  USING (conversation_id IN (SELECT get_my_conversation_ids()));

DROP POLICY "Users can send messages in own conversations" ON messages;
CREATE POLICY "Users can send messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND conversation_id IN (SELECT get_my_conversation_ids()));
```

### No Frontend Changes Needed

The `ChatConversation.tsx` error handling (toast on failure, keep text on error) is already in place from the previous fix. Once the RLS recursion is resolved, the existing frontend code will work correctly.

## Summary

| Change | Detail |
|--------|--------|
| New DB function | `get_my_conversation_ids()` -- SECURITY DEFINER to bypass RLS |
| Drop policies | 5 recursive/problematic policies |
| Create policies | 4 new policies using the helper function |
| Frontend changes | None |

This is purely a database-level fix. One migration, zero code changes.

