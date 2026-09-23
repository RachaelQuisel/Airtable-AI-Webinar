// examples/wedding-seating-after.jsx
//
// The refined version of wedding-seating-before.jsx, produced by applying the
// airtable-omni-refiner skill. Changes applied:
//
//   1. <Suspense> boundary at the entry point
//   2. useRecords with a scoped `fields` option (only what's displayed)
//   3. Field IDs centralized in FIELD_IDS; field names nowhere in logic
//   4. getTableByIdIfExists + getFieldIfExists + null handling throughout
//   5. Permission check before enabling writes
//   6. Trigonometric circular seat placement (T1 from reference/transformations.md)
//   7. HTML5 drag-and-drop with swap-on-occupied (T2)
//   8. Optimistic UI on assignment (T3)
//   9. Batched mutation for swaps (T4)
//  10. Dark mode via dark: variants on every color class
//  11. Error / empty / missing-table states (T8)
//  12. VIP badge via conditional render (T6)
//  13. Unseated-guest tray — without it, unassigned guests have no drag source
//  14. Optimistic overrides retired once Airtable's value catches up
//
// Centralized constants:
const TABLE_IDS = {
    GUESTS: 'tbl7AorYDijc5NafK',
};

const FIELD_IDS = {
    GUESTS: {
        NAME: 'fldFQgQcYILPPl9PU',
        PHOTO: 'fldbpeTmvrNcHLIum',
        VIP: 'fldVIA859ng3LWB8T',
        TABLE_NUMBER: 'fldCfCAjmivLZwi5A',
        SEAT_NUMBER: 'fldW3PFejW2L6hAGq',
    },
};

const SEATING_FIELDS = [
    FIELD_IDS.GUESTS.NAME,
    FIELD_IDS.GUESTS.PHOTO,
    FIELD_IDS.GUESTS.VIP,
    FIELD_IDS.GUESTS.TABLE_NUMBER,
    FIELD_IDS.GUESTS.SEAT_NUMBER,
];

const TOTAL_TABLES = 10;
const SEATS_PER_TABLE = 8;
const TOTAL_SEATS = TOTAL_TABLES * SEATS_PER_TABLE;

import {initializeBlock, useBase, useRecords} from '@airtable/blocks/interface/ui';
import React, {Suspense, useCallback, useEffect, useMemo, useState} from 'react';

function App() {
    const base = useBase();
    const table = base.getTableByIdIfExists(TABLE_IDS.GUESTS);

    // The missing-table guard lives here, in a component that calls no hooks
    // after it. An early return above a hook changes the hook count between
    // renders and throws "Rendered fewer hooks than expected" -- which would
    // fire on exactly the schema change this guard exists to survive.
    if (!table) {
        return (
            <div className="p-6 text-gray-500 dark:text-gray-400">
                The Guests table was not found. It may have been renamed or deleted.
            </div>
        );
    }

    return <SeatingPlan table={table} />;
}

