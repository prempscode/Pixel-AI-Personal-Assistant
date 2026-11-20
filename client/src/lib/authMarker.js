// Captured once, at module load, BEFORE Supabase or the router clean the URL.
// True when this page load is the return leg of Supabase sign-in or of the
// server's Google connect flow (`?google=connected|error|no_refresh_token`).
// The landing page uses it ONCE to forward the user straight into the app,
// then clears it so visiting "/" later in the same session stays on the
// landing page.
const href = typeof window === "undefined" ? "" : window.location.href;

let pending =
  /[#&?]access_token=/.test(href) ||
  /[?&]code=/.test(href) ||
  /[?&]google=/.test(href);

export const hasAuthReturn = () => pending;
export const clearAuthReturn = () => {
  pending = false;
};
