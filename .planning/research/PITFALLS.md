# Pitfalls Research

**Domain:** Clinical AI context engine — Next.js / Supabase / n8n / Claude API portfolio demo
**Researched:** 2026-03-26
**Confidence:** HIGH (pitfalls grounded in existing codebase concerns + verified external sources)

---

## Critical Pitfalls

### Pitfall 1: Cosmetic State That Evaporates on Refresh

**What goes wrong:**
Nurse actions (approve, escalate, override), supply checklist confirmations, and handoff extras all update local React state but write nothing to Supabase. Refreshing the page resets every interaction to its default. A hiring manager clicking "Approve" on Devon's flagged note and then refreshing will see the approval vanished — the exact opposite of the "human stays in control" story the demo is trying to tell.

**Why it happens:**
State is the path of least resistance during initial build. Writing to DB requires a schema change, a Supabase mutation, and a re-fetch. Developers defer it to "later" and ship the visual scaffolding first. Later becomes never.

**How to avoid:**
Every button that implies persistence must write to the database before the phase that introduces it is considered complete. The test: refresh the page after every action and verify the state survives. If it doesn't, it isn't done. Specifically: add `action_taken` column to `notes`, update `confirmed_by` on `supply_requests`, add `stable_items`/`recommended_first_actions` columns to `handoff_reports`.

**Warning signs:**
- A component calls `setState` inside an action handler but makes no Supabase call
- `console.log` is the only side effect of a button click
- Component state resets on navigation back to the page

**Phase to address:** Phase 1 (functional gaps) — fix before building any new features

---

### Pitfall 2: Supabase Realtime Subscriptions Leaking in React

**What goes wrong:**
Realtime subscriptions created inside `useEffect` without a cleanup function accumulate on every re-render. React 18+ Strict Mode double-fires effects in development, creating duplicate channels that immediately close — making it appear the subscription doesn't work, when actually it's being created and destroyed twice. In production, navigating away without unsubscribing leaves WebSocket connections open, causing memory creep and stale update callbacks firing on unmounted components.

**Why it happens:**
Supabase's subscription API looks synchronous but manages async WebSocket state underneath. Developers copy the `supabase.channel().on().subscribe()` pattern without adding the matching `supabase.removeChannel()` teardown. The React 18 Strict Mode double-invoke behaviour only appears in development, so the production leak goes undetected.

**How to avoid:**
Every `useEffect` that opens a Supabase channel must return a cleanup function that calls `supabase.removeChannel(channel)`. Pattern:

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`notes:${patientId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, handler)
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [patientId])
```

Subscribe once per patient page mount, not inside helper functions that may re-run.

**Warning signs:**
- React DevTools shows the subscription effect running twice without cleanup
- Browser memory grows across tab switches
- Stale handlers fire after navigating away from a patient page
- "Channel already subscribed" errors in the console

**Phase to address:** Phase 3 (real-time updates) — build correctly from the start, not retrofitted

---

### Pitfall 3: Missing Initial Data Load Before Subscription

**What goes wrong:**
A realtime subscription only delivers changes that occur after it connects. Any note, action, or supply record created between the last page load and the subscription establishing is silently missed. The UI shows stale data as if it is current. This is especially damaging during a demo: the interviewer refreshes and the "live" state is behind by whatever happened while the page was loading.

**Why it happens:**
The mental model of "subscribe and it's live" ignores the gap between DOM mount and WebSocket handshake. Developers assume the subscription delivers all current records — it does not.

**How to avoid:**
Always follow the load-then-subscribe pattern: fetch current state with a normal Supabase query first, render it, then open the subscription to receive incremental changes. The subscription merges new events into the already-loaded state — it does not replace the initial fetch.

**Warning signs:**
- UI is empty for 200-500ms after navigation then snaps to current state
- Refreshing immediately after an action shows the previous state
- No initial `select()` query exists in the same hook that creates a realtime channel

**Phase to address:** Phase 3 (real-time updates)

---

### Pitfall 4: AI Cross-Visit Memory That Stuffs the Entire History Into One Prompt

**What goes wrong:**
Naively aggregating "all prior notes" into the Claude prompt works for three seeded patients with 2-3 notes each. As the demo accumulates real notes during live testing, the prompt grows linearly. Beyond a certain point — well under the 200K token limit of claude-sonnet — the "lost-in-the-middle" effect degrades the handoff report quality: the model pays less attention to middle-of-prompt content. More importantly, including everything signals poor engineering judgment to a technical interviewer.

**Why it happens:**
"Just send everything" is the easiest implementation. Token counting and summarisation feel like premature optimisation at demo scale, so they get skipped.

