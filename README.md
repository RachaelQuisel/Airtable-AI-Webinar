# Airtable AI Webinar

Resources from Rachael Quisel's webinar, **Building an AI-assisted workflow with Omni in Airtable**.

I take one real job — a paraprofessional tracking case tasks for the families on their caseload —
and follow it through four versions of the same interface. A native Airtable page, then Omni's
first React custom element, then two passes where Claude edits that React source. The focus is
building fun into the product and shipping something you've put your own creative stamp on.

## Consulting playbook: six skills

The [consulting skill index](skills/README.md) explains the sequence and how to use the complete folders.

| Skill | Job |
| --- | --- |
| [Workflow Scout](skills/airtable-workflow-scout/SKILL.md) | Understand the work and recommend up to three interfaces. |
| [Momentum Studio](skills/airtable-momentum-studio/SKILL.md) | Design an individual's interactive workflow and write the Omni prompt. |
| [Capacity Studio](skills/airtable-capacity-studio/SKILL.md) | Design team workload and assignment experiences. |
| [Omni Refiner](skills/airtable-omni-refiner/SKILL.md) | Edit exported custom-interface source. This is the adapted existing specialist. |
| [Experience Lab](skills/airtable-experience-lab/SKILL.md) | Test whether an interface helps someone complete the job. |
| [Base Check](skills/airtable-base-check/SKILL.md) | Check the data and schema when a build depends on them. |

[Voice Align](skills/voice-align/SKILL.md) is a companion writing skill for clear narration and
documentation. The public copy omits its private delivery integration. The earlier
[Omni Prompt Generator](skills/omni-prompt/SKILL.md) is still here as a separate prompting aid;
the two Studios now cover that job with more design structure.

For this demo the sequence is **Workflow Scout → native baseline → Momentum Studio → custom build
→ Omni Refiner**. Capacity Studio covers team workload; Base Check supports data and schema
questions; Experience Lab checks whether the result actually works. These are instructions for the
same assistant, not independent agents. Every prompt and source handoff is performed manually.

## The demo

| Resource | What it is |
| --- | --- |
| [Family Neighborhood V3 source](family-neighborhood/family-neighborhood-v3.tsx) | The shipped React custom interface: one house per family, a car on the road, tasks, documents, training progress, badges, and a "How this works" guide. |
| [Family Neighborhood setup notes](family-neighborhood/README.md) | Which tables to connect and the 48 demo field IDs you have to remap first. Read this before reusing the source. |
| [The five demo prompts](prompts/family-neighborhood-demo-prompts.md) | Every prompt behind the four versions, in order, copy-ready. |
| [Recording script](docs/recording-script.md) | The full walkthrough with narration and the checks to run after each version. |
| [Demo video](videos/README.md) | The recording of all four versions. |

## Use these in your own setup

Download the repository with GitHub's **Code → Download ZIP** button, or clone it:

```sh
git clone https://github.com/RachaelQuisel/Airtable-AI-Webinar.git
```

Keep each skill folder intact, references, examples, and agent metadata included, and use the
skill-import process your assistant supports. You'll likely need to tweak the skills for your LLM
and system. Each skill ships an `agents/openai.yaml`, which is the Codex wiring — ignore it if
you're not using Codex. Loading a skill does not grant Airtable access; configure that separately.

The prompts use the demo base ID and its field names, and the V3 source resolves 48 fields by
literal demo field ID. Change that configuration for your own base before asking Omni to build or
pasting the source into an element. `getFieldIfExists` returns `undefined` instead of throwing, so
an unmapped base renders blank values rather than an obvious error.

## Build and review

Run Workflow Scout on your base and pick a recommendation. Let a Studio write the Omni prompt and
paste it into Omni yourself. When Omni has built the custom element, download its source from the
element menu, give that source to Omni Refiner with the change you want, and paste the returned
code back through **Edit source code**. Save, render, and check it before calling it done.

AI-generated output still needs review and testing in your own base. Check the installed Airtable
SDK before applying code patterns from a skill. The bundled Interface Extension source uses
`useRecords(table)` and configures its data through Airtable's Data panel; Base Extension examples
may use a different signature. Generated prompts, local source edits, changes applied to Airtable,
and verified results are different states.

## Credits

The Airtable Omni Custom Interface Refiner is adapted from
[Noam Say / Airmakers' airtable-omni-refiner](https://github.com/noamsay/airtable-omni-refiner).
Its original README is preserved as `skills/airtable-omni-refiner/UPSTREAM-README.md`; the adapted
skill includes updated examples and reference files. The upstream README identifies the skill as
MIT licensed.

Workflow Scout, Momentum Studio, Capacity Studio, Experience Lab, Base Check, Voice Align, the Omni
Prompt Generator, the Family Neighborhood source, the demo prompts, and the webinar notes are
shared here by Rachael Quisel. The upstream skill's license statement applies to that skill; it is
not a repository-wide license declaration.

## Earlier version

An earlier cut of this repository held the Questwood demo (a gamified task dashboard with XP,
levels, a leaderboard, and garden rewards), its original Omni prompt, the 15-step speaker outline,
and six Loom recordings. Those were replaced by the Family Neighborhood demo above and remain in
this repository's git history.
