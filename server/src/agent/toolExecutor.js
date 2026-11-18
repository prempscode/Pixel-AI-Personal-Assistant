const { createTask } = require("../integrations/google/tasks");
const { createEvent } = require("../integrations/google/calendar");
const { createDraft } = require("../integrations/google/gmail");
const { sendEmail, searchEmails } = require("../integrations/google/gmail");
const { listFiles, searchDrive } = require("../integrations/google/drive");

function getCurrentTime(timezone) {
  try {
    new Intl.DateTimeFormat("en-IN", { timeZone: timezone });
  } catch {
    throw new Error("Invalid timezone.");
  }

  const now = new Date();

  return {
    timezone,
    dateTime: new Intl.DateTimeFormat("en-IN", {
      timeZone: timezone,
      dateStyle: "full",
      timeStyle: "long",
    }).format(now),
    isoTimestamp: now.toISOString(),
  };
}

async function executeTool(name, args, userId) {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return { success: false, error: "Invalid tool arguments." };
  }

  try {
    switch (name) {
      case "get_current_time":
        return { success: true, data: getCurrentTime(args.timezone) };

      case "create_google_task": {
        const task = await createTask(userId, args);
        return {
          success: true,
          data: task,
          message: `Task "${task.title}" created.`,
        };
      }

      case "create_calendar_event": {
        const event = await createEvent(userId, args);
        return {
          success: true,
          data: event,
          message: `Event "${event.title}" created. Link: ${event.url}`,
        };
      }

      case "create_gmail_draft": {
        const draft = await createDraft(userId, args);
        return {
          success: true,
          data: draft,
          message: `Draft to ${args.to} created.`,
        };
      }

      case "open_website":
        return {
          success: true,
          data: { url: args.url },
          message: `Opening ${args.url}`,
        };

      case "search_google":
        return {
          success: true,
          data: {
            url: `https://www.google.com/search?q=${encodeURIComponent(args.query)}`,
          },
          message: `Searching Google for "${args.query}"`,
        };

      case "send_gmail": {
        const sent = await sendEmail(userId, args);
        return {
          success: true,
          data: sent,
          message: `Email sent to ${args.to}.`,
        };
      }

      case "search_gmail": {
        const found = await searchEmails(userId, args);
        return {
          success: true,
          data: found,
          message:
            found.found === 0
              ? "No emails found."
              : `Found ${found.found} email(s):\n` +
                found.results
                  .map((r) => `• ${r.subject} — ${r.from} (${r.date})`)
                  .join("\n"),
        };
      }

      case "search_google_drive": {
        const found = await searchDrive(userId, args);
        return {
          success: true,
          data: found,
          message:
            found.found === 0
              ? "No files found."
              : `Found ${found.found} file(s):\n` +
                found.files.map((f) => `• ${f.name} — ${f.link}`).join("\n"),
        };
      }
      case "list_drive_files": {
        const files = await listFiles(userId);
        return {
          success: true,
          data: files,
          message:
            files.found === 0
              ? "Drive is empty."
              : `Recent files:\n` +
                files.files.map((f) => `• ${f.name} — ${f.link}`).join("\n"),
        };
      }

      default:
        return { success: false, error: `Unknown tool: ${name}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = executeTool;
