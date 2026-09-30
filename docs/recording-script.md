# Recording script: one task, four versions

This is a live walkthrough for Rachael. Read the **Say** lines aloud and perform the **Do** lines. The five paste blocks are every message you need to type into Claude in Chrome. Claude writes the two Omni prompts during the recording; copy its actual responses into Omni. Omni Refiner returns React source code, which you paste into Airtable's source editor.

| Version | What viewers will see |
| --- | --- |
| V0 | A regular task tracker made with native Airtable components |
| V1 | Omni's first custom React Family Neighborhood |
| V2 | The same React interface with layout and progress fixes |
| V3 | A further React edit with playful interactions and a How this works guide |

**Job and value:** Each paraprofessional opens their assigned caseload and chooses a family. They can see open tasks, required documents, applicant training, and due dates. They can record completed work and see what to do next. The organization can spot missing items before deadlines pass. Review and approval still happen separately.

Use the same paraprofessional, family, and task in all four versions. If you change a task's saved status on camera, restore that synthetic task to the same starting state before the next comparison. Keep each prior version intact.

## 1. Workflow Scout gives me a choice

**Do:** Start in Claude in Chrome. Open the Demo base in another tab. In a Claude conversation where Workflow Scout is available, paste Prompt 1.

**Prompt 1 → Claude**

~~~text
Use the airtable-workflow-scout skill on my Demo base: https://airtable.com/appY3L5TcbLUcie6d. Show me up to three interface recommendations, then pause so I can choose one.
~~~

**Say:** “I’m starting with the work. Workflow Scout is looking at this base and giving me a few different interfaces I could build.”

**Do:** Let Claude finish. Show its actual recommendations. Point to the paraprofessional task-tracking idea. If it gives fewer than three, show the ideas it actually returned.

**Say:** “I’m choosing the paraprofessional task tracker. Staff have several kinds of follow-up for each family. I want them to see the next action, the evidence it needs, and what is still unfinished. That helps the organization spot gaps while there is time to act.”

## 2. Claude writes the ordinary Omni prompt

**Do:** Stay in the same Claude conversation. You do not need to run Workflow Scout again. Paste Prompt 2.

**Prompt 2 → Claude**

~~~text
I choose your paraprofessional task-tracking recommendation. Focus on helping staff see what their assigned families still need and record completed work, so open tasks and deadlines are visible. Write a short, copy-ready Omni prompt for a polished native Airtable interface called V0: Family Task Desk. Use the existing Case Tasks table and its real relationships. Standard Interface Designer components only, no custom element. Return only the prompt; I will paste it into Omni.
~~~

**Say:** “Now I’m asking Claude for the words I’ll give Omni. This first one is a normal Airtable task interface using the Case Tasks table that already exists.”

**Do:** Show Claude's actual response. Copy its Omni prompt. Switch to the Demo base, open Omni, paste that response, and submit it. This is the **first Omni paste**. Read Omni's plan, then choose **Build it** when it matches the native task tracker.

**Do:** Open V0. Filter to the paraprofessional you will use throughout. Find one family, open a task, and show its status, due date, and related details. Note the family and task so you can use them again.

**Say:** “Here’s the regular version. I can find my work and open a task. It’s useful, but it still feels like moving through records and lists. Now I want to try the same job as an interactive space.”

## 3. Momentum Studio writes the neighborhood prompt

**Do:** Return to the same Claude conversation and paste Prompt 3. This is the design brief; Momentum Studio handles the detailed Omni wording.

**Prompt 3 → Claude**

~~~text
Use the airtable-momentum-studio skill to write a copy-ready Omni prompt for a separate React custom interface called V1: Family Neighborhood. Keep the paraprofessional task-tracking job we chose.

Make it a warm, cute, interactive neighborhood: one house per family on the selected staff member's caseload and a little car that drives between houses. Let me switch staff and open a house to see shared tasks and documents, each applicant's training separately, checkboxes, due dates, a way to attach documents, and personal progress. A small celebration can follow a verified completion. No leaderboard or staff competition.

Give me the Omni prompt and a few things to check after it builds. I will paste the prompt myself.
~~~

**Say:** “Momentum Studio is turning the same workflow into the Family Neighborhood. The houses are families on a caseload, and the car gives me a playful way to move between them.”

**Do:** Show Claude's actual response. Copy only its copy-ready Omni prompt. Switch to Omni, paste it, and submit it. This is the **second Omni paste**. Read Omni's plan. When it calls for a separate React custom element with the right job, choose **Build it**.

## 4. Show what Omni made in V1

**Do:** Open V1. Select the same paraprofessional and family. Hover over a house, click it, watch the car, open the family details, and show the tasks, documents, and applicant information.

