# SDK Patterns

> Reference for the `airtable-omni-refiner` skill. Loaded on demand from `SKILL.md`.
> Performance, custom properties, resiliency, state, current user, select colors, SDK utilities, debug panel.

---

> Opinionated patterns for performance, custom properties, and resiliency in Airtable Interface Extensions. Battle-tested across 50+ production extensions.

---

## 1. Performance Rules

1. **Always use `fields` option** on `useRecords` — only load what you display
2. **Use minimal field sets for lists** — load only the fields needed for list display (e.g., name + status), then load full fields when a record is selected for detail view
3. **Find selected records from the result set** — `useRecords` returns all records; use `.find(r => r.id === selectedId)` to get the selected one rather than making a separate query
4. **Split components** — move hooks into child components so they only load when rendered
5. **Avoid loading all tables** — only `getTableByIdIfExists` for tables the extension uses
6. **No pagination in SDK** — field limiting is the primary performance lever
7. **Batch mutations** — use `createRecordsAsync` / `updateRecordsAsync` instead of looping single operations. **Max 50 records per batch call, max 15 calls per second.**
8. **Memoize computed values** — use `useMemo` for filtering, sorting, or aggregating records client-side
9. **Use `React.memo` on list item components** — `useRecords` returns a fresh array on every change, so memoize row/card components to prevent unnecessary re-renders
10. **Pre-build Maps for linked record lookups** — when resolving linked records from a second table, build a `Map` by ID for O(1) lookups instead of `.find()` per record

```js
// Memoized list item — only re-renders when its own record changes
const RecordRow = React.memo(({record, onSelect}) => {
    return <div onClick={() => onSelect(record.id)}>{record.name}</div>;
});

// O(1) linked record resolution
const linkedRecordMap = useMemo(() => {
    const map = new Map();
    linkedRecords.forEach(r => map.set(r.id, r));
    return map;
}, [linkedRecords]);

// Usage: linkedRecordMap.get(linkId) instead of linkedRecords.find(r => r.id === linkId)
```

### Chunking large batches

When operating on more than 50 records, chunk them:

```js
const BATCH_SIZE = 50;
async function batchUpdate(table, updates) {
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const chunk = updates.slice(i, i + BATCH_SIZE);
        await table.updateRecordsAsync(chunk);
    }
}
```

---

## 2. Custom Properties Strategy

Custom properties let interface designers configure the extension without code changes. Use them strategically:

### When to use custom properties
- **Table selection** — let the designer pick which table the extension reads from
- **Field mapping** — let the designer map fields to the extension's slots (e.g., "which field is the status field?")
- **View selection** — let the designer pick which view to filter by

### When NOT to use custom properties
- **Core logic fields** — if the extension fundamentally requires a specific field type (e.g., a Kanban board needs a single-select field for columns), use a custom property with validation
- **Internal constants** — don't expose batch sizes, debounce intervals, or implementation details

### CRITICAL: Define getCustomProperties at module level

The function that returns custom property definitions **must be defined outside the component** (at module level). Defining it inline inside the component causes infinite re-renders because React sees a new function reference on every render, which triggers `useCustomProperties` to re-evaluate, which triggers a re-render, and so on.

```js
// CORRECT — defined at module level, stable reference
function getCustomProperties(base) {
    return [
        {key: 'sourceTable', label: 'Data Table', type: 'table'},
        {key: 'statusField', label: 'Status Field', type: 'field', table: base.tables[0]},
    ];
}

function MyExtension() {
    const {customPropertyValueByKey} = useCustomProperties(getCustomProperties);
    // ...
}

// WRONG — defined inline, causes infinite re-renders
function MyExtension() {
    const {customPropertyValueByKey} = useCustomProperties((base) => [
        {key: 'sourceTable', label: 'Data Table', type: 'table'},
    ]);
}
```

### Defaults pattern

Always provide sensible defaults so the extension works out of the box:

```js
const {customPropertyValueByKey} = useCustomProperties(getCustomProperties);
const tableId = customPropertyValueByKey.sourceTable?.id || TABLE_IDS.DEFAULT;
```

---

## 3. Resiliency Patterns

### Use getFieldIfExists() only

Interface Extensions only provide `getFieldIfExists()` — never `getFieldById` or `getFieldByName`. Always handle the null case:

```js
const field = table.getFieldIfExists(FIELD_IDS.STATUS);
if (!field) {
    return <div className="text-gray-500 dark:text-gray-400">Status field not found</div>;
}
```

### Permission checks before every write

