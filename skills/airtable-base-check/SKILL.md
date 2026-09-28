---
name: airtable-base-check
description: Audit the schema, data quality, and automation evidence relevant to an Airtable workflow. Use before a consequential build or to diagnose unreliable data; distinguishes observed findings from unavailable run history and does not authorize repairs.
---

# Base Check

Determine whether the data and workflow can support the requested experience. Scope the review to the business job; do not redesign an entire base because one interface needs a field.

## Gather evidence

Use provided schema, records, scripts, and logs, or inspect the authorized base with an available connector/CLI/API. Discover tools rather than assume names or arguments; use the installed Airtable CLI and filters guidance when applicable. Never retrieve credentials from conversation history or print tokens. A missing tool is not proof that no automations exist.

Record the base/table or supplied file, inspection date, record coverage, and accessible automation evidence. Label a sample as a sample. For a full-count claim, paginate or use a verified aggregate; state unexamined records. Distinguish:

- Schema/configuration inspected.
- Data sampled or exhaustively checked.
- Automation source inspected.
- Deployed configuration inspected.
- Run history or downstream outcomes verified.

If run history is unavailable, automation health is **unknown** even when the source looks sound. A local script is not evidence of its deployed version. A success log is not proof of the intended downstream change.

## Inspect what affects the job

Check relationships and ownership; duplicate entry and fields; missing or invalid values; calculated fields that should replace copied values; formula errors; orphaned records; status and naming inconsistencies. Use actual business definitions for duplicates and completion. A similarly named record alone is not a duplicate.

For relevant automations, inspect triggers, field dependencies, repeated-event handling, failure visibility, competing writes, and recoverability to the extent evidence allows. Separate confirmed faults, plausible risks, and missing evidence. Explain dependencies and tradeoffs before suggesting changes to schema or controls.

## Return actionable findings

Give a concise readiness assessment followed by findings with **evidence/coverage → operational impact → smallest useful correction → dependencies/tradeoff → verification**. Prioritize issues that would make an interface misleading, such as stale completion fields or unknown effort estimates. Supply the chosen Studio or Refiner with verified table/field IDs, types, select choices, writable/computed status, and unresolved mappings as needed. Do not invent IDs to fill a handoff.

An audit ends with recommendations. If repairs are separately requested, use the user's existing authorization and identify the precise target and change; do not treat an audit as permission to delete fields, alter records, or publish automations. After a repeated failure without new evidence, stop retrying and diagnose schema, permissions, configuration, and the reported error.

Report the state honestly: inspected, recommended, changed locally, applied, or verified in Airtable. Carry the goal, authorization, source locations, findings, acceptance checks, and gaps into the next skill only when follow-up is requested. A simple record lookup should use the ordinary Airtable tool directly rather than launch this audit.
