# Content Hierarchy Map: Nurse Context Engine

_Last updated: 2026-03-29 | What information lives at each level, for each view_

---

## Hierarchy Levels

| Level | Scan Time | Purpose | Design Treatment |
|---|---|---|---|
| **L1: Page** | 0-3 seconds | Orient: "Where am I? What's the overall state?" | Page title, aggregate status indicators, navigation |
| **L2: Section** | 3-10 seconds | Triage: "What needs my attention first?" | Section headers, flag badges, card groupings |
| **L3: Card/Row** | 10-20 seconds | Evaluate: "What's happening with this specific item?" | Card content, table rows, inline data |
| **L4: Element** | 20+ seconds | Act: "What do I do about this?" | Action buttons, form inputs, detail text |

---

## View: Patient Dashboard (`/`)

```
L1: PAGE
├── Page title: "Patient Dashboard"
├── Nurse identity: "Sarah Chen | Day Shift"
├── Aggregate status: patient count, flag count summary
│
L2: SECTION
├── Patient grid (all assigned patients)
│
L3: CARD (per patient)
│   ├── Patient name (H4, text-primary, semibold)
│   ├── Ward badge ("Ward 3B")
│   ├── Diagnosis summary ("Post-op | Hip Replacement")
│   ├── Flag badge [Clear | Flagged | Critical]
│   ├── Last update timestamp (caption, muted, monospace)
│   └── Note count indicator
│
L4: ELEMENT
    └── Click/Enter → navigates to patient detail
```

**Scanning rule:** A nurse returning from a patient room must re-orient in under 3 seconds by scanning L1-L2. Flag badges at L3 tell them who needs attention without clicking into any card.

---

## View: Patient Detail (`/patient/[id]`)

### Left Sidebar (Patient Context -- 280px fixed)

```
L2: SECTION — Patient Identity
│   ├── Patient name (H3)
│   ├── Age, sex, ward
│   ├── Admitting diagnosis
│   └── Flag badge (current status)
│
L2: SECTION — Current Vitals
│   ├── BP (monospace)
│   ├── HR (monospace)
│   ├── Temp (monospace)
│   ├── SpO2 (monospace)
│   └── Last vitals timestamp
│
L2: SECTION — Key History
    ├── Comorbidities (bulleted)
    ├── Allergies
    └── Code status
```

### Center Panel (Content Tabs -- fluid width)

#### Tab: Notes

```
L2: SECTION — Notes list (reverse chronological)
│
L3: CARD (per note)
│   ├── Nurse name + timestamp (caption, muted)
│   ├── Flag badge [Clear | Flagged | Critical]
│   ├── Review status pill [Flagged | Under Review | Resolved]
│   │
│   ├── SOAP Section: Subjective
│   │   ├── Section label (label style: 12px, uppercase, tracked, semantic color)
│   │   └── Content (body text)
│   ├── SOAP Section: Objective
│   │   ├── Section label
│   │   └── Content (body text, clinical values in monospace)
│   ├── SOAP Section: Assessment
│   │   ├── Section label
│   │   └── Content (body text)
│   ├── SOAP Section: Plan
│   │   ├── Section label
│   │   └── Content (body text)
│   │
│   ├── [CONDITIONAL] Flag Reason Block
│   │   ├── Flag icon + severity color
│   │   └── Plain-English reason (body SM)
│   │
│   └── [CONDITIONAL] Nurse Action Bar
│       ├── [PRIMARY] Approve button (green, large)
│       ├── [SECONDARY] Escalate button (amber outline)
│       └── [GHOST] Override button (muted, de-emphasized)
│
L4: ELEMENT — AI-generated content marker
    └── Italic, text-muted, prefixed with AI indicator icon
```

#### Tab: Supplies

