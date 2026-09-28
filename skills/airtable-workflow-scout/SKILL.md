---
name: airtable-workflow-scout
description: Understand an Airtable business workflow, identify work to remove, and recommend up to three useful interfaces. Use for consulting discovery or deciding which interface to build; ordinary record lookups do not require this process.
---

# Workflow Scout

Explain the business and its work before recommending a build. The deliverable is a decision about what would help people, not a catalog of dashboards.

## Discover the work

Use supplied context first. When base inspection is requested, discover the available Airtable connector or CLI tools and inspect only the relevant schema and records. If using `airtable-mcp`, read its skill and run `tools --json` before assuming commands. For structured filters, use the installed Airtable filters guidance. A schema shows structure, not why a business operates that way. Label evidence, inference, and questions separately. Do not infer meanings from status names alone.

Describe who receives work, its trigger, the steps and handoffs, the completion condition, and who makes decisions. Distinguish required controls from habitual approvals. Ask a focused question only when the answer changes the recommendation; otherwise state a provisional assumption and continue.

Look for duplicate entry, waiting, redundant review, missing ownership, and unnecessary handoffs. Consider removing or simplifying work before automating it. Explain the tradeoff when a step provides accountability or serves a requirement. Discovery authorizes analysis, not schema changes, automation edits, or interface publication.

## Recommend a small set

Return:

1. A short account of the business and a trigger → work → decision → outcome workflow map.
2. The most consequential friction and the operational improvement that addresses it, with evidence and uncertainty.
3. **Up to three interface candidates**, each with audience, job to finish, required data, a useful interaction, and a reason to prioritize it. Recommend one first. If no new interface is justified, say so.

An interaction should help someone act: select the next task, resolve a blocker, preview a reassignment, or see progress after saving. A chart alone is not a daily workflow. Do not impose points, a fantasy theme, or employee rankings. Tie any progress feedback to meaningful work.

## Continue only as requested

- For an individual task experience, hand the selected candidate to **Momentum Studio** (`airtable-momentum-studio`).
- For team assignment and capacity, use **Capacity Studio** (`airtable-capacity-studio`).
- For unresolved schema or data evidence that affects the chosen design, use **Base Check** (`airtable-base-check`). Do not run a full audit as a prerequisite to every prompt.
- If the user asks for the ordinary baseline prompt, explicitly request a **native Airtable Interface Designer page using standard components**. Include the selected job, actual fields, filters, and actions. Avoid requesting a custom element by accident.

These are instructions the same assistant reads when the next task is requested, not separate agents or automatic API calls. If a skill is absent, return the same plain-English handoff.

Carry forward the goal, chosen candidate, deliverable/authorization, verified schema mappings and their source, interface/version/source location when available, acceptance checks, and gaps. For a comparison demo, keep the same fictional task and data across native, custom, and refined versions. Return recommendations or the requested prompt; do not operate Omni when the presenter intends to paste it manually.
