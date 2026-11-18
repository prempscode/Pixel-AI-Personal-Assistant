const express = require("express");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const { google } = require("googleapis");
const authMiddleware = require("../middleware/authMiddleware");
const GoogleCredential = require("../models/GoogleCredential");
const { encrypt } = require("../utils/tokenCrypto");

const router = express.Router();
router.use(cookieParser());

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/gmail.send",
];

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI, // http://localhost:5000/api/google/callback
  );
}

// Step 1: logged-in user asks for the Google consent URL
router.get("/auth", authMiddleware, (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");

  res.cookie("oauth_state", JSON.stringify({ state, userId: req.user.id }), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });

  const url = getOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });

  res.json({ url });
});

// Step 2: Google redirects HERE — refresh token never touches the browser
router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    const cookie = req.cookies.oauth_state
      ? JSON.parse(req.cookies.oauth_state)
      : null;
    res.clearCookie("oauth_state");

    if (!cookie || cookie.state !== state) {
      return res.status(400).send("Invalid OAuth state.");
    }
    if (!code) {
      return res.redirect(`${FRONTEND_URL}?google=error`);
    }

    const { tokens } = await getOAuthClient().getToken(code);

    if (!tokens.refresh_token) {
      return res.redirect(`${FRONTEND_URL}?google=no_refresh_token`);
    }

    const encryptedData = encrypt(tokens.refresh_token);

    await GoogleCredential.findOneAndUpdate(
      { userId: cookie.userId },
      { userId: cookie.userId, ...encryptedData },
      { upsert: true, new: true },
    );

    res.redirect(`${FRONTEND_URL}?google=connected`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect(`${FRONTEND_URL}?google=error`);
  }
});

// Check Google connection
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const credential = await GoogleCredential.findOne({ userId: req.user.id });
    res.json({ connected: !!credential });
  } catch (error) {
    res.status(500).json({ error: "Failed to check Google connection" });
  }
});

module.exports = router;
