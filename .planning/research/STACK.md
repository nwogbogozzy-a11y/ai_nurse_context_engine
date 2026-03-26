# Stack Research

**Domain:** AI-native clinical nursing context system — adding real-time updates, audit trail, cross-visit patient memory, and clinical UI polish to an existing Next.js + Supabase + n8n + Claude API app.
**Researched:** 2026-03-26
**Confidence:** HIGH for Supabase Realtime and audit trail; MEDIUM for clinical UI component choices; MEDIUM for cross-visit memory approach (multiple valid patterns exist)

---

## Existing Stack (Do Not Change)

The project constraint is explicit: no stack changes. These are locked in.

| Technology | Version in Use | Role |
|------------|---------------|------|
| Next.js | 16.1.6 | App Router, all `'use client'` pages |
| React | 19.2.3 | UI rendering |
| TypeScript | ~5.x | Strict mode |
| Tailwind CSS | v4 (^4) | Utility CSS via PostCSS |
| `@supabase/supabase-js` | ^2.98.0 | DB client + realtime |
| n8n | Cloud | Automation pipeline |
| Claude API | claude-sonnet-4-20250514 | AI processing |

The additions below extend this stack. Nothing replaces anything already installed.

---

## Recommended Stack — New Additions

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@supabase/supabase-js` | ^2.100.1 (upgrade from ^2.98.0) | Supabase Realtime subscriptions | v2.100.0 switched realtime-js to Phoenix's JS lib — more stable WebSocket handling. The `postgres_changes` channel API is stable and well-documented at this version. Already installed; bump the pin. |
| shadcn/ui | Latest CLI (no version — copy-paste component model) | Professional accessible UI components | Not a package version — it's a CLI that copies component source into your project. Full Tailwind v4 + React 19 support confirmed. Components adapt to your existing design tokens. No runtime dependency to manage. |
| `lucide-react` | ^0.511.0 (current: 1.x — see note) | Clinical iconography | Ships as `lucide-react` on npm at 0.5xx versioning despite "version 1" marketing. Tree-shakable SVG icons. Used by shadcn/ui internally. No additional bundle cost if shadcn is added. Clinical icons available: `Activity`, `AlertTriangle`, `ClipboardList`, `User`, `Clock`, `CheckCircle`. |
| `sonner` | ^1.x | Real-time action feedback toasts | shadcn/ui deprecated its own `toast` component in favor of `sonner` with Tailwind v4. Trusted by OpenAI, Adobe. Accessible, no hook setup required, works from anywhere in the component tree. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `class-variance-authority` | ^0.7.x | Variant-based component styling | Required by shadcn/ui for button/badge variant APIs. Install only if adopting shadcn. |
| `clsx` | ^2.x | Conditional class merging | Required by shadcn/ui's `cn()` utility. Tiny (228 bytes). Add alongside shadcn. |
| `tailwind-merge` | ^2.x | Tailwind class conflict resolution | Required alongside `clsx` for the `cn()` utility pattern that shadcn uses. Prevents duplicate class bugs (e.g., `p-2 p-4` resolving correctly). |
| `tw-animate-css` | ^1.x | CSS animations compatible with Tailwind v4 | shadcn/ui replaced `tailwindcss-animate` with `tw-animate-css` for v4 compatibility. Required for shadcn accordion, dialog, sheet transitions. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Supabase Dashboard — Realtime toggle | Enable realtime per-table | Must be enabled manually in Supabase Dashboard under Table Editor > [table] > "Enable Realtime". Not a code change — dashboard-only step. Required before any `postgres_changes` subscription works. |
| Supabase SQL Editor | Run audit trail migration | The `audit_log` table + trigger function must be created via SQL migration, not the JS client. Use `supabase/migrations/` directory already present in the project. |

---

## Installation

```bash
# Upgrade supabase-js (existing package — bump version)
npm install @supabase/supabase-js@^2.100.1

# shadcn/ui CLI setup (one-time init — already have Tailwind v4 + React 19)
npx shadcn@latest init

# shadcn components as needed (adds source to src/components/ui/)
npx shadcn@latest add button badge card dialog separator

# Toast notifications
npm install sonner

