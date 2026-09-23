// examples/wedding-seating-before.jsx
//
// This is a realistic output from Airtable Omni when prompted with:
// "Create a custom interface for my wedding seating plan — 10 round tables
// of 8 seats, show guest photo and name on each occupied seat, VIP badge
// for VIPs, empty seats in gray."
//
// Notable gaps — all typical of Omni output, all covered by the refiner:
//   1. No <Suspense> boundary
//   2. useRecords has no `fields` option — loads everything
//   3. Field names (strings) instead of field IDs
//   4. getTableByName instead of getTableByIdIfExists
//   5. No null handling on getCellValue
//   6. No permission check before assuming writes would work
//   7. Seats placed via CSS grid, not in a circle
//   8. No drag & drop
//   9. No dark mode (every color class is light-only)
//  10. Hardcoded 10 tables / 8 seats as magic numbers, scattered

import {initializeBlock, useBase, useRecords} from '@airtable/blocks/interface/ui';
import React from 'react';

function App() {
    const base = useBase();
    const table = base.getTableByName('Guests');
    const records = useRecords(table);

    const seatedCount = records.filter(r =>
        r.getCellValue('Table Number') && r.getCellValue('Seat Number')
    ).length;

    return (
        <div className="p-6 bg-white min-h-screen">
            <header className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Seating Plan</h1>
                <div className="text-sm text-gray-600">{seatedCount} / 80 guests seated</div>
            </header>

            <div className="grid grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tableNum => (
                    <Table
                        key={tableNum}
                        tableNumber={tableNum}
                        guests={records.filter(r => r.getCellValue('Table Number') === tableNum)}
                    />
                ))}
            </div>
        </div>
    );
}

function Table({tableNumber, guests}) {
    const seats = [1, 2, 3, 4, 5, 6, 7, 8].map(seatNum => {
        const guest = guests.find(g => g.getCellValue('Seat Number') === seatNum);
        return {seatNum, guest};
    });

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center font-semibold mb-3">Table {tableNumber}</div>
            <div className="grid grid-cols-4 gap-2">
                {seats.map(({seatNum, guest}) => (
                    <Seat key={seatNum} seatNum={seatNum} guest={guest} />
                ))}
            </div>
        </div>
    );
}

function Seat({seatNum, guest}) {
    if (!guest) {
        return (
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                {seatNum}
            </div>
        );
    }

    const name = guest.getCellValue('Name');
    const photo = guest.getCellValue('Photo');
    const isVip = guest.getCellValue('VIP');
    const photoUrl = photo[0].url;

    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <img
                    src={photoUrl}
                    alt={name}
                    className="w-14 h-14 rounded-full object-cover"
                />
                {isVip && (
                    <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 rounded-full px-1">
                        VIP
                    </span>
                )}
            </div>
            <span className="text-xs mt-1 truncate max-w-[56px]">{name}</span>
        </div>
    );
}

initializeBlock({interface: () => <App />});
