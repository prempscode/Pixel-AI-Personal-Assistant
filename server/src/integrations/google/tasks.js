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

/*
I implemented a function called `createTask` to create 
tasks directly in a user's Google Tasks account using the Google Tasks API.

First, I imported the Google API library and my `getGoogleClient` function.

The function accepts the user ID, task title, and notes.

Then I call `getGoogleClient` to get an authenticated 
Google client for that particular user.

After that, I initialize the Google Tasks service using API 
version v1 and the authenticated client.

Next, I use the `tasks.tasks.insert()` method to create a task 
in the user's default task list. I pass the task title and notes in the request body.

Once Google successfully creates the task, it returns a response. 
I extract the task ID and title from that response and return them.

Finally, I export the function so that my tool executor can use it.

This allows my AI assistant to create actual tasks in a user's 
Google account instead of just generating text responses.

*/
