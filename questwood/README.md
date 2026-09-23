# Questwood source

`questwood-refined.tsx` is the refined v2.0 source snapshot dated September 23, 2026. The file is included unchanged.

## Runtime

Use this source inside an Airtable custom interface. It imports React, `@airtable/blocks/interface/ui`, `@airtable/blocks/interface/models`, and `@phosphor-icons/react`. It is not a standalone application or a complete dependency-locked project.

## Configure the data

The source exposes custom properties for these tables and fields:

| Table | Fields |
| --- | --- |
| Case Tasks | Name, Status, Responsible Role, Assigned Staff, Application, Internal Due At, Timing Alert, Notes, Done, Completed At |
| Staff | Staff Name, Role |

Point the custom properties at your own tables and fields. Make the required fields available in the element's Data panel.

The `CHOICE_IDS` constant contains the demo base's single-select choice IDs. Update it for your base. The code also tries the names `Open`, `In progress`, `Complete`, and `Paraprofessional` as fallbacks.

The Start, Complete, Reopen, and Undo controls write to the connected Airtable records. Try the code in a demo base and review permissions before using it with operational data.

## Review the behavior

- A completed task contributes 25 team XP. Player XP is shared among linked eligible staff.
- Reopening changes the score calculated from the task's current status.
- Check the task controls, saved status, completion timestamp, scores, leaderboard, garden rewards, and refresh behavior in your own setup.
- The source stores the current browser's change history in local storage for its Undo controls. Review that behavior for shared devices and sensitive workflows.

This package preserves the supplied source. Packaging checks do not establish that it is deployed or fully validated in your Airtable environment.

See the [original build prompt](../prompts/questwood-original-omni-prompt.txt) and the [refiner skill](../skills/airtable-omni-refiner/).
