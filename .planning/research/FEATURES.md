# Feature Research

**Domain:** AI-native clinical context engine / EHR-adjacent nursing workflow tool (portfolio demo for AI Builder role at FIKA Cannabis)
**Researched:** 2026-03-26
**Confidence:** HIGH for clinical domain patterns; MEDIUM for portfolio signal judgment (subjective); HIGH for FIKA analogy mapping

---

## Context: Two Lenses on the Same System

Every feature decision must pass two tests simultaneously:

1. **Clinical lens** — Does it solve a real nursing workflow problem? (Validated by active nurses.)
2. **Portfolio lens** — Does it make the FIKA CEO think "this is already 80% of what we need"?

Features that only pass one test are deprioritized. Features that pass both are the core of this milestone.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that clinical/workflow tools users assume exist. Missing these = product feels broken or half-finished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Persistent nurse actions** | Approvals, escalations, and overrides that vanish on refresh are not actions — they are UI theater. Any workflow tool must save state. | LOW | Currently cosmetic. FK on actions table + `confirmed_by` field already exists in schema. |
| **Structured note display** | Nurses need to scan notes fast. Raw text is not a note. SOAP structure is the clinical standard (Subjective, Objective, Assessment, Plan). | LOW | Already built; improvement is visual hierarchy, not new data. |
| **Flag badges with reasoning** | A flag without an explanation creates anxiety, not action. "Something is wrong" is useless. "Drain output 250mL, expected <150mL" is usable. | LOW | Already built. Improvement is display polish and persistence. |
| **Supply checklist auto-generation** | Nurses expect the system to know what a dressing change requires. Manual list creation from memory is exactly the problem being solved. | LOW | Already built. Improvement is confirmation persistence. |
| **Shift handoff report on demand** | The incoming nurse needs a synthesized briefing, not a scroll through raw notes. One-click generation is expected for any system claiming to solve handoff. | LOW | Already built. Improvement is multi-nurse context (whose handoff to whom). |
| **Chronological note history** | Patient context is temporal. Notes out of order — or with no time context — are disorienting on a 12-hour shift. | LOW | Already built. Improvement is timestamps and visual separation. |
| **Patient status indicators** | Current status (stable / flagged / critical) must be visible without opening the patient record. Dashboard-level at-a-glance is standard. | LOW | Already built. Improvement is live sync with DB state. |
| **Loading and error states** | A blank screen or frozen UI during AI processing destroys trust. "Processing..." with a visual indicator is the minimum. | LOW | Exists. Audit all states for completeness. |

### Differentiators (Competitive Advantage)

