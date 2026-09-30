# Illustrative Family Neighborhood fixture

This is a **fictional relationship example**, not a CSV import, a copy of the demo base, or a
complete Airtable schema. It shows how a small record set would connect after you create the nine
tables, choose appropriate field types, and replace the 48 IDs in the
[field map](field-map.md). All people and household labels below are invented.

| Table | Fictional record | Values and links relevant to the interface |
| --- | --- | --- |
| Staff | `S1` — Morgan Demo | Active; Case tasks → `T1`; Badges → `B1`; Points earned 0; Badge bonus 0; Total score 0; Goal 50. |
| Families | `F1` — Cedar Household | Applicants → `A1`; Case tasks → `T1`. |
| Case tasks | `T1` — Schedule an orientation | Status Open; Done false; Internal due date October 15, 2026; Points 5; Assigned staff → `S1`; Application → `F1`; Documents → `D1`. |
| Applicants | `A1` — Demo Applicant | Required modules 1; Completed modules 0; Requirements → `R1`; Certificates → `C1`. |
| Requirements | `R1` | Module → `M1`; Completion result not Complete; Integrity warning OK. |
| Modules | `M1` — Introduction | Code `M1`; Sequence 1. |
| Certificates | `C1` | PDF and submission date empty while the example is still in progress. |
| Documents | `D1` — Orientation checklist | Linked from `T1`; PDF empty; review and parsing values depend on your own workflow. |
| Badges | `B1` — First Steps | Active; category Milestone; an example criterion explained in the Airtable record. |

The visible caseload depends on **both** the Staff → Case tasks link and the task's Application →
Families link. The family panel also reads Families → Case tasks, while each task's Assigned staff
link decides whether it belongs to the selected person. Keep those relationships consistent or a
house may appear with missing tasks.

For a safe trial, use a separate demo base and disposable records. Remap the field IDs and default
Staff record ID, configure all tables in the element Data panel, then check the task control with
write permission and refresh the page to confirm the saved value. Add actual attachment examples
only when you are comfortable making those files visible to everyone with access to that base.
