# Field Type Handling

> Reference for the `airtable-omni-refiner` skill. Loaded on demand from `SKILL.md`.
> Read and write formats per FieldType, computed fields, rendering with HTML + Tailwind.

---

> How to read and write each Airtable field type via the SDK. Use when generating code that accesses cell values.

---

The table below is a reading aid, not an exhaustive schema validator. Use configured Field objects or verified IDs; validate existence/type before these fragments. Write shapes here are SDK shapes, not interchangeable with REST or MCP inputs.

## Reading Cell Values

Use `record.getCellValue(fieldIdOrName)` for typed values, or `record.getCellValueAsString(fieldIdOrName)` for display strings.

### Return types by FieldType

| FieldType | getCellValue return | Notes |
|-----------|-------------------|-------|
| `singleLineText` | `string \| null` | |
| `multilineText` | `string \| null` | May contain newlines |
| `richText` | `string \| null` | Markdown-formatted string |
| `email` | `string \| null` | |
| `url` | `string \| null` | |
| `phoneNumber` | `string \| null` | |
| `number` | `number \| null` | |
| `percent` | `number \| null` | Stored as decimal (0.5 = 50%) |
| `currency` | `number \| null` | Numeric value only; symbol in field options |
| `duration` | `number \| null` | Duration in seconds |
| `rating` | `number \| null` | Integer from 1 to max |
| `checkbox` | `boolean \| null` | `true` if checked, `null` if unchecked (not `false`) |
| `singleSelect` | `{id: string, name: string, color?: string} \| null` | |
| `multipleSelects` | `Array<{id: string, name: string, color?: string}> \| null` | |
| `singleCollaborator` | `{id: string, email: string, name?: string} \| null` | |
| `multipleCollaborators` | `Array<{id: string, email: string, name?: string}> \| null` | |
| `date` | `string \| null` | ISO 8601 date string (e.g., `'2025-03-15'`) |
| `dateTime` | `string \| null` | ISO 8601 datetime (e.g., `'2025-03-15T14:30:00.000Z'`) |
| `multipleRecordLinks` | `Array<{id: string, name: string}> \| null` | Linked record IDs + primary field values |
| `multipleAttachments` | `Array<AttachmentData> \| null` | Inspect the target SDK attachment type |
| `barcode` | `{text: string} \| null` | |
| `autoNumber` | `number \| null` | **Read-only** |
| `formula` | `varies` | **Read-only** — return type depends on formula result |
| `rollup` | `varies` | **Read-only** — return type depends on rollup config |
| `count` | `number \| null` | **Read-only** |
| `multipleLookupValues` | SDK-dependent structured value | **Read-only** — inspect target types; use getCellValueAsString for display |
| `createdTime` | `string \| null` | **Read-only** — ISO datetime |
| `lastModifiedTime` | `string \| null` | **Read-only** — ISO datetime |
| `createdBy` | `{id: string, email: string, name?: string} \| null` | **Read-only** |
| `lastModifiedBy` | `{id: string, email: string, name?: string} \| null` | **Read-only** |
| `button` | — | Not readable — buttons trigger actions |
| `aiText` | SDK-dependent structured value | **Read-only** — inspect the target result type |

---

## Writing Cell Values

Use `table.updateRecordAsync(recordId, fields)` or `table.createRecordAsync(fields)`. The `fields` object maps **field IDs** to values.

### Write formats by FieldType

| FieldType | Write format | Example |
|-----------|-------------|---------|
| `singleLineText` | `string` | `'Hello'` |
| `multilineText` | `string` | `'Line 1\nLine 2'` |
| `richText` | `string` (markdown) | `'**bold** text'` |
| `email` | `string` | `'user@example.com'` |
| `url` | `string` | `'https://example.com'` |
| `phoneNumber` | `string` | `'+1-555-0100'` |
| `number` | `number` | `42` |
| `percent` | `number` (decimal) | `0.75` (= 75%) |
| `currency` | `number` | `99.99` |
| `duration` | `number` (seconds) | `3600` (= 1 hour) |
| `rating` | `number` | `4` |
| `checkbox` | `boolean` | `true` |
| `singleSelect` | `{id: string}` or `{name: string}` | `{name: 'Active'}` |
| `multipleSelects` | `Array<{name: string}>` | `[{name: 'Tag1'}, {name: 'Tag2'}]` |
| `singleCollaborator` | `{id: string}` | `{id: 'usrXXX'}` |
| `multipleCollaborators` | `Array<{id: string}>` | `[{id: 'usrXXX'}]` |
| `date` | `string` (ISO) | `'2025-03-15'` |
| `dateTime` | `string` (ISO) | `'2025-03-15T14:30:00.000Z'` |
| `multipleRecordLinks` | `Array<{id: string}>` | `[{id: 'recXXX'}]` |
| `multipleAttachments` | `Array<{url: string}>` | `[{url: 'https://...'}]` (creates new) |

### Important write rules