Features that current EHR/handoff tools do not have, that make this demo feel like a different category of product.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Audit trail with nurse attribution** | Who flagged what. Who approved. Who overrode. When. This is the compliance signal. Maps directly to cannabis regulation narrative: every transaction logged, reviewer identified, timestamp immutable. EHRs have this deep in admin panels. This surface-levels it for the nurse. | MEDIUM | New table: `audit_events`. Schema: `{id, event_type, patient_id, note_id, nurse_name, action, timestamp, metadata}`. Every approve/escalate/override writes an event. Frontend renders as "Activity trail" on patient detail. |
| **Multi-nurse identity switching** | The handoff narrative only becomes real when you can see Nurse A submit a note and Nurse B receive the briefing. Single-nurse demos are monologues. Multi-nurse demos are conversations — and the FIKA parallel is obvious: budtender A knows the guest, budtender B picks up the shift, context survives. | MEDIUM | No auth required. Predefined nurse identities (e.g., "Sarah Chen – Night", "Marcus Webb – Morning"). Dropdown selector persists to `localStorage`. All new actions attributed to active nurse. |
| **Cross-visit patient memory** | The AI prompt today only sees the current admission. Cross-visit memory means: aggregate prior notes into a longitudinal summary that seeds the AI prompt for every new note. "This is Mrs. Thompson's third post-op admission in 14 months. Prior drain complications in 2024." This is what separates a charting tool from a context engine. Maps to cannabis: "This guest always asks about sleep, tried Indica strains twice, preferred CBD-dominant." | HIGH | Requires: (1) `patient_history` table or `notes` query across `admission_date` ranges; (2) AI prompt enrichment with summarized history; (3) UI "Patient History" section showing aggregated context. Seeded demo data must span multiple visit dates. |
| **Real-time cross-tab sync** | Supabase Realtime subscriptions on `notes` and `patient` tables. Open two tabs: Nurse A submits a note, Nurse B's view updates live. This makes "living context layer" a visible claim, not a verbal one. Highest-impact demo moment. | MEDIUM | Supabase Realtime uses Postgres CDC. Subscribe to `INSERT` on `notes` table. Merge updates into React state without full re-fetch. Cleanup on unmount. |
| **Recommendation panel framing** | The supply checklist currently reads as a checklist. Reframe as "Procedure Prep Recommendations" with confidence indicators, priority ordering (critical first), and "based on: [procedure context + unit type]" attribution. This is the bridge to cannabis retail: not "here's a list" but "here's what I'm suggesting and why." | LOW | No new data. Same AI output, different UI affordance. Add rationale field to supply item display. Show "AI suggested based on [procedure]" attribution. |
| **Flag escalation workflow** | "Flag for review" is one action. A real escalation workflow has states: `flagged → under review → resolved` with the resolving nurse's name and timestamp. This is audit trail made interactive — and it maps to cannabis compliance escalations (regulatory hold → reviewed → cleared). | MEDIUM | Requires action state machine on notes. DB field: `review_status ENUM(pending, reviewing, resolved)` + `resolved_by` + `resolved_at`. UI renders state transitions as badge progression. |
| **Handoff completeness score** | Before generating the handoff report, show a readiness indicator: "3 of 5 expected checks documented this shift. Missing: pain assessment, mobility." Prompts better input quality. Maps to cannabis: "Guest profile 60% complete. Add preferred effects for better recommendations." | HIGH | Requires defining expected note categories per unit type. Comparison of current shift notes against template. Complex to get right without false positives — flag for deeper phase research. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good ideas but would hurt this specific product.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real voice input (microphone)** | "It's a dictation tool, it should use the mic" | (1) Demo reliability — microphone permissions, browser behavior, and ambient noise are uncontrollable variables in a live demo. (2) STT errors change what gets sent to Claude, breaking the carefully scripted scenario outputs. (3) The typewriter simulation IS the demo affordance — it shows what dictation would produce without the risk. | Keep typewriter animation. In a real production build, this is the first feature to add post-validation. For demo: the simulation is the right call. |
| **Full user authentication** | "It should have login/logout" | Authentication is infrastructure cost with zero demo value. FIKA cares about the workflow, not the login screen. Auth gates the demo, slows reviewers, and adds cold-start complexity. | Predefined nurse identity selector (dropdown). No passwords. This still demonstrates multi-user context — which is the actual feature. |
| **Dashboard analytics / charts** | "Show patient trends, vital graphs" | This is scope expansion into clinical analytics, which is a different product category. Would require time-series data architecture that doesn't exist in the current schema. Demo would feel diluted — "what is this, a dashboard or a context engine?" | The note history IS the trend. Flag badges surface anomalies. Handoff report synthesizes change over time. These are the right outputs for a context engine. |
| **Notification/alert system (push or email)** | "Flag this patient to the charge nurse" | Builds in an external dependency (email/push infra) that must work during demo. Adds complexity to achieve what flag badges already accomplish visually. | Audit trail + flag escalation workflow achieves the accountability signal without external delivery plumbing. |
| **Mobile/tablet responsive layout** | "Nurses use tablets" | True in some settings. But (1) this is a workstation demo; (2) responsive reflow would compromise the three-panel layout that communicates the information architecture; (3) WCAG 2.1 AA on desktop is already a commitment. | Desktop only is the explicit constraint. Call it out in the demo video: "Designed for workstation use — the shift nurse's primary interface." |
| **Auto-fill from historical notes** | "Populate new note with prior context" | Risks the nurse approving AI-prefilled content without reading it. In clinical settings this is a patient safety issue. The AI should surface context, not pre-write the note. | Cross-visit memory fed into AI prompt enrichment (as a differentiator above). Context informs generation, never pre-fills input fields. |
| **PDF export of handoff reports** | "Outgoing nurse wants a copy" | Adds a dependency (PDF library), creates the illusion that the system produces paper artifacts — which is the old workflow being replaced, not improved. | Handoff report persists to `handoff_reports` table. Incoming nurse reads it in-app. The point is that context lives in the system, not in a printout. |

---

## Feature Dependencies

```
Persistent nurse actions
    └──requires──> Multi-nurse identity
                       └──enhances──> Audit trail

Audit trail
    └──requires──> Persistent nurse actions
    └──enhances──> Flag escalation workflow

Cross-visit patient memory
    └──requires──> Multi-admission seeded data (Supabase)
    └──enhances──> Handoff report quality (richer AI context)

Real-time cross-tab sync
    └──requires──> Supabase Realtime enabled on project
    └──enhances──> Multi-nurse identity demo (makes it visible)

Flag escalation workflow
    └──requires──> Persistent nurse actions
    └──requires──> Audit trail schema

Recommendation panel polish
    └──requires──> Supply checklist (existing)
    └──independent──> All other differentiators

Handoff completeness score
    └──requires──> Cross-visit patient memory (for baseline)
    └──requires──> Note category schema (new)
    └──conflicts──> Scope without deeper research (see pitfalls)
```

