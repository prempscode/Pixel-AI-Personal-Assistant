const { google } = require("googleapis");
const GoogleCredential = require("../../models/GoogleCredential");
const { decrypt } = require("../../utils/tokenCrypto");

async function getGoogleClient(userId) {
  const credential = await GoogleCredential.findOne({ userId });

  if (!credential) {
    throw new Error(
      "Google account is not connected. Click 'Connect Google' in the top bar.",
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  const refreshToken = decrypt(
    credential.encrypted,
    credential.iv,
    credential.authTag,
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return oauth2Client;
}

module.exports = getGoogleClient;