function SeatingPlan({table}) {
    const records = useRecords(table, {fields: SEATING_FIELDS});
    const canEdit = table.hasPermissionToUpdateRecords();

    // Optimistic state: recordId -> {tableNum, seatNum}
    const initialAssignments = useMemo(() => {
        const map = new Map();
        records.forEach(r => {
            const tableNum = r.getCellValue(FIELD_IDS.GUESTS.TABLE_NUMBER);
            const seatNum = r.getCellValue(FIELD_IDS.GUESTS.SEAT_NUMBER);
            if (tableNum != null && seatNum != null) {
                map.set(r.id, {tableNum, seatNum});
            }
        });
        return map;
    }, [records]);

    const [overrides, setOverrides] = useState(new Map());

    // Retire each override once Airtable's own value matches it. Clearing only
    // on failure (as this file used to) leaves the override in place forever,
    // so a later change by another collaborator is masked by stale local state
    // for the rest of the session.
    useEffect(() => {
        setOverrides(prev => {
            const next = new Map(prev);
            let changed = false;
            for (const [id, pos] of prev) {
                const live = initialAssignments.get(id);
                if (live && live.tableNum === pos.tableNum && live.seatNum === pos.seatNum) {
                    next.delete(id);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [initialAssignments]);

    const getAssignment = useCallback(
        (recordId) => overrides.get(recordId) ?? initialAssignments.get(recordId),
        [overrides, initialAssignments]
    );

    const persist = useCallback(async (updates) => {
        if (!canEdit) return;
        try {
            await table.updateRecordsAsync(updates);
        } catch (err) {
            // Roll back optimistic overrides on failure
            setOverrides(prev => {
                const next = new Map(prev);
                updates.forEach(u => next.delete(u.id));
                return next;
            });
            console.error('Seating update failed', err);
        }
    }, [table, canEdit]);

    const assign = useCallback((recordId, tableNum, seatNum) => {
        setOverrides(prev => new Map(prev).set(recordId, {tableNum, seatNum}));
        persist([
            {id: recordId, fields: {
                [FIELD_IDS.GUESTS.TABLE_NUMBER]: tableNum,
                [FIELD_IDS.GUESTS.SEAT_NUMBER]: seatNum,
            }},
        ]);
    }, [persist]);

    const swap = useCallback((recordA, posA, recordB, posB) => {
        setOverrides(prev => {
            const next = new Map(prev);
            next.set(recordA, posB);
            next.set(recordB, posA);
            return next;
        });
        persist([
            {id: recordA, fields: {
                [FIELD_IDS.GUESTS.TABLE_NUMBER]: posB.tableNum,
                [FIELD_IDS.GUESTS.SEAT_NUMBER]: posB.seatNum,
            }},
            {id: recordB, fields: {
                [FIELD_IDS.GUESTS.TABLE_NUMBER]: posA.tableNum,
                [FIELD_IDS.GUESTS.SEAT_NUMBER]: posA.seatNum,
            }},
        ]);
    }, [persist]);

    // Build a seat index: `${tableNum}-${seatNum}` -> record
    const seatIndex = useMemo(() => {
        const map = new Map();
        records.forEach(r => {
            const pos = getAssignment(r.id);
            if (pos) map.set(`${pos.tableNum}-${pos.seatNum}`, r);
        });
        return map;
    }, [records, getAssignment]);

    const seatedCount = seatIndex.size;

    // Guests with no table/seat render nowhere on the chart, so without this
    // list they have no drag source and a fresh plan cannot be seated at all.
    const unassigned = useMemo(
        () => records.filter(r => !getAssignment(r.id)),
        [records, getAssignment]
    );

    return (
        <div className="p-6 bg-white dark:bg-gray-950 min-h-screen">
            <header className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Seating Plan
                </h1>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {seatedCount} / {TOTAL_SEATS} guests seated
                </div>
            </header>

            {!canEdit && (
                <div className="mb-4 p-3 rounded bg-yellow-50 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 text-sm">
                    Read-only: you don't have permission to edit guest records.
                </div>
            )}

            <UnassignedTray guests={unassigned} canEdit={canEdit} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                {Array.from({length: TOTAL_TABLES}).map((_, i) => {
                    const tableNum = i + 1;
                    return (
                        <Table
                            key={tableNum}
                            tableNumber={tableNum}
                            seatIndex={seatIndex}
                            canEdit={canEdit}
                            onAssign={assign}
                            onSwap={swap}
                            getAssignment={getAssignment}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function Table({tableNumber, seatIndex, canEdit, onAssign, onSwap, getAssignment}) {
    return (
        <div className="relative w-[280px] h-[280px] mx-auto">
            <div className="absolute inset-8 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                <span className="text-lg font-semibold text-amber-900 dark:text-amber-200">
                    Table {tableNumber}
                </span>
            </div>
            {Array.from({length: SEATS_PER_TABLE}).map((_, i) => {
                const seatNum = i + 1;
                const angle = (i * 2 * Math.PI) / SEATS_PER_TABLE - Math.PI / 2;
                const radiusPct = 42;
                const x = 50 + radiusPct * Math.cos(angle);
                const y = 50 + radiusPct * Math.sin(angle);
                const record = seatIndex.get(`${tableNumber}-${seatNum}`);
                return (
                    <div
                        key={seatNum}
                        className="absolute"
                        style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <Seat
                            seatNumber={seatNum}
                            tableNumber={tableNumber}
                            record={record}
                            canEdit={canEdit}
                            onAssign={onAssign}
                            onSwap={onSwap}
                            getAssignment={getAssignment}
                        />
                    </div>
                );
            })}
        </div>
    );
}

function UnassignedTray({guests, canEdit}) {
    if (guests.length === 0) return null;

    return (
        <div className="mb-6 p-3 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <h2 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Unseated ({guests.length})
            </h2>
            <ul className="flex flex-wrap gap-2">
                {guests.map(g => (
                    <li key={g.id}>
                        <div
                            draggable={canEdit}
                            onDragStart={(e) => {
                                if (!canEdit) {
                                    e.preventDefault();
                                    return;
                                }
                                e.dataTransfer.setData('recordId', g.id);
                                e.dataTransfer.effectAllowed = 'move';
                            }}
                            className={`px-2 py-1 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 ${canEdit ? 'cursor-grab' : ''}`}
                        >
                            {guestName(g)}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function guestName(record) {
    return record.getCellValueAsString(FIELD_IDS.GUESTS.NAME) || '(untitled)';
}

function toInitials(name) {
    return (name ?? '')
        .split(' ')
        .filter(Boolean)
        .map(p => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

const Seat = React.memo(function Seat({
    seatNumber,
    tableNumber,
    record,
    canEdit,
    onAssign,
    onSwap,
    getAssignment,
}) {
    const [isDragOver, setIsDragOver] = useState(false);

    const isOccupied = !!record;
    // getCellValueAsString, not getCellValue: the Name field may be a number,
    // formula, or rollup, and .split(' ') below would throw on those.
    const name = record ? guestName(record) : null;
    const photoCell = record?.getCellValue(FIELD_IDS.GUESTS.PHOTO);
    const photoUrl = Array.isArray(photoCell) && photoCell.length > 0 ? photoCell[0].url : null;
    const isVip = record?.getCellValue(FIELD_IDS.GUESTS.VIP) === true;

    const handleDragStart = (e) => {
        if (!isOccupied || !canEdit) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('recordId', record.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        if (!canEdit) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!canEdit) return;
        const draggedId = e.dataTransfer.getData('recordId');
        if (!draggedId || draggedId === record?.id) return;
        const target = {tableNum: tableNumber, seatNum: seatNumber};

        if (isOccupied) {
            const draggedPos = getAssignment(draggedId);
            if (draggedPos) onSwap(draggedId, draggedPos, record.id, target);
        } else {
            onAssign(draggedId, target.tableNum, target.seatNum);
        }
    };

    const baseClasses = 'w-14 h-14 rounded-full flex flex-col items-center justify-center text-xs transition-all';
    const dragOverClasses = isDragOver ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-950' : '';

    if (!isOccupied) {
        return (
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${dragOverClasses}`}
                aria-label={`Empty seat ${seatNumber}`}
            >
                {seatNumber}
            </div>
        );
    }

    const initials = toInitials(name);

    return (
        <div
            draggable={canEdit}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''}`}
            aria-label={`${name} at seat ${seatNumber}`}
        >
            <div className={`${baseClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden ${dragOverClasses}`}>
                {photoUrl ? (
                    <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{initials}</span>
                )}
            </div>
            {isVip && (
                <span
                    className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-yellow-400 text-yellow-900 shadow ring-2 ring-white dark:ring-gray-950"
                    aria-label="VIP"
                >
                    ★
                </span>
            )}
            <div className="mt-1 text-[10px] text-center truncate max-w-[56px] text-gray-700 dark:text-gray-300">
                {name}
            </div>
        </div>
    );
});

initializeBlock({
    interface: () => (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
            }
        >
            <App />
        </Suspense>
    ),
});
