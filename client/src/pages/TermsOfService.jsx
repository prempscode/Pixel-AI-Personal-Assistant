import { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";

export default function TermsOfService() {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]');
    const previousContent = previousDescription?.getAttribute("content");
    document.title = "Terms of Service — Pixel";
    let meta = previousDescription;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "Terms for using Pixel, including Google account connections, AI-generated actions, acceptable use, and limitations.");
    return () => {
      document.title = previousTitle;
      if (meta && previousContent) meta.setAttribute("content", previousContent);
    };
  }, []);

  const sections = [
    { id: "acceptance", heading: "Acceptance of these terms", content: (
      <><p>By using Pixel, you agree to these Terms of Service and to the Privacy Policy. If you do not agree, do not use Pixel or connect a Google account.</p><p>These terms apply to the Pixel website and current assistant features. Material changes may be posted with an updated effective date.</p></>
    ) },
    { id: "service", heading: "What Pixel does", content: (
      <><p>Pixel is a personal AI assistant that interprets chat requests and, when your Google account is connected, may create tasks or calendar events, draft or send Gmail, search Gmail, and list or search Google Drive files.</p><p>Pixel uses Supabase for sign-in, MongoDB for application records, Google APIs for account actions, and Groq for AI processing. Some features depend on successful authentication and third-party availability.</p></>
    ) },
    { id: "google", heading: "Connecting Google", content: (
      <><p>You authorize Pixel only for the Google permissions you approve. Pixel requests Calendar event, Tasks, Gmail compose/read-only, and Drive read-only access. You remain responsible for any Google account connected to your Pixel account and should keep it secure.</p><p>At present, Pixel has no in-app Google-disconnect or Google-credential-deletion control. You may revoke Pixel's access in <a className="underline decoration-paper/30 underline-offset-4 hover:text-paper" href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account permissions</a>.</p></>
    ) },
    { id: "review", heading: "Review AI actions", content: (
      <><p>You are responsible for reviewing AI-generated instructions, drafts, task details, recipients, dates, times, and other content before relying on it or confirming an action. AI can misunderstand a request or produce inaccurate, incomplete, or inappropriate output.</p><p>Email sending has a confirmation step in the current implementation: Pixel shows the proposed email and asks you to reply “yes” before sending. Tasks and calendar events may be created directly after the assistant chooses the relevant tool, so verify titles, attendees, locations, time zones, deadlines, and important details.</p></>
    ) },
    { id: "actions", heading: "Emails, tasks, calendar, and files", content: (
      <><p>Email drafts are created in Gmail, while sending requires an affirmative confirmation in a separate chat turn. Search results and file links come from Google and may be incomplete or change after they are shown.</p><p>Verify important actions and results in Google itself. Pixel can report only the response it receives from Google or the AI model and cannot guarantee that a recipient received mail, a task sync completed, a calendar event was accepted, or a file remained available.</p></>
    ) },
    { id: "acceptable", heading: "Acceptable use", content: (
      <><p>You may use Pixel for lawful, personally authorized, and legitimate assistance. You must have permission to access the Google account and content you ask Pixel to read or modify.</p></>
    ) },
    { id: "prohibited", heading: "Prohibited misuse", content: (
      <><ul className="list-disc space-y-2 pl-5"><li>Breaking any law or infringing another person's rights or privacy.</li><li>Attempting unauthorized access, scraping, abuse of credentials, service interference, or reverse engineering controls.</li><li>Using Pixel to send spam, malicious content, deceptive messages, harmful instructions, or abusive communications.</li><li>Using Google data or Pixel results to harm, harass, surveil, impersonate, or discriminate against anyone.</li><li>Attempting to bypass limits, authentication, provider controls, or security measures.</li></ul></>
    ) },
    { id: "third-party", heading: "Third-party services", content: (
      <><p>Pixel depends on Google, Supabase, MongoDB, Groq, hosting providers, and internet connectivity. They may experience outages, change APIs or pricing, enforce limits, or modify availability. Pixel is not responsible for their independent actions or failures.</p></>
    ) },
    { id: "responsibility", heading: "Data and account responsibility", content: (
      <><p>You are responsible for protecting your Pixel sign-in, device, connected Google account, and any sensitive information included in prompts or results. Do not enter secrets or information you are not authorized to share. Your data and account may be affected by a provider, device compromise, or a Pixel bug or outage.</p><p>Privacy, collection, storage, and deletion details are described in the <a className="underline decoration-paper/30 underline-offset-4 hover:text-paper" href="/privacy">Privacy Policy</a>.</p></>
    ) },
    { id: "changes", heading: "Changes, suspension, or termination", content: (
      <><p>Pixel may add, change, pause, or remove features or service access when needed to maintain safety, address abuse, respond to provider requirements, or operate the application. We may suspend or terminate access for misuse or security reasons. If possible, we will provide reasonable notice of material changes, although emergency changes may be made immediately.</p></>
    ) },
    { id: "disclaimer", heading: "Warranty disclaimer", content: (
      <><p>Pixel is provided on an “as is” and “as available” basis. To the fullest extent allowed by law, we do not promise uninterrupted availability, accuracy, fitness for a particular purpose, or that every AI-generated suggestion or Google action will be correct or successful.</p></>
    ) },
    { id: "liability", heading: "Limitation of liability", content: (
      <><p>To the extent permitted by applicable law, neither the Pixel operator nor its providers will be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, data, opportunities, or goodwill, arising from use or inability to use Pixel or a connected service.</p><p>Where liability cannot legally be excluded or limited, it will be limited to the fullest amount and scope allowed by law. These terms do not exclude or limit rights or liability that cannot lawfully be waived.</p><p><strong>Operator, governing-law, and damages limitation placeholders require owner review:</strong> [LEGAL_ENTITY_OR_OPERATOR_NAME], [GOVERNING_LAW_AND_JURISDICTION], [COURSE_OF_OPERATION_OR_LIMIT_OF_FEE_VALUE].</p></>
    ) },
    { id: "contact", heading: "Contact", content: (
      <><p><strong>Support or legal contact: </strong>prempravash65@gmail.com</p><p><strong>Operator: </strong>Prem Pravash Sahu</p><p><strong>Location: </strong>Bhubaneswar, Odisha, India</p></>
    ) },
  ];

  return (
    <LegalLayout
      title="Terms of Service"
      effectiveDate="November 23, 2026"
      description="Using Pixel"
      sections={sections}
    />
  );
}
