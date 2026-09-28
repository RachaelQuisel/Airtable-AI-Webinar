# Airtable AI Webinar

Resources from Rachael Quisel's webinar, **Building an AI-assisted workflow with Omni in Airtable**.

I build three versions of a paraprofessional task dashboard, then use Claude to refine the custom interface code. The focus is building fun into the product and shipping something you've put your own creative stamp on.

## Webinar resources

| Resource | What it does |
| --- | --- |
| [Questwood source code](questwood/questwood-refined.tsx) | The refined custom task dashboard with XP, levels, a leaderboard, garden rewards, and task controls. |
| [Original Questwood Omni prompt](prompts/questwood-original-omni-prompt.txt) | The text prompt that built the first custom Questwood interface. |
| [Omni Prompt Generator](skills/omni-prompt/) (`omni-prompt`) | Turns rough ideas into specific prompts for Omni. |
| [Airtable Omni Custom Interface Refiner](skills/airtable-omni-refiner/) (`airtable-omni-refiner`) | Helps fix bugs, improve usability, and add interactions to Omni-generated interface code. |

## Consulting playbook: six skills

The [consulting skill index](skills/README.md) explains the sequence and how to use the complete folders.

| Skill | Role |
| --- | --- |
| [Workflow Scout](skills/airtable-workflow-scout/SKILL.md) | Understand the workflow, identify work to remove, and select an interface. |
| [Base Check](skills/airtable-base-check/SKILL.md) | Audit the schema, data quality, and automation evidence needed for the chosen workflow. |
| [Momentum Studio](skills/airtable-momentum-studio/SKILL.md) | Design an interactive individual task experience and write its Omni build prompt. |
| [Capacity Studio](skills/airtable-capacity-studio/SKILL.md) | Design team workload and assignment interactions and write their Omni build prompt. |
| [Omni Refiner](skills/airtable-omni-refiner/SKILL.md) | Improve actual generated source and guide its return to Airtable. |
| [Experience Lab](skills/airtable-experience-lab/SKILL.md) | Review or test the interface and compare observed behavior across versions. |

[Voice Align](skills/voice-align/SKILL.md) is a companion writing skill for clear narration and documentation. The public copy omits its private delivery integration.

For the three-version demo, use **Workflow Scout → native baseline → Momentum Studio → custom build → Omni Refiner → Experience Lab**. Capacity Studio covers team workload; Base Check supports relevant data/schema questions. The presenter can perform every prompt and source handoff manually.

## Speaker notes and videos

- [Download the speaker outline PDF](docs/airtable-webinar-speaker-outline.pdf)
- [Read the editable speaker outline](docs/speaker-outline.md)
- [Watch the six demo videos, in order](videos/README.md)

The PDF includes the 15-step outline, the full original Questwood prompt, and clickable links to the resources and videos. The videos are rough recordings hosted on Loom. Video files are not stored in this repository.

## Use these in your own setup

Download the repository with GitHub's **Code → Download ZIP** button, or clone it:

```sh
git clone https://github.com/RachaelQuisel/Airtable-AI-Webinar.git
```

You'll likely need to tweak the skills for your LLM and system. Keep each skill's supporting reference and example files with its `SKILL.md`. Adapt the installation path and invocation syntax to the assistant you're using.

The prompt uses the demo base ID and its field names. Change that configuration for your own base before asking Omni to build.

The code is an Airtable custom interface source file, not a standalone web app. It needs Airtable's Interface Extensions runtime and the configured tables and fields. See [Questwood setup notes](questwood/README.md) before using it.

## Build and review

Use the original prompt to create a custom interface with Omni. Use the refiner skill with the generated source code, review the output, and iterate with your feedback. The source file here is the refined v2.0 snapshot dated September 23, 2026; it is separate from the original build prompt.

AI-generated output still needs review and testing in your own base. Check the installed Airtable SDK before applying code patterns from a skill. For example, the bundled Interface Extension uses `useRecords(table)` and configures its data through Airtable's Data panel. Base Extension examples may use a different signature.

## Credits

The Airtable Omni Custom Interface Refiner is adapted from [Noam Say / Airmakers' airtable-omni-refiner](https://github.com/noamsay/airtable-omni-refiner). Its original README is preserved as `skills/airtable-omni-refiner/UPSTREAM-README.md`; the adapted skill includes updated examples and reference files. The upstream README identifies the skill as MIT licensed.

Workflow Scout, Base Check, Momentum Studio, Capacity Studio, Experience Lab, the Omni Prompt Generator, Questwood prompt, refined Questwood source, and webinar notes are shared here by Rachael Quisel. The upstream skill's license statement applies to that skill; it is not a repository-wide license declaration.
