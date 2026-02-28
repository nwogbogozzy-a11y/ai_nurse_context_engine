# Query Patterns Library

Proven query templates organized by decision type. Copy and adapt — always replace `[brackets]` with specifics. More specific = better results.

---

## Typography

```
What principles govern type hierarchy when users are [scanning / reading long-form / completing a task]?

How should type scale relate to spatial hierarchy in [mobile / desktop / data-dense] interfaces?

What makes body text feel trustworthy vs clinical in [context]?

When should you use weight vs size vs color to create typographic emphasis?

What are the tradeoffs between system fonts and custom typefaces for [audience type]?

How does line length affect reading comprehension in [context]?
```

**Best notebooks:** `@visual`, `@web`

---

## Color

```
What psychological associations does [color/hue] carry for [audience/culture]?

How should color be used to create hierarchy without relying on it as the sole differentiator?

What are best practices for accessible color palettes that still feel visually distinctive?

How should a [brand personality] translate into a color system?

When is it appropriate to use color to signal state vs category vs priority?

What's the right balance between neutral and accent colors in [interface type]?
```

**Best notebooks:** `@visual`, `@ux`

---

## Layout & Grid

```
What grid systems work best for [content type] at [breakpoint range]?

How should whitespace be used to create hierarchy rather than just separation?

What layout patterns work for [user task — scanning, comparing, completing a form]?

When should layout be asymmetric vs balanced, and what does each communicate?

How does visual weight distribution affect user trust and focus?

What are the principles behind F-pattern and Z-pattern scanning, and when does each apply?
```

**Best notebooks:** `@visual`, `@web`

---

## Navigation & Information Architecture

```
What IA patterns work best when users have [high / low] domain familiarity?

How should navigation adapt when users are [exploring vs seeking a specific item]?

What are the principles behind progressive disclosure and when should it be applied?

How do you design navigation for [mobile / desktop / both] without losing orientation cues?

What signals help users understand where they are in a system?

When is breadcrumb navigation appropriate vs harmful?
```

**Best notebooks:** `@ux`, `@web`

---

## Forms & Data Entry

```
What principles reduce cognitive load in [long / multi-step / complex] forms?

How should validation feedback be timed and positioned for [form type]?

What makes error messages feel helpful rather than punitive?

When should form fields be stacked vs inline, and what does layout communicate?

How should optional vs required fields be distinguished without creating anxiety?

What are best practices for [autocomplete / dropdowns / date pickers] in terms of user control?
```

**Best notebooks:** `@ux`, `@web`

---

## Interaction & Motion

```
What principles govern when motion adds meaning vs when it's just decoration?

How should transition duration and easing relate to the weight of the action being performed?

What interaction feedback patterns build user confidence without slowing them down?

When should state changes be animated vs instant, and what's the threshold?

How does microinteraction design affect perceived system responsiveness?
```

**Best notebooks:** `@ux`, `@web`

---

## Content & Microcopy

```
What principles make interface copy feel like a human wrote it rather than a system?

How should error messages be written to maintain trust while explaining what went wrong?

What's the difference between instructional copy and confirmational copy, and when do you need each?

How does content tone need to shift between [onboarding / error states / success states / empty states]?

What makes a CTA feel compelling rather than generic?

How should copy be adapted for [mobile / desktop] contexts where reading behavior differs?
```

**Best notebooks:** `@copy`, `@ux`

---

## Components

```
What design principles distinguish a [button / card / modal / table] that feels native from one that feels bolted on?

How should [component type] communicate its affordances to new users?

What states does a [component] need to handle, and how should each be visually differentiated?

When is a [modal / drawer / inline expansion] the right container pattern, and what are the tradeoffs?

How do component patterns need to adapt across [screen sizes / input methods]?
```

**Best notebooks:** `@web`, `@ux`

---

## Accessibility

```
Beyond contrast ratios, what makes an interface genuinely accessible to [low vision / motor impairment / cognitive load] users?

How should focus management work in [single-page apps / modals / multi-step flows]?

What ARIA patterns are appropriate for [component type], and when does ARIA do more harm than good?

How does semantic HTML structure affect both accessibility and SEO?

What are the most commonly missed accessibility requirements in [form / navigation / data table] design?
```

**Best notebooks:** `@web`, `@ux`

---

## Design Systems

```
What principles govern when a pattern should be a component vs a one-off?

How should a design system communicate the intent behind decisions, not just the decisions themselves?

What's the right granularity for design tokens — too coarse vs too fine?

How do you design a system that's flexible enough for edge cases but constrained enough to be consistent?

What governance models work for design systems at [small team / mid-size / enterprise] scale?
```

**Best notebooks:** `@product`, `@web`

---

## User Research & Problem Framing

```
What research methods are appropriate when [timeline / budget / access] is constrained?

How do you translate qualitative research findings into design constraints?

What frameworks help prioritize user needs when they conflict with business goals?

How should personas be constructed to be useful rather than reductive?

What's the difference between user goals, tasks, and behaviors, and how does each inform design differently?
```

**Best notebooks:** `@ux`, `@product`

---

## Query Writing Tips

**Include context:** Who is the user, what are they trying to do, what's the constraint?
> Instead of: `"how should buttons look"`
> Use: `"what visual weight and size should primary CTAs have on a mobile checkout flow where users are completing a high-stakes financial transaction?"`

**Name the tension:** The best queries surface a genuine tradeoff.
> `"when does adding visual complexity help users understand a data visualization vs when does it hurt comprehension?"`

**Specify the audience:** Results shift significantly based on this.
> `"...for users with low technical literacy"` vs `"...for power users who use the tool daily"`

**Ask for principles, not solutions:** NotebookLM surfaces theory better than it generates specific UI recommendations.
> Instead of: `"what should my nav look like"`
> Use: `"what principles should govern navigation design for a content-heavy site where users have varying levels of familiarity?"`
