const getGroqAI = require("../config/groq");
const tools = require("./toolRegistry");
const executeTool = require("./toolExecutor");
const Conversation = require("../models/Conversation");

async function runAgent(message, userId) {
  const groq = await getGroqAI();

  // Load conversation history (last 20 messages for context)
  const convo = await Conversation.findOne({ userId });
  const history = (convo?.messages || []).slice(-20);

  const messages = [
    {
      role: "system",
      content: `
You are an AI personal assistant with access to the user's Google account.

CURRENT TIME CONTEXT:
For questions about current date or time, use get_current_time with Asia/Kolkata unless the user specifies otherwise.

TOOL SELECTION RULES:
- create_google_task: For to-do items, notes, reminders, and checklist items WITHOUT a specific time slot.
- create_calendar_event: For anything with a specific start and end time (meetings, appointments, time blocks).
- create_gmail_draft: When the user wants to compose but NOT send an email.
- send_gmail: Only when the user explicitly says "send" or "email to...". Otherwise use create_gmail_draft.
- search_gmail: To find existing emails.
- list_drive_files: To see recent files.
- search_google_drive: To find specific files by name or content.
- open_website / search_google: To open URLs or search the web.

CRITICAL RULES:
1. NEVER claim an action was completed unless a tool confirms success.
2. If a tool fails, explain the error clearly.
3. When the user asks you to create content (write a body, compose text, draft a message), you MUST write that content yourself based on the request. Do NOT ask the user to provide it.
4. When creating a task with a body/description, write meaningful content yourself.
5. If multiple actions are requested, execute them in order and report each result separately.
      `,
    },
    ...history.map((m) => ({ role: m.role, content: m.text })),
    {
      role: "user",
      content: message,
    },
  ];

  const maxIterations = 5;
  const urls = [];

  for (let i = 0; i < maxIterations; i++) {
    // 1. Ask Groq what to do next.
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
    });

    const assistantMessage = response.choices[0].message;

    // 2. No more tools: save to memory and return the final response.
    if (!assistantMessage.tool_calls?.length) {
      const finalReply = assistantMessage.content || "";

      // Save conversation to MongoDB
      await Conversation.findOneAndUpdate(
        { userId },
        {
          $push: {
            messages: {
              $each: [
                { role: "user", text: message },
                { role: "assistant", text: finalReply },
              ],
              $slice: -50, // keep last 50 messages only
            },
          },
          $set: { updatedAt: new Date() },
        },
        { upsert: true },
      );

      return {
        type: "text",
        reply: finalReply,
        urls,
      };
    }

    // 3. Preserve Groq's assistant tool-call message.
    messages.push(assistantMessage);

    // 4. Execute every requested tool.
    for (const toolCall of assistantMessage.tool_calls) {
      const name = toolCall.function.name;
      let result;

      try {
        const args = JSON.parse(toolCall.function.arguments);
        result = await executeTool(name, args, userId);
      } catch (error) {
        result = {
          success: false,
          error: error.message,
        };
      }

      // Collect URLs from open_website / search_google
      if (result?.data?.url) {
        urls.push(result.data.url);
      }

      // 5. Send the execution result back to Groq.
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name,
        content: JSON.stringify(result),
      });
    }
  }

  // Max iterations reached
  return {
    type: "text",
    reply:
      "I reached the maximum number of tool operations. Please try a simpler request.",
    urls,
  };
}

module.exports = runAgent;
