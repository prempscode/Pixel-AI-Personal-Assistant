const express = require("express");
const runAgent = require("../agent/agent");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

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

    const result = await runAgent(message, req.user.id);

    return res.json(result);
  } catch (error) {
    console.error("Agent Error:", error);

    return res.status(500).json({
      error: "Failed to process request",
    });
  }
});

module.exports = router;