```js
// Check before rendering write controls
if (!table.hasPermissionToUpdateRecords()) {
    // Show read-only view
}

// Check before individual operations
if (table.hasPermissionToUpdateRecord(record, {[fieldId]: value})) {
    await table.updateRecordAsync(record, {[fieldId]: value});
}
```

### Null handling for cell values

Every `getCellValue()` can return `null`. Handle with defaults:

```js
const name = record.getCellValue(FIELD_IDS.NAME) ?? '(untitled)';
const amount = record.getCellValue(FIELD_IDS.AMOUNT) ?? 0;
const status = record.getCellValue(FIELD_IDS.STATUS);
const statusName = status?.name ?? 'Unknown';
```

### Schema change resilience

- Reference fields by ID, not name — survives renames
- Read select options dynamically from field config — survives new choices
- Use `getFieldIfExists()` — survives deletions gracefully
- Use custom properties — lets designers reconfigure without code changes

---

## 4. State Management

### Local UI state (useState)

Use for ephemeral UI state: selected record, active tab, filter values, edit mode toggles.

```js
const [selectedRecordId, setSelectedRecordId] = useState(null);
const [activeTab, setActiveTab] = useState('overview');
const [filterValue, setFilterValue] = useState('');
```

### Shared state (useContext)

Use `useContext` when multiple components need the same state (e.g., selected record ID shared between a list and detail panel). Do not use Redux, Zustand, or other state management libraries.

### GlobalConfig (persistent settings)

Use for extension-level settings that persist across sessions (e.g., default view, saved filters). Max 150kB, 1,000 keys.

```js
import {useGlobalConfig} from '@airtable/blocks/interface/ui';

const globalConfig = useGlobalConfig();
const defaultView = globalConfig.get('defaultView');
```

---

## 5. Current User & User-Scoped Filtering

### useSession — Get the current user

`useSession` returns the current user's identity. Use it to personalize the extension or filter records to only show what's relevant to the logged-in user.

```js
import {useSession} from '@airtable/blocks/interface/ui';

function App() {
    const session = useSession();
    const currentUser = session.currentUser;
    // currentUser: {id: 'usrXXXXXX', email: 'jane@example.com', name: 'Jane Smith'}
}
```

### Filtering records by the current user

This is the most common use of `useSession` — showing only records assigned to, created by, or otherwise associated with the logged-in user. Compare the current user's ID against collaborator field values on each record.

> **SDK check:** this `{fields: [...]}` form is **Base Extension** API (`@airtable/blocks/ui`). In Interface Extensions the signature is `useRecords(table)` with no opts — scope via the element's Data panel instead.

```js
import {useSession, useBase, useRecords} from '@airtable/blocks/interface/ui';

function MyAssignedTasks() {
    const session = useSession();
    const currentUser = session.currentUser;
    const base = useBase();
    const table = base.getTableByIdIfExists(TABLE_IDS.TASKS);

    const allRecords = useRecords(table, {
        fields: [FIELD_IDS.TASKS.TITLE, FIELD_IDS.TASKS.ASSIGNEE, FIELD_IDS.TASKS.STATUS],
    });

    // Filter to only records assigned to the current user
    const myRecords = useMemo(() => {
        if (!currentUser) return [];
        return allRecords.filter(record => {
            const assignee = record.getCellValue(FIELD_IDS.TASKS.ASSIGNEE);
            // Single collaborator field — compare .id directly
            return assignee?.id === currentUser.id;
        });
    }, [allRecords, currentUser]);

    return (/* render myRecords */);
}
```

### Field type determines comparison logic

| Collaborator field type | How to match current user |
|------------------------|--------------------------|
| `singleCollaborator` | `cellValue?.id === currentUser.id` |
| `multipleCollaborators` | `cellValue?.some(c => c.id === currentUser.id)` |
| `createdBy` | `cellValue?.id === currentUser.id` (read-only) |
| `lastModifiedBy` | `cellValue?.id === currentUser.id` (read-only) |

### Common patterns

**"My items" toggle** — let users switch between "My Items" and "All Items":

```js
const [showMineOnly, setShowMineOnly] = useState(true);

const visibleRecords = useMemo(() => {
    if (!showMineOnly || !currentUser) return allRecords;
    return allRecords.filter(record => {
        const assignee = record.getCellValue(FIELD_IDS.ASSIGNEE);
        return assignee?.id === currentUser.id;
    });
}, [allRecords, showMineOnly, currentUser]);
```

**Permission-aware editing** — show edit controls only for the user's own records:

