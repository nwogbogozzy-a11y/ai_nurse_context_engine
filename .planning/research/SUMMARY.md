# Project Research Summary

**Project:** AI-Native Nurse Context Engine (v2 milestone)
**Domain:** Clinical AI context engine — Next.js / Supabase / n8n / Claude API portfolio demo
**Researched:** 2026-03-26
**Confidence:** HIGH

## Executive Summary

This is a v2 milestone on an existing working system — not a greenfield build. Three new capabilities are being layered onto a validated Next.js + Supabase + n8n + Claude API architecture: persistent state (nurse actions that survive refresh), real-time cross-tab sync, and cross-visit patient memory. The core technical risk is not in any single feature but in the cumulative failure of cosmetic state: buttons that look functional but write nothing to the database. Every action in the demo must have a database consequence before the milestone is considered done. The recommended build order enforces a hard dependency — multi-nurse identity must land before audit trail, because an audit trail with a hardcoded actor is a compliance theater prop, not a compliance demonstration.

The strongest signal this system can send for the FIKA Cannabis AI Builder application is the audit trail. Cannabis retail is one of the most compliance-regulated environments in Canada, and surfacing "who approved what flag, when, on which shift" directly parallels the budtender compliance workflows FIKA operates under. Every differentiating feature in this system — audit trail, multi-nurse handoff, cross-visit memory, supply recommendations — has a structurally identical cannabis retail equivalent. The demo should name these parallels explicitly during presentation.

The three primary risks are: (1) cosmetic state that evaporates on refresh — mitigated by treating "refresh survival" as the completion criterion for every action; (2) n8n webhook cold-start latency killing the demo's first interaction — mitigated by a pre-demo warmup call and a timeout UI with fallback mock responses; (3) AI prompt bloat as notes accumulate during testing — mitigated by a bounded 5-note prior context window using only Assessment + Plan sections, not raw SOAP text.

---

## Key Findings

### Recommended Stack

The existing stack is locked — no changes. The v2 additions are purely additive: a version bump on `@supabase/supabase-js` from ^2.98.0 to ^2.100.1 (more stable WebSocket handling via Phoenix JS lib), shadcn/ui components on top of existing Tailwind v4 (Tailwind-native, headless, Radix UI underneath for WCAG 2.1 AA accessibility), `sonner` for toast notifications (shadcn deprecated its own toast in favor of sonner with v4), and `lucide-react` for clinical iconography. Critically, vector embeddings (pgvector) are explicitly ruled out: for three seeded patients, a rolling SQL summary in a `patient_context_summaries` table achieves the same "AI remembers" demo narrative at zero additional infrastructure cost.

The audit trail must use a Postgres trigger function, not application-level logging. Application logs can be bypassed by n8n direct writes; triggers cannot. Supabase Realtime subscriptions must use the `postgres_changes` channel (not Broadcast — that requires n8n to emit events explicitly, adding pipeline complexity for no benefit at demo scale).

**Core technologies:**
- `@supabase/supabase-js` ^2.100.1: DB client + Realtime — stable Phoenix-based WebSocket handling
- shadcn/ui (CLI): Accessible UI components — Tailwind v4 + React 19 compatible, no CSS-in-JS conflicts
- `sonner` ^1.x: Toast notifications — shadcn-recommended, works from anywhere in component tree
- `lucide-react` ^0.511.0: Clinical iconography — tree-shakable, no bundle overhead if shadcn is added
- Postgres trigger (`log_audit_event()`): Audit trail writes — atomic, cannot be bypassed
- `patient_context_summaries` table: Rolling AI memory — SQL aggregate, no embedding pipeline needed

### Expected Features

The v2 "MVP" is defined as: what must be added to make the demo undeniable for the FIKA application. V1 already works end-to-end. The additions are upgrades to credibility, not functionality.

**Must have (table stakes — demo breaks without these):**
- Persistent nurse actions — approve/escalate/override must write to DB and survive refresh
- Multi-nurse identity switching — handoff narrative requires two distinct actors; currently hardcoded to `'Sarah Chen'`
- Audit trail with nurse attribution — who did what, when, with a JSONB snapshot; requires nurse identity first
- Real-time cross-tab sync — makes "living context layer" a visible claim, not a verbal one
- Recommendation panel polish — supply checklist reframed as AI suggestions with rationale and attribution

**Should have (competitive differentiators — add after core if time permits):**
- Cross-visit patient memory (simplified) — last-admission summary injected into Claude prompt; highest narrative value, 80% demo value at 30% complexity via bounded SQL query
- Flag escalation workflow — state machine: flagged → reviewing → resolved; extends audit trail into interactive compliance demonstration

