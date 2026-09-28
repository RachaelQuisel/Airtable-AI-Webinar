# Airtable Omni Refiner

Refine existing Omni-generated interface source and guide its return to Airtable. Works standalone or after Momentum Studio and Capacity Studio. The primary workflow is in [SKILL.md](SKILL.md); conditional SDK, field, interaction, testing, and source-return guidance lives in `reference/`.

Install the complete folder in the personal skills directory of the intended host: `~/.codex/skills` for Codex or `~/.claude/skills` for Claude Code. Verify discovery in that host; filesystem installation is not proof of Claude.ai or Cowork availability. Follow the selected application's supported import process for other hosts.

Supply actual source, the desired change, relevant schema/configuration, and the target location. The skill returns changed source plus evidence and the remaining return step. For the demo, preserve V2 and return the refined source to V3. A local build is not live installation.

The [examples](examples/README.md) are educational fixtures, not a claim about every Omni build or a deployed app. Runtime behavior still needs verification in the selected element.

## Attribution

Adapted from [Noam Say / Airmakers](https://github.com/noamsay/airtable-omni-refiner). The original README attributed the skill to Noam Say and described it as MIT licensed. Local revisions reconcile SDK compatibility and the consulting/manual-demo workflow; no upstream publication is implied.

The [archived upstream README](UPSTREAM-README.md) preserves the original authorship and license statement. Historical local work plans are not included in this package.
