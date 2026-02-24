

# Fix Chat: Send Message Not Working

## Issues Found

### 1. Silent Error Swallowing in `useSendMessage`
The `useSendMessage` mutation in `src/hooks/useChat.ts` has no `onError` callback. If the Supabase insert fails (RLS violation, network error, auth expiry), the user sees **zero feedback** -- the text input clears, but nothing is sent. This is the most likely cause of "send message not working."

### 2. No Toast/Error Feedback in `ChatConversation.tsx`
The `handleSend` function calls `sendMessage.mutate(...)` without passing `onError` or `onSuccess` callbacks. There is no user-visible indicator that a message failed to send.

### 3. Email Input `.trim()` in onChange (Auth page)
The `emailPrefix` onChange handler applies `.trim()` on every keystroke. While this doesn't cause the cursor-jumping bug (that was the component remount), it silently strips any spaces users might type. This is minor but noted.

## Fix Plan

### File: `src/hooks/useChat.ts`

**Add `onError` to `useSendMessage`**: Surface mutation errors so they can be caught by callers.

### File: `src/pages/ChatConversation.tsx`

**Add error handling to `handleSend`**: 
- Use `sendMessage.mutate({ ... }, { onError: (e) => toast.error(e.message) })` to show a toast on failure
- Don't clear the text input until the mutation succeeds (move `setText("")` to `onSuccess`)
- Show a toast on error so the user knows what went wrong

Changes:
```tsx
const handleSend = () => {
  if (!text.trim() || !conversationId) return;
  const body = text.trim();
  sendMessage.mutate(
    { conversationId, body },
    {
      onSuccess: () => setText(""),
      onError: (e: any) => toast.error(e.message || "Failed to send message"),
    }
  );
};
```

This also fixes the UX issue where text was cleared before confirming the message was sent.

**Add `import { toast } from "sonner"`** to ChatConversation.tsx.

## Summary

| File | Change |
|------|--------|
| `src/pages/ChatConversation.tsx` | Add toast import, move `setText("")` to `onSuccess`, add `onError` toast, keep text on failure |

One file, ~5-line change. No database changes needed.

