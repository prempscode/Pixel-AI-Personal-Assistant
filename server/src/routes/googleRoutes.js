const express = require("express");
const crypto = require("crypto");
const { google } = require("googleapis");
const authMiddleware = require("../middleware/authMiddleware");
const GoogleCredential = require("../models/GoogleCredential");
const { encrypt } = require("../utils/tokenCrypto");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const STATE_SECRET = process.env.STATE_SECRET;
if (!STATE_SECRET) {
  throw new Error("STATE_SECRET is not set in the environment.");
}

// Least privilege: only what the 10 tools actually use.
// gmail.readonly is needed for search_gmail (messages.list); gmail.compose
// covers drafts and sending; drive.readonly covers list/search.
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
];

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI, // e.g. http://localhost:5000/api/google/callback
  );
}

// ---- signed OAuth state (no cookie needed, works across domains) ----
// state = base64url(payload) + "." + HMAC(payload). The userId inside can't be
// changed by anyone who doesn't know STATE_SECRET.

function signState(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", STATE_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

function verifyState(state) {
  if (typeof state !== "string") return null;
  const [data, sig] = state.split(".");
  if (!data || !sig) return null;

  const expected = crypto
    .createHmac("sha256", STATE_SECRET)
    .update(data)
    .digest("base64url");

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!payload.userId || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// Step 1: logged-in user asks for the Google consent URL
router.get("/auth", authMiddleware, (req, res) => {
  const state = signState({
    userId: req.user.id,
    nonce: crypto.randomBytes(8).toString("hex"),
    exp: Date.now() + 10 * 60 * 1000, // valid for 10 minutes
  });

  const url = getOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });

  res.json({ url });
});

// Step 2: Google redirects HERE. The refresh token never touches the browser.
router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    const payload = verifyState(state);
    if (!payload) {
      return res.status(400).send("Invalid or expired OAuth state.");
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
      { userId: payload.userId },
      { userId: payload.userId, ...encryptedData, connectedAt: new Date() },
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
