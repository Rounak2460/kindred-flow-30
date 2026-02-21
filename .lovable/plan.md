

# Fix Academics Page to Match Updated Design System

The Academics page was missed during the 50-issue overhaul and still has old patterns. Here are the specific fixes needed to align it with the already-updated Exchange, Internships, and other section pages:

## Changes to `src/pages/Academics.tsx`

1. **max-w-3xl to max-w-2xl** -- all other pages use max-w-2xl
2. **Remove emoji from heading** -- "📚 Academics" becomes "Academics" (font-semibold, not font-bold)
3. **Back button uses navigate("/")** -- should use navigate(-1) like Exchange
4. **"Add Review" button is rounded-full** -- should be rounded-lg + pass category query param
5. **Search input is rounded-full** -- should be rounded-lg for consistency
6. **Sample banner still present** -- remove the yellow "These are examples" box (lines 67-72)
7. **Sample Badge still present** -- remove the "Sample" badge on cards (line 92)
8. **Sample cards not clickable** -- remove the `!showSamples &&` guard so sample cards navigate to detail pages
9. **Empty state uses emoji** -- remove the magnifying glass emoji from the empty state (line 80)
10. **Unused imports** -- remove `BookOpen` and `Badge` imports (no longer needed)

## Changes to `src/pages/CourseDetail.tsx`

11. **max-w-3xl to max-w-2xl** -- consistency
12. **Back button hardcodes /academics** -- should use navigate(-1)
13. **"Write Review" button is rounded-full** -- should be rounded-lg + pass category query param
14. **h1 uses font-bold** -- should be font-semibold

## Verification

After implementation, navigate to /academics in the browser to confirm:
- Clean header without emoji
- Sample data shows silently without banners/badges
- Cards are clickable
- Consistent styling with other section pages

