const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const agentRoutes = require("./routes/agentRoutes");
const googleRoutes = require("./routes/googleRoutes");
const Conversation = require("./models/Conversation");
const GoogleCredential = require("./models/GoogleCredential");
const authMiddleware = require("./middleware/authMiddleware");
const { decrypt } = require("./utils/tokenCrypto");
const { google } = require("googleapis");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "AI Agent Server Running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/agent", agentRoutes);
app.use("/api/google", googleRoutes);

app.delete("/api/account/data", authMiddleware, async (req, res) => {
  try {
    const credential = await GoogleCredential.findOne({ userId: req.user.id });

    if (credential) {
      try {
        const refreshToken = decrypt(
          credential.encrypted,
          credential.iv,
          credential.authTag,
        );
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI,
        );
        await oauth2Client.revokeToken(refreshToken);
      } catch (error) {
        console.error("Google revocation during data deletion:", error);
      }
    }

    await Promise.all([
      Conversation.deleteMany({ userId: req.user.id }),
      GoogleCredential.deleteOne({ userId: req.user.id }),
    ]);

    res.json({
      deleted: true,
      deletedConversations: true,
      deletedGoogleCredential: true,
      deletedSupabaseAccount: false,
    });
  } catch (error) {
    console.error("Account data deletion error:", error);
    res.status(500).json({ error: "Failed to delete Pixel data" });
  }
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
