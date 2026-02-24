

# Implementation Plan: 4 Major Changes + Remove Gossip Section

This plan implements all 4 changes from the uploaded prompt AND removes the Gossip section entirely.

---

## REMOVAL: Gossip Section (Complete Cleanup)

Remove all Gossip-related code from the frontend. Database tables stay (no harm), but all UI references are eliminated.

### Files to Delete
- `src/pages/Gossip.tsx`
- `src/hooks/useGossip.ts`
- `supabase/functions/moderate-gossip/index.ts`

### Files to Modify

**`src/App.tsx`**: Remove `import Gossip` and the `/gossip` route.

**`src/components/layout/BottomNav.tsx`**: Remove the Gossip tab (`{ key: "/gossip", icon: EyeOff, label: "Gossip" }`). Replace with Chat tab (from Change 3): `{ key: "/chat", icon: MessageCircle, label: "Chat" }`.

**`src/components/layout/Navbar.tsx`**: Remove the "Gossip" button from desktop nav (line 281), remove Gossip from dropdown menu (line 303), remove Gossip button for unauthenticated users (line 312). Remove `EyeOff` import.

**`src/contexts/AuthContext.tsx`**: Keep `gossip_member` in the Profile interface and select query (it's a DB column, removing it would break things). Just leave it unused.

---

## CHANGE 1: Microsoft / Outlook Login (restricted to @iimb.ac.in)

### File: `src/pages/Auth.tsx`

Add `loginWithMicrosoft` callback using `supabase.auth.signInWithOAuth({ provider: "azure" })` with scopes `"email openid profile"` and `redirectTo: window.location.origin + "/auth"`.

Add `onAuthStateChange` listener in Auth.tsx that checks the email domain on `SIGNED_IN` event -- if not `@iimb.ac.in`, call `supabase.auth.signOut()` and show error toast.

Add "Sign in with Outlook" button with Microsoft logo SVG on both login and signup steps, separated by an "or" divider.

**Note**: The Microsoft/Azure provider must be enabled in the backend authentication settings. This is a manual configuration step that requires setting up Azure AD credentials.

---

## CHANGE 2: Named Posts with Anonymous Toggle

### Database Migration

Add `is_anonymous BOOLEAN NOT NULL DEFAULT false` to 6 tables:
- `posts`
- `comments`
- `course_reviews`
- `exchange_reviews`
- `internship_reviews`
- `campus_tips`

### File: `src/hooks/usePosts.ts`
Add `is_anonymous: boolean` to the `Post` interface.

### File: `src/hooks/useComments.ts`
Add `is_anonymous: boolean` to the `Comment` interface. Add `is_anonymous` to the select query.

### File: `src/pages/Submit.tsx`
Add `const [isAnonymous, setIsAnonymous] = useState(false)` state. Add anonymous toggle UI (Switch + EyeOff icon) before the submit button in ALL category forms. Pass `is_anonymous: isAnonymous` in all insert queries (`posts`, `course_reviews`, `exchange_reviews`, `internship_reviews`, `campus_tips`) and in `dualWritePost`.

### File: `src/components/feed/PostCard.tsx`
- Add `is_anonymous?: boolean` to props
- Add `useState` + `useEffect` to fetch author name from `profiles` table when `!is_anonymous && user_id` exists
- When `is_anonymous`, show anonymous handle + EyeOff icon
- When NOT anonymous, show real name as a clickable `<Link to={/user/${user_id}}>` (for Change 3)
- Import `supabase`, `Link`

### File: `src/components/feed/CommentItem.tsx`
- Same logic: check `comment.is_anonymous` to decide real name vs anonymous handle
- Fetch profile name when not anonymous
- Make real names clickable links to `/user/:userId`

### File: `src/pages/PostDetail.tsx`
- Show real name or anonymous handle based on `post.is_anonymous`
- Add anonymous toggle to comment input area
- Pass `is_anonymous: commentAnonymous` when inserting comments
- Make real names clickable

### File: `src/pages/Home.tsx`
- Pass `is_anonymous={post.is_anonymous}` to each `<PostCard>`

### Files: `CourseDetail.tsx`, `ExchangeDetail.tsx`, `InternshipDetail.tsx`
- For reviews: check `r.is_anonymous` to show real name or anonymous handle
- Fetch profile names for non-anonymous reviews

---

## CHANGE 3: Peer-to-Peer Chat System

### Database Migration

Create 3 new tables with RLS:

**`conversations`**: `id UUID PK`, `created_at`, `updated_at`. RLS: users can read only conversations they participate in, authenticated can create.

**`conversation_participants`**: `id UUID PK`, `conversation_id FK`, `user_id FK(auth.users)`, `last_read_at`, `created_at`, `UNIQUE(conversation_id, user_id)`. RLS: users can read/update own participation.

**`messages`**: `id UUID PK`, `conversation_id FK`, `sender_id FK(auth.users)`, `body TEXT`, `created_at`. RLS: users can read/send messages in their conversations only. Index on `(conversation_id, created_at)`.

**Triggers**: `update_conversation_on_message` -- updates `conversations.updated_at` on new message.

**Realtime**: `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;`

Also need a helper function `update_updated_at_column()` if it doesn't exist.

### New Files to Create

**`src/hooks/useChat.ts`**:
- `useConversations()` -- fetch all user's conversations with latest message + other participant's profile
- `useMessages(conversationId)` -- fetch messages for a conversation + realtime subscription
- `useSendMessage()` -- mutation to send a message
- `useStartConversation()` -- find existing or create new conversation between two users
- `useUnreadCount()` -- count conversations with unread messages

**`src/pages/UserProfile.tsx`** (route: `/user/:userId`):
- Public profile view showing avatar, name, batch, section, bio, credits, founding contributor badge
- "Send Message" button that calls `useStartConversation` then navigates to `/chat/:conversationId`
- If viewing own profile, redirect to `/profile`

**`src/pages/ChatList.tsx`** (route: `/chat`):
- List all conversations sorted by `updated_at` desc
- Each row: other person's avatar + name, last message preview, timestamp
- Unread indicator (compare `last_read_at` with latest message time)
- Empty state with encouraging copy

**`src/pages/ChatConversation.tsx`** (route: `/chat/:conversationId`):
- Header with other person's name + back button
- Message list: sender messages right (primary color), received left (gray)
- Real-time updates via Supabase Realtime subscription on messages table
- Text input + send button at bottom
- Auto-scroll to bottom on new messages
- Update `last_read_at` on open

### Files to Modify

**`src/App.tsx`**: Add routes for `/user/:userId`, `/chat`, `/chat/:conversationId`. Import new page components.

**`src/components/layout/Navbar.tsx`**: Add `MessageCircle` icon button next to notification bell (for logged-in users) with unread badge. Links to `/chat`.

**`src/components/layout/BottomNav.tsx`**: Replace Gossip tab with Chat tab.

---

## CHANGE 4: End-to-End Verification

After implementing, systematically test:
- Auth flows (email+password, magic link, Outlook OAuth, domain restriction)
- Named vs anonymous posts, comments, and reviews
- Chat: create conversation from user profile, send/receive messages, realtime updates, unread badges
- Regression: feed, voting, search, all section pages, profile, notifications, theme toggle

---

## Summary of All Files

### Files to Create
| File | Purpose |
|------|---------|
| `src/pages/UserProfile.tsx` | Public profile view with "Send Message" |
| `src/pages/ChatList.tsx` | Conversation list |
| `src/pages/ChatConversation.tsx` | Single chat view with realtime |
| `src/hooks/useChat.ts` | Chat hooks (conversations, messages, send, start) |

### Files to Delete
| File | Reason |
|------|--------|
| `src/pages/Gossip.tsx` | Gossip section removed |
| `src/hooks/useGossip.ts` | Gossip section removed |
| `supabase/functions/moderate-gossip/index.ts` | Gossip section removed |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Add Outlook OAuth button + domain check on callback |
| `src/pages/Submit.tsx` | Add anonymous toggle to all forms |
| `src/pages/Home.tsx` | Pass `is_anonymous` to PostCard |
| `src/pages/PostDetail.tsx` | Named/anon display, comment anon toggle |
| `src/pages/CourseDetail.tsx` | Named/anon review display |
| `src/pages/ExchangeDetail.tsx` | Named/anon review display |
| `src/pages/InternshipDetail.tsx` | Named/anon review display |
| `src/components/feed/PostCard.tsx` | Fetch author name, clickable links |
| `src/components/feed/CommentItem.tsx` | Fetch author name, clickable links |
| `src/components/layout/Navbar.tsx` | Remove Gossip, add Chat icon |
| `src/components/layout/BottomNav.tsx` | Replace Gossip with Chat tab |
| `src/hooks/usePosts.ts` | Add `is_anonymous` to Post interface |
| `src/hooks/useComments.ts` | Add `is_anonymous` to Comment interface + select |
| `src/App.tsx` | Remove Gossip route, add UserProfile + Chat routes |

### Database Migrations
1. Add `is_anonymous BOOLEAN DEFAULT false` to 6 tables
2. Create `conversations`, `conversation_participants`, `messages` tables with RLS
3. Create trigger to update `conversations.updated_at` on new message
4. Enable realtime on `messages` table

