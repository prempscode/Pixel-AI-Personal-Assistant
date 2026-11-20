# Pixel client

React 19 + Vite + Tailwind CSS v4. Motion (Framer Motion) for UI animation,
GSAP/ScrollTrigger for the scroll-pinned section, React Three Fiber for the
landing hero.

```bash
cp .env.example .env   # VITE_BACKEND_URL, VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev            # http://localhost:5173
npm test               # 33 tests (Vitest + Testing Library)
npm run build
```

## Routes
- `/` landing page
- `/app` chat (requires sign-in; redirects to `/` otherwise)

Static hosts need an SPA fallback so `/app` survives a refresh (`vercel.json` is included).

## Backend endpoints used (unchanged)
| Call | Used for |
|---|---|
| Supabase Auth (Google) | sign in / out, JWT |
| `POST /api/agent/chat` | send a message -> `{ reply, urls }` |
| `GET /api/google/status` | connection state |
| `GET /api/google/auth` | Google consent URL |

## Structure
```
src/pages        Landing, Chat, NotFound
src/components   landing/ chat/ ui/
src/hooks        useChat, useGoogleStatus, useSpeech, useMediaQuery
src/services     api.js (typed errors), authService.js
src/test         api, landing, chat tests
```
