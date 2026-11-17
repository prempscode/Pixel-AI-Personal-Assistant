const { google } = require("googleapis");
const getGoogleClient = require("./googleClient");

async function createDraft(userId, { to, subject, body }) {
  const auth = await getGoogleClient(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const message = [`To: ${to}`, `Subject: ${subject}`, "", body].join("\n");

  // URL-safe base64 (Gmail's requirement)
  const encoded = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw: encoded } },
  });

  return { id: res.data.id };
}

module.exports = { createDraft };