**Defer to v3 or production:**
- Handoff completeness score — requires clinical domain knowledge about expected note categories per unit type; no verified benchmark found; high false-positive risk
- Advanced AI token budgeting — only relevant when note volume exceeds demo scale

**Anti-features (explicitly ruled out):**
- Real voice input (microphone) — uncontrollable demo variable; typewriter simulation is the correct demo affordance
- Full authentication — zero demo value; nurse identity switcher communicates the concept without the overhead
- Dashboard analytics / charts — scope dilution; the context engine outputs (notes, flags, handoff reports) are already the trend visualization
- PDF export — recreates the paper workflow being replaced; context belongs in the system

### Architecture Approach

This is an additive architecture: three new capabilities slot into defined positions without changing the base system. The data layer gains one new table (`audit_log`) and Realtime publication membership for existing tables. The frontend gains two new components (`AuditLog`, `NurseSelector`) and one new hook (`useRealtimeChannel`). The n8n pipeline gains one new node (N3b: fetch prior notes for context injection). The key architectural principle is: audit log writes bypass n8n entirely — direct Supabase JS client INSERT from the frontend is faster, simpler, and removes a failure surface for a non-AI action.

**Major components:**
1. `useRealtimeChannel` hook — reusable Supabase channel subscription with cleanup; fires existing `fetchData()` on event; used in both Dashboard and Patient Detail
2. `AuditLog` component — reads `audit_log` table directly via Supabase JS; displays who did what, when, on which note; subscribes to Realtime for live updates
3. `NurseSelector` component — predefined nurse identities persisted to `localStorage`; feeds `nurse_name` into all audit writes; required before audit trail is meaningful
4. `NurseActionBar` (wired) — existing component; approve/escalate/override actions now write to `audit_log` and update `notes.action_taken`
5. n8n N3b node — fetches last 5 notes for patient before Claude call; compresses to Assessment + Plan sections only; injects as `{prior_context}` into Prompt 1 and Prompt 3
6. `patient_context_summaries` table — periodically-regenerated rolling summary; displayed as "Patient Context" in patient detail left panel; makes the "memory" feature visible

### Critical Pitfalls

1. **Cosmetic state that evaporates on refresh** — treat "refresh survival" as the completion criterion for every action; every button must write to Supabase before its phase closes; the specific fields: `notes.action_taken`, `supply_requests.confirmed_by`, `handoff_reports.stable_items`, `handoff_reports.recommended_first_actions`

2. **Audit trail built before nurse identity** — the actor field will always be `'Sarah Chen'` and the audit trail becomes compliance theater; hard sequence: `NurseSelector` → `audit_log` table → `NurseActionBar` wiring; no exceptions

3. **Realtime subscription leaks** — every `useEffect` that opens a Supabase channel must return `() => { supabase.removeChannel(channel) }`; React 18 Strict Mode double-fires effects, causing duplicate channels in development that appear as non-working subscriptions; the `useRealtimeChannel` hook enforces this pattern project-wide

4. **Missing initial data load before subscription** — subscriptions only deliver changes after connection; always fetch current state first, then open subscription to receive incremental changes; without this, refreshing during a demo shows stale data

5. **n8n webhook cold-start killing first demo interaction** — n8n cloud instances on idle have 2-5 second cold starts; Claude API adds 1-3 seconds; first submission can take 5-8 seconds with no feedback; mitigation: warm up webhook 30 seconds before demo, show timeout message at 8 seconds, have fallback mock responses in `demo-scripts.ts`

---

## Implications for Roadmap

Based on combined research, the feature dependencies and pitfall-to-phase mapping suggest a 4-phase structure. The ordering is driven by two hard constraints: (1) nurse identity must precede audit trail, and (2) all cosmetic state must be fixed before new features are added.

### Phase 1: Functional Foundation

**Rationale:** The existing v1 system has cosmetic state — actions that look functional but write nothing to Supabase. Building new features on top of cosmetic state compounds the debt. This phase fixes the foundation and establishes the identity layer that everything else depends on.

**Delivers:** A system where every interaction has a database consequence; two distinct nurse identities in the handoff narrative; an audit trail that answers "who approved what"

**Addresses (from FEATURES.md):**
- Persistent nurse actions (P1 — demo breaks without this)
- Multi-nurse identity switching (P1 — required by audit trail)
- Audit trail with nurse attribution (P1 — compliance signal)

**Avoids (from PITFALLS.md):**
- Cosmetic state evaporation (Pitfall 1 — Phase 1 explicitly fixes this)
- Audit trail without actor field (Pitfall 5 — sequence enforced: identity first)
- Technical debt: hardcoded `'Sarah Chen'` (must be resolved before audit trail writes)