**Say:** “The house grows a little when I hover. I love that. The neighborhood makes the caseload feel inviting, and I can open a family right here.”

**Do:** Show the issues you actually see: the car is off the road, some houses and trees appear to float, the open family view covers much of the scene, and personal progress is hard to spot.

**Say:** “I can also see what needs work. The car isn’t on the road, the houses and trees look like they’re floating, and the family panel takes over the scene. I want to keep the idea and fix those details.”

## 5. Omni Refiner edits V1's React source for V2

**Do:** In V1, select the custom element and use its menu to **Download source code**. Keep that export unchanged. Duplicate the V1 interface as a separate V2 draft. Attach the fresh V1 source to Claude in Chrome and paste Prompt 4.

**Prompt 4 → Claude**

~~~text
Use the airtable-omni-refiner skill to edit the V1 React source I attached for a separate V2 draft. Put the car on the road, ground the houses and trees, keep the neighborhood visible when the family panel opens, make that panel scroll, and add a clear My Progress area for the selected paraprofessional. Preserve the working family, task, document, and applicant interactions. Return complete editor-ready React source and a brief summary of the changes, not an Omni prompt.
~~~

**Say:** “Omni built the custom element, and Airtable lets me download its source. I’m keeping that first version and asking Claude to make a specific change to the React code.”

**Do:** Show Claude's actual source revision. Copy the complete editor-ready code, not its explanation. In the V2 copy, select the custom element, open **Edit source code**, check which file the editor expects, replace that source with the revised code, and choose **Save changes**. Wait for the page to render.

**Do:** Use the same staff member and family. Check the road, grounded scenery, family panel, scrolling, and My Progress.

**Say:** “Now the car is on the road, the scene holds together, and I can open and scroll the family details without losing the neighborhood. My Progress is easier to find. I saved the source and checked the rendered result, so this is an actual V2.”

## 6. Edit the React again for V3

**Do:** Point to **Next helpful stop** in V2. Download the source from this saved V2, not an older export. Keep V2 intact and duplicate it as a V3 draft. Attach the fresh V2 source to Claude in Chrome and paste Prompt 5.

**Say:** “There’s one more thing I want to change. V2 added Next helpful stop, which I didn’t ask for. I also want the nice house hover back, a tiny surprise in the neighborhood, and a simple explanation of the points and badges.”

**Prompt 5 → Claude**

~~~text
Use the airtable-omni-refiner skill to edit the attached V2 React source for a separate V3 copy. Return revised React code, not a new Omni prompt.

Remove Next helpful stop and its unused logic. Restore the slight house expansion on hover, with visible keyboard focus and reduced-motion support. Add a clickable bush where a little cat or dog runs out, then resets; this is just for fun and changes no records.

Add a collapsible How this works guide. Explain the actual task-points rule, the selected person's progress goal, and the existing badge criteria from Airtable. Explain how timely tasks, documents, and training help the foster care organization track compliance work without claiming that a checkbox or upload proves approval. Keep the humor gentle and never make families or missed requirements the joke. Preserve V2's layout and working data actions. Return complete editor-ready source and a short change list.
~~~

**Do:** Show Claude's changed React source and its change list. Copy the complete editor-ready code. In the V3 copy, select the **existing** custom element, choose **Edit source code**, replace its React source, and choose **Save changes**. Do not ask Omni to generate another interface.

**Say:** “I’m changing the React code inside the copied custom element. V3 is the neighborhood we already had, with another focused edit. I want to see it save and render before I call it ready.”

**Do:** After V3 renders, confirm Next helpful stop is gone. Hover over and keyboard-focus a house. Click the bush and watch for the cat or dog. Open and close How this works; check that its point and badge descriptions reflect the Airtable data. Reopen the same family and make sure the V2 road, panel, My Progress, and task details still work. If something fails, show the result and fix it before recording the comparison.

## 7. Compare the four versions

**Do:** Show V0, V1, V2, and V3 in order with the same staff member, family, and task. Keep this scene for after V3 has saved and rendered.

**Say:** “We followed the same staff job through four versions. V0 gives us a useful task list. V1 makes families easier to explore, but its layout needs work. V2 fixes the layout and shows personal progress. V3 keeps those improvements, restores the playful hover, and explains the points, badges, and compliance work. The value is a clearer next step for staff and a better view of outstanding work for the organization.”

**Presenter reference:** The [V3 React source snapshot](../family-neighborhood/family-neighborhood-v3.tsx) in this repository is available for rehearsal. It is a code artifact until it is saved and checked in the V3 Airtable element. If you use that prepared file instead of code generated during the recording, say so plainly.
