# Before / after examples

The before file is an intentionally flawed educational fixture; it is not a recorded Omni output. The after file retains circular seating, an unseated list, moves/swaps, stable hooks, safe display, missing-field handling, and theme support. It adds keyboard assignment, actual-payload permission checks, pending/error feedback, and acknowledgement-based unlocking. It deliberately uses pending saves rather than optimistic seating; optional optimistic behavior is described in the SDK and transformation references.

Map the illustrative IDs to verified tables/fields before use and expose those fields in the element Data panel. No options argument is passed to Interface `useRecords`. The smaller example focuses on assignment and omits the earlier photo/VIP decorations; those are optional T6 work, not prerequisites for a safe move.

`planMove` and `saveMove` can be tested with fixture rows/a mocked table. A passing local test does not establish Airtable rendering, permissions, transactional swaps, or concurrent editing. A client lock only serializes actions in one mounted view. Validate concurrency for the real business use case.

To refine your own code, provide the actual source and requested change; do not substitute this fixture for an export. Preserve V2 and follow [the source round trip](../reference/source-round-trip.md) when preparing V3.
