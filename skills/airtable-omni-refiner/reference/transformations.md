# Common Transformations

> Reference for the `airtable-omni-refiner` skill. Loaded on demand from `SKILL.md`.
> The T1-T10 catalogue: pattern-match the request, apply the canonical transformation.

---

> A catalogue of canonical patterns for going from "what Omni gave you" to "what production needs". Pattern-match the user's request against this list; apply the canonical pattern.

---

## T1 — Static grid → circular / trigonometric layout

**When:** 8 seats around a round table, clock faces, radial menus, network diagrams.

**Omni output:** CSS grid (`grid-cols-4`) with seats in fixed positions.

**Pattern:** Absolute positioning on a container, seats placed via polar coordinates.

```js
const SEATS_PER_TABLE = 8;
const TABLE_RADIUS_PX = 110; // distance from center to seat center
const SEAT_SIZE_PX = 56;

function Table({tableNumber, guests}) {
    return (
        <div className="relative w-[300px] h-[300px] mx-auto">
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Table {tableNumber}
                </span>
            </div>
            {/* Seats around the circumference */}
            {Array.from({length: SEATS_PER_TABLE}).map((_, i) => {
                const angle = (i * 2 * Math.PI) / SEATS_PER_TABLE - Math.PI / 2;
                const x = 50 + (TABLE_RADIUS_PX / 150) * 100 * Math.cos(angle) / 2;
                const y = 50 + (TABLE_RADIUS_PX / 150) * 100 * Math.sin(angle) / 2;
                return (
                    <div
                        key={i}
                        className="absolute"
                        style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            width: SEAT_SIZE_PX,
                            height: SEAT_SIZE_PX,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <Seat seatNumber={i + 1} guest={guests[i]} />
                    </div>
                );
            })}
        </div>
    );
}
```