### Dependency Notes

- **Persistent nurse actions requires multi-nurse identity:** Saving "who approved this" is meaningless without a nurse identity to attribute it to. Build identity switching first, then action persistence.
- **Audit trail requires persistent nurse actions:** The audit trail IS the record of persisted actions. Not a separate system — a view over the actions table with nurse attribution and timestamps.
- **Real-time sync enhances multi-nurse demo:** Without realtime, multi-nurse identity is still valuable (two tabs with manual refresh). With realtime, it becomes a live demonstration of the "living context layer" claim.
- **Cross-visit memory is the highest-value / highest-effort differentiator:** It requires seeded data spanning multiple visits and changes to the AI prompt construction. Scope carefully — a simplified version (last-3-notes summary injected into prompt) achieves 80% of the demo value at 30% of the complexity.
- **Handoff completeness score should be deferred:** Requires defining "expected checks per unit type" which is clinical domain knowledge this system doesn't currently encode. High risk of false positives. Flag for phase-specific research if included.

---

## MVP Definition (for this milestone — v2)

This is not a greenfield MVP. The v1 product works end-to-end. This milestone's "MVP" is: what must be added to make the demo undeniable for the FIKA application.

### Launch With (v2 milestone complete)

- [x] Persistent nurse actions (approve/escalate/override save to DB, survive refresh) — breaks credibility if missing
- [x] Multi-nurse identity switching — handoff narrative requires two actors
- [x] Audit trail (who did what, when) — compliance signal is the strongest FIKA parallel
- [x] Real-time cross-tab sync — makes "living context layer" visible, not verbal
- [x] Recommendation panel polish — supply checklist reframed as AI suggestions with rationale

### Add After Core (v2.x if time permits)

- [ ] Cross-visit patient memory — highest narrative value but highest implementation complexity; simplified version (last-admission summary in AI prompt) is acceptable for demo
- [ ] Flag escalation workflow (state machine: flagged → reviewing → resolved) — extends audit trail into interactive compliance demonstration

### Defer to v3 or Production

- [ ] Handoff completeness score — requires clinical domain knowledge about expected note categories per unit type; needs phase-specific research
- [ ] Advanced AI context window management (token budgeting for large patient histories) — relevant only when note volume grows beyond demo scale

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Persistent nurse actions | HIGH | LOW | P1 |
| Multi-nurse identity | HIGH | LOW | P1 |
| Audit trail | HIGH | MEDIUM | P1 |
| Real-time cross-tab sync | HIGH | MEDIUM | P1 |
| Recommendation panel polish | MEDIUM | LOW | P1 |
| Cross-visit patient memory (simplified) | HIGH | MEDIUM | P2 |
| Flag escalation workflow | MEDIUM | MEDIUM | P2 |
| Handoff completeness score | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Build in this milestone — demo is not credible without it
- P2: Build if P1 complete with time remaining
- P3: Defer — requires more research or creates scope risk

---

## Competitor Feature Analysis

This is not a direct competitor analysis (no production EHR competitor is relevant to a portfolio demo). Instead: what do production clinical/workflow tools have that this demo should either match, exceed, or deliberately omit?

| Feature | Epic/Cerner (EHR) | HCA Nurse Handoff App | This System | Rationale |
|---------|-------------------|----------------------|-------------|-----------|
| Structured note format | Deep — complex forms | Automated from EHR | AI-structured from free-form | Superior UX: nurse speaks naturally, structure emerges |
| Audit trail | Yes — buried in admin | Partial | Surface-level, nurse-visible | Better: compliance signal is visible in the workflow, not a hidden log |
| Shift handoff report | Auto-generated from EHR | Yes — pulls from records | On-demand AI synthesis with flags | Comparable, differentiated by flag reasoning quality |
| Supply checklists | No (separate system) | No | Yes — auto-triggered | Differentiator: closes a genuine gap no current tool addresses |
| Cross-visit memory | Yes — in patient record | Partial | AI-injected into prompt | Differentiated framing: not a record to scroll, but context the AI already knows |
| Real-time sync | Yes — enterprise infra | Yes | Supabase Realtime | Achieves same outcome, far simpler implementation — demo signal is "modern stack" |
| Multi-nurse identity | Yes — login-based | Yes — login-based | Dropdown selector, no auth | Appropriate for demo scope; communicates the concept without the overhead |
| Recommendation engine framing | No | No | Yes — supply panel reframed | Unique: this is the explicit FIKA bridge — clinical recommendations = retail suggestions |

