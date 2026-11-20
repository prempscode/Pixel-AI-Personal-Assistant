const { google } = require("googleapis");
const getGoogleClient = require("./googleClient");

const DEFAULT_TZ = process.env.DEFAULT_TIMEZONE || "Asia/Kolkata";

async function createEvent(userId, { title, start, end }) {
  const auth = await getGoogleClient(userId);
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: title,
      // timeZone is used only when the ISO string has no offset
      start: { dateTime: start, timeZone: DEFAULT_TZ },
      end: { dateTime: end, timeZone: DEFAULT_TZ },
    },
  });

  return {
    id: res.data.id,
    title: res.data.summary,
    url: res.data.htmlLink,
  };
}

module.exports = { createEvent };
