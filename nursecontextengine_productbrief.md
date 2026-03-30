# AI-Native Nurse Context Engine: Product Brief

---

## 1. Product Brief

### The Problem

Hospital nursing workflows were designed around paper, memory, and verbal handoff. Nurses spend 30 to 40 percent of every shift on documentation, written after the fact, from memory, inconsistently. Shift handoffs happen via rushed verbal reports with no standard format. One nurse described the process as "a game of telephone." Before procedures, nurses walk to the supply room, reconstruct what they need from memory, make multiple trips, and waste clean supplies that cannot be returned once they enter a patient room.

All three breakdowns share one root: a nurse constantly reconstructing context from scratch, at shift start, before a procedure, after an observation. The system was built for a world where no tool could hold that context continuously. That constraint no longer exists.

### The System

The Nurse Context Engine is a single, continuously updated patient context layer that powers three outputs nurses currently rebuild manually every time.

1. **Structured clinical notes:** the nurse dictates or types a raw observation; the system structures it into a SOAP-format note, flags anomalies for human review, and detects procedures that need supplies.
2. **Supply checklists:** generated automatically when a procedure is mentioned, or on demand via procedure search. The nurse confirms items instead of building the list from memory.
3. **Shift handoff reports:** generated on demand from the full patient record, prioritizing what changed, what needs watching, and what is stable. The incoming nurse gets a complete briefing before stepping into the room.

### How It Works

```
Nurse dictates or types an observation
        ↓
AI structures the input into a clinical note,
detects procedures, and flags anomalies
        ↓
Three outputs, always current:
  1. Living patient record
  2. Supply checklist (auto or on-demand)
  3. Shift handoff report (on-demand)
```

The human's role: every clinical decision, every approval, every override. The AI holds context and surfaces it. The nurse acts on it.

### Demo Scenarios

**Margaret Thompson** (67F, post-op hip replacement, stable): The nurse dictates a routine observation. The system structures it into a clean SOAP note with no flags and auto-generates a dressing change supply list from the procedure mention. Zero friction, zero cognitive overhead.

**Devon Clarke** (44M, ICU, chest drain): The nurse reports drain output higher than expected. The system structures the note, flags the anomaly with a plain-English reason ("drain output exceeds expected threshold"), and generates a chest drain supply list. The AI surfaces the concern; the nurse decides what it means clinically.

**Aisha Mensah** (31F, general ward, vitals change mid-shift): She starts stable. A second dictation at 18:45 reports a BP drop and elevated heart rate. The system flags it critical. When the incoming nurse requests a handoff report, the flag appears in their briefing, reflecting the most current state, not what was true six hours ago.

### Design Decisions

Notes use SOAP format (Subjective, Objective, Assessment, Plan) because it is the structure nurses already think in, reducing cognitive translation cost to zero. We extended SOAP with History of Present Illness, Comorbidities, and Interventions sections after nurse feedback confirmed these anchoring fields were missing from standard SOAP and forcing unnecessary context reconstruction.

Color in the interface carries only meaning: amber for warnings, red for critical flags, green for clear. No decorative color. On hour 11 of a 12-hour shift, a nurse needs to know that color always signals something.

The AI flags anomalies but never acts on them. The prompt returns a boolean flag and a plain-English reason; the clinical response belongs to the nurse. Automation handles context. Humans handle judgment.

### Why This Is an Observability Problem

Patient monitoring is an observability problem. Vitals are telemetry. Nurse notes are logs. The care timeline is a trace. Anomaly flags are alerts. The architectural pattern here is a continuous context layer that ingests unstructured signals, structures them, detects anomalies, and surfaces them for human judgment without acting autonomously. That pattern maps directly to how AI should work in infrastructure observability. The domain is healthcare, but the system design is the same problem Grafana solves: too many signals, too little context, and a human operator who needs the right information at the right time to make a high-stakes decision.

### Competitive Landscape

Nuance DAX Copilot is the incumbent in AI-assisted clinical documentation, but it is dictation-only: it transcribes and structures notes. No supply automation, no handoff generation, no anomaly flagging, no continuous context layer. Epic's ambient listening features are emerging but locked inside Epic's EHR ecosystem, inaccessible to the 40 percent of US hospitals not on Epic. The Nurse Context Engine is not a charting replacement. It is the context layer that sits between raw observation and every downstream action, a category neither Nuance nor Epic currently occupies.

### Go-to-Market

**Why this exists:** The goal is not to sell software to hospitals. It is to give nurses back the 30 to 40 percent of their shift currently lost to reconstructing context, so they can spend that time on patient care. The commercial model exists to make that sustainable.

**The adoption constraint:** Nurses cannot adopt clinical tools independently. Every system that touches Protected Health Information goes through hospital IT, compliance review, and procurement. A nurse can validate the problem and confirm the solution works. The institution decides whether to buy it. This is not a PLG (product-led growth) motion. It is an enterprise sale with clinical validation as the wedge.

**EHR integration is non-negotiable.** Patient records live inside the hospital's EHR: Epic, Cerner, MEDITECH, or Oracle Health. A standalone context layer that does not read from and write back to the EHR creates parallel documentation, which is exactly what compliance teams reject. The Nurse Context Engine is middleware, not a replacement. The production deployment path requires integration via HL7 FHIR APIs (the healthcare data interoperability standard) or direct EHR vendor partnership. The demo runs standalone to prove the interaction model; the production system connects to whatever EHR the hospital already runs.

