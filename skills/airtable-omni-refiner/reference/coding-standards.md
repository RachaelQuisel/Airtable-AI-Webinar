# Coding standards and verification

Match the generated project's actual structure and supported dependencies. Extract components/hooks when it clarifies a real responsibility, not at an arbitrary line count. Avoid adding a UI framework to achieve a minor interaction. Keep a recoverable copy before changing source.

## Focused checks

- Correct Interface SDK import surface and package version; no copied Base-only hook options.
- Configured fields belong to the selected table, have the expected type, and are exposed in Data. Fixed IDs come from evidence.
- Stable hook order, parent configuration guard, loading/Suspense and useful empty/error states.
- Safe cell-value display, supported write formats, no computed-field writes; array operations match add/remove/replace intent.
- Actual payload checked for permissions, pending submission blocked, failures visible and recoverable.
- Confirmed progress derives from saved data; repeat clicks, reopening, and stale/competing changes have defined behavior.
- Optimistic overrides, when used, roll back on failure and retire after data acknowledgement; no indefinite stale masks.
- Keyboard alternative to dragging; visible focus, labels, status announcements, text with color, reduced motion.
- Supported light/dark themes and narrow desktop layouts checked when changed. Do not equate responsive CSS with Airtable mobile availability.
- Library/build commands and source return route match the real project. No frontend secrets.

## Verify in layers

1. Run the project's applicable parser/build/type checks for changed code. A source-only patch may have no runnable project: state that limitation.
2. Exercise changed logic with useful fixtures: duplicate submission, no permission, rejected save, missing field, and stale data as relevant. Do not claim a mocked SDK proves Airtable integration.
3. After source returns to Airtable, test the intended interaction and record values; refresh and observe them again. Test a representative read-only role if access is available. Record Pass/Fail/Not tested and evidence.

A local check is evidence for local code only. If the presenter performs runtime checks, capture their reported observations as presenter-reported evidence; do not claim you executed them. Retest affected behavior after fixes. The optional Experience Lab skill can organize the comparison.
