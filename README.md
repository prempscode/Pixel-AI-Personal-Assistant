# Pixel: AI Personal Assistant

Pixel turns plain-language (or voice) requests into real actions in your Google account. Ask it to add a to-do, block time on your calendar, draft or send an email, or find a file in Drive, and it picks the right tool, runs it, and reports what actually happened.

<!-- DEMO: record a 20-30 second screen capture, save it as docs/demo.gif, and uncomment the next line -->
<!-- ![Pixel demo](docs/demo.gif) -->

## What it can do

| Tool | Action |
|---|---|
| `create_google_task` | Add a to-do to Google Tasks |
| `create_calendar_event` | Create an event with a start and end time in Google Calendar |
| `create_gmail_draft` | Save a draft in Gmail (does not send) |
| `send_gmail` + `confirm_send_gmail` | Prepare an email, then send it only after the user confirms |
| `search_gmail` | Search emails (subject, sender, date) |
| `list_drive_files` | List the 10 most recently modified Drive files |
| `search_google_drive` | Search Drive by file name or content |
| `get_current_time` | Current date and time for any IANA timezone |
| `open_website` / `search_google` | Return a link for the user to open |

Other features: voice input (browser Web Speech API), per-user conversation memory, and a "Google connected" status in the header.

## How it works

```
React (Vite) ──Supabase JWT──▶ Express API ──▶ Groq (llama-3.3-70b, tool calling)
                                   │                      │
                                   │              picks a tool, gets the result,
                                   │              loops (max 5 iterations)
                                   ▼                      │
                              MongoDB                     ▼
                    (chat history, encrypted        Google APIs
                     Google refresh tokens)    (Tasks, Calendar, Gmail, Drive)
```

1. The user signs in with Google through **Supabase Auth**. Every API call carries the Supabase JWT, which the server verifies.
2. The user clicks **Connect Google** once. A separate server-side OAuth flow stores their Google refresh token, **encrypted with AES-256-GCM**, in MongoDB. The token never reaches the browser.
3. For each message, the server sends the last 20 messages, the system prompt, and the tool definitions to Groq.
4. If the model asks for tools, the server executes them with that user's credentials, feeds the results back, and repeats up to 5 times, then returns the final reply.
5. The reply is saved to the user's history (last 50 messages kept).

## Safety design

- **Emails are never sent in one step.** `send_gmail` only stores a preview. `confirm_send_gmail` sends it, and the server rejects it unless the confirmation arrives in a *later* chat turn, so the model cannot prepare and send in the same request.
- **No success without proof.** The system prompt forbids claiming an action succeeded unless a tool confirms it, and every tool result (including errors) is passed back to the model.
- **Input validation:** length limits, valid ISO dates, event end after start, single valid recipient, no line breaks in email headers (header injection), http/https-only links.
- **Signed OAuth state:** the OAuth `state` is an HMAC-signed, 10-minute token, so it cannot be forged or reused with another user's ID.
- **Least-privilege scopes:** Calendar events, Tasks, Gmail compose and read, Drive read-only.
- **Per-user rate limit** on `/api/agent/chat` (60 requests per 15 minutes), because one chat request can trigger up to 5 model calls.
- **Revoked or expired Google access** returns a clear "reconnect Google" message instead of a generic error.

## Tech stack

React 19, Vite, Node.js, Express 5, MongoDB (Mongoose), Supabase Auth, Groq API (`groq-sdk`), Google APIs (`googleapis`).

## Getting started

**Prerequisites:** Node 20+, a MongoDB database (local or Atlas), a Groq API key, a Supabase project with Google sign-in enabled, and a Google Cloud project.

### 1. Google Cloud (one time)
1. Enable these APIs: Google Tasks, Google Calendar, Gmail, Google Drive.
2. OAuth consent screen: add the scopes `calendar.events`, `tasks`, `gmail.compose`, `gmail.readonly`, `drive.readonly`, and add yourself as a test user.
3. Create an **OAuth client ID (Web)** with the redirect URI `http://localhost:5000/api/google/callback`.

### 2. Server
```bash
cd server
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:5000
```

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 5000) |
| `FRONTEND_URL` | Client URL for CORS and redirects, e.g. `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string |
| `GROQ_API_KEY` | Groq API key |
| `GROQ_MODEL` | Optional, defaults to `llama-3.3-70b-versatile` |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Supabase project, used to verify user JWTs |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth client |
| `GOOGLE_REDIRECT_URI` | `http://localhost:5000/api/google/callback` |
| `TOKEN_ENCRYPTION_KEY` | 64 hex characters (32 bytes) used to encrypt refresh tokens |
| `STATE_SECRET` | Random secret used to sign the OAuth state |
| `DEFAULT_TIMEZONE` | Optional, defaults to `Asia/Kolkata` |

Generate `TOKEN_ENCRYPTION_KEY` and `STATE_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Client
```bash
cd client
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

| Variable | Purpose |
|---|---|
| `VITE_BACKEND_URL` | Server base URL, e.g. `http://localhost:5000` (no `/api`) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |

### 4. First run
Sign in, click **Connect Google**, accept the permissions, then try:
- "Remind me to call John tomorrow at 6 PM"
- "Block 2 to 3 PM on Friday for a project review"
- "Draft an email to alex@example.com asking to reschedule our meeting"
- "Find my latest invoice in Drive"

## Tests

```bash
cd server
npm test
```

20 tests using Node's built-in test runner. Google APIs, MongoDB, and token decryption are stubbed, so no network or `.env` is needed. They cover the email confirmation flow, header-injection and recipient checks, UTF-8 email encoding, date and URL validation, unknown tools, and revoked-token handling.

## Deployment

- **Database:** MongoDB Atlas.
- **Backend (Render or similar):** root directory `server`, build `npm install`, start `npm start`, and add all server env vars. Set `FRONTEND_URL` to the deployed client URL and `GOOGLE_REDIRECT_URI` to `https://<backend-domain>/api/google/callback`, and add that same URI to the Google OAuth client.
- **Frontend (Vercel or similar):** root directory `client`, add the three `VITE_` variables, and add the deployed URL to Supabase's allowed redirect URLs.
- Until the Google app passes verification, only listed test users can connect their account.

## Known limitations

- Pending email confirmations are kept in server memory. They reset on restart and are not shared across multiple instances (use MongoDB for that).
- There are no tools yet to list, update, or delete tasks and calendar events.
- Gmail and Drive scopes are restricted by Google, so a public launch requires Google's app verification.
- The 5-iteration cap means very complex requests are asked to be simplified.

## Roadmap

- [ ] List, update, and delete tools for tasks and events
- [ ] Confirm button in the chat UI for pending emails
- [ ] Streaming responses
- [ ] Persist pending confirmations in MongoDB
