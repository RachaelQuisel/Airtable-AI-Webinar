# Coding Standards

> Reference for the `airtable-omni-refiner` skill. Loaded on demand from `SKILL.md`.
> File structure, naming, imports, ID constants, error handling, accessibility, library policy, dark mode.

---

> Conventions for all Airtable Interface Extension code — naming, file structure, error handling, library policy. Follow these consistently across every extension.

---

## 1. File Structure

```
<project-name>/frontend/
├── index.js              # Entry point — initializeBlock({interface: ...}) call
├── App.js                # Top-level component — layout, navigation, top-level hooks
├── hooks/                # Custom data hooks (one per table or data concern)
│   ├── use-projects.js
│   └── use-tasks.js
├── components/           # Feature and shared components
│   ├── ProjectList.js
│   ├── ProjectDetail.js
│   ├── TaskTable.js
│   └── FilterBar.js
├── types.js              # Table/field ID constants and field list definitions
├── utils.js              # Helper functions (only if genuinely needed)
├── style.css             # Tailwind setup (created by block init)
└── package.json          # Dependencies (created by block init)
```

Only create `types.js` and `utils.js` if they contain content. Do not create empty placeholder files.

---

## 2. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Component files | PascalCase.js | `ProjectList.js` |
| Hook files | kebab-case.js | `use-projects.js` |
| Utility files | kebab-case.js | `date-helpers.js` |
| Components | PascalCase | `ProjectList` |
| Hooks | camelCase, `use` prefix | `useProjects` |
| Constants | UPPER_SNAKE_CASE | `TABLE_ID` |
| Local variables | camelCase | `selectedRecordId` |
| Event handlers | camelCase, `handle` or `on` prefix | `handleRowClick`, `onStatusChange` |

---

## 3. Import Order

Group imports in this order, separated by blank lines:

```js
// 1. Airtable SDK
import {useBase, useRecords} from '@airtable/blocks/interface/ui';
import {FieldType} from '@airtable/blocks/interface/models';

// 2. React
import React, {useState, useMemo, useCallback, Suspense} from 'react';

// 3. Third-party libraries
import {useReactTable, getCoreRowModel} from '@tanstack/react-table';
import {format} from 'date-fns';
import {MagnifyingGlass, CaretDown} from '@phosphor-icons/react';

// 4. Local imports
import {useProjects} from './hooks/use-projects';
import {ProjectDetail} from './components/ProjectDetail';
import {TABLE_IDS, FIELD_IDS} from './types';
```

---

## 4. Table & Field ID Constants

Derive constants directly from `schema.md`. Every table and field ID used by the extension gets a named constant.

```js
// types.js — derived from schema.md
export const TABLE_IDS = {
    PROJECTS: 'tblXXXXXX',
    TASKS: 'tblYYYYYY',
};

export const FIELD_IDS = {
    PROJECTS: {
        NAME: 'fldAAAAAA',
        STATUS: 'fldBBBBBB',
        DUE_DATE: 'fldCCCCCC',
        TASKS: 'fldDDDDDD',  // linked record field
    },
    TASKS: {
        TITLE: 'fldEEEEEE',
        ASSIGNEE: 'fldFFFFFF',
    },
};

// Field lists for useRecords calls (only the fields each view needs)
export const PROJECT_LIST_FIELDS = [
    FIELD_IDS.PROJECTS.NAME,
    FIELD_IDS.PROJECTS.STATUS,
    FIELD_IDS.PROJECTS.DUE_DATE,
];

export const PROJECT_DETAIL_FIELDS = Object.values(FIELD_IDS.PROJECTS);
```

---

## 5. Error Handling

Every component that loads data must handle three states using standard HTML elements:

1. **Loading** — show a spinner or rely on Suspense
2. **Empty** — show a helpful message when no data exists
3. **Missing/deleted** — handle tables, fields, or records that no longer exist

**CRITICAL: the missing-table guard goes in a parent component.** An early
`return` placed above a hook changes the number of hooks React sees between
renders, and React throws `Rendered fewer hooks than expected`. That crash
fires on exactly the schema change the guard was written to survive. Split the
guard out so the data component's hooks always run:

> **SDK check:** this `{fields: [...]}` form is **Base Extension** API (`@airtable/blocks/ui`). In Interface Extensions the signature is `useRecords(table)` with no opts — scope via the element's Data panel instead.

```js
// Parent: resolves the table, calls no hooks after the guard.
function ProjectView() {
    const base = useBase();
    const table = base.getTableByIdIfExists(TABLE_IDS.PROJECTS);

    if (!table) {
        return (
            <div className="p-4 text-gray-500 dark:text-gray-400">
                The Projects table was not found. It may have been renamed or deleted.
            </div>
        );
    }

    return <ProjectList table={table} />;
}

// Child: only ever mounted with a non-null table, so its hook order is stable.
function ProjectList({table}) {
    const records = useRecords(table, {fields: Object.values(FIELD_IDS.PROJECTS)});

    if (records.length === 0) {
        return (
            <div className="p-4 text-gray-500 dark:text-gray-400">
                No projects found. Create a project in the base to get started.
            </div>
        );
    }

    return (/* render */);
}
```

