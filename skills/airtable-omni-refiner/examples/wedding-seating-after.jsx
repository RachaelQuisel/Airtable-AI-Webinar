// Educational fixture: map the illustrative IDs to a verified base first.
// Pending-only saving is intentional. Counts derive from live Airtable records.
// A multi-record swap still requires live concurrency testing; it is not a transaction.
import {initializeBlock, useBase, useRecords} from '@airtable/blocks/interface/ui';
import {FieldType} from '@airtable/blocks/interface/models';
import React, {Suspense, useEffect, useRef, useState} from 'react';

const TABLE_ID = 'tblGuestsExample1';
export const FIELDS = {name: 'fldNameExample001', table: 'fldTableExample01', seat: 'fldSeatExample001'};
const TABLES = 10;
const SEATS = 8;

// Pure planning from the latest rendered snapshot; no writes or optimistic rewards.
export function planMove(rows, id, tableNum, seatNum) {
    if (!Number.isInteger(tableNum) || tableNum < 1 || tableNum > TABLES ||
        !Number.isInteger(seatNum) || seatNum < 1 || seatNum > SEATS) {
        throw new Error('Choose a valid table and seat.');
    }
    const source = rows.find(row => row.id === id);
    if (!source) throw new Error('The selected guest is no longer available.');
    const occupants = rows.filter(row => row.tableNum === tableNum && row.seatNum === seatNum);
    if (occupants.length > 1) throw new Error('This seat has conflicting assignments. Resolve them first.');
    if (source.tableNum === tableNum && source.seatNum === seatNum) return [];
    const update = (recordId, t, s) => ({id: recordId, fields: {[FIELDS.table]: t, [FIELDS.seat]: s}});
    const updates = [update(id, tableNum, seatNum)];
    if (occupants[0]) updates.push(update(occupants[0].id, source.tableNum, source.seatNum));
    return updates;
}

export async function saveMove(table, updates) {
    if (!updates.length) return;
    if (!table.hasPermissionToUpdateRecords(updates)) throw new Error('You cannot change these assignments.');
    await table.updateRecordsAsync(updates);
}

function App() {
    const base = useBase();
    const table = base.getTableByIdIfExists(TABLE_ID);
    const fields = table && Object.fromEntries(Object.entries(FIELDS).map(([key, id]) => [key, table.getFieldIfExists(id)]));
    if (!table || Object.values(fields).some(field => !field)) {
        return <p role="status">Configure the verified Guests table and expose Name, Table, and Seat in the Data panel.</p>;
    }
    if ([fields.table, fields.seat].some(field => field.type !== FieldType.NUMBER || field.isComputed)) {
        return <p role="status">Table and Seat must be editable number fields.</p>;
    }
    return <SeatingPlan key={table.id} table={table} fields={fields} />;
}

