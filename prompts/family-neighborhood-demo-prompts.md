# Family Neighborhood demo prompts

The five prompts behind the four-version demo, in order. Prompts 1 through 3 go to Claude,
which returns Omni prompts you paste into Airtable yourself. Prompts 4 and 5 go to Claude
with the downloaded custom-element source attached; those return React code you paste back
into Airtable's source editor.

Swap the base ID, table names, and field names for your own before using any of these.
The demo base ID below is not yours.

See the [recording script](../docs/recording-script.md) for the full walkthrough and the
[V3 source snapshot](../family-neighborhood/family-neighborhood-v3.tsx) for the end state.

## Prompt 1 — Workflow Scout recommends interfaces

Run first. Scout reads the base and returns up to three interface options, then pauses for your choice.

```text
Use the airtable-workflow-scout skill on my Demo base: https://airtable.com/appY3L5TcbLUcie6d. Show me up to three interface recommendations, then pause so I can choose one.
```

## Prompt 2 — Claude writes the native (V0) Omni prompt

Same conversation. Returns a copy-ready Omni prompt for a standard Interface Designer page. Paste the response into Omni yourself.

```text
I choose your paraprofessional task-tracking recommendation. Focus on helping staff see what their assigned families still need and record completed work, so open tasks and deadlines are visible. Write a short, copy-ready Omni prompt for a polished native Airtable interface called V0: Family Task Desk. Use the existing Case Tasks table and its real relationships. Standard Interface Designer components only, no custom element. Return only the prompt; I will paste it into Omni.
```

## Prompt 3 — Momentum Studio writes the custom (V1) Omni prompt

Same conversation. Returns the Omni prompt for the React custom element, plus checks to run after it builds.

```text
Use the airtable-momentum-studio skill to write a copy-ready Omni prompt for a separate React custom interface called V1: Family Neighborhood. Keep the paraprofessional task-tracking job we chose.

Make it a warm, cute, interactive neighborhood: one house per family on the selected staff member's caseload and a little car that drives between houses. Let me switch staff and open a house to see shared tasks and documents, each applicant's training separately, checkboxes, due dates, a way to attach documents, and personal progress. A small celebration can follow a verified completion. No leaderboard or staff competition.

Give me the Omni prompt and a few things to check after it builds. I will paste the prompt myself.
```

## Prompt 4 — Omni Refiner edits V1 into V2

Attach the V1 source you downloaded from Airtable's custom element menu. Returns editor-ready React source, not an Omni prompt.

```text
Use the airtable-omni-refiner skill to edit the V1 React source I attached for a separate V2 draft. Put the car on the road, ground the houses and trees, keep the neighborhood visible when the family panel opens, make that panel scroll, and add a clear My Progress area for the selected paraprofessional. Preserve the working family, task, document, and applicant interactions. Return complete editor-ready React source and a brief summary of the changes, not an Omni prompt.
```

## Prompt 5 — Omni Refiner edits V2 into V3

Attach the V2 source. Returns the editor-ready React source preserved as family-neighborhood-v3.tsx.

```text
Use the airtable-omni-refiner skill to edit the attached V2 React source for a separate V3 copy. Return revised React code, not a new Omni prompt.

Remove Next helpful stop and its unused logic. Restore the slight house expansion on hover, with visible keyboard focus and reduced-motion support. Add a clickable bush where a little cat or dog runs out, then resets; this is just for fun and changes no records.

Add a collapsible How this works guide. Explain the actual task-points rule, the selected person's progress goal, and the existing badge criteria from Airtable. Explain how timely tasks, documents, and training help the foster care organization track compliance work without claiming that a checkbox or upload proves approval. Keep the humor gentle and never make families or missed requirements the joke. Preserve V2's layout and working data actions. Return complete editor-ready source and a short change list.
```
