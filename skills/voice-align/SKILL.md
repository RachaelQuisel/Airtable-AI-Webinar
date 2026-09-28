---
name: voice-align
description: Rewrite or review content for clarity, concision, and plain English. Use when the user invokes /voice-align or says "make this make sense," "make this more concise," "use normal plain English," "write this for my team," or "tell me what is useful or unnecessary." Also use for automation and process explanations that need triggers, inputs, complete steps, and outputs. Do not use this skill by itself to imitate Rachael's personal voice.
---

# Voice Align

Make the content easy to understand on the first read. Preserve its meaning. Match the requested format.

## Scope

- Own clarity, concision, structure, and plain English.
- Use for explanations, reviews, requirements, process documents, and automation documents.
- Do not use personal writing samples to decide what is clear.
- Use `humanizing` when the user asks for writing that sounds like Rachael.

## Follow this order

1. Follow the user's instructions for the current task.
2. Preserve every material fact from the source.
3. Apply the rules in this skill.
4. Preserve exact names, labels, commands, code, and identifiers.

Label a required fact as unknown when the source does not provide it. Do not guess.

## Rewrite the content

- Identify the reader.
- Identify what the reader needs to know or do.
- Start with the first useful point.
- Use common words.
- Use complete sentences.
- Put one idea in each sentence.
- Use one clause per sentence.
- Add another clause only when splitting it would change the meaning.
- Keep sentences short without making them fragments.
- Do not use metaphors or analogies.
- Do not use em dashes.
- Avoid shortened terms.
- Use the full term unless the shortened form identifies a product, field, or source.
- Define a required shortened form once.
- Explain an unavoidable technical term at first use.
- Keep each fact in one place.
- Remove previews, recaps, and summary sentences.
- Remove broad claims that repeat specific facts.
- Correct spelling and grammar.
- End after the last useful point.

## Remove filler

Delete openings such as:

- "I wanted to explain..."
- "It is important to note..."
- "In order to..."
- "As mentioned above..."
- "In summary..."

Delete any phrase that does not add a fact, instruction, decision, condition, or useful tone.

## Choose the structure

- Use bullets for processes, explanations, requirements, and reviews.
- Use numbered bullets when order matters.
- Use complete sentences in explanatory bullets.
- Preserve the requested format for emails, messages, and documents.
- Add a section only when it helps the reader find distinct information.
- Combine overlapping sections.
- Do not repeat a fact to make each section feel complete.

## Explain an automation or process

Use these sections:

- **Trigger:** State the event that starts the automation.
- **Inputs:** List the information the automation reads or receives.
- **What happens:** List every action in order. State each condition before its result.
- **Outputs:** List what the automation creates, changes, sends, or records.

Do not add an overview. Do not add a closing summary. Do not repeat the trigger or outputs in the steps unless the sequence requires it.

## Review content

Use these labels only when the user asks for an evaluation:

- **Keep:** The content is clear and necessary.
- **Change:** The content is confusing, vague, or hard to use.
- **Remove:** The content repeats another point or adds no useful information.

Omit an empty label. Do not invent an issue to fill a category.

Suggest a change only when it improves meaning, accuracy, or usability. Identify the issue once. Suggest one change.

Return revised content instead of a critique unless the user asks for feedback.

## Work with Humanizing

Use both skills only when the user invokes both.

1. Apply `voice-align` first.
2. Apply `humanizing` second.
3. Keep every `voice-align` rule in place.

`humanizing` may add first person, contractions, brief warmth, or a direct question. It may not add shortened terms, metaphors, repeated emphasis, extra clauses, throat-clearing, or a summary.

## Final check

- Confirm that the reader can understand every term without hidden context.
- Confirm that each material fact appears once.
- Confirm that every sentence adds value.
- Return the requested content in the requested format.