---

## The FIKA Analogy Map

Every differentiating feature in this system has a direct cannabis retail parallel. This is not a metaphor — it is the actual argument for the FIKA application.

| Nursing Feature | Cannabis Retail Equivalent | FIKA Signal |
|-----------------|---------------------------|-------------|
| Audit trail (who approved what flag) | Compliance log (who approved what sale, age verification, regulatory flag) | Cannabis is one of the most compliance-regulated retail environments in Canada |
| Multi-nurse identity + handoff | Budtender shift change + guest context continuity | "The guest who was here Tuesday wants the same thing" — memory survives staff turnover |
| Cross-visit patient memory | Returning guest profile (preferences, past products, contraindications noted) | Personalization engine at point of sale |
| Supply recommendations with rationale | Product recommendations with "based on your history / stated needs" | Recommendation engine is the core retail AI feature FIKA would build |
| Real-time sync | Live inventory + guest queue across multiple terminals | Any multi-terminal retail environment needs live state |
| Flag escalation (clinical anomaly → reviewed → resolved) | Regulatory flag (age concern → verified → cleared) | Compliance workflow is identical in structure |

The demo video should name these parallels explicitly. The system does not need to be reskinned — the structural argument is made verbally while the clinical demo runs.

---

## Sources

- [EHR Implementation Guide 2025 — TopFlight Apps](https://topflightapps.com/ideas/ehr-implementation/)
- [2025 EHR Buyer's Guide — CapMinds](https://www.capminds.com/2025-ehr-buyers-guide-features-interoperability-and-roi-benchmarks/)
- [Clinical Decision Support Interface Design — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1386505625001637)
- [AI in Nursing Practice 2025 — OJIN Nursing World](https://ojin.nursingworld.org/table-of-contents/volume-30-2025/number-2-may-2025/artificial-intelligence-in-nursing-practice-decisional-support-clinical-integration-and-future-directions/)
- [HIPAA Audit Trail Requirements — ofashandfire.com](https://www.ofashandfire.com/blog/hipaa-compliant-audit-trails-healthcare-software)
- [Audit Trail Healthcare Compliance — ideagen.com](https://www.ideagen.com/thought-leadership/blog/navigating-healthcare-compliance-the-crucial-role-of-audit-trails)
- [HCA Healthcare Nurse Handoff App — Google Cloud Blog](https://cloud.google.com/transform/nurse-handoff-ai-chart-app-hca-healthcare-better-patient-outcomes)
- [Supabase Realtime with Next.js — Supabase Docs](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)
- [Supabase Realtime subscriptions — DEV Community](https://dev.to/lra8dev/building-real-time-magic-supabase-subscriptions-in-nextjs-15-2kmp)
- [Understanding longitudinal patient records — Elation Health](https://www.elationhealth.com/resources/blogs/what-is-a-patient-longitudinal-record)
- [Cannabis Retail AI and Business Intelligence — Cova](https://www.covasoftware.com/blog/cannabis-retail-ai-and-business-intelligence)
- [Cannabis Retail Tech Trends 2025 — Cova](https://www.covasoftware.com/cova-insights/cannabis-retail-tech-trends-2025-ai-kiosks-smart-stores-1)
- [Portfolio That Gets You Hired 2025 — Meander Training](https://meander.training/blog/how-to-build-a-tech-portfolio-that-actually-gets-you-hired)
- [I-PASS Handoff Implementation — PMC](https://pmc.ncbi.nlm.wiley.com/pmc/articles/PMC7382547/)

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Table stakes (clinical) | HIGH | Verified against EHR feature guides, nurse workflow research, and clinical literature — consistent across multiple sources |
| Differentiators (technical) | HIGH | Supabase Realtime docs verified directly; audit trail patterns consistent across compliance literature; multi-nurse identity is architectural inference from validated source material |
| Anti-features | MEDIUM | Grounded in clinical safety literature and explicit project constraints; portfolio judgment is subjective but consistent with hiring research |
| FIKA analogy map | MEDIUM | Cannabis retail AI features verified via Cova (industry leader); the structural mapping is reasoning from evidence, not direct verification of FIKA's product roadmap |
| Handoff completeness score (deferred) | LOW | No verified benchmark for "expected note categories per unit type" found in research; flagged correctly as needing domain-specific investigation |

---
*Feature research for: AI-Native Nurse Context Engine (v2 milestone — FIKA Cannabis AI Builder application)*
*Researched: 2026-03-26*
