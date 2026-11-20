const { google } = require("googleapis");
const getGoogleClient = require("./googleClient");

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

function assertSingleLine(value, field, max) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  if (/[\r\n]/.test(value)) {
    throw new Error(`${field} must not contain line breaks.`);
  }
  if (value.length > max) {
    throw new Error(`${field} is too long (max ${max} characters).`);
  }
}

// Throws a clear error if the email is not safe to build. Exported so the
// tool executor can validate BEFORE asking the user to confirm.
function validateEmail({ to, subject, body }) {
  assertSingleLine(to, "Recipient", 254);
  if (!EMAIL_RE.test(to.trim())) {
    throw new Error("Recipient must be a single valid email address.");
  }
  assertSingleLine(subject, "Subject", 200);
  if (typeof body !== "string" || !body.trim()) {
    throw new Error("Body is required.");
  }
  if (body.length > 10000) {
    throw new Error("Body is too long (max 10000 characters).");
  }
}

// Non-ASCII subjects (Hindi, emoji...) must be RFC 2047 encoded.
function encodeHeader(text) {
  return /^[\x20-\x7E]*$/.test(text)
    ? text
    : `=?UTF-8?B?${Buffer.from(text, "utf8").toString("base64")}?=`;
}

function buildRawMessage({ to, subject, body }) {
  validateEmail({ to, subject, body });

  const encodedBody = Buffer.from(body, "utf8")
    .toString("base64")
    .match(/.{1,76}/g)
    .join("\r\n");

  const message = [
    `To: ${to.trim()}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodedBody,
  ].join("\r\n");

  return Buffer.from(message).toString("base64url");
}

async function createDraft(userId, { to, subject, body }) {
  const raw = buildRawMessage({ to, subject, body });
  const auth = await getGoogleClient(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw } },
  });

  return { id: res.data.id };
}

async function sendEmail(userId, { to, subject, body }) {
  const raw = buildRawMessage({ to, subject, body });
  const auth = await getGoogleClient(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return { id: res.data.id };
}

async function searchEmails(userId, { query }) {
  if (typeof query !== "string" || !query.trim() || query.length > 200) {
    throw new Error("A search query (max 200 characters) is required.");
  }

  const auth = await getGoogleClient(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 5,
  });

  const messages = res.data.messages || [];
  if (messages.length === 0) return { found: 0, results: [] };

  const results = await Promise.all(
    messages.map(async (m) => {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: m.id,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });
      const headers = full.data.payload.headers;
      const pick = (name) => headers.find((h) => h.name === name)?.value;
      return {
        subject: pick("Subject") || "(no subject)",
        from: pick("From") || "",
        date: pick("Date") || "",
      };
    }),
  );

  return { found: results.length, results };
}

module.exports = { createDraft, sendEmail, searchEmails, validateEmail };
