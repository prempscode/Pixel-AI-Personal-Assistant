const express = require("express");
const getGeminiAI = require("../config/gemini");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Message is too long",
      });
    }

    const ai = await getGeminiAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: message,
      config: {
        systemInstruction: `
                    You are a helpful AI personal assistant.
                    Understand the user's requests and respond clearly.
                    Do not claim to have performed external actions.
                    You cannot access Google services or control websites yet.
                `,
      },
    });

    res.json({
      reply: response.text,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    res.status(500).json({
      error: "Failed to generate AI response",
    });
  }
});

module.exports = router;
