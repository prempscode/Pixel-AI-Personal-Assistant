const crypto = require("crypto");
const getGroqAI = require("../config/groq");
const tools = require("./toolRegistry");
const executeTool = require("./toolExecutor");
const Conversation = require("../models/Conversation");

async function saveConversation(userId, userText, assistantText) {
  await Conversation.findOneAndUpdate(
    { userId },
    {
      $push: {
        messages: {
          $each: [
            { role: "user", text: userText },
            { role: "assistant", text: assistantText },
          ],
          $slice: -50, // keep last 50 messages only
        },
      },
      $set: { updatedAt: new Date() },
    },
    { upsert: true },
  );
}

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
- send_gmail: Only when the user explicitly says "send" or "email to...". It only PREPARES the email and does NOT send it.
- confirm_send_gmail: After the user replies "yes" (or similar) in a NEW message to your "Send it?" question, send it by calling confirm_send_gmail (no arguments). If you only have the email details, calling send_gmail again with the SAME to, subject and body also sends it. Never do either in the same turn as the first send_gmail.
- search_gmail: To find existing emails.
- list_drive_files: To see recent files.
- search_google_drive: To find specific files by name or content.
- open_website / search_google: To give the user a URL or a search link.

CRITICAL RULES:
1. NEVER claim an action was completed unless a tool confirms success.
2. If a tool fails, explain the error clearly. If a tool says reconnect_required, tell the user to click 'Connect Google'.
3. When the user asks you to create content (write a body, compose text, draft a message), you MUST write that content yourself based on the request. Do NOT ask the user to provide it.
4. When creating a task with a body/description, write meaningful content yourself.
5. If multiple actions are requested, execute them in order and report each result separately.
6. When a tool returns confirmation_required, show the user the full email and ask "Send it?". Do not claim it was sent.
7. Reply in concise, readable Markdown when it improves clarity. Use short paragraphs, lists, headings, inline code, and Markdown links where helpful; avoid unnecessary formatting.
8. Use fenced blocks only for source code or runnable terminal commands, and include a supported language tag. Never put email drafts, message bodies, or ordinary prose in code fences; present email drafts as regular formatted text.
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
      model: process.env.GROQ_MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
    });

    const assistantMessage = response.choices[0].message;

    // 2. No more tools: save to memory and return the final response.
    if (!assistantMessage.tool_calls?.length) {
      const finalReply = assistantMessage.content || "";
      await saveConversation(userId, message, finalReply);

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
        result = await executeTool(name, args, {
          userId,
          userMessage: message,
        });
      } catch (error) {
        result = {
          success: false,
          error: error.message,
        };
      }

      // Collect URLs from open_website / search_google
      if (result?.data?.url && name !== "create_calendar_event") {
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

  // Max iterations reached: still save the turn so history stays consistent.
  const fallbackReply =
    "I reached the maximum number of tool operations. Please try a simpler request.";
  await saveConversation(userId, message, fallbackReply);

  return {
    type: "text",
    reply: fallbackReply,
    urls,
  };
}

module.exports = runAgent;


/*
I built an AI agent controller that connects the user's message 
with the Groq LLM and our backend tools. It loads the recent conversation
 history from MongoDB, constructs the prompt with system instructions and
  tool definitions, and sends it to Groq. If the model requests a tool, 
  mybackend executes it through a centralized tool executor and returns the
  result to the model. This process runs in a bounded loop so the model can 
  perform multiple actions before producing a final response. Once the final 
  response is generated, the user and assistant messages
 are saved to MongoDB and returned to the frontend.
*/