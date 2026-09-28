---
name: airtable-capacity-studio
description: Design interactive Airtable team workload and assignment interfaces and write copy-ready Omni prompts. Use for balancing work, previewing reassignment, and managing capacity; individual task motivation belongs in Momentum Studio and code refinement in Omni Refiner.
---

# Capacity Studio

Help a lead decide where work belongs and see what a change would do before saving it. The default output is a custom-interface design and prompt for manual use in Omni.

## Establish the decision and data

Accept a Scout recommendation or direct brief, plus the native baseline if available. Identify the planning window, team, assignment semantics, status rules, effort unit, availability, and treatment of shared tasks. Use supplied or authorized schema evidence. Do not force a full discovery/audit when the brief is sufficient.

Define workload over the same window as availability. State whether the estimate means remaining effort or original effort; avoid counting the same shared task fully against every person without an explicit allocation rule. Capacity is available time after agreed exclusions such as leave and other commitments. Only calculate utilization when comparable effort and availability exist; label zero capacity and unestimated work separately.

When estimates or availability are absent, offer counts of open/overdue/blocked tasks, unassigned work, and visible unknowns. Counts describe queue size, not comparable effort or a defensible utilization percentage. Do not invent missing estimates, rank people's productivity, or disguise an even task count as a balanced workload.

## Make decisions interactive

Choose a clear visual direction with strong hierarchy and readable density. Useful interactions include a time-window switch, person cards that open their queue, an unassigned tray, and a reassignment preview showing before/after workload. A team goal or blocker-clearing milestone can provide cooperative progress; avoid default competitive rankings.

Define each main action: **trigger → record/field write → pending state → confirmed success → error/recovery → permission behavior**. Separate a what-if preview from a persisted assignment. Drag-and-drop must have an equivalent keyboard-accessible selection/menu flow. Define cancel and explicit apply behavior. Recheck the latest assignment before applying a stale preview; if it changed, show the conflict and refresh the proposal instead of silently overwriting it. Do not promise transactional multi-record swaps without verified platform support.

Capacity is recalculated from persisted assignments after saving. Show pending changes distinctly and roll back failed previews. Progress is derived from eligible records, so repeated completion or reassignment cannot accumulate rewards; reopening removes completed work from progress according to the agreed status/metadata rule. Preserve unrelated links when modifying a multi-assignee field according to the intended add/remove/replace operation.

Include empty, missing-input, no-permission, and failed-save states; text with color, visible focus, keyboard navigation, and reduced motion. Verify current platform support before promising mobile access.

## Deliver the design and Omni prompt

Return the concept, one end-to-end walkthrough, field mappings and missing inputs, a **copy-ready prompt**, small optional follow-up prompts, and acceptance checks. The prompt explicitly requests an **AI-generated custom interface element** with the target page/data, interactions, and calculation definitions. Essential constraints belong inside the prompt, not only outside it. Map to verified fields; label unresolved mappings as prerequisites. Avoid creating schema unless needed and authorized.

For the three-version demo, keep the same business task, essential fields, and fictional records as V1. Preserve V1 and generate V2 separately. Use richer interaction instructions without disparaging the useful native version or describing this as a controlled model benchmark.

Stop with the prompt when the presenter is doing the build manually. A separately requested direct build requires an available tool route to the correct target; when absent, state the remaining manual step without claiming installation. Inspect errors and state before retrying a failed write; repeated failure without new evidence requires diagnosis.

## Optional continuation

Use **airtable-omni-refiner** for requested improvements to actual generated source, preserving V2 before returning changes to V3. Use **airtable-experience-lab** for requested review/testing and **airtable-base-check** for a material data gap. If unavailable, provide the plain-English handoff. These are instructions for the same assistant, not services calling each other.

Carry the goal/audience, authorization/deliverable, design and calculation definitions, verified schema evidence, version/source location, checks, and gaps. Distinguish prompt delivery, local code, returned code, and verified Airtable behavior. Reset the identified fictional record state between recorded takes with existing authorization; separate interface pages can share the same records.
