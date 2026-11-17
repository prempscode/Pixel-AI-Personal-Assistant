const tools = [
  {
    type: "function",
    function: {
      name: "create_google_task",
      description: "Create a task in the user's Google Tasks.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "The title of the task." },
          notes: { type: "string", description: "Optional details." },
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
          title: { type: "string", description: "The event title." },
          start: {
            type: "string",
            description: "Start time, ISO 8601 with timezone.",
          },
          end: {
            type: "string",
            description: "End time, ISO 8601 with timezone.",
          },
        },
        required: ["title", "start", "end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_gmail_draft",
      description: "Create a draft email in the user's Gmail (does not send).",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient email address." },
          subject: { type: "string", description: "Email subject." },
          body: { type: "string", description: "Email body text." },
        },
        required: ["to", "subject", "body"],
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
          title: { type: "string", description: "The note title." },
          content: { type: "string", description: "The note content." },
        },
        required: ["title", "content"],
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
            description: "IANA timezone, e.g. Asia/Kolkata",
          },
        },
        required: ["timezone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_website",
      description: "Open a website for the user. Returns the URL to open.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Full URL to open." },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_google",
      description: "Search Google. Returns the search URL to open.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query." },
        },
        required: ["query"],
      },
    },
  },
];

module.exports = tools;
