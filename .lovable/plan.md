

# Fix: Email Input Loses Cursor After Each Keystroke

## Root Cause

`EmailPrefixInput` is defined as a **component function inside the `Auth` component body** (line 118-133). Every time `emailPrefix` state changes (i.e., every keystroke), `Auth` re-renders, which creates a **new function reference** for `EmailPrefixInput`. React sees it as a completely different component type, so it **unmounts the old input and mounts a new one** — destroying focus.

## Fix

**Inline the JSX** directly where `<EmailPrefixInput>` is used (lines 177 and 197) instead of wrapping it in a component function. This way React sees the same element tree across renders and preserves focus.

### File: `src/pages/Auth.tsx`

1. **Delete** the `EmailPrefixInput` component definition (lines 118-133)
2. **Replace** `<EmailPrefixInput id="email" />` on line 177 and line 197 with the raw JSX:

```tsx
<div className="flex items-center rounded-lg border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
  <Input
    id="email"
    type="text"
    placeholder="yourname"
    value={emailPrefix}
    onChange={(e) => setEmailPrefix(e.target.value.toLowerCase().trim())}
    className="border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
    required
  />
  <span className="px-3 text-sm text-muted-foreground whitespace-nowrap border-l border-border bg-muted/50">
    @iimb.ac.in
  </span>
</div>
```

No other files affected. Single file, ~15-line change.