**How to avoid:**
Build a structured context aggregation layer from the start. For prior-visit memory, send a summary (not raw notes) plus the three most recent notes. The summary should be pre-computed and stored in the `patients` table as a `context_summary` field, updated when a new note is confirmed. For the handoff report, limit to notes from the last 24 hours (as the existing prompt already specifies) — enforce this with a Supabase query filter, not a post-hoc truncation.

**Warning signs:**
- The prompt building function does `notes.join('\n')` without a length or recency limit
- Handoff report quality degrades noticeably between the first and fifth demo run
- No `context_summary` or equivalent pre-computed field exists on the patient record

**Phase to address:** Phase 2 (patient preference memory / cross-visit context)

---

### Pitfall 5: Audit Trail That Logs Actions But Cannot Answer "Who Did What"

**What goes wrong:**
An `audit_events` table with rows like `{ event_type: 'note_approved', note_id: '...' }` is not an audit trail — it is an event log. An audit trail must answer: which nurse, on which shift, approved which note, at what time, and what the note said at the moment of approval. Without the nurse identity and a snapshot of the state at the time of the action, the trail is useless for the compliance narrative this demo is making.

**Why it happens:**
Developers design the schema for the happy path (record that something happened) rather than for the audit use case (reconstruct exactly what happened and who authorised it). Nurse identity is particularly prone to being skipped because the current codebase hardcodes `'Sarah Chen'` — there is no real identity to capture yet.

**How to avoid:**
Design the audit schema before implementing it. Required fields per event: `id`, `actor` (nurse name/id), `action_type` (enum: approved / escalated / overridden / supply_confirmed / handoff_generated), `target_table`, `target_id`, `snapshot` (JSONB — the full record at time of action), `shift`, `created_at`. The multi-nurse identity work (nurse switcher) must land before the audit trail — otherwise the actor field is always `'Sarah Chen'` and the audit trail is meaningless.

**Warning signs:**
- The audit schema has no `actor` or `nurse` column
- No JSONB snapshot field exists
- Audit logging is added before nurse identity is resolved
- The schema is an append-only log table that duplicates the `notes` table columns rather than referencing them

**Phase to address:** Phase 1 (multi-nurse identity) must complete before Phase 1 (audit trail) — sequence within the phase matters

---

### Pitfall 6: n8n Webhook Timeout During Live Demo

**What goes wrong:**
The n8n cloud instance, if idle, may take 2-5 seconds to process the first webhook of a demo session. Combined with Claude API latency (typically 1-3 seconds for sonnet), the first dictation submission can take 5-8 seconds with no visible feedback — long enough for a hiring manager to assume it broke. If the demo machine loses internet, the entire system is dead.

**Why it happens:**
n8n cloud instances on free/starter tiers have no keep-alive. The app has no timeout handling on the fetch call and shows no loading state distinction between "processing" and "hung."

**How to avoid:**
Three-part mitigation: (1) warm up the n8n webhook by hitting it with a dummy payload 30 seconds before starting the demo — build this into the pre-demo checklist. (2) Add a loading state with a timeout indicator: if the webhook has not responded in 8 seconds, show "Still processing — Claude API may be slow" rather than an infinite spinner. (3) Have a fallback: pre-recorded outputs in `demo-scripts.ts` that can be displayed if the webhook call fails, so the demo narrative can continue even if the backend is down.

**Warning signs:**
- No timeout or AbortController on the fetch call in `DictationInput.tsx`
- The loading state is a generic spinner with no elapsed time indicator
- No fallback mock response path exists in the component