1. **Computed fields cannot be written** — formula, rollup, count, lookup, autoNumber, createdTime, createdBy, lastModifiedTime, lastModifiedBy, aiText
2. **Single select**: use an existing choice ID or name. Do not assume record updates create missing choices; treat a missing choice as a schema prerequisite.
3. **Checkbox**: set to `true` to check and `null` to clear. Verify accepted write values against the target SDK.
4. **Clearing a field**: set the value to `null`

### CRITICAL: Array fields overwrite entirely on update

Linked records (`multipleRecordLinks`), attachments (`multipleAttachments`), multi-select (`multipleSelects`), and multi-collaborator (`multipleCollaborators`) fields **replace the entire array** on update — they do NOT append.

```js
// WRONG — loses all existing links!
await table.updateRecordAsync(record, {
    [FIELD_IDS.RELATED_PROJECTS]: [{id: newProjectId}],
});

// CORRECT — spread existing values to append
const existing = (record.getCellValue(FIELD_IDS.RELATED_PROJECTS) ?? []).map(({id}) => ({id}));
await table.updateRecordAsync(record, {
    [FIELD_IDS.RELATED_PROJECTS]: existing.some(item => item.id === newProjectId) ? existing : [...existing, {id: newProjectId}],
});
```

This applies to all four array field types:
- **Linked records**: retain existing IDs as `{id}`, add unique new `{id}` entries
- **Attachments**: retain existing attachments by `{id}` and add new `{url}` entries
- **Multi-select**: spread existing `{name}` objects, add new `{name}` entries
- **Multi-collaborator**: spread existing `{id}` objects, add new `{id}` entries

**Match the operation to the intent.** Add: preserve existing entries and deduplicate. Remove: filter out only the intended entries. Replace: write the intended replacement, without spreading unwanted old values. Convert read objects to supported write shapes, and recheck the latest value before submitting. Read-modify-write is not atomic across users; do not promise that a client-side check eliminates concurrent edits.

---

## Computed (Read-Only) Field Types

These fields cannot be written to. Check `field.isComputed` at runtime, or reference this list:

- `formula`
- `rollup`
- `count`
- `multipleLookupValues`
- `autoNumber`
- `createdTime`
- `createdBy`
- `lastModifiedTime`
- `lastModifiedBy`
- `aiText`
- `externalSyncSource`

When generating edit forms, **exclude computed fields** from the editable field list.

---

## Rendering Field Values with HTML + Tailwind

These are illustrative fragments, not a standalone component. Resolve fields first and keep hooks unconditional in a configured child component. Use existing date-fns only if the project includes it; date-only strings must retain their calendar date, while date/time values use the agreed timezone.

Since Interface Extensions use HTML + Tailwind (not SDK UI components), render field values with styled HTML elements:

```js
// Single select — colored badge using the color from the field value
const status = record.getCellValue(FIELD_IDS.STATUS);
{status && (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        {status.name}
    </span>
)}
// Tip: select option objects include a `color` property (e.g., 'blueBright', 'greenDark1').
// To map these to Tailwind classes dynamically, see the Airtable color mapping
// pattern in `sdk-patterns.md` §6.

// Date — formatted display
//
// A `date` field returns a date-only string ('2025-03-15'). new Date() parses
// that as UTC midnight, so formatting it in local time renders a day early for
// every user west of UTC -- all US timezones. parseISO treats it as local.
import {format, parseISO} from 'date-fns';

const dateStr = record.getCellValue(FIELD_IDS.DUE_DATE);
<span className="text-sm text-gray-600 dark:text-gray-400">
    {dateStr ? format(parseISO(dateStr), 'MMM d, yyyy') : '—'}
</span>

// Linked records — clickable pills (matches Airtable's native UX)
//
// getCellValue on a linked-record field returns plain {id, name} objects, and
// expandRecord needs a live Record model (`sdk-patterns.md` §7). Resolve through a
// useRecords lookup on the linked table before expanding — passing the raw
// cell value does not work.
import {expandRecord} from '@airtable/blocks/interface/ui';

const clientRecords = useRecords(clientsTable); // Fields/filters configured in Data panel
const clientById = useMemo(
    () => new Map(clientRecords.map(r => [r.id, r])),
    [clientRecords]
);

const clientLinks = record.getCellValue(FIELD_IDS.CLIENTS);
{clientLinks?.map(link => (
    <button
        key={link.id}
        onClick={() => {
            const live = clientById.get(link.id);
            if (live && clientsTable.hasPermissionToExpandRecords()) expandRecord(live);
        }}
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
    >
        {link.name}
    </button>
)) ?? <span>—</span>}

// Linked records — simple comma-separated (when pills aren't needed, and no
// useRecords lookup is required because nothing is clickable)
const clientNames = record.getCellValue(FIELD_IDS.CLIENTS);
<span>{clientNames?.map(l => l.name).join(', ') ?? '—'}</span>

// Checkbox — icon indicator
const isDone = record.getCellValue(FIELD_IDS.DONE);
<span>{isDone ? '✓' : '—'}</span>
```

---
