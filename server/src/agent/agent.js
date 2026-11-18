const getGroqAI = require("../config/groq");
const tools = require("./toolRegistry");
const executeTool = require("./toolExecutor");

async function runAgent(message, userId) {
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

        result = await executeTool(name, args, userId);
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

/*
I implemented an AI agent using the Groq API.

First, I imported three things: the Groq client, the tool registry, 
and the tool executor.

The Groq client is used to communicate with the AI model. 
The tool registry contains the available tools that the AI can use, 
and the tool executor is responsible for executing those tools in our backend.

Then I created an asynchronous function called `runAgent`, which accepts 
the user's message and user ID.

I pass the user ID because our application supports multiple users, and we 
need to manage each user's tasks separately.

Next, I created a messages array containing two types of messages: 
a system message and a user message.

The system message contains instructions that define how our 
AI assistant should behave, such as when to use tools, how to handle 
errors, and why it should not guess current information.

The user message contains the actual request.

After that, I set a maximum iteration limit of five to prevent the 
agent from running continuously.

Inside a loop, I send the messages and available tools to the Groq API. 
I use `tool_choice: auto` so that the AI can decide whether it needs 
a tool or can answer directly.

After receiving the response, I check whether the AI requested any tools.

If no tool is required, I return the AI's response directly to the user.

If a tool is required, I save the AI's tool-call message and 
execute the requested tool using our tool executor.

I also use `JSON.parse()` to convert the tool arguments into a 
JavaScript object and pass the tool name, arguments, and user ID to the executor.

I use try-catch to handle errors during tool execution.

Once the tool is executed, I send its result back to Groq using a
tool message. This allows the AI to understand whether 
the operation succeeded or failed.

The loop then continues, allowing the AI to request additional 
tools if necessary or generate the final response.

Finally, I export the `runAgent` function so that other backend 
files, such as the chat controller, can use it.

This approach allows our AI assistant to do more than just answer 
questions. It can also perform actual operations through our backend tools.

*/
