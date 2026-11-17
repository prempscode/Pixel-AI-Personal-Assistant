const express = require("express");
const runAgent = require("../agent/agent");
const executeTool = require("../agent/toolExecutor");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Message is too long",
      });
    }

    // Ask Groq to understand the request.
    const result = await runAgent(message);

    // Normal conversation.
    if (result.type === "text") {
      return res.json(result);
    }

    // Execute selected tools one by one.
    const toolResults = [];

    for (const tool of result.toolCalls) {
      const execution = await executeTool(tool.name, tool.args);

      toolResults.push({
        name: tool.name,
        args: tool.args,
        result: execution,
      });
    }

    return res.json({
      type: "tool_result",
      toolResults,
    });
  } catch (error) {
    console.error("Agent Error:", error);

    res.status(500).json({
      error: "Failed to process request",
    });
  }
});

module.exports = router;
