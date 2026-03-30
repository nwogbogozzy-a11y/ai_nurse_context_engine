# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Files:**
- Components: PascalCase single-word or compound names — `PatientCard.tsx`, `FlagBadge.tsx`, `DictationInput.tsx`, `StructuredNote.tsx`, `ProcedureSearch.tsx`
- Library/utility files: kebab-case — `demo-scripts.ts`, `format-time.ts`, `supabase.ts`
- Type definitions: kebab-case — `types.ts`
- Pages: Next.js App Router convention — `page.tsx` inside route directories (`src/app/page.tsx`, `src/app/patient/[id]/page.tsx`)
- Config files: standard naming — `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`

**Components:**
- Use PascalCase for component names: `DictationInput`, `FlagBadge`, `HandoffReport`
- Named exports only (no default exports for components): `export function PatientCard(...)` in `src/components/PatientCard.tsx`
- Page components use default exports: `export default function Dashboard()` in `src/app/page.tsx`

**Functions:**
- camelCase for all functions: `fetchData`, `startDictation`, `submitDictation`, `toggleItem`, `markAllReady`, `handleAction`
- Event handlers prefixed with `handle` or action verbs: `handleDictationResult`, `handleSubmit`, `handleAction`
- Helper functions use descriptive camelCase: `getAge`, `formatTimestamp`, `formatNoteTimestamp`, `formatNoteLabel`

**Variables:**
- camelCase for all variables: `patientId`, `activeTab`, `generatingHandoff`, `handoffError`
- State variables use descriptive names: `highlightedNoteId`, `selectedScript`, `handoffExtras`
- Boolean state uses `is`/`has` prefix or descriptive adjective: `allReady`, `allConfirmed`, `hasCriticalFlag`, `hasWarningFlag`

**Types/Interfaces:**
- PascalCase for all types and interfaces: `Patient`, `Note`, `SupplyItem`, `WebhookResponse`
- Use `interface` for object shapes (not `type`): all domain types in `src/lib/types.ts` use `interface`
- Use `type` only for union types and aliases: `type Tab = 'notes' | 'supplies' | 'handoff'`, `type DictationState = 'idle' | 'animating' | 'processing' | 'complete' | 'error'`
- Props interfaces named `{ComponentName}Props`: `DictationInputProps`, `FlagBadgeProps`, `PatientCardProps`, `HandoffReportProps`

**CSS/Design Tokens:**
- Semantic token names in globals.css: `--color-background`, `--color-surface`, `--color-primary`, `--color-accent`, `--color-flag-warning`
- Tailwind classes reference semantic tokens: `text-primary`, `bg-surface`, `border-border`, `text-flag-critical`
- Never use raw hex values in components — all colors go through the design token layer in `src/app/globals.css`

## Code Style

**Formatting:**
- No explicit Prettier config — relies on default formatting
- 2-space indentation in TypeScript/TSX files
- Single quotes for string literals in TypeScript
- Double quotes in JSX attributes (standard JSX convention)
- No semicolons (semicolon-free style throughout the codebase)
- Trailing commas in multi-line constructs

