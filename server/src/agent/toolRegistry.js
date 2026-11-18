const tools = [
  {
    type: "function",
    function: {
      name: "create_google_task",
      description:
        "Create a to-do item in Google Tasks (a checklist item, not a calendar event). Use for reminders and to-dos without a specific time slot.",
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
      description:
        "Block a specific time slot on Google Calendar. Use for meetings, appointments, or anything with a start and end time.",
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
  {
    type: "function",
    function: {
      name: "send_gmail",
      description: "Send an email from the user's Gmail account immediately.",
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
      name: "search_gmail",
      description: "Search the user's Gmail for emails matching a query.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Gmail search query, e.g. 'from:boss subject:report'",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_drive_files",
      description: "List the user's most recent files in Google Drive.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_google_drive",
      description: "Search Google Drive for files by name or content.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search term (file name or content).",
          },
        },
        required: ["query"],
      },
    },
  },
];

module.exports = tools;
