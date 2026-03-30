# 3 Concept Directions: Sub-Variations of Precision Instrument

_Last updated: 2026-03-29 | All directions share the "Precision Instrument" aesthetic. Each varies density, color temperature, and typographic treatment._

---

## Direction A: "Clinical Monitor"

### Rationale
Modeled after patient monitoring equipment -- the bedside vital signs displays nurses already trust. Maximum information density with zero decoration. Data is king. The interface recedes entirely; only the numbers, labels, and flags exist. This is the ICU version of the tool.

### Density Philosophy
**High density, tight spacing.** Optimized for nurses who manage 6-8 patients simultaneously and need every data point visible without scrolling. Cards are compact. Tables are tight. Whitespace is functional (grouping), never decorative.

- Card padding: 16px (`p-4`)
- Table row height: 8px vertical padding (`py-2`)
- Gap between elements: 8px (`gap-2`)
- Dashboard grid: 4 columns at 1440px+ (fits more patients on screen)
- Body text: 14px as default (not 16px) -- density over comfort

### Color Temperature
**Cool and desaturated.** Slate-heavy. The base surface shifts slightly cooler -- `#F1F5F9` (Slate-100) instead of `#F8FAFC`. Borders are more visible (`#CBD5E1` Slate-300) to create sharper grid lines reminiscent of monitoring equipment. Accent stays sky blue but at slightly lower saturation for reduced visual stimulation during long shifts.

| Token | Standard | Clinical Monitor |
|---|---|---|
| `surface` | #F8FAFC | #F1F5F9 |
| `border` | #E2E8F0 | #CBD5E1 |
| `text-muted` | #94A3B8 | #64748B (higher contrast) |

### Typographic Treatment
**Monospace-forward.** Clinical values (vitals, timestamps, drain output, quantities) use monospace not just as an accent but as a primary data display typeface. Section labels are tighter, more compact. The overall feel is a data terminal.

- Timestamps: always monospace, always visible
- SOAP section labels: 11px uppercase, tracked, monospace
- Patient card metadata: monospace for all numerical values
- Reduced line-height on data rows: 1.375 instead of 1.625

### Layout Philosophy
Grid-dominant. Every surface is a grid cell. Borders are structural, not decorative -- they create the matrix that the nurse's eye follows. Think: spreadsheet precision with clinical color coding.

### Best For
ICU-heavy deployments. Charge nurses monitoring multiple patients. Environments where screen real estate is limited and data density is paramount.

### Risk
May feel cramped for nurses who primarily use the narrative views (handoff reports, SOAP notes). The tight spacing may increase misclick rates under fatigue.

---

## Direction B: "Instrument Panel"

### Rationale
Modeled after cockpit instrument panels -- each section is a discrete, self-contained instrument that reports one thing clearly. The organizing principle is **compartmentalization**: every piece of information lives in its own bounded zone. The nurse's eye moves between zones, never needing to parse a continuous stream. This is the current direction closest to what `system.md` already defines.

### Density Philosophy
**Moderate density, generous compartments.** Cards have clear boundaries and comfortable padding. Information is grouped into self-contained modules, each with a header, content area, and optional action footer. Whitespace between compartments creates visual breathing room.

- Card padding: 20px (`p-5`)
- Table row height: 12px vertical padding (`py-3`)
- Gap between elements: 16px (`gap-4`)
- Dashboard grid: 3 columns at 1440px+ (current specification)
- Body text: 16px (comfortable reading size)

### Color Temperature
**Neutral.** The current palette -- pure white background, warm-neutral slate for text, sky blue accent. Neither warm nor cool. The system feels like a well-calibrated instrument: no emotional bias in either direction. Semantic colors pop against the neutral base.

| Token | Value | Character |
|---|---|---|
| `background` | #FFFFFF | Pure white -- maximum contrast base |
| `surface` | #F8FAFC | Near-white with the faintest blue tint |
| `accent` | #0EA5E9 | Sky blue -- trustworthy, clinical, neutral |

### Typographic Treatment
**Balanced hierarchy.** Clear distinction between heading levels. Body copy at 16px for comfortable reading during narrative review (handoff reports, SOAP note content). Labels and metadata clearly subordinated. Monospace reserved for clinical values only.

- Strong heading weight differentiation (700 > 600 > 400)
- Generous line-height on body text (1.625)
- Labels: uppercase, tracked, 12px -- visually distinct from content
- Monospace only for vitals, timestamps, and measurements

### Layout Philosophy
Module-based. Each view is composed of discrete, bordered modules. The patient detail view is a 3-column grid where each column is a self-contained instrument: sidebar (patient context), center (content tabs), right panel (input). Modules never bleed into each other. Borders are the primary structural element.