**Linting:**
- ESLint 9 with flat config: `src/eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Run with: `npm run lint` (which runs `eslint`)

**Import Organization:**
1. React/framework imports: `import { useState, useRef, useCallback } from 'react'`
2. Next.js imports: `import { useParams } from 'next/navigation'`, `import Link from 'next/link'`
3. Library imports: `import { supabase } from '@/lib/supabase'`
4. Type imports: `import { Patient, Note } from '@/lib/types'` (mixed with value imports from same module)
5. Component imports: `import { FlagBadge } from '@/components/FlagBadge'`

**Path Aliases:**
- `@/*` maps to `src/*` (configured in `src/tsconfig.json`)
- Use `@/lib/...` for library code: `@/lib/supabase`, `@/lib/types`, `@/lib/demo-scripts`
- Use `@/components/...` for components: `@/components/PatientCard`, `@/components/FlagBadge`
- Relative imports (`./FlagBadge`) used only when importing sibling components within the same directory

## Component Patterns

**Structure:**
- All components are functional (no class components)
- Client components marked with `'use client'` directive at the top of every component file and every page file
- The only server component is `src/app/layout.tsx` (the root layout)

**Props Pattern:**
- Props defined as an `interface` immediately above the component:
```typescript
interface DictationInputProps {
  patientId: string
  patientName: string
  shift: string
  onResult: (result: WebhookResponse) => void
}

export function DictationInput({ patientId, patientName, shift, onResult }: DictationInputProps) {
```
- Props destructured in the function signature, never accessed via `props.xxx`

**State Management:**
- Local state only via `useState` — no global state management library
- State union types for multi-step flows: `type DictationState = 'idle' | 'animating' | 'processing' | 'complete' | 'error'`
- Derived state computed inline or via `useMemo`:
```typescript
const allConfirmed = items.every((_, i) => confirmed[i])
```

**Data Fetching:**
- Direct Supabase client queries in `useEffect` or `useCallback` within components
- `Promise.all` for parallel fetches in `src/app/patient/[id]/page.tsx`
- No dedicated data fetching hooks or abstraction layer
- Webhook calls via native `fetch` — no axios or other HTTP client

**Effects:**
- `useEffect` for initial data loading with empty dependency array or `useCallback` reference
- `useCallback` for functions referenced in dependency arrays: `fetchData` in patient detail page

**Conditional Rendering:**
- Ternary for simple conditions: `{loading ? <Skeleton /> : <Content />}`
- `&&` for optional rendering: `{note.flagged && <FlagAlert />}`
- Early returns for loading/error/not-found states in page components

## TypeScript Usage

**Strictness:**
- `strict: true` in `src/tsconfig.json`
- Target: ES2017
- Module resolution: bundler

**Type Patterns:**
- Non-null assertion for env vars: `process.env.NEXT_PUBLIC_SUPABASE_URL!`
- Type casting for route params: `const patientId = params.id as string`
- Inline type annotations for state: `useState<Patient | null>(null)`, `useState<Record<string, Note | null>>({})`
- Union string literal types for enums: `type Tab = 'notes' | 'supplies' | 'handoff'`
- `Record<string, T>` for key-value maps: `Record<string, string>`, `Record<number, boolean>`

**Interface vs Type:**
- `interface` for all object shapes (domain models, props, API responses)
- `type` for union types and aliases only
- All shared types centralized in `src/lib/types.ts`

## Error Handling

**Patterns:**
- try/catch around all `fetch` calls
- Error state stored in component state: `const [error, setError] = useState<string | null>(null)`
- `instanceof Error` check for error message extraction:
```typescript
catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to process dictation')
}
```
- Error UI rendered inline with red/critical styling using `bg-flag-critical-bg` and `text-flag-critical`
- No global error boundary
- No error logging service — errors surface in UI only
- Supabase query errors silently ignored (no `.catch` or error handling on Supabase reads)

## Logging

**Framework:** `console.log` only

**Patterns:**
- Minimal logging — only one `console.log` in the codebase (`src/components/NurseActionBar.tsx` line 156)
- No structured logging, no log levels

## Comments & Documentation

**When to Comment:**
- JSDoc used sparingly — only on utility functions in `src/lib/format-time.ts`:
```typescript
/**
 * Format a timestamp for note display.
 * <1min -> "Just now", <60min -> "X min ago", <24h -> "Xh ago (HH:MM)", older -> "DD Mon, HH:MM"
 */
```
- Inline comments for non-obvious logic: `// Correlate notes to supply_requests by timestamp proximity (within 120s)`
- Section comments in JSX for layout regions: `{/* Back nav */}`, `{/* Left sidebar -- Patient Info */}`, `{/* Center -- Tabbed content */}`
- No JSDoc on components or props interfaces

**JSDoc/TSDoc:**
- Not used on components, interfaces, or most functions
- Use JSDoc only when the function behavior is non-obvious (format functions, utility helpers)

## Styling Patterns

**Approach:**
- Tailwind CSS v4 with semantic design tokens defined in `src/app/globals.css` using `@theme inline`
- All styling via Tailwind utility classes — no CSS modules, no styled-components
- Conditional classes via template literals:
```typescript
className={`px-4 py-2.5 text-sm font-medium ${
  activeTab === tab.key
    ? 'border-accent text-accent'
    : 'border-transparent text-secondary hover:text-primary'
}`}
```
- No `clsx` or `cn` utility — raw template literal string concatenation

**Common Tailwind Patterns:**
- Card containers: `bg-surface border border-border rounded-lg p-5`
- Section headers: `text-xs font-medium uppercase tracking-wide text-secondary`
- Primary buttons: `bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent`
- Transitions: `transition-colors duration-150`
- Focus states: `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`

**Accessibility:**
- ARIA attributes on interactive elements: `role="tab"`, `aria-selected`, `aria-controls`, `role="status"`, `role="alert"`, `role="checkbox"`, `aria-checked`, `aria-label`, `aria-busy`
- `sr-only` class for screen-reader-only content
- `aria-hidden="true"` on decorative SVG icons
- `<html lang="en">` set in layout
- Semantic HTML elements: `<article>`, `<aside>`, `<header>`, `<main>`, `<nav>` (via Link), `<dl>/<dt>/<dd>`, `<table>`, `<time>`, `<ol>/<ul>`

---

*Convention analysis: 2026-03-26*
