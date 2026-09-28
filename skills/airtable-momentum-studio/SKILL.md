---
name: airtable-momentum-studio
description: Design engaging Airtable custom interfaces for individual daily work and produce copy-ready Omni prompts. Use for task focus, meaningful progress, and interactive completion flows; team capacity belongs in Capacity Studio, and existing source-code changes belong in Omni Refiner.
---

# Momentum Studio

Turn a chosen workflow into an experience that makes the next action clear and finishing work satisfying. The default deliverable is a design and an Omni prompt for the user to paste manually.

## Ground the design

Accept a Workflow Scout recommendation or a direct brief. Identify the user, job, completion definition, actual fields, and existing native interface if supplied. Use available schema evidence; label unverified mappings and ask only for information that materially changes the design. Do not require Scout or Base Check for a sufficiently clear request.

Preserve the native baseline's business goal and essential data. A custom interface is a richer design, not proof that a different model is better. Keep V1 intact and create V2 separately for a comparison.

## Design interactions, not decoration

Choose a coherent visual direction appropriate to the client's work: strong hierarchy, readable type, deliberate color, and visible focus. Give the user an actionable starting point and a satisfying return after each action. Useful patterns include a focused next-task card, an expandable checklist, a blocker/help action, a completion trail, and an optional progress celebration. Select a few that support the job; do not add every pattern.

Use meaningful, cooperative progress. Explain the count's eligible set and completion rule. Do not invent productivity scores or default to leaderboards, streak penalties, or a game theme. If points are requested, define what earns them, why that behavior matters, and how duplicates/reversals work.

For each key interaction specify **trigger → exact record/field change → pending feedback → confirmed success → failure/recovery → permission behavior**. Mark local filters and expanded panels as UI-only actions. Completion must persist in Airtable before success rewards appear. Derive progress from current eligible records; do not increment an unbounded local counter. Block repeated submissions while saving. Reopening removes the task from completed progress and follows an explicit completion-metadata rule. Do not promise cross-user idempotency for a separate rewards ledger without a supported reconciliation design.

Provide keyboard-operable buttons as alternatives to gestures; visible focus, text alongside color, accessible error/status messages, and reduced-motion behavior. Narrow desktop layouts are not evidence of Airtable mobile support. Check current Airtable documentation before promising a particular platform or capability.

## Deliver a prompt someone can use

Return a short concept and walkthrough, data mappings/prerequisites, a **copy-ready Omni prompt**, optional small follow-up prompts, and acceptance checks. Embed essential mappings and behavior in the prompt itself, not only in surrounding explanation. Use exact verified names/IDs when known; unresolved fields are labeled prerequisites, never fabricated. Avoid unnecessary schema additions.

The main prompt must explicitly request an **AI-generated custom interface element**, identify the target page and data, describe the layout and state-changing interactions, and preserve the baseline when relevant. Tell Omni to use existing fields and call out any required schema changes before implementing them. Stage additional interactions after a functional first build. Do not impose an arbitrary prompt word limit.

For a manual prompt request, stop after delivery. Do not open Omni, mutate the base, or claim an interface was built. If direct implementation is separately requested, inspect available access and the exact destination first. Without a working route, return the prompt and the specific remaining manual step; do not call it installed.

## Optional continuation

When actual V2 source exists and code improvement is requested, read **airtable-omni-refiner** if available. Preserve V2, refine a separate V3 copy, and include the source return route. For requested design review or behavior testing, use **airtable-experience-lab**. One assistant reads these instructions; there is no autonomous call chain.

Pass goal/audience, authorization/deliverable, design, verified schema evidence, version/source location, acceptance checks, and gaps. Report prompt delivered, source changed locally, returned to Airtable, and verified as separate states. For recorded comparisons, reset only the identified fictional records and completion metadata to the same authorized starting state before each take; separate pages may share records.
