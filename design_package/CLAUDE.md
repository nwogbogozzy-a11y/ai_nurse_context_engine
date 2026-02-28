# CLAUDE.md
_Fill in all [bracketed] placeholders before starting any work._

---

## Project

**Name:** [Project name]
**Type:** [Marketing / Portfolio / Web App]
**One-line description:** [What this is and who it's for]
**Primary goal:** [Single most important outcome]

---

## Stack

- **Framework:** [e.g. Next.js 14 / Astro / Vite + React]
- **Styling:** Tailwind CSS
- **Language:** [TypeScript / JavaScript]
- **Deployment:** [e.g. Vercel / Netlify]
- **Other:** [Any libraries, CMS, or tools]

---

## Constraints

- **Accessibility standard:** WCAG 2.1 AA (non-negotiable)
- **Browser targets:** [e.g. Chrome, Firefox, Safari — last 2 versions]
- **Device targets:** [e.g. Mobile-first, 320px minimum]
- **Brand rules:** [Any existing colors, fonts, logo usage rules — or "none"]
- **Timeline:** [Hard deadline if any]

---

## Knowledge Sources — Single Source of Truth

All design decisions must be grounded in the NotebookLM library before implementation. Claude must never design by assumption when relevant theory exists in these notebooks.

**Do not query NotebookLM as an afterthought. Query it first, then design.**

| Notebook | ID | Query When |
|---|---|---|
| visual-design | `7c272003-7835-410a-bc9c-f39b520512db` | Color, typography, grid, visual hierarchy, gestalt |
| ux-interaction | `2ba9a638-46b4-41d0-8f1b-a109544458e5` | User flows, IA, interaction patterns, usability |
| copywriting-content | `a1655b58-fe91-4d1d-a787-ced4eaeb3d1b` | Voice/tone, microcopy, CTAs, content strategy |
| web-frontend | `20697553-9152-4b26-ab14-3577ebb90355` | Web patterns, responsive design, accessibility, performance UX |
| product-design-strategy | `29dfc6e4-7ea6-47a0-9848-046a433e2671` | Design systems, design thinking, component strategy |

### How to Query
**MCP (preferred):** Use `notebooklm-mcp` tools directly with the notebook ID.
**CLI fallback:** `nlm notebook query --notebook <id> "<specific question>"`

Query guidelines:
- Always include context: who the user is, what they're doing, what the constraint is
- Ask for principles, not solutions
- Run 2–3 targeted queries per decision, not one broad one
- Synthesize into 3–5 actionable principles — never dump raw output
- See `.claude/skills/design-principles/references/query-patterns.md` for proven templates

### Auth Recovery
If MCP returns auth error: run `nlm login` in terminal, then retry via CLI fallback.

---

## Agent Workflow

Agents run in strict order. No agent starts until the previous one has produced its output.

```
1. ux-research      → produces: ux-brief.md
2. design-principles → produces: design-principles-[project].md (queries NotebookLM)
3. design-system    → produces: .interface-design/system.md
4. builder          → produces: implementation
5. design-review    → produces: reviews/review-[section].md
```

### Agent Rules

**All agents must:**
- Read `ux-brief.md` before doing anything
- Read `.interface-design/system.md` before touching any styling
- Never invent design decisions not grounded in either the system or NotebookLM output
- Save outputs to the correct file paths — do not output to chat only

**ux-research must:**
- Complete all four research phases (intake, archetype check, journey map, constraints)
- Check `.claude/skills/ux-research/references/user-archetypes.md` for reusable archetypes before defining new ones
- Produce a complete `ux-brief.md` before handing off

**design-principles must:**
- Query NotebookLM before producing any principles — no principles from training knowledge alone
- Identify decision type first to select the right notebook(s)
- Synthesize into a named `## Design Principles for [X]` block
- Explicitly flag if NotebookLM returns low-confidence results

**design-system must:**
- Read `ux-brief.md` and design principles output before establishing any token
- Use semantic color tokens only — no hardcoded hex values anywhere in the system
- Populate every section of `.interface-design/system.md` using the template
- Output Tailwind config block if any custom tokens are defined

**builder must:**
- Read `.claude/skills/frontend-design/SKILL.md` before writing any code
- Commit to a clear aesthetic direction before implementation — bold or refined, never generic
- Implement exclusively against `.interface-design/system.md` — no ad-hoc styling
- Use semantic tokens by name, not by value
- Make intentional choices on typography, motion, and spatial composition — project-specific, never default
- Never add a component that isn't in the system without flagging it first
- Consult `design-principles` skill and re-query NotebookLM for any decision not covered by the system

**design-review must:**
- Run all four checklist categories — never skip a category
- Classify every issue with correct severity (🔴 Critical / 🟡 Warning / 🔵 Note)
- Save report to `reviews/review-[section].md`
- Explicitly state handoff status at the end of every report
- Critical issues must be acknowledged by the builder — silence is not acceptance

---

## File Structure

```
[project-root]/
├── CLAUDE.md                          ← this file
├── ux-brief.md                        ← produced by ux-research
├── notebook-ids.json                  ← NotebookLM IDs (do not edit)
├── .interface-design/
│   └── system.md                      ← produced by design-system, read by all
├── .claude/
│   └── skills/
│       ├── design-principles/
│       │   ├── SKILL.md
│       │   └── references/
│       │       └── query-patterns.md
│       ├── ux-research/
│       │   ├── SKILL.md
│       │   ├── references/
│       │   │   └── user-archetypes.md
│       │   └── assets/
│       │       └── ux-brief-template.md
│       ├── design-system/
│       │   ├── SKILL.md
│       │   ├── references/
│       │   │   ├── spacing-scale.md
│       │   │   └── typography-system.md
│       │   └── assets/
│       │       └── system-template.md
│       ├── design-review/
│       │   ├── SKILL.md
│       │   └── references/
│       │       └── review-checklist.md
│       └── frontend-design/
│           └── SKILL.md                ← Anthropic skill, governs builder aesthetics
├── reviews/                           ← produced by design-review (auto-created)
│   └── review-[section].md
└── src/                               ← implementation
```

---

## Hard Rules

These apply to every agent at all times. No exceptions.

1. **NotebookLM is the design authority.** Training knowledge supplements; it does not replace. When in doubt, query.
2. **`system.md` is the implementation authority.** No component gets built outside the system without explicit flagging.
3. **Semantic tokens only.** No hardcoded hex, px, or arbitrary Tailwind values in components.
4. **WCAG 2.1 AA is the floor.** Contrast, keyboard navigation, and semantic HTML are not optional.
5. **Outputs go to files, not chat.** Every agent saves its work. Chat summaries are secondary.
6. **Workflow order is enforced.** The builder does not start until `system.md` exists. Design-principles does not run until `ux-brief.md` exists.
7. **Review issues must be acknowledged.** Critical issues cannot be silently ignored. If disputed, document why in the review file.
