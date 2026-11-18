const { google } = require("googleapis");
const GoogleCredential = require("../../models/GoogleCredential");
const { decrypt } = require("../../utils/tokenCrypto");

async function getGoogleClient(userId) {
  const credential = await GoogleCredential.findOne({ userId });

  if (!credential) {
    throw new Error("Google account is not connected. Connect it in Settings.");
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

/*
I created this function to manage Google authentication 
in my AI assistant project.

First, I imported the Google API library, the Google credentials 
model, and the decryption function.

Then I created an asynchronous function called `getGoogleClient`, 
which accepts the user ID.

I use the user ID to find that user's Google credentials from MongoDB.

If the user has not connected their Google account, I throw an error.

Next, I create a Google OAuth client using my application's 
Client ID, Client Secret, and Redirect URI, which are stored 
in environment variables.

After that, I decrypt the user's stored refresh token because 
we store it in encrypted form for security.

Then I set the decrypted refresh token in the OAuth client. 
This allows Google to generate new access tokens when required 
without asking the user to log in again.

Finally, I return the configured OAuth client so other backend 
functions can use it to access Google services like Calendar and Gmail.
*/
