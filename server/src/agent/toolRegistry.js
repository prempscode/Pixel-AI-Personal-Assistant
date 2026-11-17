const tools = [
  {
    type: "function",
    function: {
      name: "create_google_task",
      description: "Create a task in the user's Google Tasks.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the task.",
          },
          notes: {
            type: "string",
            description: "Optional details about the task.",
          },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_calendar_event",
      description: "Create an event in the user's Google Calendar.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The event title.",
          },
          start: {
            type: "string",
            description:
              "Start date and time in ISO 8601 format, including timezone.",
          },
          end: {
            type: "string",
            description:
              "End date and time in ISO 8601 format, including timezone.",
          },
        },
        required: ["title", "start", "end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the current date and time for a specified timezone.",
      parameters: {
        type: "object",
        properties: {
          timezone: {
            type: "string",
            description: "Timezone in IANA format, e.g. Asia/Kolkata",
          },
        },
        required: ["timezone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_keep_note",
      description: "Create a note in the user's Google Keep.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The note title.",
          },
          content: {
            type: "string",
            description: "The note content.",
          },
        },
        required: ["title", "content"],
      },
    },
  },
];

module.exports = tools;