```js
const isMyRecord = record.getCellValue(FIELD_IDS.OWNER)?.id === currentUser?.id;
// Combine with table-level permission check
const canEdit = isMyRecord && table.hasPermissionToUpdateRecord(record);
```

**Pre-fill current user on record creation** — when creating a new record, auto-assign to the logged-in user:

```js
await table.createRecordAsync({
    [FIELD_IDS.TITLE]: 'New Task',
    [FIELD_IDS.ASSIGNEE]: {id: currentUser.id},
});
```

---

## 6. Airtable Select Option Colors

Select and multi-select field options include a `color` property (e.g., `'blueBright'`, `'greenDark1'`, `'pinkLight2'`). To render colored badges that match Airtable's native appearance, map these color tokens to Tailwind classes.

### Color token → Tailwind class mapping

Airtable color tokens follow the pattern `{family}{variant}` where family is one of: blue, cyan, teal, green, yellow, orange, red, pink, purple, gray. Build a lookup object:

```js
// utils.js or inline in the component that needs it
const AIRTABLE_COLOR_STYLES = {
    blueBright:  {bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200'},
    cyanBright:  {bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-800 dark:text-cyan-200'},
    tealBright:  {bg: 'bg-teal-100 dark:bg-teal-900', text: 'text-teal-800 dark:text-teal-200'},
    greenBright: {bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200'},
    yellowBright:{bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200'},
    orangeBright:{bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200'},
    redBright:   {bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200'},
    pinkBright:  {bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-800 dark:text-pink-200'},
    purpleBright:{bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200'},
    grayBright:  {bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200'},
    // Add dark1, light1, light2 variants as needed — same families, adjusted shades
};

const DEFAULT_STYLE = {bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200'};

function getColorStyle(airtableColor) {
    if (!airtableColor) return DEFAULT_STYLE;
    // Try exact match first, then match by family prefix
    if (AIRTABLE_COLOR_STYLES[airtableColor]) return AIRTABLE_COLOR_STYLES[airtableColor];
    const family = airtableColor.replace(/(Bright|Dark1|Light[123])$/, 'Bright');
    return AIRTABLE_COLOR_STYLES[family] || DEFAULT_STYLE;
}
```

### Usage in a status badge

```js
const status = record.getCellValue(FIELD_IDS.STATUS);
if (status) {
    const style = getColorStyle(status.color);
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
            {status.name}
        </span>
    );
}
```

### Reading select options dynamically from field config

For filters, legends, or anywhere you need all available options (not just the ones on current records):

```js
const field = table.getFieldIfExists(FIELD_IDS.STATUS);
const options = field?.options?.choices || [];
// Each choice: {id, name, color}
```

This survives new choices being added — no hardcoded lists.

---

## 7. Useful SDK Utilities

### expandRecord — Open record detail popup

`expandRecord()` opens Airtable's native record detail popup. Use it for linked record pills and "view details" actions:

```js
import {expandRecord} from '@airtable/blocks/interface/ui';

// In a linked record pill or detail button:
<button onClick={() => expandRecord(record)}>View Details</button>
```

The record object must come from a `useRecords` result (it needs to be a live Record model, not a plain object).

### useColorScheme — Detect dark mode programmatically

When you need to adapt logic (not just Tailwind classes) based on the color scheme:

```js
import {useColorScheme} from '@airtable/blocks/interface/ui';

const colorScheme = useColorScheme(); // 'light' or 'dark'
// Useful for chart libraries, canvas drawing, or third-party components
// that don't support Tailwind's dark: prefix
```

---

## 8. Debug Panel Pattern

For development and troubleshooting, implement a debug panel controlled by a boolean custom property. This helps consultants diagnose issues without reading code:

```js
// In getCustomProperties:
{key: 'showDebug', label: 'Show Debug Panel', type: 'boolean', defaultValue: false},

// In the component:
{customPropertyValueByKey.showDebug && (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono space-y-1">
        <div>Table: {table ? `${table.name} (found)` : 'NOT FOUND'}</div>
        <div>Records loaded: {records.length}</div>
        <div>Fields resolved: {resolvedFields.filter(Boolean).length}/{totalFields}</div>
        <div>Can create: {table?.hasPermissionToCreateRecords() ? 'Yes' : 'No'}</div>
        <div>Can update: {table?.hasPermissionToUpdateRecords() ? 'Yes' : 'No'}</div>
    </div>
)}
```

Toggle it on in the Interface Designer sidebar. Remove or leave disabled for production.

---
