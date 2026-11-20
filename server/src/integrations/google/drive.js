const { google } = require("googleapis");
const getGoogleClient = require("./googleClient");

async function listFiles(userId) {
  const auth = await getGoogleClient(userId);
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    pageSize: 10,
    fields: "files(id,name,mimeType,webViewLink)",
    orderBy: "modifiedTime desc",
  });

  return {
    found: res.data.files.length,
    files: res.data.files.map((f) => ({
      name: f.name,
      type: f.mimeType,
      link: f.webViewLink,
    })),
  };
}

async function searchDrive(userId, { query }) {
  if (typeof query !== "string" || !query.trim() || query.length > 200) {
    throw new Error("A search term (max 200 characters) is required.");
  }

  const auth = await getGoogleClient(userId);
  const drive = google.drive({ version: "v3", auth });

  // Escape backslashes FIRST, then single quotes (Drive query syntax)
  const safeQuery = query.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  const res = await drive.files.list({
    q: `name contains '${safeQuery}' or fullText contains '${safeQuery}'`,
    fields: "files(id,name,mimeType,webViewLink)",
    pageSize: 10,
  });

  return {
    found: res.data.files.length,
    files: res.data.files.map((f) => ({
      name: f.name,
      type: f.mimeType,
      link: f.webViewLink,
    })),
  };
}

module.exports = { listFiles, searchDrive };