The `records.length === 0` return is safe where it sits: it comes after every
hook in `ProjectList`, so the hook count does not change.

---

## 6. Field Type Comparisons

**Always compare field types using the `FieldType` enum, never raw strings.** String comparisons are fragile and won't catch typos at build time.

```js
import {FieldType} from '@airtable/blocks/interface/models';

// CORRECT — uses the enum
if (field.type === FieldType.SINGLE_SELECT) { /* ... */ }
if (field.type === FieldType.MULTIPLE_RECORD_LINKS) { /* ... */ }

// WRONG — raw strings are fragile
if (field.type === 'singleSelect') { /* ... */ }
```

---

## 7. Accessibility

- Use semantic HTML elements: `<nav>`, `<main>`, `<header>`, `<section>`, `<article>`, `<aside>`
- Add `aria-label` to interactive elements that lack visible text labels
- Use `<label>` elements associated with inputs via `htmlFor`
- Ensure all `<button>` elements have either text content or an `aria-label`
- Use heading elements (`<h1>` through `<h6>`) for section titles with proper hierarchy

---

## 8. Library Usage Policy

**Prefer established React libraries** over building complex UI from scratch. This produces more reliable, maintainable code.

### Recommended libraries

| Need | Library | When to use |
|------|---------|-------------|
| Data tables | `@tanstack/react-table` | Sortable, filterable, paginated tables |
| Date formatting | `date-fns` | Displaying dates in human-friendly formats |
| Charts | `recharts` | Dashboards with bar/line/pie charts |
| Drag-and-drop | `@dnd-kit/core` | Kanban boards, reorderable lists |
| Complex forms | `react-hook-form` | Multi-step forms, complex validation |
| Icons | `@phosphor-icons/react` | All icons — import with suffix (e.g., `CaretDown`) |
| Markdown | `marked` | Rendering rich text / markdown content |

### Single-purpose component libraries are fine

Libraries that solve a specific complex UI need (calendar, date picker, rich text editor, combobox, color picker) are encouraged — same rationale as `@tanstack/react-table` or `recharts`. Don't build complex interactive widgets from scratch when a well-maintained library exists.

### Do NOT add libraries for

- **CSS/styling frameworks** (Bootstrap, Styled Components, etc.) — Tailwind is pre-configured by `block init`
- **Full UI component suites** (Material UI, Chakra, Ant Design, Radix UI, etc.) — they bring their own styling system that conflicts with Tailwind and won't respect Airtable's design tokens or dark mode
- **State management** (Redux, Zustand, etc.) — extensions are small enough for `useState` + `useContext`
- **Routing** — extensions don't have URLs; use `useState` for view switching

### When adding a library

- Add it to `frontend/package.json` dependencies
- Run `npm install --legacy-peer-deps` in the `frontend/` directory (needed for React 19 compatibility with some libraries)
- Use the library's documented patterns — don't wrap it in custom abstractions
- Import only what you need (tree-shaking compatible imports)

---

## 9. Dark Mode

**Always support dark mode.** Airtable can render extensions in dark mode, and the Tailwind config includes dark mode tokens.

- Use `dark:` Tailwind prefixes for all visual properties:
  ```html
  <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  ```
- Test both modes visually — don't assume light mode only
- Use semantic color classes from the Tailwind config (e.g., `text-foreground`, `bg-surface`) when available — these auto-adapt to dark mode

---

## 10. Resiliency Patterns

These live in one place to stop the two copies drifting apart: see
**[sdk-patterns.md §3 — Resiliency Patterns](sdk-patterns.md)** for
`getFieldIfExists()`, null cell values, permission checks before writes, and
schema-change resilience.

### Centralize IDs

Keep all table and field IDs in `types.js`. If the customer changes a field ID (rare but possible after field type changes), there's one place to update.

---

## Validation checklist

Run this *after* refactoring, before telling the user it's done. It checks the
work; the Part 1 health check in `SKILL.md` checks the input. List anything
still unchecked rather than quietly leaving it.

- [ ] No `return` sits above a hook in any component (rule 11)
- [ ] Every `useRecords` call passes a scoped `fields` option
- [ ] No field or table name strings in logic — IDs only, centralized
- [ ] `getTableByIdIfExists` / `getFieldIfExists` with the null branch handled
- [ ] Every `getCellValue` has `?? fallback` or `?.`
- [ ] Every `multipleX` update spreads the existing value before writing
- [ ] Writes are guarded by `hasPermissionToUpdateRecords()` for UI and `hasPermissionToUpdateRecord(record, fields)` per call
- [ ] Batches chunked to 50 records, 15 calls/sec
- [ ] Optimistic updates roll back on error *and* clear on success
- [ ] Every color class pairs light + `dark:`
- [ ] Loading, empty, and missing-table states render for every data view
- [ ] No writes to computed fields
- [ ] No SDK UI components (`<Box>`, `<Button>`, `<Text>`) — HTML + Tailwind only
- [ ] No API used that isn't in these reference files or the SDK docs

---
