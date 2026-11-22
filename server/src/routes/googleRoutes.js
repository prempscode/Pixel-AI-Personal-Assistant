const express = require("express");
const crypto = require("crypto");
const { google } = require("googleapis");
const authMiddleware = require("../middleware/authMiddleware");
const GoogleCredential = require("../models/GoogleCredential");
const { encrypt } = require("../utils/tokenCrypto");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL;

const STATE_SECRET = process.env.STATE_SECRET;
if (!STATE_SECRET) {
  throw new Error("STATE_SECRET is not set in the environment.");
}

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
    process.env.GOOGLE_REDIRECT_URI,
  );
}

function signState(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", STATE_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}
/*
signState creates a tamper-proof token before we redirect a user to Google 
for OAuth. First, it serializes the payload—which holds the userId, a random 
nonce, and an expiration time—and encodes it into a URL-safe Base64 string. 
Then, it generates an HMAC-SHA256 signature using a server-side secret key 
and appends it with a dot. That way, when Google redirects back to our callback, 
we can verify the signature to guarantee the state wasn't altered in transit 
and prevents CSRF attacks.
*/

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

/*
  Supabase identifies the user; Google authorizes
  access to Google services.
  payload.userId is the same verified Supabase user 
  ID carried in the signed state.
  findOneAndUpdate() doesn't change the user's identity; 
  it finds the credential document belonging to that user and updates its Google credential data, or creates one if necessary.
  upsert: true means create the document if it doesn't exist.
  new: true returns the updated document, but our code 
  doesn't use the returned value.
  The state protects against tampering and helps associate the 
  callback with the initiating user, but our implementation still needs one-time state/replay protection
  */

/*
  In my Pixel AI Personal Assistant project, I implemented Google OAuth 
  to allow users to connect their Google services like Calendar, Gmail, Tasks, and Drive.

  First, I protect the Google connection route using authentication 
  middleware, so only logged-in users can start the connection. Then I 
  generate a Google authorization URL with the required scopes and a signed 
  state containing the user's ID and an expiration time.

  When the user grants permission, Google redirects to my callback route with 
  an authorization code. My backend exchanges this code for Google tokens 
  and retrieves the refresh token.

  I encrypt the refresh token using AES-256-GCM before storing it in MongoDB. 
  This prevents the token from being stored as plain text. Later, my backend 
  can use the stored credential to access Google services without requiring 
  the user to reconnect every time.

  I also created a status route to check whether the user has connected their Google account.

  */

/**
   
  Why state is critical in generateAuthUrl ?

• Preventing CSRF(cross site request forgery) (Login Hijacking). Without a unique, unguessable state
    parameter, an attacker could complete an OAuth login with their own account,
    capture the callback URL (?code=...), and trick a victim into visiting it.
    The victim’s browser would silently link the attacker's third-party account
    to the victim's local session. Comparing the returned state against a value
    stored in the user's session/cookie blocks this.
*/