### Best For
General-purpose deployment. Mixed ICU and general ward use. Environments where nurses alternate between data-dense tasks (supply checklists, audit logs) and narrative tasks (handoff reports, SOAP note review).

### Risk
The moderate density may feel too sparse for high-acuity ICU environments where every pixel counts. The strong compartmentalization may create excessive visual fragmentation if too many small modules are on screen.

---

## Direction C: "Reading Room"

### Rationale
Modeled after the radiologist's reading room -- optimized for sustained, focused reading of clinical narratives. The SOAP note and handoff report are the primary surfaces, and they are treated like documents, not data cards. This direction prioritizes comprehension depth over scanning breadth. The nurse who reads a handoff report in this interface should feel like they are reading a well-structured clinical document, not parsing a dashboard widget.

### Density Philosophy
**Low density, maximum readability.** Generous padding, wide content columns, and ample line-height. The interface favors vertical scroll over horizontal packing. Fewer elements on screen at once, but each element gets the space it needs to be read carefully.

- Card padding: 24px (`p-6`)
- Table row height: 16px vertical padding (`py-4`)
- Gap between elements: 24px (`gap-6`)
- Dashboard grid: 2 columns at 1440px, 3 at 1920px+
- Body text: 16px with 1.75 line-height (long-form reading optimized)
- Content column max-width: 720px (optimal reading measure)

### Color Temperature
**Warm-neutral.** The surface color shifts slightly warmer -- `#FAFAF9` (Stone-50) instead of the cooler `#F8FAFC`. Borders soften to `#E7E5E4` (Stone-300). The effect is subtle but makes the interface feel less sterile and more like a well-lit reading surface. Text primary stays near-black for maximum contrast but uses `#1C1917` (Stone-900) for a fractionally warmer tone.

| Token | Standard | Reading Room |
|---|---|---|
| `surface` | #F8FAFC | #FAFAF9 |
| `border` | #E2E8F0 | #E7E5E4 |
| `text-primary` | #0F172A | #1C1917 |

### Typographic Treatment
**Prose-optimized.** Body text gets premium treatment -- 16px at 1.75 line-height with a constrained measure (max 720px content width). Paragraph spacing is generous. SOAP sections feel like structured paragraphs, not table cells. Headings are slightly larger and more clearly differentiated from body text.

- Body line-height: 1.75 (optimized for sustained reading)
- Content column: 720px max-width for optimal reading measure
- Paragraph spacing: 16px (`space-y-4`)
- SOAP section headers: 14px semibold (not uppercase labels -- feels more like document structure)
- Reduced emphasis on monospace -- clinical values inline with body text using semibold instead

### Layout Philosophy
Document-centric. The center content area is treated as a document viewport. Sidebar and right panel are narrower, receding to support the main content. Tab content scrolls vertically like a page. The handoff report renders as a continuous document, not as discrete cards.

### Best For
General ward deployments. Incoming nurses consuming handoff reports. Environments where narrative understanding matters more than data density. Nurses who spend more time reading than scanning.

### Risk
The lower density uses more vertical space, requiring more scrolling. Dashboard-level scanning is slower because fewer patients fit on screen. The warm-neutral palette may feel less "clinical" to some users, potentially reducing perceived trustworthiness.

---

## Comparison Matrix

| Attribute | A: Clinical Monitor | B: Instrument Panel | C: Reading Room |
|---|---|---|---|
| **Density** | High | Moderate | Low |
| **Color temperature** | Cool (slate-heavy) | Neutral | Warm-neutral |
| **Typography emphasis** | Monospace-forward | Balanced hierarchy | Prose-optimized |
| **Body text size** | 14px | 16px | 16px (1.75 line-height) |
| **Card padding** | 16px | 20px | 24px |
| **Dashboard columns** | 4 at 1440px | 3 at 1440px | 2 at 1440px |
| **Primary strength** | Data density, scanning speed | Versatility, compartmentalization | Reading comprehension, narrative clarity |
| **Primary risk** | Fatigue, misclicks | Visual fragmentation | Scrolling, reduced scanning speed |
| **Best environment** | ICU, high-acuity | Mixed ward | General ward, handoff-heavy |
| **Closest reference** | Bedside vital signs monitor | Aircraft instrument panel | Radiology reading room |

---

## Recommendation

**Direction B (Instrument Panel) as the foundation**, with selective borrowing from A and C:

- From **A (Clinical Monitor):** Use monospace for all timestamps and clinical values. Adopt the higher-contrast `text-muted` value (#64748B) for better readability of metadata.
- From **C (Reading Room):** Use 1.75 line-height for handoff report body text and SOAP note content. Apply 720px max-width to narrative content columns.

This hybrid preserves the versatile module system while improving data readability (from A) and narrative comprehension (from C) where each matters most.
