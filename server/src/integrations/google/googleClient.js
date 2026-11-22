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

/* in steps what this file do :
Finds your Google credential document in MongoDB.
Decrypts your refresh token.
Creates a Google OAuth client.
Sets the refresh token on that client.
Returns the client to the Calendar tool.
The Calendar tool uses it to create the event.
 */

/* in one sentence what this file do :
getGoogleClient() is a reusable authentication helper that 
retrieves a user's encrypted Google refresh token from MongoDB, decrypts it,
configures a Google OAuth2 client, and 
returns that client for authenticated Google API operations.
*/

/*
Supabase handles authentication for my application, so the frontend
 sends its Supabase access token with every protected API request. 
 The backend verifies it and identifies the user. Google authentication
  is separate. When the AI needs a Google service, the backend fetches 
  the user's encrypted Google refresh token from MongoDB, decrypts it, 
  and uses the Google OAuth client to obtain a valid access token. 
  We don't query MongoDB for Google credentials on every request, only
  when a Google service is required, and credentials can be reused 
  across multiple tool calls in the same agent execution.

*/
