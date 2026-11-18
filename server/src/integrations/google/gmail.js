const { google } = require("googleapis");
const getGoogleClient = require("./googleClient");

function encodeMessage(to, subject, body) {
  const message = [`To: ${to}`, `Subject: ${subject}`, "", body].join("\n");
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function createDraft(userId, { to, subject, body }) {
  const auth = await getGoogleClient(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw: encodeMessage(to, subject, body) } },
  });

  return { id: res.data.id };
}

async function sendEmail(userId, { to, subject, body }) {
  const auth = await getGoogleClient(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodeMessage(to, subject, body) },
  });

  return { id: res.data.id };
}

async function searchEmails(userId, { query }) {
  const auth = await getGoogleClient(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 5,
  });

  const messages = res.data.messages || [];
  if (messages.length === 0) return { found: 0, results: [] };

  const results = [];
  for (const m of messages) {
    const full = await gmail.users.messages.get({
      userId: "me",
      id: m.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "Date"],
    });
    const headers = full.data.payload.headers;
    results.push({
      subject:
        headers.find((h) => h.name === "Subject")?.value || "(no subject)",
      from: headers.find((h) => h.name === "From")?.value || "",
      date: headers.find((h) => h.name === "Date")?.value || "",
    });
  }

  return { found: results.length, results };
}

module.exports = { createDraft, sendEmail, searchEmails };
