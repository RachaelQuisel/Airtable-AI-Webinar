# SDK patterns

## Compatibility evidence

Checked against npm `@airtable/blocks@0.0.0-experimental-8575f0e0d-20260428` on 2026-09-27 (the `interface-alpha` tag at inspection). Inspect the actual project's lockfile and declarations before changing dependencies or applying these patterns to another version.

| Pattern | Evidence in package `dist/types/src/` |
| --- | --- |
| `useRecords(table)` takes one argument | `interface/ui/use_records.d.ts` |
| `useCustomProperties(callback)` returns `customPropertyValueByKey`, `errorState`; callback identity must be stable | `interface/ui/use_custom_properties.d.ts` |
| `hasPermissionToUpdateRecords([{id, fields}])` and singular `hasPermissionToUpdateRecord(record, fields)` both exist | inherited `shared/models/table_core.d.ts` |
| `updateRecordAsync(recordOrId, fields)`; batches up to 50 | `shared/models/table_core.d.ts` |
| `hasPermissionToExpandRecords()` before `expandRecord(liveRecord)` | `interface/models/table.d.ts`, `interface/ui/expand_record.d.ts` |
| `useColorScheme()` returns `{colorScheme}` | `shared/ui/use_color_scheme.d.ts` |
| `useGlobalConfig` exported; `useViewport` not exported on this surface | `interface/ui/ui.d.ts` |

The [official Interface Extensions guide](https://github.com/Airtable/interface-extensions-hello-world/blob/main/.cursor/rules/interface-extensions.mdc) and the target declarations are the sources for API choices. Generic Base Extensions examples may not match this surface.

## Data and configuration

```js
import {useRecords} from '@airtable/blocks/interface/ui';
const records = useRecords(table); // table is non-null; no fields/options argument
```

Expose only needed tables/fields and apply supported filters in the element's Data panel. Render pagination reduces DOM work, not necessarily data loading. Memoize expensive derived data when justified; do not assume a memoized row with a mutable Record object always notices cell changes. Pass derived primitive values or verify its update behavior.

Use custom properties for designer-configurable mappings. Define their callback at module scope or with a stable `useCallback`. A field property requires a valid table; do not bind fields blindly to `base.tables[0]` while allowing an unrelated table selection. Build the callback around the selected table as supported by the target SDK, then validate returned field IDs/types against that table. Handle `errorState` and no tables. Verified fixed table/field IDs are acceptable for an intentionally base-specific element. Do not guess IDs or silently fall back to an unrelated table.

Resolve fields with `getFieldIfExists` and handle missing or unexposed fields. Guard the parent, then mount a child that calls `useRecords(table)` unconditionally. Use `FieldType` from `@airtable/blocks/interface/models` for type comparisons. Native semantic HTML is sufficient for buttons and layout; do not import Base-only `Box`/`Button` components.

## Mutation pattern

```js
const updates = [{id: record.id, fields: {[statusField.id]: {name: doneChoice.name}}}];
if (!table.hasPermissionToUpdateRecords(updates)) {
    throw new Error('You cannot make this change.');
}
await table.updateRecordsAsync(updates);
```

The UI's generic permission check is not a substitute for validating the actual payload before writing. Catch save failures and show recovery. Chunk batches to at most 50; observe the target SDK's mutation limit (the official guide documents 15 calls/second), avoiding an unthrottled bulk loop. Do not treat a multi-record batch as a verified transaction; re-read affected records after partial or uncertain outcomes. These SDK limits are not REST/MCP batch limits.

Serialize conflicting actions, disable repeat submission while pending, and recheck current records. A browser-side lock does not guarantee cross-user concurrency control. For ordinary status changes, deriving progress from record state avoids duplicate increments. A rewards ledger requires a supported idempotency/reconciliation design; do not promise exactly-once awards from a client-only check.

## State, feedback, and recovery

Use local state for selection, filters, and drafts; Airtable records for durable work state. Use a pending indicator while awaiting persistence. Optimistic feedback is optional: keep pending changes distinguishable, roll back failures, and clear overrides when live data acknowledges them. Define reconciliation for deleted records, changed assignments, and acknowledgement timeouts. A success toast is not independent persistence verification; reload/check records for acceptance tests.

`useGlobalConfig` can store extension settings in this checked version. Prefer custom properties for designer settings and records for business data. Neither custom properties nor frontend code can securely hold third-party credentials.

## Personalization and display

`useSession().currentUser` supports personalization. Match single collaborators by `value?.id`, multiple collaborators by `value?.some(...)`. When the current user cannot be resolved, show a helpful state rather than defaulting a private view to all records. Client-side filters are not access controls.

For record detail, resolve the actual SDK Record (not a `{id,name}` link value), check `table.hasPermissionToExpandRecords()`, then call `expandRecord(record)`. For appearance use `const {colorScheme} = useColorScheme()` or the project's verified theme tokens. Preserve legibility in supported themes; do not require a specific CSS framework.

Use CSS/container sizing or a supported browser observer for responsive layout; this target does not export `useViewport`. Optional diagnostics should show configuration and counts, not secrets or unnecessary client data.
