# Review Checklist

Run every check in every review. Mark each as ✅ Pass, ⚠️ Issue, or N/A.

---

## 1. Brief Alignment

### Primary Goal
- [ ] Does the work solve the primary goal stated in `ux-brief.md`?
- [ ] Is the most important action/message visible without scrolling on desktop?
- [ ] Is the most important action/message visible without scrolling on mobile?

### User Archetype Match
- [ ] Does the visual tone match the primary archetype's trust signals?
- [ ] Is the language appropriate for the archetype's knowledge level?
- [ ] Are the archetype's fears addressed somewhere visible?

### Journey Map Alignment
- [ ] Does the layout support the expected user flow (arrival → exploration → decision)?
- [ ] Is the decision point (CTA, conversion moment) clearly signposted?
- [ ] Does the post-action state exist and feel complete?

### Project-Type Specific

**Marketing / Landing:**
- [ ] Is there a single dominant CTA per section?
- [ ] Is social proof present and specific (not generic)?
- [ ] Is the value proposition stated in the first viewport?

**Portfolio:**
- [ ] Is the viewer's next action (contact, view work) unambiguous?
- [ ] Does the work speak to the primary archetype (peer, client, or recruiter)?
- [ ] Is the contributor's role clear on each piece of work?

**Web App:**
- [ ] Are all primary user tasks reachable within 2 clicks from the landing state?
- [ ] Do empty states guide the user toward the first meaningful action?
- [ ] Are error states recoverable — not just informative?

---

## 2. Design System Consistency

### Color
- [ ] All colors use semantic tokens from `system.md` — no hardcoded hex values
- [ ] Accent color used only for primary actions and key highlights
- [ ] No more than one primary CTA color per surface
- [ ] Destructive/error color not used decoratively

### Typography
- [ ] All type sizes come from the defined scale in `system.md`
- [ ] No more than 2 typefaces in use
- [ ] Heading hierarchy is logical (H1 → H2 → H3, no skipped levels)
- [ ] Body text uses the defined line-height (`leading-relaxed` or as specified)
- [ ] Body text width constrained to `max-w-prose` or as specified

### Spacing
- [ ] All spacing values are from the 8px grid — no arbitrary pixel values
- [ ] Component internal padding consistent with density level in `system.md`
- [ ] Section spacing consistent with project type density guidelines

### Components
- [ ] All buttons match the defined Tailwind pattern in `system.md`
- [ ] Focus states present on all interactive elements (matches `focus-visible:ring` spec)
- [ ] Hover states present on all interactive elements
- [ ] Disabled states visually distinct and non-interactive
- [ ] No one-off component styles that should be in the system

### Border Radius & Shadows
- [ ] Border radius consistent with `radius-*` tokens in `system.md`
- [ ] Shadow/elevation consistent with `shadow-*` tokens — no arbitrary shadows

---

## 3. Accessibility (WCAG 2.1 AA)

### Color & Contrast
- [ ] Normal text (< 18px): contrast ratio ≥ 4.5:1
- [ ] Large text (≥ 18px or 14px bold): contrast ratio ≥ 3:1
- [ ] UI components and focus indicators: contrast ratio ≥ 3:1
- [ ] Information not conveyed by color alone (icons, labels, patterns used too)

### Keyboard & Focus
- [ ] All interactive elements reachable via Tab
- [ ] Focus order follows visual/logical reading order
- [ ] Focus indicator visible on all interactive elements (`focus-visible` not just `focus`)
- [ ] No keyboard traps (except intentional modal focus trapping)
- [ ] Modals/drawers trap focus while open and restore focus to trigger on close
- [ ] Skip link present if page has significant nav before main content

### Semantics & Structure
- [ ] Page has a single `<h1>`
- [ ] Heading levels are sequential — no skipped levels (H1 → H3 with no H2)
- [ ] Landmark regions used: `<main>`, `<nav>`, `<header>`, `<footer>`
- [ ] Buttons use `<button>`, links use `<a href>` — not `<div onClick>`
- [ ] Images have meaningful `alt` text; decorative images have `alt=""`
- [ ] Form inputs have associated `<label>` elements (not just placeholders)
- [ ] Error messages are associated with their input via `aria-describedby`

### Interactive Components
- [ ] Custom dropdowns/selects have correct ARIA roles and keyboard behavior
- [ ] Modals have `role="dialog"` and `aria-labelledby`
- [ ] Icon-only buttons have `aria-label`
- [ ] Loading states announced to screen readers (`aria-live` or `aria-busy`)
- [ ] Toast/alert notifications use `role="status"` or `role="alert"` as appropriate

---

## 4. Responsive Behavior

### Layout
- [ ] No horizontal scroll at 320px, 375px, 768px, 1024px, 1280px
- [ ] Content doesn't overflow its container at any breakpoint
- [ ] Grid columns collapse gracefully (no 1-column grid that should be 2-column at tablet)
- [ ] No fixed-width elements that break mobile layout

### Typography
- [ ] Headlines scale down on mobile (minimum 2 steps from desktop size)
- [ ] Body text remains readable at mobile (min 16px, `leading-relaxed`)
- [ ] No text truncation that hides meaningful content

### Navigation
- [ ] Desktop nav is not shown on mobile without a hamburger/toggle
- [ ] Mobile nav is fully functional and keyboard accessible
- [ ] Active/current page indicated in nav at all breakpoints

### Touch & Interaction
- [ ] Touch targets are at least 44×44px on mobile
- [ ] Hover-dependent interactions have touch equivalents
- [ ] No content exclusively visible on hover with no mobile equivalent

### Images & Media
- [ ] Images use responsive sizing (`w-full`, `max-w-*`, or `srcset`)
- [ ] Images don't distort or crop badly at any breakpoint
- [ ] No fixed-height image containers that cause awkward cropping on mobile
