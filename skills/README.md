# Airtable consulting skills

Six skills for moving from workflow discovery to an interactive Airtable interface and verified improvements.

| Skill | Use it to |
| --- | --- |
| [Workflow Scout](airtable-workflow-scout/SKILL.md) | Understand the workflow, identify work to remove, and select an interface. |
| [Base Check](airtable-base-check/SKILL.md) | Audit the schema, data quality, and automation evidence needed for the chosen workflow. |
| [Momentum Studio](airtable-momentum-studio/SKILL.md) | Design an interactive individual task experience and write its Omni build prompt. |
| [Capacity Studio](airtable-capacity-studio/SKILL.md) | Design team workload and assignment interactions and write their Omni build prompt. |
| [Omni Refiner](airtable-omni-refiner/SKILL.md) | Improve actual generated source and guide its return to Airtable. |
| [Experience Lab](airtable-experience-lab/SKILL.md) | Review or test the interface and compare observed behavior across versions. |

## Companion writing skill

[Voice Align](voice-align/SKILL.md) helps turn a technical explanation or recording script into concise, plain English. This public copy includes the writing guidance. The local private installation has a client-specific delivery hook, which is intentionally excluded from this public repository.

## Use them together

For the three-version demo: **Workflow Scout → native-page prompt → Momentum Studio → custom Omni build → Omni Refiner → Experience Lab**. Use Capacity Studio instead of Momentum Studio for a team workload or assignment experience. Use Base Check when a relevant schema or data question needs investigation.

These are instructions for the same assistant, not independent agents or an automatic cross-app pipeline. You can manually copy a Studio's prompt into Omni, bring the generated source back to the assistant, and return the refined source to Airtable. The native baseline prompt is an output of the selected workflow, not a seventh consulting skill.

## Use the complete folders

Download or clone this repository and keep each folder intact, including its references, examples, and agent metadata. Use the skill-import or installation process supported by your chosen assistant. Loading a skill does not grant Airtable access; provide context or configure the appropriate connector separately.

A skill can be used on its own when the request supplies enough context. You do not need to run the entire suite for each change. Generated prompts, local source edits, changes applied to Airtable, and verified results are different states.

The existing [Omni Prompt Generator](omni-prompt/SKILL.md) is also available as a separate prompting aid.

## Attribution

Omni Refiner is adapted from [Noam Say / Airmakers](https://github.com/noamsay/airtable-omni-refiner); see its [README](airtable-omni-refiner/README.md) and [archived upstream README](airtable-omni-refiner/UPSTREAM-README.md) for provenance and the original license statement. The other five consulting skills are shared by Rachael Quisel. No new repository-wide license is declared here.
