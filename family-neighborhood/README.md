# Family Neighborhood source (V3)

`family-neighborhood-v3.tsx` is the V3 snapshot of the Airtable custom interface built during
the demo, dated September 28, 2026. It is the end state of the four-version walkthrough:
Omni generated V1, and two Omni Refiner passes produced V2 and V3.

The interface shows one house per family on the selected paraprofessional's caseload, with a
car that drives the road between them. Opening a house shows that family's shared tasks and
documents, each applicant's training progress, due dates, and the staff member's own progress.
A small celebration follows a verified completion. There is no leaderboard.

## Runtime

This is an Airtable **Interface Extension** source file, not a standalone web app. It imports
React, `@airtable/blocks/interface/ui`, `@airtable/blocks/interface/models`,
`@phosphor-icons/react`, and `canvas-confetti`. It needs Airtable's Interface Extensions
runtime and configured tables and fields. It is not a dependency-locked project.

To use it, open a custom interface element in Airtable, choose **Edit source code**, replace
the source, and save.

## Configure the data

The source exposes custom properties for nine tables:

| Custom property | Table |
| --- | --- |
| `staffTable` | Staff |
| `familiesTable` | Families |
| `caseTasksTable` | Case tasks |
| `applicantsTable` | Applicants |
| `requirementsTable` | Requirements |
| `modulesTable` | Modules |
| `certificatesTable` | Certificates |
| `documentsTable` | Documents |
| `badgesTable` | Badges |

Point those custom properties at your own tables and make the required fields available in the
element's Data panel.

## Remap the hardcoded IDs before reuse

**This is the main porting cost.** The source resolves fields by literal Airtable field ID via
`getFieldIfExists('fld…')`, not by name. It contains **48 distinct field IDs from the demo base**,
distributed roughly as:

| Table | Field IDs referenced |
| --- | --- |
| Case tasks | 18 |
| Staff | 10 |
| Applicants | 6 |
| Families | 4 |
| Documents | 4 |
| Badges | 4 |
| Requirements | 3 |
| Modules | 3 |
| Certificates | 3 |

There are also two named constants to change:

- `DEFAULT_STAFF_RECORD_ID` — a demo Staff record ID used as the initial selection.
- `TASK_POINTS_FIELD_ID` — the Case tasks points field.

In another base every one of those IDs resolves to nothing. `getFieldIfExists` returns
`undefined` rather than throwing, so the interface will render with blank or zero values
instead of an obvious error. Expect to do the remapping deliberately and verify each panel.

## Review the behavior

- Task completion writes to the connected Airtable records. Review permissions before pointing
  this at operational data.
- Points, progress goals, and badge criteria read from Airtable fields. The collapsible
  **How this works** guide explains the rules that are actually in the data.
- V3 removed the "Next helpful stop" feature, restored the house hover expansion with keyboard
  focus and reduced-motion support, and added a clickable bush that runs a cat or dog out. The
  bush changes no records.
- Check the task controls, saved status, completion timestamp, progress, badges, and refresh
  behavior in your own setup.

Recording it here preserves the supplied source. It does not establish that the file is
deployed or validated in your Airtable environment.

See the [demo prompts](../prompts/family-neighborhood-demo-prompts.md) that produced it and the
[Omni Refiner skill](../skills/airtable-omni-refiner/) that edited it.