**Research flag:** Standard patterns — direct Supabase JS inserts, localStorage for nurse switcher, SQL schema additions. No phase-specific research needed.

---

### Phase 2: AI Context Memory

**Rationale:** Cross-visit patient memory is the highest-narrative-value differentiator but has no UI or schema dependencies on Phase 1. It modifies the n8n pipeline and adds one new table. It is architecturally isolated and can be built once Phase 1 is stable.

**Delivers:** Claude prompts enriched with prior patient context; patient detail page showing "Patient Context" summary panel; handoff reports that reference baseline patterns, not just the current shift

**Addresses (from FEATURES.md):**
- Cross-visit patient memory, simplified version — last-admission summary in AI prompt (P2)

**Uses (from STACK.md):**
- `patient_context_summaries` table (rolling SQL summary, not pgvector)
- Modified n8n N3b node: fetch 5 most recent notes, compress to Assessment + Plan, inject as `{prior_context}`

**Avoids (from PITFALLS.md):**
- AI cross-visit memory prompt bloat (Pitfall 4) — enforce 5-note bounded window from the start; never `notes.join('\n')` without recency cap

**Research flag:** MEDIUM confidence on summarization interval and note count threshold — validate during build by comparing Claude output quality with 3-note vs 5-note windows. The pattern is sound; the exact parameters need empirical tuning.

---

### Phase 3: Real-Time Updates

**Rationale:** Realtime sync is architecturally independent of Phases 1 and 2 but its demo value multiplies when Phase 1 (multi-nurse identity) is complete — two nurses in different tabs, live sync visible. Build after identity and audit are stable so the "living context layer" demonstration is compelling.

**Delivers:** Notes appearing in Tab B when submitted from Tab A without refresh; audit trail updating live when a nurse approves from another tab; patient status indicators syncing across dashboard and detail views

**Addresses (from FEATURES.md):**
- Real-time cross-tab sync (P1 — highest-impact demo moment)

**Implements (from ARCHITECTURE.md):**
- `useRealtimeChannel` hook — one reusable hook for Dashboard and Patient Detail
- `REPLICA IDENTITY FULL` + `ALTER PUBLICATION supabase_realtime ADD TABLE` per tracked table
- Supabase migration `002_audit_and_realtime.sql` — all schema changes colocated

**Avoids (from PITFALLS.md):**
- Realtime subscription leaks (Pitfall 2) — `useRealtimeChannel` enforces cleanup by design
- Missing initial data load before subscription (Pitfall 3) — load-then-subscribe pattern enforced in hook implementation
- Full table subscription without filter (Anti-Pattern 2) — scope all subscriptions to `patient_id=eq.${patientId}`

**Research flag:** Standard patterns — Supabase Realtime docs are verified and comprehensive. No phase-specific research needed.

---

### Phase 4: Demo Hardening and Polish

**Rationale:** The system is functionally complete after Phase 3. This phase makes it bulletproof for a live demo and adds the UI polish that signals professional engineering judgment to a technical interviewer.

**Delivers:** shadcn/ui component upgrades; timeout handling with fallback mock responses; self-hosted fonts (no CDN dependency); recommendation panel reframed as AI suggestions with rationale; typewriter "Skip" button; flag escalation state machine (if time permits)

**Addresses (from FEATURES.md):**
- Recommendation panel polish (P1 — low complexity, high narrative value)
- Flag escalation workflow (P2 — if time permits after core complete)

**Avoids (from PITFALLS.md):**
- n8n webhook timeout during live demo (Pitfall 6) — pre-demo warmup checklist, 8-second timeout UI, fallback mock responses
- Google Fonts CDN dependency — switch to `next/font/google` (self-hosted); verify offline render
- Infinite spinner with no timeout message (UX Pitfalls) — elapsed time at 3s, "Still processing..." at 6s, actionable error at 10s
- Typewriter animation with no interrupt (UX Pitfalls) — add "Skip" button that completes text immediately

**Research flag:** Standard patterns for shadcn component integration. Flag escalation state machine is MEDIUM complexity — if included, verify the `review_status ENUM` approach against existing `notes` table schema before adding columns.

---

### Phase Ordering Rationale