```
L2: SECTION — Active Supply Checklists
│
L3: CARD (per checklist)
│   ├── Procedure name (H4)
│   ├── Generation timestamp (caption, muted)
│   ├── AI-generated indicator
│   │
│   ├── Table: Supply Items
│   │   ├── Header row: Item | Qty | Unit | Notes | Confirm
│   │   └── Data rows (per item):
│   │       ├── Item name (body SM)
│   │       ├── Quantity (monospace)
│   │       ├── Unit (text-secondary)
│   │       ├── Notes (text-muted)
│   │       └── Checkbox (confirm/unconfirm)
│   │
│   ├── [CONDITIONAL] AI Rationale Line
│   │   └── Italic, muted, AI indicator prefix
│   │
│   └── "Mark All Ready" CTA (full-width, primary action)
```

#### Tab: Handoff

```
L2: SECTION — Handoff Report
│
L3: CARD 1 — Summary
│   ├── Generation timestamp (monospace, prominent)
│   ├── Shift label ("Incoming: Night Shift")
│   └── Summary paragraph (body text, 1.75 line-height)
│
L3: CARD 2 — Priority Flags
│   ├── Section label: "Priority Flags"
│   └── Flag items (per flag):
│       ├── Severity badge [Critical | Warning] (left-anchored)
│       └── Flag detail text (body SM)
│
L3: CARD 3 — Stable Items
│   ├── Section label: "Stable Items"
│   └── Bulleted list (muted, no badge, body SM)
│
L3: CARD 4 — Recommended First Actions
    ├── Section label: "Recommended First Actions"
    └── Numbered list (body text, semibold, action-oriented)
```

#### Tab: Audit

```
L2: SECTION — Audit Log
│
L3: TABLE
    ├── Header: Timestamp | Nurse | Action | Detail
    └── Rows (per event):
        ├── Timestamp (monospace, caption)
        ├── Nurse name (body SM)
        ├── Action badge [APPROVED | ESCALATED | OVERRIDDEN]
        └── Detail text (body SM, truncated with expand)
```

### Right Panel (Dictation Input -- 400px fixed)

```
L2: SECTION — Dictation Input
│   ├── Section label: "Dictation Input"
│   ├── Patient context line (caption, muted)
│   ├── Textarea (body text, 120px min-height)
│   ├── [ANIMATING] Typewriter cursor
│   ├── [PROCESSING] Pulse indicator + "AI is processing..." label
│   └── Submit button [Begin Dictation | Submit Note]
│
L2: SECTION — Structured Output (appears after processing)
    └── Structured Note Display (same as Notes tab card, rendered inline)
```

---

## Information Priority Rules

### What Appears First (Top/Left in F-Pattern)

1. **Flag status** -- always top-right of any card or row
2. **Patient name** -- always top-left
3. **Recency indicator** -- timestamp of last meaningful change
4. **Action items** -- what the nurse needs to do next

### What Appears Last (Bottom/Right, Below the Fold)

1. **Stable items** -- unchanging background information
2. **Historical data** -- previous shift notes, resolved flags
3. **Audit trail** -- compliance data, not clinical decision data
4. **AI rationale lines** -- supporting context, not primary content

### What Gets Elevated Under Conditions

| Condition | Elevated Content | Treatment |
|---|---|---|
| Patient flagged critical | Flag badge + reason | Red left border on card, `role="alert"` |
| New note since last view | Note card | 100ms highlight fade on prepend |
| AI processing active | Processing indicator | Inline pulse, `aria-busy="true"` |
| Handoff report generated | Generation timestamp | Prominent, monospace, top of report |

---

## Cross-View Consistency Rules

1. **Flag badges look identical everywhere** -- dashboard cards, note cards, handoff report, sidebar. Same component, same tokens, same ARIA.
2. **Timestamps are always monospace, always caption-sized.** Never body text. Never hidden.
3. **AI-generated content always carries its visual marker.** Italic + muted + AI icon prefix. No exceptions across any view.
4. **SOAP section labels use the same token set everywhere** -- in the notes tab, in the structured output panel, in the handoff report summary.
5. **Action buttons follow the same hierarchy everywhere** -- primary (filled) > secondary (outlined) > ghost (text only).
