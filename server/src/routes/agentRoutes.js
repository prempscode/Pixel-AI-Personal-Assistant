const express = require("express");
const rateLimit = require("express-rate-limit");
const runAgent = require("../agent/agent");
const authMiddleware = require("../middleware/authMiddleware");
const Conversation = require("../models/Conversation");

const router = express.Router();

router.use(authMiddleware);

// Each chat request can trigger up to 5 Groq calls, so limit per USER
// (this runs after authMiddleware, so req.user is available).
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  keyGenerator: (req) => req.user.id,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again soon." },
});

router.post("/chat", chatLimiter, async (req, res) => {
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

router.delete("/history", async (req, res) => {
  try {
    await Conversation.deleteOne({ userId: req.user.id });
    return res.json({ deleted: true });
  } catch (error) {
    console.error("Conversation history deletion error:", error);
    return res.status(500).json({ error: "Failed to clear conversation history" });
  }
});

module.exports = router;
