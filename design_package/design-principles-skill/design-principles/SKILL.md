# Skill: design-principles

## What This Skill Does
Queries your NotebookLM design library to retrieve grounded theory before any design decision is made. Prevents designing by gut. Every significant design choice should be preceded by a relevant query.

## When to Trigger This Skill
Use this skill when:
- Starting any new design component or layout
- Making typography, color, or spacing decisions
- Choosing between layout or interaction patterns
- Validating a design direction before building
- Stuck on a design problem and need a framework

Do NOT use this skill for:
- Implementation (writing code)
- Copy or content decisions (use copywriting-content notebook instead)
- Technical architecture decisions

---

## Notebook Registry

| Notebook | ID | Alias | Best For |
|---|---|---|---|
| visual-design | `7c272003-7835-410a-bc9c-f39b520512db` | `@visual` | Color, typography, grid, gestalt, visual hierarchy |
| ux-interaction | `2ba9a638-46b4-41d0-8f1b-a109544458e5` | `@ux` | User research, IA, interaction patterns, usability heuristics |
| copywriting-content | `a1655b58-fe91-4d1d-a787-ced4eaeb3d1b` | `@copy` | Voice/tone, content strategy, persuasion, microcopy |
| web-frontend | `20697553-9152-4b26-ab14-3577ebb90355` | `@web` | Web patterns, responsive design, accessibility, performance UX |
| product-design-strategy | `29dfc6e4-7ea6-47a0-9848-046a433e2671` | `@product` | Design systems, design thinking, design leadership |

---

## Query Protocol

### Step 1 — Identify the decision type
Before querying, classify what kind of decision you're making:
- **Visual** → query `@visual` first, `@web` second
- **Interaction/UX** → query `@ux` first, `@product` second
- **Content/Copy** → query `@copy` first, `@ux` second
- **Layout/Structure** → query `@visual` + `@ux`
- **Component design** → query `@web` + `@visual`
- **System-level** → query `@product` first

### Step 2 — Run queries (MCP preferred, CLI fallback)

**MCP (primary):**
Use the `notebooklm-mcp` tools directly. Query the relevant notebook by its ID, passing a specific well-formed question. See `references/query-patterns.md` for proven templates.

**CLI fallback** (if MCP unavailable or returns error):
```bash
nlm notebook query --notebook <notebook-id> "<your query here>"
```
Notebook IDs are stored in `notebook-ids.json` at the project root.

### Step 3 — Run 2-3 targeted queries, not one broad one
Bad: `"what are design principles?"`
Good: `"what principles govern visual hierarchy when users are scanning rather than reading?"`

Always include:
- The specific context (who, what, where)
- The tension or decision you're trying to resolve
- The constraint you're working within

### Step 4 — Synthesize, don't dump
After querying, synthesize results into **3-5 actionable principles** specific to the current problem. Format as:

```markdown
## Design Principles for [Current Decision]

1. **[Principle name]** — [One sentence applying it to this specific context]
2. **[Principle name]** — [One sentence applying it to this specific context]
3. **[Principle name]** — [One sentence applying it to this specific context]

Sources: [notebook names queried]
```

Do not paste raw NotebookLM output. Synthesize it.

### Step 5 — Flag gaps
If NotebookLM returns low-confidence or irrelevant results, say so explicitly:
> "NotebookLM didn't return strong results for [topic]. Proceeding with general best practice — recommend adding sources on [topic] to [notebook]."

---

## Error Handling

| Error | Action |
|---|---|
| MCP auth expired | Run `nlm login`, then retry via CLI |
| Notebook not found | Check `notebook-ids.json`, verify alias mapping |
| Low-quality results | Try rephrasing query, query a second notebook |
| Rate limit hit (~50/day free) | Prioritize queries, batch decisions where possible |

---

## Output Contract
This skill always produces a named `## Design Principles for [X]` block before design work begins. If it cannot, it must state why and get explicit approval to proceed without theory grounding.
