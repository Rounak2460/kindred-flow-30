

# Fix Chat: "New Row Violates RLS" on Conversation Creation

## Root Cause

The error `new row violates row-level security policy for table "conversations"` happens at this line in `useStartConversation`:

```ts
const { data: conv, error: convErr } = await supabase
  .from("conversations")
  .insert({})
  .select("id")   // <-- THIS FAILS
  .single();
```

The `.select("id")` after `.insert({})` requires the SELECT policy to pass on the newly inserted row. The SELECT policy is:

```sql
USING (id IN (SELECT get_my_conversation_ids()))
```

But `get_my_conversation_ids()` queries `conversation_participants` -- and the user hasn't been added as a participant yet (that happens AFTER this step). So the SELECT check fails, and PostgREST returns an RLS violation.

This is a chicken-and-egg problem: you need the conversation ID to add participants, but you can't read the conversation ID until participants exist.

## Fix: Atomic Database Function

Create a `SECURITY DEFINER` database function that handles the entire conversation creation atomically:

1. Check if a conversation already exists between the two users
2. If not, create one and add both participants
3. Return the conversation ID

This bypasses the RLS chicken-and-egg issue entirely.

### Database Migration

```sql
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

  -- Check for existing conversation between the two users
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

  -- Create new conversation
  INSERT INTO conversations DEFAULT VALUES
  RETURNING id INTO new_conv_id;

  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES 
    (new_conv_id, current_uid),
    (new_conv_id, other_user_id);

  RETURN new_conv_id;
END;
$$;
```

### Frontend Change: `src/hooks/useChat.ts`

Replace the `useStartConversation` function body to call the RPC instead of doing 3 separate queries:

```ts
export function useStartConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useCallback(async (otherUserId: string): Promise<string> => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .rpc("start_conversation", { other_user_id: otherUserId });
    
    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    return data as string;
  }, [user, queryClient]);
}
```

This replaces ~30 lines of fragile multi-step logic with a single atomic RPC call.

## Summary

| Change | Detail |
|--------|--------|
| New DB function | `start_conversation(other_user_id uuid)` -- SECURITY DEFINER, atomic |
| Frontend | Replace `useStartConversation` body with single `supabase.rpc()` call |
| Root cause | `.insert({}).select("id")` fails because SELECT policy can't see the row before participants are added |