Key math: for N items around a circle, item `i` is at angle `(i * 2π / N)` from center. Subtract `π/2` to start at the top (12 o'clock position) instead of 3 o'clock.

---

## T2 — Static list → drag & drop with swap

**When:** Rearrange items by dragging; drop on empty slot moves, drop on occupied slot swaps.

**Omni output:** Click to select, dropdown or form to assign position.

**Pattern (simple cases):** HTML5 Drag and Drop API, native, no library.

```js
function Seat({record, position, onAssign, onSwap}) {
    const isOccupied = !!record;

    const handleDragStart = (e) => {
        if (!record) return;
        e.dataTransfer.setData('recordId', record.id);
        // The source position travels with the drag. A swap needs both ends:
        // the displaced occupant moves into the dragged guest's old seat.
        e.dataTransfer.setData('position', JSON.stringify(position));
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Allows drop
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('recordId');
        if (!draggedId || draggedId === record?.id) return;
        const rawPos = e.dataTransfer.getData('position');
        const draggedPos = rawPos ? JSON.parse(rawPos) : null;
        if (isOccupied) {
            onSwap(draggedId, draggedPos, record.id, position);
        } else {
            onAssign(draggedId, position);
        }
    };

    return (
        <div
            draggable={isOccupied}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={isOccupied ? 'cursor-grab active:cursor-grabbing' : ''}
        >
            {/* ...seat UI... */}
        </div>
    );
}
```

**Pattern (complex cases):** Use `@dnd-kit/core` for keyboard support, touch, accessibility, or multi-column flows (kanban).

---

## T3 — Blocking writes → optimistic UI

**When:** Drag-and-drop, toggles, any UI where waiting on network feels sluggish.

**Omni output:** `await table.updateRecordAsync(...)` inside the handler — UI freezes during the write.

**Pattern:** Mirror Airtable state in local state, update optimistically, fire the mutation in the background, roll back on error.

```js
function useOptimisticAssignments(records, table) {
    // Build initial state from records
    const initial = useMemo(() => {
        const map = new Map();
        records.forEach(r => {
            const tableNum = r.getCellValue(FIELD_IDS.TABLE_NUMBER);
            const seatNum = r.getCellValue(FIELD_IDS.SEAT_NUMBER);
            if (tableNum != null && seatNum != null) {
                map.set(r.id, {tableNum, seatNum});
            }
        });
        return map;
    }, [records]);

    const [overrides, setOverrides] = useState(new Map());

    // Clear each override once the record's own value matches it. Deleting on
    // write-success alone flashes the old value when useRecords has not
    // re-rendered yet; deleting only on failure is worse -- the override
    // survives forever and masks later edits by other collaborators.
    useEffect(() => {
        setOverrides(prev => {
            const next = new Map(prev);
            let changed = false;
            for (const [id, pos] of prev) {
                const live = initial.get(id);
                if (live && live.tableNum === pos.tableNum && live.seatNum === pos.seatNum) {
                    next.delete(id);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [initial]);

    const get = useCallback((recordId) => {
        return overrides.get(recordId) ?? initial.get(recordId);
    }, [overrides, initial]);

    const assign = useCallback(async (recordId, tableNum, seatNum) => {
        // Optimistic
        setOverrides(prev => new Map(prev).set(recordId, {tableNum, seatNum}));
        try {
            if (!table.hasPermissionToUpdateRecords()) throw new Error('No permission');
            await table.updateRecordAsync(recordId, {
                [FIELD_IDS.TABLE_NUMBER]: tableNum,
                [FIELD_IDS.SEAT_NUMBER]: seatNum,
            });
        } catch (err) {
            // Rollback on failure
            setOverrides(prev => {
                const next = new Map(prev);
                next.delete(recordId);
                return next;
            });
            console.error('Assignment failed', err);
        }
    }, [table]);

    return {get, assign};
}
```

---

## T4 — Single CRUD → batched mutations

**When:** Swapping two records (two writes), bulk assigning many records, imports.

**Omni output:** Loop of `await table.updateRecordAsync(...)` — slow and potentially rate-limited.

**Pattern:** `updateRecordsAsync(updates)` accepts up to 50 records per call. Chunk larger operations.

```js
async function swapAssignments(recordAId, recordBId, posA, posB) {
    await table.updateRecordsAsync([
        {id: recordAId, fields: {[FIELD_IDS.TABLE_NUMBER]: posB.tableNum, [FIELD_IDS.SEAT_NUMBER]: posB.seatNum}},
        {id: recordBId, fields: {[FIELD_IDS.TABLE_NUMBER]: posA.tableNum, [FIELD_IDS.SEAT_NUMBER]: posA.seatNum}},
    ]);
}

// Bulk import — chunk at 50
async function batchAssign(assignments) {
    const BATCH_SIZE = 50;
    for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
        const chunk = assignments.slice(i, i + BATCH_SIZE);
        await table.updateRecordsAsync(chunk);
    }
}
```

Rate limit: max 15 batch calls per second. For very large operations, add a short delay between chunks.

---

## T5 — Hardcoded select options → dynamic from field config

**When:** Filters, legends, dropdowns showing select or multi-select values.

**Omni output:** Hardcoded array like `['Active', 'Pending', 'Done']`.

**Pattern:** Read from the field's `options.choices` array — survives new choices being added.

```js
const field = table.getFieldIfExists(FIELD_IDS.STATUS);
const choices = field?.options?.choices ?? [];

// Render as filter buttons
{choices.map(choice => (
    <button
        key={choice.id}
        onClick={() => setFilter(choice.name)}
        className="px-3 py-1 rounded-full text-sm"
    >
        {choice.name}
    </button>
))}
```

See `sdk-patterns.md` §6 for mapping Airtable colors (`blueBright`, etc.) to Tailwind classes.

---

## T6 — No conditional indicators → badges & flags

**When:** VIP badges, "needs attention" flags, priority markers.

**Omni output:** Missing — Omni doesn't model conditional visual states unless prompted explicitly.

**Pattern:** Conditional render with Tailwind badge classes, positioned absolutely over the main visual.

```js
function Seat({guest}) {
    const isVip = guest?.getCellValue(FIELD_IDS.VIP) === true;
    return (
        <div className="relative w-14 h-14">
            {/* Main seat content */}
            <img src={photoUrl} alt="" className="w-full h-full rounded-full" />
            {/* VIP badge — absolutely positioned */}
            {isVip && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-yellow-400 text-yellow-900 shadow">
                    ★
                </span>
            )}
        </div>
    );
}
```

---

## T7 — No current-user awareness → personalized view

**When:** "My tasks", "assigned to me", show-my-items toggle.

**Omni output:** Shows everything; user has to filter manually.

**Pattern:** `useSession` + filter by collaborator field.

> **SDK check:** this `{fields: [...]}` form is **Base Extension** API (`@airtable/blocks/ui`). In Interface Extensions the signature is `useRecords(table)` with no opts — scope via the element's Data panel instead.

```js
import {useSession} from '@airtable/blocks/interface/ui';

function MyTasks() {
    const session = useSession();
    const currentUser = session.currentUser;
    const allRecords = useRecords(table, {fields: [FIELD_IDS.TITLE, FIELD_IDS.ASSIGNEE]});

    const myRecords = useMemo(() => {
        if (!currentUser) return [];
        return allRecords.filter(r => {
            const assignee = r.getCellValue(FIELD_IDS.ASSIGNEE);
            return assignee?.id === currentUser.id;
        });
    }, [allRecords, currentUser]);

    return (/* render myRecords */);
}
```

For multi-collaborator fields: `assignees?.some(c => c.id === currentUser.id)`.

---

## T8 — Missing error states → resilient UI

**When:** Every component that depends on a table, field, or records.

**Omni output:** Usually shows blank or crashes silently if data is missing.

**Pattern:** Explicit handling for 3 states — missing table, empty result, and
loaded.

> An earlier version of this section guarded a fourth state with
> `if (!table.hasPermissionToReadRecords?.())`. That is broken regardless of
> whether the method exists: the optional call returns `undefined` when it does
> not, and `!undefined` is `true`, so every user is shown "no access". It was
> also placed *after* `useRecords`, gating a read that had already happened.
> Guard *writes* with `hasPermissionToUpdateRecords()` (rule 6). Whether a
> read-permission method exists on `table` is unverified — do not reintroduce
> one without checking the SDK reference.

```js
// Parent: resolves the table. The guard sits after this component's only
// hook, so the hook count never changes between renders. Never put a
// `return` above a hook -- see `coding-standards.md` §5.
function ProjectList() {
    const base = useBase();
    const table = base.getTableByIdIfExists(TABLE_IDS.PROJECTS);

    if (!table) {
        return <EmptyState message="Projects table not found. It may have been renamed or deleted." />;
    }

    return <ProjectListBody table={table} />;
}

// Child: only mounted with a non-null table, so its hooks always run.
function ProjectListBody({table}) {
    const records = useRecords(table, {fields: PROJECT_LIST_FIELDS});

    if (records.length === 0) {
        return <EmptyState message="No projects yet. Create one to get started." />;
    }

    return (/* render records */);
}

function EmptyState({message}) {
    return (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {message}
        </div>
    );
}
```

---

## T9 — Hardcoded layout dimensions → responsive

**When:** Fixed pixel widths that break on narrow or wide viewports.

**Omni output:** `w-[800px]` or `grid-cols-5` regardless of viewport.

**Pattern:** Use Tailwind breakpoints for adaptive layouts.

```js
// Instead of grid-cols-5
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
    {tables.map(t => <Table key={t.id} {...t} />)}
</div>
```

For more control, use `useViewport()` from the SDK.

---

## T10 — Hardcoded values → custom properties

**When:** The extension should be reusable across bases or configurable by the interface designer without code edits.

**Omni output:** Hardcoded table IDs and field mappings.

**Pattern:** `useCustomProperties` with a **module-level** `getCustomProperties` function (see `sdk-patterns.md` §2 — defining it inline causes infinite re-renders).

```js
// At module level, OUTSIDE the component
function getCustomProperties(base) {
    return [
        {key: 'guestTable', label: 'Guests table', type: 'table'},
        {key: 'nameField', label: 'Name field', type: 'field', table: base.tables[0]},
    ];
}

function App() {
    const {customPropertyValueByKey} = useCustomProperties(getCustomProperties);
    const tableId = customPropertyValueByKey.guestTable?.id;
    // ...
}
```

---

## Applying multiple transformations

When the user asks for a big change (e.g., "make the wedding seating plan work with drag & drop"), decompose into transformations:

1. **T1** — circular seat layout (trigonometric placement)
2. **T2** — drag & drop between seats
3. **T3** — optimistic UI on assignment
4. **T4** — batched write for swap (2 records at once)
5. **T6** — VIP badge conditional render
6. **T8** — error states (table missing, no permission, no records)

Apply them in this order: structural (T1), interactive (T2), performance/UX (T3, T4), polish (T6), resiliency (T8).

Dark mode (`dark:` variants) and field IDs are applied throughout, not as a separate pass.
