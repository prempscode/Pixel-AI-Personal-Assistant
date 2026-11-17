const getGroqAI = require("../config/groq");
const tools = require("./toolRegistry");
const executeTool = require("./toolExecutor");

async function runAgent(message) {
  const groq = await getGroqAI();

  const messages = [
    {
      role: "system",
      content: `
                You are an AI personal assistant.

                Understand the user's requests and use
                available tools whenever necessary.

                For questions about current date or time,
                always use get_current_time.

                Use Asia/Kolkata for India when no other
                timezone is specified.

                Never guess current information.

                Never claim an action was completed unless
                a tool confirms successful execution.

                If a tool reports an error, explain it clearly.
            `,
    },
    {
      role: "user",
      content: message,
    },
  ];

  const maxIterations = 5;

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

    // 2. No more tools: return the final response.
    if (!assistantMessage.tool_calls?.length) {
      return {
        type: "text",
        reply: assistantMessage.content || "",
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

        result = await executeTool(name, args);
      } catch (error) {
        result = {
          success: false,
          error: error.message,
        };
      }

      // 5. Send the execution result back to Groq.
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name,
        content: JSON.stringify(result),
      });
    }

    // Loop continues: Groq receives tool results
    // and decides whether more tools are needed.
  }

  return {
    type: "text",
    reply:
      "I reached the maximum number of tool operations. Please try a simpler request.",
  };
}

module.exports = runAgent;
