import { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";

export default function PrivacyPolicy() {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]');
    const previousContent = previousDescription?.getAttribute("content");
    document.title = "Privacy Policy — Pixel";
    let meta = previousDescription;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "Learn what information Pixel collects, how Google and Groq integrations are used, and how to manage your connected account.");
    return () => {
      document.title = previousTitle;
      if (meta && previousContent) meta.setAttribute("content", previousContent);
    };
  }, []);

  const sections = [
    {
      id: "overview",
      heading: "What Pixel is",
      content: (
        <>
          <p>Pixel is a personal AI assistant that helps users prepare and perform actions in their Google account through chat. After sign-in, Pixel can create tasks and calendar events, create Gmail drafts, send email after confirmation, search Gmail, and list or search Google Drive files.</p>
          <p>The app combines Google OAuth, the user's Supabase account, MongoDB conversation and credential storage, and Groq-hosted AI processing. A particular feature is available only when its corresponding Google permission and user action are present.</p>
        </>
      ),
    },
    {
      id: "information",
      heading: "Information we collect",
      content: (
        <>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Account information:</strong> Supabase authentication identifies the signed-in user. Pixel receives the authenticated account identity and session token needed to authorize protected requests.</li>
            <li><strong>Chat information:</strong> Pixel stores the text of user messages and assistant replies in MongoDB, keeping the latest messages for that account.</li>
            <li><strong>Google connection data:</strong> Pixel stores the Google OAuth refresh token in encrypted form and a connection timestamp. It does not store the refresh token in plain text.</li>
            <li><strong>Google data used at request time:</strong> Depending on the request and permissions, this may include Gmail messages or metadata found through search, recent or matching Drive file names and links, task details, calendar event details, and email content the user asks Pixel to create or send.</li>
          </ul>
          <p>Pixel does not store a complete copy of all Gmail, Drive, Calendar, or Tasks data in MongoDB. Google data is fetched for requested actions and may be included in chat responses or sent to AI processing as described below.</p>
        </>
      ),
    },
    {
      id: "google",
      heading: "Google permissions",
      content: (
        <>
          <p>Pixel requests only these Google OAuth scopes:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><code>calendar.events</code> — create and manage calendar events in the user's primary calendar.</li>
            <li><code>tasks</code> — create and manage task items.</li>
            <li><code>gmail.compose</code> — create drafts and send email only after the app's confirmation flow.</li>
            <li><code>gmail.readonly</code> — search existing Gmail messages and read results needed for a request.</li>
            <li><code>drive.readonly</code> — list recent Drive files and search files by name or content.</li>
          </ul>
          <p>These permissions are used to execute the user's requested actions. Pixel may read Google-derived content and, when a tool is used, send relevant details to the AI service to continue or complete the request.</p>
        </>
      ),
    },
    {
      id: "ai",
      heading: "AI processing",
      content: (
        <>
          <p>Pixel uses Groq as an AI provider. When you send a chat message, Pixel may send that message, recent conversation history, system instructions, and tool inputs or tool results to Groq. If you ask about Gmail or Drive, relevant returned Google data may therefore be included in the request to Groq. Google-derived data is not claimed to be excluded from AI processing.</p>
          <p>This processing is used to understand a request, select a tool, generate a response or draft, and summarize tool results. Pixel does not provide a verified statement here about Groq's independent retention or training practices; users should also review Groq's current terms and privacy notice.</p>
        </>
      ),
    },
    {
      id: "storage",
      heading: "Storage and retention",
      content: (
        <>
          <p>Conversation documents are stored in MongoDB under the Supabase user ID. Each conversation retains up to 50 stored messages and loads up to the latest 20 messages for new AI requests. Google refresh credentials are stored in MongoDB with AES-256-GCM encryption: the encrypted value, initialization vector, and authentication tag are stored separately; the key is held in a server environment variable.</p>
          <p>Pixel retains conversations and Google credentials until they are replaced or deleted through an available Pixel control. The chat sidebar's “Clear chat history” control deletes the saved conversation and clears its AI context without disconnecting Google. No separate numeric retention period is currently published for Supabase account data, provider logs, or backups.</p>
          <p>The account settings “Delete Pixel data” control deletes Pixel conversation records and the stored Google credential. This action revokes Pixel's Google refresh-token access and signs you out. It does not delete your Supabase sign-in account or independently stored data held by Google, Groq, Supabase, or MongoDB provider backups.</p>
        </>
      ),
    },
    {
      id: "cookies",
      heading: "Sessions and cookies",
      content: (
        <>
          <p>Pixel uses Supabase OAuth and Supabase-authenticated Bearer access tokens to identify the signed-in user. The Supabase client manages browser authentication state and supplies the access token to protected backend requests. Pixel also uses signed, short-lived OAuth state parameters during Google connection to associate the callback with the authenticated user and reduce OAuth tampering or CSRF risk.</p>
          <p>The code does not implement application-specific analytics or advertising cookies. Supabase or other providers may set or manage authentication-related browser storage or cookies as part of their own services.</p>
        </>
      ),
    },
    {
      id: "providers",
      heading: "Service providers",
      content: (
        <>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Supabase:</strong> Google sign-in and authentication identity/session verification.</li>
            <li><strong>Google:</strong> Calendar, Tasks, Gmail, and Drive APIs under the scopes listed above.</li>
            <li><strong>Groq:</strong> AI text processing used to interpret requests and generate responses or tool calls.</li>
            <li><strong>MongoDB:</strong> Storage for conversations and encrypted Google credential records.</li>
          </ul>
          <p>Pixel does not sell personal information. Provider information is shared only as needed to operate Pixel's features or when disclosure is required by law or needed to protect users and the service.</p>
        </>
      ),
    },
    {
      id: "choices",
      heading: "Your choices and Google connection",
      content: (
        <>
          <p>You can sign out of Pixel through the account controls in the assistant. Signing out ends the local Pixel/Supabase session but does not by itself delete Pixel data or Google credentials.</p>
          <p>When a Google account is connected, the account card provides a “Disconnect Google” control that revokes the stored refresh token and deletes Pixel's stored Google credential. You can also open <a className="underline decoration-paper/30 underline-offset-4 hover:text-paper" href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account permissions</a>, find Pixel, and remove access directly.</p>
          <p>Revoking Pixel in Google may cause expired or revoked-token errors until Google access is connected again. Revocation should stop new Google API access, but it does not by itself delete conversation data in MongoDB or an account at Supabase.</p>
        </>
      ),
    },
    {
      id: "deletion",
      heading: "Account and data deletion",
      content: (
        <>
          <p>Account settings include a “Delete Pixel data” control. It deletes Pixel conversation records and the stored Google credential, attempts to revoke Google's refresh token, and signs you out.</p>
          <p>This control does not delete the Supabase authentication account, Google account, Groq records, or MongoDB provider backup copies. Provider-side retention and backup removal remain subject to the applicable provider. If you need the Supabase account deleted, contact the privacy email below.</p>
        </>
      ),
    },
    {
      id: "security",
      heading: "Security practices and limitations",
      content: (
        <>
          <p>Pixel verifies protected backend requests with Supabase access tokens, signs OAuth state with HMAC-SHA256, uses a 10-minute OAuth state expiry, encrypts stored Google refresh tokens with AES-256-GCM, limits chat request bodies to 4,000 characters, and applies a rate limit to chat requests.</p>
          <p>These are application-level safeguards, not guarantees. The codebase does not verify or claim certifications, penetration-testing results, SOC 2 compliance, or zero-risk security. Supabase, MongoDB, hosting, Google, Groq, browser, and network providers also have their own security responsibilities and risks.</p>
        </>
      ),
    },
    {
      id: "contact",
      heading: "Contact",
      content: (
        <>
          <p><strong>Privacy contact :</strong>prempravash65@gmail.com</p>
          <p><strong>Operator :</strong>Prem Pravash Sahu</p>
          <p><strong>Location:</strong>Bhubaneswar, Odisha, India</p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      effectiveDate="November 23, 2026"
      description="Pixel privacy"
      sections={sections}
    />
  );
}
