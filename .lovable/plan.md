

# Typing Indicators & Online Status for Chat

## Current State

The chat backend (RLS policies, `start_conversation` RPC, realtime subscriptions) is now correctly configured. The previous fixes addressed:
- Error handling with toast feedback in `ChatConversation.tsx`
- RLS infinite recursion via `get_my_conversation_ids()` SECURITY DEFINER function
- Atomic conversation creation via `start_conversation()` RPC

The chat flow should now work. The user should re-test by logging in and clicking "Send Message" on a user profile.

## New Feature: Typing Indicators & Online Status

### Approach: Supabase Realtime Presence (No DB Changes)

Both features can be implemented using **Supabase Realtime Presence** — no new tables or migrations needed. Presence is an in-memory feature that tracks which users are online and what they're doing, perfect for ephemeral state like typing and online status.

### 1. Online Status (Green Dot)

**How it works:**
- When a user loads the app, join a global presence channel (`online-users`) with their user ID
- Other users can check presence state to see who's online
- Show a green dot on the avatar in `ChatConversation.tsx` header and in `ChatList.tsx` conversation items

**File: `src/hooks/usePresence.ts`** (new)
- `useOnlinePresence()` — joins the `online-users` channel on mount, tracks current online user IDs
- Returns a `Set<string>` of online user IDs
- Automatically leaves on unmount

**File: `src/pages/ChatConversation.tsx`**
- Import `useOnlinePresence`
- Show a green dot next to the other user's name in the header when they're online

**File: `src/pages/ChatList.tsx`**
- Import `useOnlinePresence`
- Show a green dot on each conversation avatar where the other user is online

### 2. Typing Indicator (Animated Dots)

**How it works:**
- When a user types in a conversation, broadcast a `typing` event on a conversation-specific presence channel
- The other user sees an animated "typing..." indicator below the messages
- Typing state expires after 3 seconds of inactivity

**File: `src/hooks/useTypingIndicator.ts`** (new)
- `useTypingIndicator(conversationId, userId)` — manages typing state for a specific conversation
- `setTyping(isTyping: boolean)` — broadcasts typing state
- `isOtherTyping` — boolean indicating if the other participant is typing
- Uses debounce: sets typing=true on keystroke, resets to false after 3s of no input

**File: `src/pages/ChatConversation.tsx`**
- Import `useTypingIndicator`
- Call `setTyping(true)` in the textarea's `onChange` handler
- Call `setTyping(false)` on send
- Render animated dots ("typing...") above the input area when `isOtherTyping` is true

### 3. UI Components

**Typing indicator animation** — three bouncing dots, inline in the message area:
```
<div className="flex gap-1 items-center px-4 py-2">
  <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
  <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
  <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
</div>
```

**Online dot** — small green circle with a subtle pulse:
```
<span className="h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
```

## File Summary

| File | Change |
|------|--------|
| `src/hooks/usePresence.ts` | New — global online presence tracking |
| `src/hooks/useTypingIndicator.ts` | New — per-conversation typing state via Realtime |
| `src/pages/ChatConversation.tsx` | Add online dot in header, typing indicator in messages, wire up typing on input change |
| `src/pages/ChatList.tsx` | Add online dots next to conversation avatars |

No database migrations needed — this uses Supabase Realtime Presence which is entirely in-memory.

