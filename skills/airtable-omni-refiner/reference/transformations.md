# Common transformations

Apply the patterns relevant to the requested change. These extend the original Noam Say/Airmakers T1–T10 catalogue; they describe design choices, not limitations that every Omni output has. For SDK calls use [SDK patterns](sdk-patterns.md); for acceptance use [coding standards](coding-standards.md).

## T1 — Grid to circular layout

For N seats around a table, angle = `i * 2 * Math.PI / N - Math.PI / 2`; percentage coordinates = `50 + radiusPct * Math.cos(angle)` and `50 + radiusPct * Math.sin(angle)`. Center with `translate(-50%, -50%)`. Size the container so labels remain readable. Keep an ordinary list/assignment control available for keyboard users. The [seating example](../examples/wedding-seating-after.jsx) demonstrates the layout.

## T2 — Selection to drag-and-drop

Use drag/drop only when it improves the work. Include an equivalent select-and-apply control. Carry the record ID, then resolve its current position from records at drop time; validate the payload instead of trusting transferred JSON. Define empty-target moves and occupied-target swaps, including an unassigned source. Validate both affected records and permissions. Show pending feedback and visible errors; prevent overlapping local submissions. Do not claim a two-record write prevents all cross-user races.

## T3 — Pending saves or optimistic feedback

An awaited write does not block React rendering. Start with a clear pending state if it meets the interaction need. For optimistic feedback, retain a small override keyed by record ID rather than copying the entire table. Roll back on error. Retire the override when the live record equals the intended value, not merely when the promise resolves. Otherwise old values can flash, or later collaborator edits can be masked. Also handle deletion and bounded acknowledgement timeouts with a refresh/recovery state. Only confirmed data earns completion credit.

## T4 — Individual writes to batches

Construct payloads before mutation and check `hasPermissionToUpdateRecords(updates)`. Send at most 50 records per SDK batch, paced within the verified target limit; preserve partial/uncertain results for reconciliation. A batch is not proof of transactional behavior. A swap should preserve the displaced record's prior destination, including null/unassigned values, and report unresolved conflicts.

## T5 — Hardcoded select labels to configured options

After validating a single/multiple-select Field, read `field.options.choices`. Use option IDs as identities; map labels for display. Treat missing required choices as configuration gaps rather than silently adding schema. `colorUtils.getHexForColor` can map Airtable color tokens when supported by the target package; provide text labels and contrast.

## T6 — Indicators that explain action

Use badges for a meaningful condition (blocked, due, missing information). Include text; color or an animation alone is insufficient. An optional celebration follows confirmed persistence, respects reduced motion, and is not evidence the record saved. Avoid turning pending work into a success state.

## T7 — Current-user personalization

Use `useSession` and `useRecords(table)` in a configured child component. Compare collaborator IDs for the actual field type. An unresolved user produces an explicit state; it must not silently broaden a private view. UI filtering is not a security boundary. Progress uses a defined eligible set that includes completed records, so filters do not accidentally change the denominator.

## T8 — Missing/loading/error states

Resolve tables/fields in a parent and render the data child only after they are valid. Hooks remain unconditional in each component. Provide loading, no matching records, missing configuration, no-permission, and failed-save states as applicable. Do not invent a read-permission method or use `!table.someMethod?.()` to infer denial: an absent method yields undefined, not evidence of a permission decision.

## T9 — Fixed dimensions to responsive controls

Use existing CSS breakpoints/container sizing and preserve keyboard focus as layouts change. Test zoom and the narrowest supported desktop width. The checked Interface SDK does not export `useViewport`; use supported browser measurements if necessary. Check current Airtable product support before promising mobile availability.

## T10 — Fixed mappings to custom properties

Use `useCustomProperties` with a stable callback (module scope or useCallback) and handle `errorState`. Bind field selectors to the actual chosen table and validate returned mappings. Prefer custom properties for portable interfaces; verified fixed IDs can remain for a deliberately base-specific design. Do not expose internal implementation options or credentials as user settings.

For combined requests, preserve the working behavior, apply the smallest sequence of changes, and retest affected behavior. Keep the source return route explicit: local refactoring is not a saved or published Airtable element.
