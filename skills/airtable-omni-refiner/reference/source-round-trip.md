# Source round trip: V2 to V3

Use this when refined code needs to return to the actual Airtable element. [Airtable documents source download/browser editing, History, and page duplication](https://support.airtable.com/articles/6845086569-ai-generated-interface-elements-in-airtable). Controls vary with access and page state; verify them in the target before recording.

1. Identify the base, interface/page, custom element, and source version. Preserve V1 and V2; duplicate the custom page for V3 and confirm the target. Duplication forks element code but may still share the underlying records.
2. Save a recoverable V2 source copy plus the package/lockfile if available. Record where it came from. The presenter may download/copy it and attach it manually.
3. Refine the actual source locally. Return changed files/patch and checks, keeping required Data-panel tables/fields and custom properties documented.
4. The presenter returns the edits to **V3** through the source editor, or the assistant uses a separately requested and verified deployment route. Do not assume a generic CLI deploy can target this element. Confirm the saved code/version and errors; a local file or build is not installation.
5. Render V3 in Airtable. Perform the chosen task and inspect its record change, then refresh. Test failure/permission behavior where feasible. Record what was observed; publish only within the user's requested scope.
6. If source editing or return access is missing, deliver the patch with the exact remaining manual step and label it **local only**. Diagnose repeated failures before trying again. Recover using the saved source/History in the intended copy; do not overwrite V2 to rescue V3.

For a recording, reset only the identified synthetic task records and completion metadata to the authorized baseline between takes. Verify progress after reset. Show the same job in each version and attribute differences to the design/refinement actually shown.

Return: target/version; source origin; changed files; local checks; source return status; Airtable observations; remaining steps. Skills guide the assistant; the presenter owns manual transfers. No autonomous cross-app agent coordination is required.
