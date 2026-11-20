# Pixel — Frontend

The product front end for Pixel, a Google Workspace AI assistant. It includes a
marketing landing page and an authenticated chat workspace with a responsive
sidebar, voice input, real Google connection state, and live calls to the
existing Express API.

Only this `client/` directory was changed. The existing server, authentication
provider setup, API contracts, and database models are untouched.

## Stack

- React 19 + Vite 8
- Tailwind CSS 4 with a shared token-based design system
- Framer Motion for page transitions, message motion, and scroll reveals
- Three.js + React Three Fiber for the interactive, lazy-loaded hero pixel field
- GSAP + ScrollTrigger for the scroll-scrubbed manifesto section
- React Router for `/` and `/chat`
- Supabase Auth (Google OAuth), reusing the existing session flow
- React Markdown with GFM, line breaks, math, and KaTeX
- Lazy-loaded Prism syntax highlighting for assistant code blocks
- Lucide icons and self-hosted Manrope / Instrument Serif fonts

## Themes and motion

- Light and dark modes are available on every surface: landing page, auth gate,
  chat header/sidebar/messages/composer, toasts, connection states, and errors.
- The theme defaults to the operating system preference, can be toggled from
  the landing nav, the chat header, the chat sidebar, and the auth gate, and is
  stored in `localStorage` under `pixel-theme`.
- Theme changes use the browser View Transitions API where available, with a
  circular reveal from the toggle. Browsers without it get an instant fallback.
- The hero pixel sphere auto-rotates slowly clockwise independently of scroll.
  Drag with mouse or touch in any direction to orbit it with smooth momentum;
  the idle orbit pauses during the grab and eases back in on release, preserving
  the final orientation. Tap/click sends a spark through the blocks. It adapts
  tile count, star count, DPR, and antialiasing for compact/low-power devices,
  and pauses rendering when it leaves the viewport.
- Motion includes route fades and a route sweep, scroll parallax, smooth
  enter/exit hover lifts, static ambient card glows, animated icons,
  message/timeline reveals, and reduced-motion fallbacks throughout.

## Run locally

```bash
cd client
npm install
cp .env.example .env
# fill in the three values
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API is expected at the
URL in `VITE_BACKEND_URL` (default `http://localhost:5000`).

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Use the same Supabase project the server verifies JWTs with. The Google OAuth
sign-in redirect is the site origin, matching the existing app. After the
session returns, an intent flag moves the user into `/chat`. Keep the deployed
site origin in Supabase's allowed redirect URLs.

## API integration

The front end uses the existing endpoints exactly as implemented:

| Action | Request |
| --- | --- |
| Sign in | Supabase `signInWithOAuth({ provider: "google" })` |
| Chat | `POST /api/agent/chat` with `Authorization: Bearer <supabase JWT>` and `{ message }` |
| Google status | `GET /api/google/status` |
| Connect Google | `GET /api/google/auth`, then redirect to the returned URL |

The server's OAuth callback returns to `FRONTEND_URL?google=connected`. The SPA
preserves that query into `/chat`, refreshes the connection card, shows a
success toast, and cleans the URL.

No API calls are mocked in application code. Errors, rate limits, expired
sessions, unreachable servers, pending requests, disconnected Google accounts,
and empty conversations all have explicit UI states.

## Rich AI responses

Assistant messages use a dedicated, memoized Markdown renderer. User and error
messages keep their original plain-text presentation.

- GFM headings, emphasis, nested lists, task lists, tables, blockquotes,
  horizontal rules, strikethrough, inline code, fenced code, images, and math.
- Fenced code is rendered in a dark editor-style panel with language detection,
  syntax highlighting, line numbers for longer snippets, horizontal scrolling,
  and a copy button with confirmation.
- The Prism highlighter (JavaScript, TypeScript, JSX/TSX, Python, Java, C, C++,
  C#, HTML, CSS, JSON, SQL, Bash, YAML, Markdown, Go, Rust) is loaded lazily only
  when a response contains a code block.
- Every safe HTTP/HTTPS link becomes a compact service-aware card. Gmail,
  Google Tasks, Calendar, Drive, Docs, Sheets, Slides, Meet, GitHub, YouTube,
  LinkedIn, Notion, Figma, and Stack Overflow get named cards with suitable
  icons. Google service detection understands direct hosts, Calendar paths,
  Gmail's integrated Tasks/Calendar hash routes, and Google redirect URLs.
  Unknown domains use a globe icon and display the domain.
- Assistant messages sit on a themed translucent surface (with a transparent
  Pixel mark instead of a filled avatar), while user messages keep their
  contrasting bubble.
- Markdown link labels are preserved when meaningful. Raw URLs never display as
  raw text.
- Images preserve aspect ratio, are capped to the message width, open in a new
  tab, and fall back to a labelled placeholder if loading fails.
- Tables scroll horizontally on small screens; long code scrolls within its
  panel instead of widening the chat.
- Link and image URLs are restricted to safe HTTP/HTTPS values. Raw HTML is not
  enabled, and no `dangerouslySetInnerHTML` is used.
- URLs already shown in the Markdown are de-duplicated from the backend's
  additional `urls` list. Remaining backend URLs appear in the existing
  "Links from Pixel" section using the same cards.

The server's current system prompt asks the model for plain text, and it was
left untouched as requested. Rich formatting therefore renders whenever the
model returns Markdown or Markdown-like links; enabling Markdown in the prompt
is a backend-only decision for later.

## Routes

- `/` — landing page with product story, capabilities, security, how it works,
  final CTA, and footer.
- `/chat` — auth-gated workspace with sidebar, Google connection controls,
  conversation composer, voice input, message history states, link cards, and
  retryable errors.

## Behaviour notes

- The backend has one rolling conversation per user and does not expose a
  history or reset endpoint. The "New chat" action therefore starts a clean
  screen for this tab; it does not claim to erase the server's memory.
- Chat transcripts are intentionally kept in memory for the current tab. No
  fake history threads or dummy API data are used.
- Google tokens and scopes remain entirely server-side. The front end only
  receives `connected: true/false` from `/api/google/status`.
- Voice input uses the browser Web Speech API and is hidden when unsupported.
- `prefers-reduced-motion` disables non-essential motion, route sweeps, the
  theme reveal, and decorative hero effects. The hero's slow idle orbit stays
  present because it is core to the 3D object, while its sparkle/bob effects are
  reduced.
- The light theme uses an intentionally inverted editorial surface on the
  landing/auth pages and dedicated app-surface tokens in chat, so contrast is
  tuned per context rather than produced by a filter or simple CSS inversion.

## Production build

```bash
npm run build
npm run preview
npm run lint
```

`vercel.json` includes the SPA rewrite required for direct visits to `/chat`.
For other hosts, rewrite unknown paths to `index.html`.

The landing route, chat route, 3D scene, and syntax highlighter are code-split.
The Three.js chunk is loaded only by the hero, and the Prism highlighter only
when a chat response contains a code block. KaTeX styles ship with the chat
route.