**The buyer** is the Chief Nursing Officer, with budget sign-off from the CTO or CIO. The CNO feels the pain directly: staffing shortages, documentation burden driving burnout, handoff errors showing up in incident reports. The CTO cares about integration, security, and whether it fits their existing infrastructure.

**Pricing model:** per-bed, per-month. This aligns cost to the unit of value (patient context) rather than the number of nurses, which fluctuates with staffing. A 200-bed hospital at $50/bed/month is $120K ARR, competitive with clinical documentation add-ons and small enough for a department-level purchase without board approval.

**The wedge:** Start with a single high-acuity unit (ICU or surgical) where handoff errors and supply waste are most visible. Run the context layer alongside the existing EHR with manual sync for 90 days. Prove the handoff and supply ROI with unit-level data. Then expand hospital-wide with full EHR integration as the second phase.

---

## 2. Working with Claude's API

### The Three Prompts

**Prompt 1: Note Structuring.** Takes raw nurse dictation plus the patient's current record and returns a structured SOAP note, a flagged boolean, a plain-English flag reason, and an array of detected procedures. The key learning: the prompt needed an explicit JSON schema in the instruction. Without it, Claude returned valid clinical content in unpredictable structures that broke downstream parsing.

**Prompt 2: Supply List Generation.** Takes a procedure name and patient context (including unit type, since ICU vs. general ward affects what is needed) and returns an itemized supply checklist. This prompt runs two ways: auto-triggered when a note mentions a procedure, and standalone via the Procedure Search feature. The tuning insight: Claude tends to over-generate supply items. Adding the instruction "Include only what is needed. Do not pad the list" cut average list length by 30 percent without losing clinically necessary items.

**Prompt 3: Handoff Report Generation.** Takes the full patient record plus recent notes and produces a structured briefing with priority flags, stable items, and recommended first actions. The instruction "Cut anything that doesn't help the incoming nurse in the first 30 minutes" was the single most effective constraint. Without it, reports included background history that an incoming nurse does not need at shift start.

### The Markdown Fence Bug

Claude occasionally wraps JSON responses in markdown code fences even when explicitly instructed not to. This is a known LLM failure mode. Adding "No markdown code fences. No preamble." to the prompt reduced but did not eliminate the behavior. The fix: a strip function in the n8n pipeline that removes code fences before parsing, `text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()`. Both the prompt instruction and the parsing guard are necessary; neither alone is sufficient.

### Structured JSON Constraint

All three prompts enforce strict JSON output with no prose preamble. This is not a stylistic choice; the n8n automation pipeline parses Claude's response programmatically. If the response is not valid JSON, the entire pipeline fails. Every prompt includes an explicit JSON schema as the final element of the instruction, showing Claude exactly what structure to return. This approach held up reliably across all test scenarios.

### Where the AI Stops

The prompts enforce a hard boundary: the AI flags anomalies but never interprets them clinically. Prompt 1 returns `"flagged": true` and `"flag_reason": "Drain output exceeds expected threshold"`. It does not say "this patient is deteriorating" or recommend a clinical intervention. That boundary matters because clinical judgment on ambiguous presentations requires situational context the system never fully has. Constraining output to structured fields (boolean plus string) rather than open-ended clinical narrative enforces that limit at the prompt level.

### What I Would Change

The prompts work reliably for three seeded patients with well-defined scenarios. They have not been stress-tested against edge cases: missing vitals fields, contradictory readings within the same dictation, extremely short or long inputs, or patients with complex multi-system presentations. In production, input validation belongs before the prompt, and a test suite covering at least 20 patient profiles across specialties is the minimum viable safety net.

---

## 3. Instrumentation & Adoption Metrics

### Usage Metrics

**Dictation adoption rate:** the percentage of notes entered via the dictation interface versus manual entry or no entry. This is the foundational metric. If nurses are not dictating, the context layer is not being fed, and every downstream output degrades.

**Flag accuracy rate:** the percentage of AI-generated flags that nurses act on (escalate, investigate, adjust care) versus dismiss. A high dismiss rate means the system is crying wolf. A low flag rate on patients who later deteriorate means the system is missing signals. Both failure modes erode trust.

**Supply list confirmation rate:** the percentage of generated supply lists where nurses confirm items and use the "Mark Ready" flow versus ignoring the list entirely. If nurses are walking to the supply room without checking the generated list, the feature is not reducing cognitive load.

**Handoff report generation frequency:** the number of reports generated per shift change versus total shift changes. If nurses pull it every time, the feature has earned trust. If they skip it and revert to verbal handoff, the report is not meeting their needs in content, speed, or reliability.

### Experiment: Time-to-First-Action

A/B test between nurses using the system for handoff versus traditional verbal handoff. Measure time-to-first-meaningful-action: how many minutes after shift start does the incoming nurse begin active patient care (checking vitals, adjusting medications, entering a patient room) versus still reviewing notes or seeking information? The hypothesis: system-generated handoff reports reduce this window by 40 percent or more, because the incoming nurse arrives with prioritized, complete situational awareness instead of building it from scratch.

### The Canary Metric

The leading indicator that the system is failing is dictation drop-off. If nurses stop dictating and revert to handwritten notes, late manual entries, or skipped documentation, the context layer starves. Handoff reports become stale. Supply lists stop generating. Flags stop firing. The entire value proposition collapses at the input layer.

This is a change management problem, not a technical one; it is also the honest answer to what breaks first. Monitoring weekly dictation volume per nurse, with alerts on sustained decline, is the single most important instrumentation decision you can make.

---

**Source code:** [github.com/nwogbogozzy-a11y/ai_nurse_context_engine](https://github.com/nwogbogozzy-a11y/ai_nurse_context_engine)
