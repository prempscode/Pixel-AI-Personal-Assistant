const { google } = require("googleapis");
const getGoogleClient = require("./googleClient");

async function createTask(userId, { title, notes }) {
  const auth = await getGoogleClient(userId);
  const tasks = google.tasks({ version: "v1", auth });

  const res = await tasks.tasks.insert({
    tasklist: "@default",
    requestBody: { title, notes: notes || "" },
  });

  return {
    id: res.data.id,
    title: res.data.title,
  };
}

module.exports = { createTask };
