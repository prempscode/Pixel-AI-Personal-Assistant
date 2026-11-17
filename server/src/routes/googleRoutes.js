const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const GoogleCredential = require("../models/GoogleCredential");
const { encrypt } = require("../utils/tokenCrypto");

const router = express.Router();

// Save Google refresh token
router.post("/connect", authMiddleware, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Google refresh token is required",
      });
    }

    const encryptedData = encrypt(refreshToken);

    await GoogleCredential.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        ...encryptedData,
      },
      { upsert: true, new: true },
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Google connection error:", error);
    res.status(500).json({
      error: error.message+" Failed to connect Google",
    });
  }
});

// Check Google connection
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const credential = await GoogleCredential.findOne({
      userId: req.user.id,
    });

    res.json({
      connected: !!credential,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message +" Failed to check Google connection",
    });
  }
});

module.exports = router;