# shadcn/ui peer dependencies
npm install lucide-react class-variance-authority clsx tailwind-merge tw-animate-css
```

---

## Feature-Specific Implementation Patterns

### 1. Supabase Realtime Subscriptions

**Pattern:** `postgres_changes` channel in a React `useEffect` with cleanup.

**Prerequisite (dashboard step):** Enable Realtime for each table you want to subscribe to in Supabase Dashboard > Table Editor > [table name] > toggle "Enable Realtime". This is required before any subscription works.

**Verified API (from official Supabase docs, `@supabase/supabase-js` v2):**

```typescript
useEffect(() => {
  const channel = supabase
    .channel('notes-changes')
    .on(
      'postgres_changes',
      {
        event: '*',           // INSERT | UPDATE | DELETE | *
        schema: 'public',
        table: 'notes',
        filter: `patient_id=eq.${patientId}`,  // optional row filter
      },
      (payload) => {
        // payload.new = new record, payload.old = old record
        // payload.eventType = 'INSERT' | 'UPDATE' | 'DELETE'
        setNotes((prev) => [...prev, payload.new])
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('Realtime subscription failed')
      }
    })

  return () => {
    supabase.removeChannel(channel)
  }
}, [patientId])
```

**Tables to subscribe to:** `notes`, `supply_requests`, `handoff_reports`. Subscribe per patient detail page. Dashboard page can subscribe to `notes` with no filter to show cross-patient activity.

**Important caveat:** Supabase docs now recommend Broadcast (not `postgres_changes`) for high-concurrency production apps. For a demo with 1-3 concurrent tabs, `postgres_changes` is the correct and simpler choice. The complexity of Broadcast is unwarranted here.

**Confidence:** HIGH — verified against official Supabase Realtime docs.

---

### 2. Audit Trail

**Pattern:** Postgres trigger function writing to a dedicated `audit_log` table. This is the correct approach — never application-level audit logging. Application logs can be bypassed; triggers cannot.

**Table schema (add as a Supabase migration):**

```sql
CREATE TABLE audit_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name  TEXT NOT NULL,
  record_id   UUID NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  nurse_name  TEXT,
  old_data    JSONB,
  new_data    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Insert-only via RLS: no one can UPDATE or DELETE audit records
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_insert_only" ON audit_log
  FOR INSERT WITH CHECK (true);
-- No SELECT policy needed for demo (reads happen server-side)
```

**Trigger function:**

```sql
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, nurse_name, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    COALESCE(NEW.nurse_name, OLD.nurse_name),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW)::jsonb ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Apply to target tables:**

```sql
CREATE TRIGGER audit_notes
  AFTER INSERT OR UPDATE OR DELETE ON notes
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_supply_requests
  AFTER INSERT OR UPDATE OR DELETE ON supply_requests
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_handoff_reports
  AFTER INSERT OR UPDATE OR DELETE ON handoff_reports
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
```

**Why `SECURITY DEFINER`:** The trigger function runs with definer's privileges, bypassing RLS on the audit table. This ensures audit records are written even when the calling user's RLS policies would otherwise block them.

**Frontend usage:** Query `audit_log` via Supabase JS client to render an "Activity" tab on the patient detail view. Subscribe via Realtime for live audit feed.

**Confidence:** HIGH — pattern verified against Supabase Postgres trigger docs and Harish Sirikoti's audit trail implementation.

---

### 3. Cross-Visit Patient Memory

**Pattern:** Structured summary table + prompt injection. Do NOT use vector embeddings for this project.

**Why not vector embeddings (pgvector):** Semantic similarity search requires an embedding model call per note write and per retrieval. For a demo with 3 seeded patients, this adds infrastructure complexity (embedding pipeline, vector column, HNSW index, embedding API calls) for no meaningful benefit over a simple SQL aggregate. Use embeddings when the note corpus is large enough that keyword/recency retrieval fails. That threshold is not reached here.

**Use instead:** A `patient_context_summaries` table that stores periodically-regenerated plain-text summaries of a patient's history, queryable by `patient_id`. Inject into Claude prompts on each n8n workflow run.

**Table schema:**

```sql
CREATE TABLE patient_context_summaries (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id     UUID REFERENCES patients(id) ON DELETE CASCADE,
  summary        TEXT NOT NULL,
  note_count     INTEGER NOT NULL DEFAULT 0,
  last_note_at   TIMESTAMPTZ,
  generated_at   TIMESTAMPTZ DEFAULT NOW(),
  generated_by   TEXT DEFAULT 'system'
);

CREATE INDEX idx_patient_context_summaries_patient
  ON patient_context_summaries(patient_id, generated_at DESC);
```

