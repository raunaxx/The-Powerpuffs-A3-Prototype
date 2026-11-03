# STEMMate Namibia — A4 Test Suite

Author: NNS · Assessment: A4 (SDN621S) · Record: A4-TER-01

## Setup

    npm install
    npx playwright install chromium

## Run

    npm test                    # full suite, headless Chromium
    npm run test:headed         # watch it drive the browser
    npm run test:ui             # interactive locator debugging
    npm run test:report         # open the last HTML report

Environment overrides (optional; synthetic defaults are built in):

    BASE_URL, COORD_USER, COORD_PASS, FACIL_USER, FACIL_PASS

## Traceability

| Test | Requirement | File |
|---|---|---|
| T01 | FR-AUTH-01 Coordinator adds Facilitator | auth.spec.ts |
| T02 | FR-AUTH-02 Facilitator denied admin action | auth.spec.ts |
| T03 | FR-AUTH-03 Unauthenticated access blocked | auth.spec.ts |
| T04 | FR-TASK-01 Facilitator creates/persists task | tasks.spec.ts |
| T05 | FR-TASK-02 Task form validation | tasks.spec.ts |
| T06 | FR-OFF-01 Offline queue and sync | offline.spec.ts |
| T09 | NFR-A11Y-03 Automated axe scan | a11y.spec.ts |
| T10 | NFR-REC-01 Recovery from failed request | recovery.spec.ts |
| T11 | NFR-REC-02 Corrupted local state recovery | recovery.spec.ts |
| T12 | NFR-PRIV-01 No client-side credential leakage | privacy.spec.ts |

T07 (keyboard-only) and T08 (contrast) are manual procedures recorded in
the Test Execution Record, not automated here.

## Known adjustments on first run

The deployed prototype's DOM was not available when these locators were
written. Locators use accessible roles and labels first, with fallbacks.
If a locator fails, fix it rather than weakening the assertion, and record
the change in the commit message (e.g. "T04: correct Save button label").

Anticipated fixes:
- Login field labels (`getByLabel`) may need `getByPlaceholder` only.
- The "Create Learning Task" entry may be a button, not a link — both are handled.
- The write endpoint pattern in T10 (`/\/api\/.*task/i`) may need the real path.
- T06 requires a real offline write queue; if none exists, that is the finding.

## Honest results

The suite is expected to FAIL on `T09b` and on parts of `T07`/`T12` because
defects D-01 to D-06 are open at submission. These failures are the evidence
for the evidence-led redesign, and must not be suppressed, skipped or
reclassified as passes.