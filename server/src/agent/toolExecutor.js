const { createTask } = require("../integrations/google/tasks");
const { createEvent } = require("../integrations/google/calendar");
const {
  createDraft,
  sendEmail,
  searchEmails,
  validateEmail,
} = require("../integrations/google/gmail");
const { listFiles, searchDrive } = require("../integrations/google/drive");

// ---------- helpers ----------

function assertText(value, field, max, required = true) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} is required.`);
    return;
  }
  if (typeof value !== "string") throw new Error(`${field} must be text.`);
  if (value.length > max) {
    throw new Error(`${field} is too long (max ${max} characters).`);
  }
}

function validateEventTimes(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    throw new Error("start and end must be valid ISO 8601 date-times.");
  }
  if (e <= s) throw new Error("The event end time must be after the start.");
}

function validateHttpUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL.");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are allowed.");
  }
  return parsed.toString();
}

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

// Maps raw Google/API errors to messages the model (and user) can act on.
function toToolError(error) {
  const text = String(error?.message || "Unknown error");
  const apiError = error?.response?.data?.error;

  if (text.includes("invalid_grant") || apiError === "invalid_grant") {
    return {
      success: false,
      status: "reconnect_required",
      error:
        "Google access was revoked or expired. Tell the user to click 'Connect Google' again.",
    };
  }

  if (/insufficient/i.test(text) || error?.code === 403) {
    return {
      success: false,
      status: "reconnect_required",
      error:
        "Google permissions are missing for this action. Tell the user to click 'Connect Google' again and accept all permissions.",
    };
  }

  return { success: false, error: text };
}

// ---------- email send confirmation ----------
// send_gmail only PREPARES an email. confirm_send_gmail sends it, and only if
// the confirmation arrives in a LATER chat turn than the preparation, so the
// model can never prepare and send in the same turn.
// NOTE: this Map lives in server memory (resets on restart, single instance).
// For multiple server instances, store it in MongoDB instead.

const PENDING_TTL_MS = 5 * 60 * 1000;
const pendingSends = new Map(); // userId -> { email, turnId, expires }

// ---------- main ----------

async function executeTool(name, args, { userId, turnId }) {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return { success: false, error: "Invalid tool arguments." };
  }

  try {
    switch (name) {
      case "get_current_time":
        return { success: true, data: getCurrentTime(args.timezone) };

      case "create_google_task": {
        assertText(args.title, "title", 200);
        assertText(args.notes, "notes", 2000, false);
        const task = await createTask(userId, args);
        return {
          success: true,
          data: task,
          message: `Task "${task.title}" created.`,
        };
      }

      case "create_calendar_event": {
        assertText(args.title, "title", 200);
        validateEventTimes(args.start, args.end);
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

      case "open_website": {
        const url = validateHttpUrl(args.url);
        return {
          success: true,
          data: { url },
          message: `Link ready: ${url}`,
        };
      }

      case "search_google": {
        assertText(args.query, "query", 200);
        return {
          success: true,
          data: {
            url: `https://www.google.com/search?q=${encodeURIComponent(args.query)}`,
          },
          message: `Search link ready for "${args.query}"`,
        };
      }

      case "send_gmail": {
        validateEmail(args); // fail early, before asking the user to confirm
        const email = {
          to: args.to.trim(),
          subject: args.subject,
          body: args.body,
        };
        pendingSends.set(userId, {
          email,
          turnId,
          expires: Date.now() + PENDING_TTL_MS,
        });
        return {
          success: false,
          status: "confirmation_required",
          message:
            "NOT SENT YET. Show the user exactly this email and ask 'Send it?'. " +
            "Call confirm_send_gmail only after the user says yes in their next message.\n" +
            `To: ${email.to}\nSubject: ${email.subject}\n\n${email.body}`,
        };
      }

      case "confirm_send_gmail": {
        const pending = pendingSends.get(userId);
        if (!pending || pending.expires < Date.now()) {
          pendingSends.delete(userId);
          return {
            success: false,
            error:
              "No email is waiting for confirmation (it may have expired).",
          };
        }
        if (pending.turnId === turnId) {
          return {
            success: false,
            error:
              "The user has not confirmed yet. Ask them, and wait for their reply.",
          };
        }
        pendingSends.delete(userId);
        const sent = await sendEmail(userId, pending.email);
        return {
          success: true,
          data: sent,
          message: `Email sent to ${pending.email.to}.`,
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
    return toToolError(error);
  }
}

module.exports = executeTool;
