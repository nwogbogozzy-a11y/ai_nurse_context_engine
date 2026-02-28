# Skill: ux-research

## What This Skill Does
Establishes the foundational UX brief before any design or implementation work begins. Every downstream agent — design-principles, design-system, builder, design-review — reads from this output. Nothing gets designed without it.

## When to Trigger This Skill
- At the start of every new project or feature
- When the project scope, audience, or goals shift significantly
- When a design-review surfaces a misalignment with user needs

Do NOT skip this skill to save time. A weak brief produces weak design.

---

## Project Type Detection

Identify the project type first — it determines which sections of the brief get emphasis.

| Type | Signals | Brief Emphasis |
|---|---|---|
| **Marketing / Landing Page** | Conversion goal, single CTA, persuasion-focused | User motivation, trust signals, emotional arc, CTA hierarchy |
| **Portfolio / Personal Site** | Personal brand, credibility, audience = peers or clients | Audience sophistication, tone, first impression, showcase logic |
| **Web App / Dashboard** | Task completion, recurring use, data or workflow | User goals vs tasks, pain points, learnability vs efficiency tradeoff |

---

## Research Protocol

### Phase 1 — Intake
Ask the client/stakeholder (or yourself, if this is your own project) the following. Do not skip questions — mark unknown if genuinely unknown.

**About the project:**
- What is this, in one sentence?
- What is the single most important thing a visitor/user should do or feel?
- What does success look like in 90 days?
- What has been tried before, and why didn't it work?
- What are the hard constraints? (tech stack, timeline, brand rules, legal)

**About the users:**
- Who is the primary user? Describe them concretely — not demographics, behaviors.
- What are they trying to accomplish when they arrive?
- What do they already know? What do they not know?
- What makes them trust something? What makes them leave?
- Are there secondary users with different needs?

**About the competitive landscape:**
- Who does this well? What specifically do they do well?
- Who does this poorly? What specifically goes wrong?
- What would make this meaningfully different?

### Phase 2 — Archetype Check
Check `references/user-archetypes.md` for existing archetypes before defining new ones. If a match exists, extend it rather than starting from scratch. If no match, define a new archetype and flag it for addition to the reference file.

### Phase 3 — Journey Mapping
For each primary user archetype, map:
1. **Trigger** — What causes them to seek this product/page?
2. **Arrival** — What do they see first, what do they expect?
3. **Exploration** — How do they move through the experience?
4. **Decision point** — What makes them commit or leave?
5. **Post-action** — What happens next, what do they feel?

For web apps, also map the **recurring use loop** — what brings them back and what does efficiency look like after the learning curve?

### Phase 4 — Constraints & Success Criteria
Define explicitly:
- **Accessibility standard** (default: WCAG 2.1 AA)
- **Browser/device targets**
- **Performance budget** (if relevant)
- **Brand constraints** (existing colors, fonts, voice)
- **Content constraints** (what copy exists vs needs to be created)

---

## Output Format

Save the completed brief as `ux-brief.md` in the project root. Use this structure exactly — downstream agents reference it by section header.

```markdown
# UX Brief: [Project Name]
_Last updated: [date]_

## Project Summary
[One paragraph — what this is, who it's for, what success looks like]

## Project Type
[Marketing / Portfolio / Web App] — [one sentence on primary emphasis]

## Primary Goal
[Single most important outcome — one sentence]

## Success Metrics
- [Metric 1]
- [Metric 2]
- [Metric 3]

---

## Users

### Primary Archetype: [Name]
**Who they are:** [Behavioral description — not demographics]
**What they want:** [Goal when they arrive]
**What they know:** [Relevant prior knowledge]
**What they fear:** [What makes them distrust or leave]
**Trust signals they respond to:** [Specific cues]

### Secondary Archetype: [Name] _(if applicable)_
[Same structure]

---

## Journey Map: [Primary Archetype Name]

| Stage | What They Do | What They Think/Feel | Design Implication |
|---|---|---|---|
| Trigger | | | |
| Arrival | | | |
| Exploration | | | |
| Decision Point | | | |
| Post-Action | | | |

_(For web apps, add Recurring Use Loop below)_

---

## Competitive Landscape

**Does this well:** [Competitor] — [What specifically]
**Does this poorly:** [Competitor] — [What specifically]
**Our differentiation:** [One sentence]

---

## Constraints

| Constraint | Detail |
|---|---|
| Accessibility | WCAG 2.1 AA (default) |
| Browsers/Devices | |
| Performance | |
| Brand | |
| Content | |
| Tech Stack | |
| Timeline | |

---

## Design Implications
[3-5 bullet points — direct consequences for design decisions that downstream agents must honor]

## Open Questions
[Anything unknown that could affect design — flag for follow-up]
```

---

## Archetype Handling

**If reusing an existing archetype:**
Reference it by name and note any project-specific extensions:
> "Using standard 'Evaluating Professional' archetype from references/user-archetypes.md. Extension for this project: higher time pressure, mobile-first context."

**If defining a new archetype:**
Complete the full archetype definition in the brief, then add a note:
> "New archetype defined. Recommend adding to references/user-archetypes.md after project."

---

## Quality Gate
Before handing off to design-principles, verify:
- [ ] Primary goal is one sentence — not a list
- [ ] At least one complete journey map exists
- [ ] All hard constraints are documented (unknown is acceptable, missing is not)
- [ ] Design implications section has at least 3 concrete entries
- [ ] Open questions are listed, not ignored