**Pattern:** On each n8n note-structuring workflow run, after saving the note:
1. Fetch the 10 most recent structured notes for the patient from Supabase
2. Pass them to Claude with a summarization prompt: "Given the following notes, summarize this patient's persistent clinical patterns, preferences, and known sensitivities in 150 words or fewer."
3. Upsert the result into `patient_context_summaries`
4. On the next note run, fetch the latest summary and inject it as `{prior_patient_context}` into the note-structuring and handoff prompts

**Why this pattern:** Research on longitudinal clinical LLM prompting (CLIN-SUMM framework, 2025) confirms that summarizing prior notes into a compact rolling summary is more reliable than raw context concatenation, which exhausts context windows and introduces noise. Claude claude-sonnet-4-20250514 can produce accurate patient summaries from 10 prior SOAP notes within a single prompt call.

**Frontend usage:** Display the latest summary in the patient detail left panel as "Patient Context" — makes the "memory" feature visible to demo viewers.

**Confidence:** MEDIUM — architectural pattern supported by clinical LLM research and standard Supabase SQL patterns, but specific implementation details (summarization interval, note count threshold) require validation during build.

---

### 4. Professional Clinical UI Polish

**Pattern:** shadcn/ui components on top of existing Tailwind v4 design token system. No design token changes — extend the existing semantic system in `globals.css`.

**Why shadcn/ui over raw Tailwind or MUI:**
- shadcn copies component source into your project — no version lock, no runtime overhead, no CSS-in-JS conflict with Tailwind v4
- Full Tailwind v4 + React 19 support confirmed (shadcn Tailwind v4 docs, March 2026)
- Radix UI primitives underneath every component — WCAG 2.1 AA accessibility baked in (keyboard nav, ARIA, focus management)
- Works with existing `@theme inline` token system — map shadcn's CSS variable slots to the project's existing semantic colors
- MUI and Chakra conflict with Tailwind v4 due to CSS-in-JS specificity battles

**Key shadcn components to add:**

| Component | Clinical Use | Notes |
|-----------|-------------|-------|
| `Badge` | Flag severity indicators (warning / critical / safe) | Map variants to `flag-warning`, `flag-critical`, `flag-safe` tokens |
| `Card` | Patient cards, note cards, supply items | Replaces ad-hoc div containers |
| `Dialog` | Confirm approve/escalate/override actions | Radix modal — accessible, keyboard-trapped focus |
| `Separator` | Section dividers in note and handoff panels | Replaces `<hr>` elements |
| `Skeleton` | Loading states while n8n processes | Prevents layout shift during AI calls |
| `Tabs` | Notes / Supply Requests / Handoff Report / Audit tabs | Replaces manual tab state |
| `Button` | Approve / Escalate / Override / Generate Report actions | Variant system maps to clinical action colors |

**Icon library:** `lucide-react` (^0.511.0 — actual npm version tag, not the "v1" marketing version). Icons relevant to clinical context: `Activity` (vitals), `AlertTriangle` (flag), `ClipboardList` (notes), `Clock` (timestamp), `CheckCircle` (approved), `User` (nurse/patient), `Stethoscope` (procedure).

**Toast notifications:** `sonner` for real-time action feedback. "Note saved", "Supply list generated", "Flag reviewed" toasts appear non-intrusively. shadcn explicitly deprecated its own toast in favor of sonner with Tailwind v4.

