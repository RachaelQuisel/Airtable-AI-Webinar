# Building an AI-assisted workflow with Omni in Airtable

## Speaker outline

1. Build the first dashboard with my lame prompt. Ask Omni to create an interface for paraprofessionals to track case tasks. Have it show me the plan before I approve the build.

2. Ask Claude to improve that prompt using /omni-prompt. The skill turns a rough request into clear, specific instructions for Omni.

3. While Claude writes, ask Omni about the data in the first dashboard. What are the most common tasks? How many different tasks are there?

4. Ask Omni to create tags to categorize the tasks. It says it can't. Show what happens when I start a fresh chat.

5. Try a slightly different version of the same request in the new chat. This time, Omni creates the tags field.

6. Open the agent field and inspect what Omni wrote. Show the instructions, category options, automatic-generation toggle, and conditions for running the agent. Explain that building it doesn't use AI credits, but generating its output does.

7. Return to Claude's four prompts and build the second dashboard. Task list, calendar, board, then record details and tidy-up.

8. Publish the interface. This is where I lose the thread.

9. Show Omni offering alternatives when it can't carry out a request. Run one of its suggested prompts and show the result.

10. Return to the interfaces and show the third dashboard. Built from the custom prompt Omni created. Three versions: my original prompt, Claude's improved prompts, and Omni's custom prompt.

11. Show the initial home-visit reminder automation. Omni built the first version, but it wasn't ready to ship. Show how I used Claude Code to finish the remaining details and publish it.

12. Use Claude in the browser to find the interface's source code. Give that code to Claude in the browser and run the Airtable Omni Custom Interface Refiner skill. The skill helps fix bugs, improve usability, and add custom interactions. Give the refined code back to Omni to build.

13. Review the output and keep iterating in Claude Code. Run the Airtable Omni Custom Interface Refiner skill again with my feedback, then review the next version.

14. I'm sharing the Questwood source code, the original Omni build prompt, and both skills on my GitHub. Omni Prompt Generator (omni-prompt): turns rough ideas into specific prompts for Omni. Airtable Omni Custom Interface Refiner (airtable-omni-refiner): helps fix bugs and improve Omni-generated interface code. The full prompt that built the first custom Questwood is included in the appendix.

15. These skills are a starting point. You'll likely need to tweak them for your LLM and system.

## Resources

- [Questwood source](../questwood/questwood-refined.tsx)
- [Original Omni prompt](../prompts/questwood-original-omni-prompt.txt)
- [Omni Prompt Generator](../skills/omni-prompt/)
- [Airtable Omni Custom Interface Refiner](../skills/airtable-omni-refiner/)
- [Demo videos](../videos/README.md)
