function getCurrentTime(timezone) {
  if (typeof timezone !== "string" || !timezone.trim()) {
    throw new Error("A valid timezone is required.");
  }

  // Validate the timezone.
  try {
    new Intl.DateTimeFormat("en-IN", {
      timeZone: timezone,
    });
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

async function executeTool(name, args) {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return {
      success: false,
      error: "Invalid tool arguments.",
    };
  }

  try {
    switch (name) {
      case "get_current_time": {
        const result = getCurrentTime(args.timezone);

        return {
          success: true,
          data: result,
        };
      }

      case "create_google_task":
      case "create_calendar_event":
      case "create_keep_note": {
        // Google integrations are not connected yet.
        // Never claim these actions were completed.
        return {
          success: false,
          status: "integration_not_configured",
          message: `${name} is not connected yet.`,
        };
      }

      default:
        return {
          success: false,
          error: `Unknown tool: ${name}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = executeTool;