**Phase to address:** Phase 4 (demo hardening / polish) — but timeout error handling should be present from Phase 1

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Timestamp proximity for note-supply matching | No schema change required | Two notes within 120s mis-attribute supplies; breaks if n8n is slow | Never — replace with FK before Phase 1 ships |
| Hardcoded nurse name `'Sarah Chen'` | No auth system required | Multi-nurse handoff demo is impossible; audit trail actor is meaningless | Only for initial scaffold — fix in Phase 1 |
| Client-only supply confirmation state | No Supabase write required | Confirmation is cosmetic; `confirmed_by` column is never populated | Never — compliance demo requires this to persist |
| Handoff extras in React state only | No schema migration required | Stable items and recommended actions vanish on refresh | Never — these are the most useful parts of the report |
| Google Fonts from CDN | No build step required | Demo fails offline; violates "zero external dependencies at demo time" | Never — switch to `next/font/google` which self-hosts |
| Monolith `patient/[id]/page.tsx` (347 lines) | Fast initial build | Every feature addition has collateral breakage risk | Acceptable for initial build — extract hooks in Phase 1 refactor |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Realtime | Opening a channel without RLS enabled on the target table | Enable RLS on `notes`, `supply_requests`, `handoff_reports` before opening subscriptions — even on demo policies |
| Supabase Realtime | Listening for `UPDATE` events but the n8n pipeline only does `INSERT` | Check which event type the pipeline actually emits; subscribe to `INSERT` for new notes, `UPDATE` for action_taken changes |
| n8n Webhook | Using `NEXT_PUBLIC_N8N_WEBHOOK_URL` that falls back to `localhost:5678` in production | Add a startup guard that throws a visible error if the env var is not set — silent fallback causes invisible failures on Vercel |
| Claude API via n8n | Sending raw `raw_input` with no length cap | Add input length validation in `DictationInput.tsx` before sending — prevents runaway token costs and malformed prompts |
| Supabase JS client | Non-null assertions on env vars (`NEXT_PUBLIC_SUPABASE_URL!`) | Add a runtime check with a descriptive error message so misconfiguration is immediately diagnosable |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 query on dashboard (1 query per patient for latest note) | Dashboard loads slower as patient count grows | Fetch all latest notes in a single RPC or use `Promise.all` to parallelize | Perceptible at 10+ patients; painful at 50 |
| Full `fetchData()` re-query after every action | Perceptible delay between submit and updated UI | Optimistic updates — append new note from webhook response before re-fetching | Felt immediately in demo when submitting multiple notes in sequence |
| AI prompt growing unbounded with prior note history | Handoff report quality degrades; token costs grow | Cap at last 24h notes (enforced by query) plus pre-computed context summary | Noticeable degradation after ~10 notes per patient |
| Realtime subscription with no filter | All table changes delivered to every subscriber | Filter by `patient_id` in the subscription: `filter: 'patient_id=eq.' + patientId` | All clients receive all changes at > 3 concurrent users |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Root `.env` file outside gitignore protection | Supabase credentials and Anthropic API key accidentally committed | Verify `.env` is not staged before every commit; add pre-commit hook; the `src/.env.local` is the file Next.js actually reads |
| RLS policies using `USING (true)` for all roles | Anyone with the anon key can insert arbitrary notes, supply requests, or handoff reports | Document explicitly as demo-only; for any public-facing version, scope policies to authenticated nurse session |
| No error boundary at root level | A malformed Claude response crashes the entire app to a white screen mid-demo | Add `error.tsx` at the app root per Next.js convention; component-level error boundaries around the dictation and note display components |
| `.vercel` directory committed in `src/` | Vercel project metadata exposed; causes conflicts when collaborators deploy | Add `.vercel` to `src/.gitignore` and remove from git tracking |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Infinite spinner with no timeout message | Hiring manager assumes the demo is broken after 5s; clicks away | Show elapsed time after 3s; show "Still processing..." after 6s; show actionable error after 10s |
| Flag badge identical colour for warning and critical | The distinction between anomaly-detected and urgent-review-required collapses | Amber (#F59E0B) strictly for warnings; red (#EF4444) strictly for critical — never use both on the same note without differentiation |
| Supply checklist confirmation state resetting on refresh | Nurse must re-confirm already-prepared supplies; destroys trust in the system | Persist `confirmed_by` and per-item state to Supabase; reload persisted state on mount |
| Hardcoded "Night" shift in handoff report | Handoff report claims wrong shift; undermines clinical accuracy narrative | Derive from current time or expose a shift selector in the nurse identity switcher |
| Typewriter animation with no ability to interrupt | If the animation is running and the demo needs to move on, there is no way to skip | Add a "Stop" or "Skip" button that completes the text immediately and enables the submit button |
| Monolith page component making debugging visible | If something breaks mid-demo and console errors are open, the complexity of the component is visible | Extract into clean hooks and sub-components before the demo video is recorded |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Nurse action buttons:** Visible and clickable — verify action is written to `notes.action_taken` in Supabase and survives refresh
- [ ] **Supply checklist:** Items appear and can be checked — verify `confirmed_by` and item state are persisted to `supply_requests`
- [ ] **Handoff report:** Report renders with flags — verify `stable_items` and `recommended_first_actions` are persisted to `handoff_reports` table
- [ ] **Multi-nurse handoff:** Two nurse names appear in the UI — verify outgoing and incoming nurse are different identities in the handoff report
- [ ] **Audit trail:** Audit events table exists — verify it has `actor`, `snapshot`, `shift` columns and is written on every nurse action
- [ ] **Realtime subscription:** Notes appear without refresh — verify cleanup function exists in the useEffect and no duplicate channels are created
- [ ] **Cross-visit memory:** Patient context summary displayed — verify it is pre-computed in Supabase and passed into the Claude prompt, not dynamically concatenated from raw notes
- [ ] **Demo runs offline:** Open Chrome DevTools network tab, switch to offline — verify fonts load (self-hosted), Supabase client initialises, graceful error if webhooks unavailable
- [ ] **No hardcoded UUIDs in critical paths:** Reseed the database — verify demo scripts resolve correctly by patient name slug, not raw UUID

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Cosmetic state discovered mid-demo | HIGH | Stop demo, fix schema + Supabase writes, re-run all three scenarios before re-recording |
| Realtime subscription memory leak | MEDIUM | Add cleanup functions to all subscription useEffects; test with React DevTools Profiler |
| AI prompt quality degraded by excess context | LOW | Add a `notes.slice(-3)` limit + context summary field; re-test handoff scenario |
| n8n webhook timeout during live demo | LOW (if caught early) | Warm up webhook before demo; add timeout UI; prepare fallback mock response |
| Audit trail missing actor field | HIGH | Requires multi-nurse identity work to land first; cannot retrofit meaningful actor without nurse switcher in place |
| `.env` accidentally committed | CRITICAL | Rotate Supabase anon key and Anthropic API key immediately via their respective dashboards; rewrite git history with `git filter-repo` |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Cosmetic state (no Supabase writes) | Phase 1: Functional gaps | Refresh after every action — state must survive |
| Multi-nurse hardcoding | Phase 1: Functional gaps | Two distinct nurse identities appear in handoff report |
| Note-supply FK missing | Phase 1: Functional gaps | Supply always references correct note even when two notes submitted within 120s |
| Audit trail missing actor / snapshot | Phase 1 (nurse identity) → Phase 1 (audit trail) | Query `audit_events` — every row has non-null `actor` and non-empty `snapshot` |
| Realtime subscription leaks | Phase 3: Real-time updates | React DevTools Profiler shows no accumulating listeners across navigation |
| Missing initial data load before subscribe | Phase 3: Real-time updates | Refresh page with notes present — all existing notes visible immediately, no blank flash |
| AI cross-visit memory prompt bloat | Phase 2: Patient preference memory | Check token count of prompt sent to Claude after 10+ notes — must not scale linearly |
| n8n webhook timeout | Phase 4: Demo hardening | Submit dictation with DevTools throttled to Slow 3G — timeout message appears within 8s |
| Portfolio demo feels shallow | All phases | Every button has a database consequence; every panel shows data from Supabase, not local state |
| Google Fonts CDN dependency | Phase 4: Demo hardening | Disconnect from internet — UI renders with correct Inter font |

---

## Sources

- [Supabase Realtime Troubleshooting — official docs](https://supabase.com/docs/guides/realtime/troubleshooting)
- [Supabase Realtime Client-Side Memory Leak — Stack Diagnosis](https://drdroid.io/stack-diagnosis/supabase-realtime-client-side-memory-leak)
- [Issues with un-subscribing from realtime in React 18 — Supabase GitHub Discussion #8573](https://github.com/orgs/supabase/discussions/8573)
- [Database Design for Audit Logging — Red Gate](https://www.red-gate.com/blog/database-design-for-audit-logging/)
- [4 Common Designs of Audit Trail — Medium / TechToFreedom](https://medium.com/techtofreedom/4-common-designs-of-audit-trail-tracking-data-changes-in-databases-c894b7bb6d18)
- [Context Rot: How Increasing Input Tokens Impacts LLM Performance — Chroma Research](https://research.trychroma.com/context-rot)
- [Top techniques to Manage Context Lengths in LLMs — Agenta](https://agenta.ai/blog/top-6-techniques-to-manage-context-length-in-llms)
- [I Analyzed 100 Tech Lead Portfolios — Medium](https://medium.com/@sohail_saifi/i-analyzed-100-tech-lead-portfolios-these-5-projects-are-red-flags-to-recruiters-04d03303d445)
- [Vetting AI Consultants: 7 Red Flags That Signal Implementation Risk — ECA Partners](https://www.eca-partners.com/insights/blog/vetting-ai-consultants-for-pe-portfolio-companies-7-red-flags-that-signal-implementation-risk)
- [Why n8n Webhooks Fail in Production — Prosperasoft](https://prosperasoft.com/blog/automation-tools/n8n/n8n-webhook-failures-production/)
- [How can I improve function cold start performance on Vercel](https://vercel.com/kb/guide/how-can-i-improve-serverless-function-lambda-cold-start-performance-on-vercel)
- [Frontend Modernization Without Rewriting Everything — Medium, Feb 2026](https://altersquare.medium.com/frontend-modernization-without-rewriting-everything-2ff11b6b57b0)
- Codebase audit: `.planning/codebase/CONCERNS.md` (2026-03-26)

---
*Pitfalls research for: AI-Native Nurse Context Engine — Next.js / Supabase / n8n / Claude API*
*Researched: 2026-03-26*
