export const AUTH_INTENT_KEY = "pixel:auth-intent";

export const STARTER_PROMPTS = [
  {
    id: "calendar",
    title: "Protect my focus",
    prompt: "Block 2 to 3 PM tomorrow for deep work.",
    kind: "Calendar",
  },
  {
    id: "tasks",
    title: "Plan the follow-up",
    prompt: "Remind me to follow up with the design team on Monday.",
    kind: "Tasks",
  },
  {
    id: "gmail",
    title: "Write it for me",
    prompt: "Draft an email to Alex asking to move our call to Friday.",
    kind: "Gmail",
  },
  {
    id: "drive",
    title: "Find that file",
    prompt: "Find my latest invoice in Drive.",
    kind: "Drive",
  },
];

export const INTEGRATIONS = [
  { name: "Google Calendar", short: "Calendar" },
  { name: "Gmail", short: "Gmail" },
  { name: "Google Tasks", short: "Tasks" },
  { name: "Google Drive", short: "Drive" },
];

export const CAPABILITIES = [
  "Create tasks",
  "Block calendar time",
  "Draft email",
  "Search Gmail",
  "Search Drive",
  "Open links",
];

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getFirstName(user) {
  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "";
  return fullName.trim().split(/\s+/)[0] || "there";
}

export function getInitials(user) {
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "P";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function isSafeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatMessageTime(value = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}