function SeatingPlan({table, fields}) {
    const records = useRecords(table);
    const [selectedId, setSelectedId] = useState('');
    const [tableNum, setTableNum] = useState(1);
    const [seatNum, setSeatNum] = useState(1);
    const [pending, setPending] = useState(null);
    const [error, setError] = useState('');
    const locked = useRef(false);
    const rows = records.map(record => ({
        id: record.id,
        name: record.getCellValueAsString(fields.name) || '(untitled)',
        tableNum: record.getCellValue(fields.table) ?? null,
        seatNum: record.getCellValue(fields.seat) ?? null,
    }));
    const canEdit = table.hasPermissionToUpdateRecords();
    const invalid = rows.some(row => {
        if (row.tableNum === null && row.seatNum === null) return false;
        return !Number.isInteger(row.tableNum) || row.tableNum < 1 || row.tableNum > TABLES ||
            !Number.isInteger(row.seatNum) || row.seatNum < 1 || row.seatNum > SEATS;
    });
    const assigned = rows.filter(row => row.tableNum !== null && row.seatNum !== null);
    const duplicateSeats = new Set(assigned.map(row => `${row.tableNum}-${row.seatNum}`)).size !== assigned.length;
    const dataConflict = invalid || duplicateSeats;

    // Release the local lock only once BOTH the save and live record acknowledgement exist.
    useEffect(() => {
        if (!pending?.saved) return;
        const acknowledged = pending.updates.every(update => {
            const record = records.find(item => item.id === update.id);
            return record && Object.entries(update.fields).every(([fieldId, value]) =>
                (record.getCellValue(fieldId) ?? null) === value);
        });
        if (acknowledged) { setPending(null); setError(''); locked.current = false; }
    }, [records, pending]);
    useEffect(() => {
        if (!pending) return;
        const timeout = setTimeout(() => setError('Still waiting for saved data. Reload to check the current assignments before trying again.'), 10000);
        return () => clearTimeout(timeout);
    }, [pending]);

    async function move(id, targetTable, targetSeat) {
        if (locked.current || !canEdit || dataConflict) return;
        setError('');
        let updates;
        try {
            updates = planMove(rows, id, targetTable, targetSeat);
        } catch (failure) {
            setError(failure.message || 'Choose a valid guest and seat.');
            return;
        }
        if (!updates.length) return;
        locked.current = true;
        setPending({updates, saved: false});
        try {
            await saveMove(table, updates);
            setPending({updates, saved: true});
        } catch (failure) {
            // A rejected multi-record call can have an uncertain result. Keep the lock
            // until the user reloads; never blindly repeat a swap and reverse it.
            setError(`${failure.message || 'Save failed.'} Reload to inspect current assignments before retrying.`);
            setPending(null);
        }
    }
    const disabled = !canEdit || !!pending || locked.current || dataConflict;
    return (
        <main className="p-6 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-semibold">Seating plan</h1>
            <p aria-live="polite">{assigned.length} of {rows.length} guests have a saved assignment.</p>
            {!canEdit && <p>Read-only: you cannot edit these assignments.</p>}
            {dataConflict && <p role="alert">Invalid or duplicate assignments need resolution before moving guests.</p>}
            {pending && <p role="status">Saving and checking the updated records…</p>}
            {error && <div role="alert">{error} <button type="button" onClick={() => window.location.reload()}>Reload assignments</button></div>}
            <form onSubmit={event => { event.preventDefault(); void move(selectedId, tableNum, seatNum); }} className="flex flex-wrap gap-3 my-4">
                <label>Guest <select value={selectedId} onChange={event => setSelectedId(event.target.value)} disabled={disabled}>
                    <option value="">Choose a guest</option>
                    {rows.map(row => <option key={row.id} value={row.id}>{row.name} — {row.tableNum === null ? 'Unseated' : `Table ${row.tableNum}, seat ${row.seatNum}`}</option>)}
                </select></label>
                <label>Table <input type="number" min="1" max={TABLES} value={tableNum} onChange={event => setTableNum(Number(event.target.value))} disabled={disabled} /></label>
                <label>Seat <input type="number" min="1" max={SEATS} value={seatNum} onChange={event => setSeatNum(Number(event.target.value))} disabled={disabled} /></label>
                <button type="submit" disabled={disabled || !selectedId}>Move / swap</button>
            </form>
            <p>A move into an occupied seat swaps the two guests. An unseated guest displaces the occupant into the unseated list.</p>
            <section aria-label="Unseated guests" className="my-4">
                <h2>Unseated</h2>
                {rows.filter(row => row.tableNum === null).map(row => <Guest key={row.id} row={row} disabled={disabled} onSelect={setSelectedId} />)}
                {!rows.length && <p>No guests are available in this element.</p>}
            </section>
            <section aria-label="Tables" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {Array.from({length: TABLES}, (_, index) => index + 1).map(t => (
                    <div key={t} className="relative w-72 h-72 mx-auto border rounded-full border-gray-300 dark:border-gray-700">
                        <h2 className="absolute inset-0 flex items-center justify-center pointer-events-none">Table {t}</h2>
                        {Array.from({length: SEATS}, (_, index) => index + 1).map(s => {
                            const angle = (s - 1) * 2 * Math.PI / SEATS - Math.PI / 2;
                            const row = rows.find(item => item.tableNum === t && item.seatNum === s);
                            return <div key={s} style={{position: 'absolute', left: `${50 + 40 * Math.cos(angle)}%`, top: `${50 + 40 * Math.sin(angle)}%`, transform: 'translate(-50%, -50%)'}}
                                onDragOver={event => { if (!disabled) event.preventDefault(); }}
                                onDrop={event => { event.preventDefault(); if (!disabled) void move(event.dataTransfer.getData('text/plain'), t, s); }}>
                                {row ? <Guest row={row} disabled={disabled} onSelect={setSelectedId} /> : <span className="text-sm">Seat {s}</span>}
                            </div>;
                        })}
                    </div>
                ))}
            </section>
        </main>
    );
}
function Guest({row, disabled, onSelect}) {
    return <button type="button" disabled={disabled} draggable={!disabled}
        onClick={() => onSelect(row.id)} onDragStart={event => event.dataTransfer.setData('text/plain', row.id)}
        className="max-w-20 truncate p-2 border rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-visible:outline focus-visible:outline-2"
        title={row.name}>{row.name}</button>;
}
initializeBlock({interface: () => <Suspense fallback={<p role="status">Loading guests…</p>}><App /></Suspense>});