- **Identity before audit:** Hardcoded `'Sarah Chen'` makes every audit row meaningless. This is not a "nice to have" sequencing — it is a correctness constraint. An audit trail without a real actor field fails the compliance narrative entirely.
- **Functional state before new features:** Every new feature built on cosmetic state inherits the debt. Phase 1 fixes the foundation so Phases 2-4 build on solid ground.
- **Context memory before realtime:** Memory is architecturally isolated (n8n pipeline modification only). Realtime touches more of the codebase (new hook, SQL migrations, subscription setup in multiple components). Memory is lower risk to introduce while realtime work would be distracting.
- **Hardening last:** Polish and fallbacks require knowing what the complete system looks like. Polish applied too early gets overwritten by feature work.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Context Memory):** Summarization interval and note-count threshold need empirical validation — compare Claude output quality at different window sizes during build. The architecture is clear; the parameters are not.
- **Phase 4 (Flag Escalation):** If included, verify `review_status ENUM` implementation in Postgres against existing `notes` schema — confirm no migration conflicts with v1 `flagged` boolean field.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Functional Foundation):** Direct Supabase JS inserts, localStorage, SQL schema additions — all well-documented patterns with HIGH confidence sources.
- **Phase 3 (Real-Time Updates):** Supabase Realtime `postgres_changes` API is fully documented and verified. The `useRealtimeChannel` hook pattern is straightforward.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing stack locked; additions verified against official docs (shadcn Tailwind v4 compatibility, supabase-js v2.100.1 release notes, lucide-react npm). Single lower-confidence item: rolling summary approach for context memory (CLIN-SUMM research paper — MEDIUM). |
| Features | HIGH | Table stakes verified against EHR feature guides and clinical literature. Differentiators grounded in Supabase docs, compliance literature, and nurse workflow research. FIKA analogy mapping verified against Cova cannabis retail AI sources. |
| Architecture | HIGH | Existing codebase is known. All three new patterns (Realtime, audit trail, context memory) verified against official Supabase docs and standard Postgres patterns. Build order is determined by hard dependencies, not preference. |
| Pitfalls | HIGH | Six critical pitfalls grounded in existing codebase audit (`CONCERNS.md`), Supabase GitHub discussions, and verified external sources on audit trail design and LLM context management. |

**Overall confidence:** HIGH

### Gaps to Address

- **Context memory summarization parameters:** The 5-note window and Assessment + Plan extraction are recommended but need empirical validation during Phase 2 build. Monitor Claude output quality with and without prior context on all three demo scenarios.
- **Handoff completeness score (deferred):** No verified benchmark found for "expected note categories per unit type." Correctly deferred to v3. If FIKA requests this feature post-demo, it requires nursing domain expert input before implementation.
- **Flag escalation ENUM migration:** If flag escalation is included in Phase 4, verify that adding `review_status` to the `notes` table does not conflict with the existing `flagged` boolean — specifically: does the v1 pipeline write to `flagged` in a way that would interfere with the new state machine?
- **Supabase Realtime RLS prerequisite:** Research notes that RLS must be enabled on tables before opening subscriptions, even for demo-only policies. Confirm current RLS state on `notes`, `supply_requests`, and `handoff_reports` before writing Phase 3 migration.

---

## Sources

### Primary (HIGH confidence)
- Supabase Realtime Postgres Changes Guide — `postgres_changes` API pattern, filter syntax, React cleanup
- supabase/supabase-js Releases — v2.100.1 confirmed latest as of 2026-03-26
- shadcn/ui Tailwind v4 Docs — Tailwind v4 + React 19 compatibility confirmed March 2026
- shadcn/ui Sonner Docs — toast deprecation, sonner recommendation
- lucide-react npm — current version verification
- Supabase Auth Audit Logs — RLS insert-only pattern
- Supabase Realtime Troubleshooting — subscription leak diagnosis
- Supabase Realtime with Next.js official guide
- Supabase Postgres audit pattern (150 lines of SQL blog post)
- Supabase Realtime Client-Side Memory Leak — Stack Diagnosis
- GitHub Discussion #8573 — issues unsubscribing from Realtime in React 18
- HCA Healthcare Nurse Handoff App — Google Cloud Blog (clinical handoff feature benchmark)

### Secondary (MEDIUM confidence)
- CLIN-SUMM: Temporal Summarization of Longitudinal Clinical Notes (medRxiv, 2025) — rolling summary pattern for clinical LLM prompting
- Audit Trail for Supabase Database (Harish Sirikoti, Medium) — trigger function pattern (pattern is standard Postgres; single source)
- Cannabis Retail AI and Business Intelligence — Cova (FIKA analogy mapping)
- Cannabis Retail Tech Trends 2025 — Cova
- Codebase audit: `.planning/codebase/CONCERNS.md` (2026-03-26) — cosmetic state and technical debt identification
- Context Rot: How Increasing Input Tokens Impacts LLM Performance — Chroma Research (prompt bloat pitfall)
- Why n8n Webhooks Fail in Production — Prosperasoft (cold-start mitigation)

### Tertiary (LOW confidence)
- Handoff completeness score feature — no verified benchmark for expected note categories per unit type; correctly deferred; needs nursing domain expert validation before implementation

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
