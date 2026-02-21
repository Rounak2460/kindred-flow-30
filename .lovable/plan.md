
# Fix: Add Gossip Central Access on Desktop

## Problem

Gossip Central is fully functional but **unreachable on desktop**. The only navigation to `/gossip` is in the mobile-only `BottomNav` component. Desktop users see no link to Gossip anywhere in the navbar or dropdown menu.

All other workflows are verified working:
- Home feed, categories, sorting -- OK
- Post detail with comments and votes -- OK
- AI Search (fast, ~2-3s, navigates to posts) -- OK
- Submit wizard (3-step flow) -- OK
- Auth page (login/signup) -- OK
- Profile page with editing -- OK
- Gossip Central page itself -- OK (sign-in gate, onboarding gate, post/comment flow)

## Fix

### File: `src/components/layout/Navbar.tsx`

Add a "Gossip" link to the desktop navbar in two places:

1. **For logged-in users**: Add a Gossip icon button next to the Forms and Bell buttons (the `hidden md:flex` row), and add a "Gossip" item in the dropdown menu between "Profile" and "Forms"

2. **For logged-out users**: Add a "Gossip" text link next to the "Join" button so unauthenticated desktop users can also discover the section

### Specific Changes

- Import `EyeOff` icon from lucide-react (matches the Gossip branding)
- Add a new icon button:
```
<Button variant="ghost" size="sm"
  className="hidden md:flex h-9 w-9 p-0 text-muted-foreground hover:bg-accent rounded-full"
  onClick={() => navigate("/gossip")}>
  <EyeOff className="h-4 w-4" />
</Button>
```
- Add a dropdown menu item:
```
<DropdownMenuItem onClick={() => navigate("/gossip")}>
  <EyeOff className="h-3.5 w-3.5 mr-2" /> Gossip
</DropdownMenuItem>
```

This is a single-file, minimal change that makes Gossip Central accessible on all screen sizes.
