// Starter prompts. Each maps to a real backend tool. They only ever FILL the
// composer: some create real events/tasks, so nothing sends without a click.
export const PROMPT_GROUPS = [
  {
    id: "tasks",
    label: "Tasks",
    dot: "bg-svc-tasks",
    prompts: [
      "Remind me to call John tomorrow at 6 PM",
      "Add a task to renew my passport, with a short checklist in the notes",
    ],
  },
  {
    id: "calendar",
    label: "Calendar",
    dot: "bg-svc-calendar",
    prompts: ["Block 2 to 3 PM on Friday for a project review"],
  },
  {
    id: "gmail",
    label: "Gmail",
    dot: "bg-svc-gmail",
    prompts: [
      "Draft an email to alex@example.com asking to reschedule our meeting",
      "Search my Gmail for emails about invoices",
    ],
  },
  {
    id: "drive",
    label: "Drive",
    dot: "bg-svc-drive",
    prompts: ["Find my latest invoice in Drive", "List my recent Drive files"],
  },
  {
    id: "utilities",
    label: "Time & links",
    dot: "bg-ember",
    prompts: ["What time is it in Tokyo?"],
  },
];

export const FEATURED_PROMPTS = [
  PROMPT_GROUPS[0].prompts[0],
  PROMPT_GROUPS[1].prompts[0],
  PROMPT_GROUPS[2].prompts[0],
  PROMPT_GROUPS[3].prompts[0],
];
