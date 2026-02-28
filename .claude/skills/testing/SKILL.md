# Skill: testing

## What This Skill Does
Runs the full test matrix against the integrated system. Surfaces failures to the debugging agent. Does not fix failures itself.

## Test Matrix
8 tests across 3 scenarios. All must pass before design-review begins.

| # | Scenario | Test | Expected |
|---|---|---|---|
| 1 | Margaret | Note structured | SOAP format, no flag, flagged: false |
| 2 | Margaret | Supply list | Dressing change items rendered |
| 3 | Devon | Note structured | SOAP format, flagged: true, reason present |
| 4 | Devon | Flag displayed | Amber badge, flag reason visible |
| 5 | Devon | Supply list | Chest drain items rendered |
| 6 | Aisha | Input 1 stable | No flag, stable status |
| 7 | Aisha | Input 2 flagged | Critical flag, vitals values in reason |
| 8 | Aisha | Handoff report | Priority flags include vitals change |

## Output Format
test-report.md with summary table + detailed results per test.

## Hard Rule
Do not fix failures. Surface them to the debugging agent with exact error output.
