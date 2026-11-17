const { google } = require("googleapis");
const getGoogleClient = require("./googleClient");

async function createEvent(userId, { title, start, end }) {
  const auth = await getGoogleClient(userId);
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: title,
      start: { dateTime: start },
      end: { dateTime: end },
    },
  });

  return {
    id: res.data.id,
    title: res.data.summary,
    url: res.data.htmlLink,
  };
}

module.exports = { createEvent };
