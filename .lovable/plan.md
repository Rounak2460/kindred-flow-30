

# Simplify Auth: Remove Outlook, Add Email Prefix Input

## Changes to `src/pages/Auth.tsx`

### 1. Remove all Microsoft/Outlook code
- Delete `loginWithMicrosoft` callback (lines 81-93)
- Delete `MicrosoftButton` component (lines 145-160)
- Delete `Divider` component (lines 162-168)
- Remove `<MicrosoftButton />` and `<Divider />` from login step (lines 209-210)
- Remove `<MicrosoftButton />` and `<Divider />` from signup step (lines 231-236)
- Remove the `onAuthStateChange` domain enforcement effect (lines 34-45) since there's no OAuth anymore

### 2. Change email input to prefix-only with fixed suffix
- Replace `email` state with `emailPrefix` state (stores just the part before @)
- Compute full email as `${emailPrefix}@iimb.ac.in`
- Replace all email `<Input>` fields with a combined input showing a fixed `@iimb.ac.in` suffix:
  ```
  ┌──────────────────────────────────────┐
  │ rounak.tikmani24  │ @iimb.ac.in      │
  └──────────────────────────────────────┘
  ```
  This uses a flex container with the Input on the left and a styled static suffix on the right.
- Placeholder becomes `"yourname"` instead of `"yourname@iimb.ac.in"`
- Input type changes from `"email"` to `"text"`
- Remove `isValidEmail` function -- no longer needed since domain is always `@iimb.ac.in`
- Update all references: `loginWithPassword`, `sendMagicLink`, and the verify-otp description to use the computed full email

### 3. Update helper text
- Remove "Only @iimb.ac.in emails accepted" note (it's now implicit from the UI)
- Update verify-otp description to show full email: `We sent a login link to ${emailPrefix}@iimb.ac.in`

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Remove Outlook OAuth, change email input to prefix-only with fixed `@iimb.ac.in` suffix |

No database changes needed.

