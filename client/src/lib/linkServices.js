import {
  CalendarDays,
  FileText,
  FolderOpen,
  Globe2,
  ListTodo,
  Mail,
  Presentation,
  Table2,
  Video,
} from "lucide-react";
import {
  FigmaBrandIcon,
  GitHubBrandIcon,
  LinkedInBrandIcon,
  NotionBrandIcon,
  StackOverflowBrandIcon,
  YouTubeBrandIcon,
} from "../components/chat/BrandIcons";
import { isSafeUrl } from "./constants";

const tones = {
  coral: "text-coral bg-coral/[0.08] border-coral/15",
  sky: "text-sky bg-sky/[0.09] border-sky/20",
  volt: "text-volt bg-volt/[0.1] border-volt/20",
  neutral: "text-ink/60 bg-ink/[0.05] border-ink/10",
};

const services = [
  {
    name: "Google Tasks",
    Icon: ListTodo,
    aliases: ["google tasks", "tasks"],
    matches: (host, route) =>
      host === "tasks.google.com" ||
      (host === "mail.google.com" && route.includes("tasks")) ||
      (isDomain(host, "google.com") && route.includes("/tasks")),
    toneClass: tones.volt,
  },
  {
    name: "Google Calendar",
    Icon: CalendarDays,
    aliases: ["google calendar", "calendar"],
    matches: (host, route) =>
      host === "calendar.google.com" ||
      (host === "mail.google.com" && route.includes("calendar")) ||
      (isDomain(host, "google.com") && route.includes("/calendar")),
    toneClass: tones.sky,
  },
  {
    name: "Gmail",
    Icon: Mail,
    aliases: ["gmail"],
    matches: (host) => host === "mail.google.com" || host === "gmail.com",
    toneClass: tones.coral,
  },
  {
    name: "Google Drive",
    Icon: FolderOpen,
    aliases: ["google drive", "drive"],
    matches: (host) => host === "drive.google.com",
    toneClass: tones.volt,
  },
  {
    name: "Google Docs",
    Icon: FileText,
    aliases: ["google docs", "docs"],
    matches: (host, route) =>
      host === "docs.google.com" &&
      !route.startsWith("/spreadsheets") &&
      !route.startsWith("/presentation"),
    toneClass: tones.sky,
  },
  {
    name: "Google Sheets",
    Icon: Table2,
    aliases: ["google sheets", "sheets"],
    matches: (host, route) =>
      host === "sheets.google.com" ||
      (host === "docs.google.com" && route.startsWith("/spreadsheets")),
    toneClass: tones.volt,
  },
  {
    name: "Google Slides",
    Icon: Presentation,
    aliases: ["google slides", "slides"],
    matches: (host, route) =>
      host === "slides.google.com" ||
      (host === "docs.google.com" && route.startsWith("/presentation")),
    toneClass: tones.coral,
  },
  {
    name: "Google Meet",
    Icon: Video,
    aliases: ["google meet", "meet"],
    matches: (host) => host === "meet.google.com",
    toneClass: tones.sky,
  },
  {
    name: "GitHub",
    Icon: GitHubBrandIcon,
    aliases: ["github"],
    matches: (host) => host === "github.com" || host.endsWith(".github.com"),
    toneClass: tones.neutral,
  },
  {
    name: "YouTube",
    Icon: YouTubeBrandIcon,
    aliases: ["youtube", "youtu.be"],
    matches: (host) => isDomain(host, "youtube.com") || host === "youtu.be",
    toneClass: tones.coral,
  },
  {
    name: "LinkedIn",
    Icon: LinkedInBrandIcon,
    aliases: ["linkedin"],
    matches: (host) => isDomain(host, "linkedin.com"),
    toneClass: tones.sky,
  },
  {
    name: "Notion",
    Icon: NotionBrandIcon,
    aliases: ["notion"],
    matches: (host) =>
      isDomain(host, "notion.so") || isDomain(host, "notion.site"),
    toneClass: tones.neutral,
  },
  {
    name: "Figma",
    Icon: FigmaBrandIcon,
    aliases: ["figma"],
    matches: (host) => isDomain(host, "figma.com"),
    toneClass: tones.coral,
  },
  {
    name: "Stack Overflow",
    Icon: StackOverflowBrandIcon,
    aliases: ["stack overflow", "stackoverflow"],
    matches: (host) => isDomain(host, "stackoverflow.com"),
    toneClass: tones.coral,
  },
];

const genericLabels = new Set([
  "link",
  "here",
  "click here",
  "open",
  "open link",
  "this link",
  "website",
  "url",
]);

function isDomain(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTrailingUrlPunctuation(value) {
  return value.replace(/[.,;:!?]+$/g, "");
}

export function normalizeUrlKey(value) {
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${path}${url.search}`.toLowerCase();
  } catch {
    return String(value || "").toLowerCase();
  }
}

export function extractUrls(text) {
  if (!text) return [];
  const matches = String(text).match(/https?:\/\/[^\s<>"')\]]+/gi) || [];
  return [
    ...new Set(matches.map((url) => stripTrailingUrlPunctuation(url))),
  ];
}

export function getLinkMeta(rawUrl, linkText = "") {
  if (!isSafeUrl(rawUrl)) return null;

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  // Gmail's integrated views expose Tasks and Calendar through the hash
  // (for example mail.google.com/mail/u/0/#tasks), so include those routes.
  const route = `${parsed.pathname}${parsed.hash}`.toLowerCase();
  let service = services.find((entry) => entry.matches(host, route));

  // Resolve service identity through Google redirect links without changing
  // the destination URL that the card actually opens.
  if (
    !service &&
    isDomain(host, "google.com") &&
    (parsed.pathname === "/url" || parsed.pathname === "/redirect")
  ) {
    const target =
      parsed.searchParams.get("q") ||
      parsed.searchParams.get("url") ||
      parsed.searchParams.get("continue");

    if (target && isSafeUrl(target)) {
      try {
        const targetUrl = new URL(target);
        const targetHost = targetUrl.hostname
          .toLowerCase()
          .replace(/^www\./, "");
        const targetRoute =
          `${targetUrl.pathname}${targetUrl.hash}`.toLowerCase();
        service = services.find((entry) =>
          entry.matches(targetHost, targetRoute),
        );
      } catch {
        // Leave the link as an unknown website.
      }
    }
  }
  const text = cleanText(linkText);
  const lowerText = text.toLowerCase();
  const rawText =
    !text ||
    /^https?:\/\//i.test(text) ||
    lowerText === parsed.href.toLowerCase() ||
    lowerText === host;
  const mentionsDifferentService =
    service &&
    services.some(
      (other) =>
        other !== service &&
        other.aliases.some((alias) => lowerText.includes(alias)),
    );
  const meaningfulText =
    !rawText &&
    !genericLabels.has(lowerText) &&
    !mentionsDifferentService;

  let label;
  let sublabel;

  if (meaningfulText) {
    label = text;
    sublabel = service?.name || host;
  } else {
    label = service?.name || host;
    sublabel = service ? "Open link" : "Open website";
  }

  if (label === sublabel) {
    sublabel = "Open link";
  }

  return {
    url: rawUrl,
    hostname: host,
    serviceName: service?.name || null,
    label,
    sublabel,
    Icon: service?.Icon || Globe2,
    toneClass: service?.toneClass || tones.neutral,
  };
}
