---
name: airtable-omni-refiner
description: Refine, debug, or extend existing Airtable Omni custom-interface source and guide its return to Airtable. Use when generated code or a reproducible interface bug is supplied, including a Studio handoff; use a Studio for initial design and prompting rather than triggering this skill on every mention of Omni.
---

# Omni Refiner

Improve the supplied interface source against the user's requested behavior. Works standalone or after Momentum Studio/Capacity Studio. Based on [Noam Say / Airmakers' original skill](https://github.com/noamsay/airtable-omni-refiner), with local compatibility and workflow revisions.

## Establish the target

Read the actual source, package/lockfile when available, relevant schema or custom-property mappings, the reported behavior, and the requested change. Do not assume a particular file layout or Omni limitation. If only a screenshot or design exists, diagnose what can be seen and request the source before claiming a code refinement. Do not manufacture a supposedly exported file.

Distinguish Interface Extensions (`@airtable/blocks/interface/ui`) from Base Extensions. Verify uncertain calls against the target package's declarations and official documentation. The reference target here is `@airtable/blocks@0.0.0-experimental-8575f0e0d-20260428`; the user's project may differ. Read [SDK patterns](reference/sdk-patterns.md) for compatibility-sensitive work.

Use the user's existing authorization. A request to fix supplied code authorizes relevant local edits; do not repeatedly ask permission for those edits. Report material unrelated findings separately rather than expanding the refactor. Interface publication and record/schema changes depend on the actual requested scope, not the fact that this skill was invoked.

## Refine the requested behavior

Describe the concrete problem and intended behavior, then make the smallest useful change. Keep the business job, valid interactions, and verified mappings. For larger requests, sequence structural changes, interaction logic, and visual polish so each can be checked. Read only the references needed:

- [SDK patterns](reference/sdk-patterns.md): hook signatures, configuration, permissions, persistence, and state.
- [Field types](reference/field-types.md): read/write formats and array changes.
- [Transformations](reference/transformations.md): circular layouts, drag/drop, optimistic UI, batching, personalization, and responsive controls.
- [Coding standards](reference/coding-standards.md): focused code checks and acceptance tests.

Use configurable table/field mappings where useful; verified IDs can provide defaults or support an intentionally fixed base. Validate the field belongs to the selected table and has the required type. A missing/excluded field needs a useful configuration message. Keep hooks unconditional within each component; put table/schema guards in a parent before mounting data-hook children.

For every mutation define the payload, permissions, pending feedback, confirmed success, error handling, and recovery. Awaiting a save does not freeze React; a clear pending state is often sufficient. Use optimistic state only when the interaction benefits from it. Roll it back on failure and retire overrides when live records acknowledge the change; handle deletion, conflict, and timeout rather than masking collaborators' edits indefinitely. No completion rewards before persistence. Repeated and reopened work must follow the Studio's progress rules.

## Return the code

Read [the source round trip](reference/source-round-trip.md) whenever changes must return to Airtable. For the three-version demo: preserve V2, obtain its actual source, refine a separate V3 copy, return changes through the supported browser editor or a verified deployment route, then render and check it. The presenter can perform every transfer manually. Never assume a local build command publishes into the selected element.

Deliver the changed files or patch, what changed and why, checks actually run, the exact remaining return step, and unresolved gaps. Label **source edited locally**, **returned to Airtable**, and **verified in Airtable** separately. If source return is unavailable, stop at the local artifact without claiming installation. Repeated failure with unchanged evidence calls for diagnosis of source version, schema, permissions, and the actual error before retrying.

For follow-up testing, pass Experience Lab the goal, authorization, interface/version/source location, schema evidence, expected record changes, acceptance checks, and gaps. It is the same assistant reading another skill's instructions, not an autonomous agent call. Do not launch a full review unless requested or needed to verify the change.

The [wedding seating examples](examples/README.md) illustrate selected patterns, not guaranteed output from Omni or a production deployment.