**Confidence:** MEDIUM-HIGH — shadcn Tailwind v4 + React 19 compatibility verified against official shadcn docs. Component selection is prescriptive based on the existing UI audit.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `postgres_changes` Realtime | Supabase Broadcast | Broadcast requires the server (n8n) to emit events — adds n8n node complexity. `postgres_changes` fires automatically on DB write. Correct for a demo with <10 concurrent users. |
| Postgres trigger for audit log | Application-level audit logging (JS before INSERT) | Application-level logging can be bypassed by direct DB writes, n8n nodes, or exceptions. Triggers are atomic with the transaction — cannot be skipped. |
| `patient_context_summaries` rolling summary | pgvector semantic search | pgvector requires embedding pipeline, embedding API calls, HNSW index management. Overkill for 3 patients. Rolling SQL summary achieves the same demo narrative ("AI remembers") with zero added infrastructure. |
| shadcn/ui + Radix | Mantine UI | Mantine uses CSS modules which can conflict with Tailwind v4 at specificity. shadcn is headless and Tailwind-native. |
| shadcn/ui + Radix | Material UI (MUI) | MUI uses Emotion (CSS-in-JS) which has known specificity conflicts with Tailwind. Not compatible pattern for this stack. |
| `sonner` | `react-hot-toast` | `react-hot-toast` is no longer actively maintained as of 2025 (last release 2023). Sonner is current, accessible, and the shadcn-recommended replacement. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-toastify` | Heavy (50kb+), conflicting CSS globals, not Tailwind-native | `sonner` |
| `react-hot-toast` | Unmaintained since 2023 | `sonner` |
| `tailwindcss-animate` | Deprecated in shadcn/ui Tailwind v4 upgrade | `tw-animate-css` |
| pgvector / embeddings | Unnecessary complexity for this demo's scale; adds embedding API dependency and storage overhead | Rolling SQL summary in `patient_context_summaries` |
| `@supabase/realtime-js` direct | Lower-level than needed; the `@supabase/supabase-js` client already wraps it | Use `supabase.channel()` from the existing client |
| Supabase Broadcast for this use case | Requires n8n to emit events explicitly — adds pipeline complexity for no benefit at demo scale | `postgres_changes` subscriptions |
| MUI / Chakra / Mantine | CSS-in-JS conflicts with Tailwind v4; breaks existing token system | shadcn/ui (Tailwind-native, headless) |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@supabase/supabase-js` ^2.100.1 | Next.js 16, React 19 | No known breaking changes from ^2.98.0. Realtime now uses Phoenix JS lib internally (v2.100.0 change) — more stable. |
| `shadcn/ui` (CLI, current) | Next.js 15+, React 19, Tailwind v4 | Official shadcn docs confirm full Tailwind v4 + React 19 compatibility as of March 2026. Non-breaking alongside existing components. |
| `lucide-react` ^0.511.0 | React 19, Next.js 16 | Tree-shakable; no conflicts. Import individual icons only. |
| `sonner` ^1.x | React 19, Next.js App Router | Works in `'use client'` components. Place `<Toaster />` in root layout. |
| `tw-animate-css` ^1.x | Tailwind v4 | Drop-in replacement for `tailwindcss-animate`. Import in `globals.css`. |

---

## Sources

- [Supabase Realtime Postgres Changes Guide](https://supabase.com/docs/guides/realtime/postgres-changes) — postgres_changes API pattern, filter syntax, React cleanup — HIGH confidence
- [supabase/supabase-js Releases](https://github.com/supabase/supabase-js/releases) — v2.100.1 confirmed latest as of 2026-03-26 — HIGH confidence
- [shadcn/ui Tailwind v4 Docs](https://ui.shadcn.com/docs/tailwind-v4) — Tailwind v4 + React 19 compatibility confirmed — HIGH confidence
- [shadcn/ui Sonner Docs](https://ui.shadcn.com/docs/components/radix/sonner) — toast deprecation, sonner recommendation — HIGH confidence
- [Audit Trail for Supabase Database (Harish Sirikoti, Medium)](https://medium.com/@harish.siri/simpe-audit-trail-for-supabase-database-efefcce622ff) — trigger function pattern — MEDIUM confidence (single source; pattern is standard Postgres)
- [CLIN-SUMM: Temporal Summarization of Longitudinal Clinical Notes (medRxiv, 2025)](https://www.medrxiv.org/content/10.64898/2025.11.28.25341233v1.full.pdf) — rolling summary pattern for clinical LLM prompting — MEDIUM confidence (research paper, not engineering docs)
- [lucide-react npm](https://www.npmjs.com/package/lucide-react) — current version verification — HIGH confidence
- [Supabase Auth Audit Logs](https://supabase.com/docs/guides/auth/audit-logs) — RLS insert-only pattern — HIGH confidence

---

*Stack research for: AI-Native Nurse Context Engine v2 — real-time, audit trail, cross-visit memory, clinical UI*
*Researched: 2026-03-26*
