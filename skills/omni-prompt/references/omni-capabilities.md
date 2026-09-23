# Airtable Omni AI — Capabilities & Limitations

## What Omni Can Do
- Create interfaces (dashboard pages, record detail pages, form pages)
- Add fields to existing tables (all standard field types)
- Build automations (triggers, conditions, actions)
- Generate AI-powered custom interface elements (charts, dashboards, interactive tools)
- Create records, modify data
- Pull data from multiple tables in a single custom element

## What Omni Cannot Do
- Create views (grid views, kanban views, gallery views, etc.) — known limitation
- Set conditional visibility rules on standard interface elements (e.g., "show field X only if field Y = Z")
- Handle complex multi-step external API integrations
- Create new linked records from a form inside an AI-generated interface element
- Render AI-generated interface elements on mobile devices
- Reuse AI-generated interface elements across multiple pages
- Store credentials securely in custom elements

## Prompting Rules

### Prefer Existing Fields
Omni prompts should use existing table fields whenever possible. Only ask Omni to create a field if no existing field can serve the purpose. If fields are missing, flag them as a prerequisite for the user to add manually before running the prompts — unless the user says otherwise.

### Incremental Over Monolithic
Omni works better with a sequence of focused prompts than one massive ask. Break interface builds into:
1. First page with layout, fields, filters
2. Additional pages
3. Refinements (color coding, forms, grouping)

### Use Airtable Terminology
| Say This | Not This |
|---|---|
| single select field | dropdown |
| linked record field | relationship / foreign key |
| multiple select field | multi-dropdown / tags field |
| checkbox field | boolean / toggle |
| single line text field | text input |
| collaborator field | user field / assignee |
| interface | dashboard / app |
| record | row |
| field | column |

### Filter Elements Over Custom AI Filtering
Standard filter elements on dashboard pages are more reliable than baking filters into AI-generated custom elements. Prefer: "Add a filter element connected to the grid" over "Make the grid only show records where..."

### Fields First
For existing bases, add fields manually before asking Omni to build the interface. This avoids:
- Omni creating fields with unexpected names
- Naming conflicts with existing fields
- Breaking existing automations that reference field names

### Version History
Omni supports "Undo that" and has a Revert button next to each message. Encourage iterating freely — low risk.

## Credit Considerations
All users get 500 free Omni credits/month. Complex tasks consume more credits:
- Simple field creation: ~1 credit
- Blog post generation: ~15 credits
- Custom interface element: varies by complexity

## Sources
- support.airtable.com/docs/using-omni-ai-in-airtable
- support.airtable.com/docs/ai-generated-interface-elements-in-airtable
- community.airtable.com (Omni forums, Max Bernstein prompt builder)
- gapconsulting.io/blog/custom-interfaces-with-omni-vibe-coding-in-airtable
