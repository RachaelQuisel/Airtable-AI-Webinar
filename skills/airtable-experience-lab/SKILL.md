---
name: airtable-experience-lab
description: Review or test an Airtable interface against a real user task, including native/custom/refined comparisons. Use to assess interaction quality and persistence with Pass, Fail, or Not tested evidence; a design critique alone does not establish working behavior.
---

# Experience Lab

Determine whether the interface helps someone finish the intended work. Make the next correction clear and distinguish attractive design from reliable behavior.

## Choose the evidence mode

- **Design review:** use prompts, screenshots, recordings, or specifications. Evaluate clarity, interaction design, and expected behavior; runtime checks remain Not tested.
- **Executed testing:** interact with the authorized interface and verify resulting record state, or analyze supplied test evidence. Identify who ran a test and where/when it was observed. A presenter's account is presenter-reported evidence, not an assistant-executed test.

Use the user's requested depth. Do not require the whole consulting suite for an ordinary lookup or small review. Record the goal, role, target/version, source or page, relevant schema, starting state, and permitted test actions. Use authorized synthetic records for demonstrations; do not modify client records just to make a recording convincing.

## Test the work

Walk through **find → decide → act → confirm → recover**. Evaluate information hierarchy, useful next actions, interaction feedback, empty/missing-data states, keyboard access, focus, contrast, and reduced motion as relevant. A tooltip or animation is not a substitute for an actionable control.

For a state-changing action check the intended record/field write, pending state, exact success condition, and failure recovery. Verify persistence after refresh. Check repeated submission, reopened work, no permission, and stale/concurrent data where the change warrants it. Do not invent measurements or cause a production failure to obtain a screenshot. If a test cannot be performed, state what evidence is missing.

If a celebration succeeds but the record write fails, the completion behavior is **Fail**. Specify restoring the prior visible state, removing any reward, showing a readable error, and offering a safe recovery/retry path. For uncertain writes, inspect saved state before retrying an operation that might duplicate or reverse work.

## Compare versions fairly

For the webinar compare **V1: Native**, **V2: Custom**, **V3: Refined custom** using the same role, job, records, fields, and initial state. Preserve V1 and V2 source/pages. Separate pages can share data: reset only the identified synthetic records and completion metadata to the authorized baseline between takes, then verify derived progress.

Record the actual prompts and code changes. V2 receives richer design instructions and V3 receives a refinement pass; this is an iterative design demonstration, not a controlled model benchmark. Describe what works in V1 and only claim improvements observed in the comparison. Count clicks or elapsed time only when measured using a stated start/stop rule. Keep rendering time separate from task time if it matters.

## Return evidence and a useful next step

Report **criterion | version | Pass / Fail / Not tested | evidence and source | next action**. Use Pass only for a criterion supported by the given evidence: a design criterion can pass design review while its runtime equivalent remains Not tested. Identify the highest-impact issue and the smallest correction. Avoid an overall numerical score that conceals failed persistence.

When follow-up is requested, route design/interaction issues to **Momentum Studio** or **Capacity Studio**, implementation defects in actual source to **Omni Refiner**, and data/model uncertainty to **Base Check**. Pass the goal, authorization, target/source, verified mappings, reproduction, expected/actual outcome, checks, and gaps. Read the relevant installed skill; if absent, provide a plain-English handoff. Skills are instructions for the same assistant, not independent agents.

After a correction, retest the affected behavior. Keep the earlier failure and later evidence distinguishable. If the same failure recurs without new evidence, diagnose the cause before another attempt. Close with what is verified and what still needs a manual check; local test success does not establish a saved or published Airtable interface.
