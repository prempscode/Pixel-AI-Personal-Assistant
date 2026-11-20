import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

const auth = { user: null, loading: false };
vi.mock("../context/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("../services/authService", () => ({ signInWithGoogle: vi.fn() }));
vi.mock("../lib/supabaseClient", () => ({ supabase: {} }));
// No WebGL in jsdom.
vi.mock("../components/landing/PixelField", () => ({ default: () => <div data-testid="field" /> }));

const returnFlag = { value: false };
vi.mock("../lib/authMarker", () => ({
  hasAuthReturn: () => returnFlag.value,
  clearAuthReturn: () => { returnFlag.value = false; },
}));

import Landing from "../pages/Landing";
import { signInWithGoogle } from "../services/authService";
import { ToastProvider } from "../components/ui/Toast";

function Where() {
  const l = useLocation();
  return <div data-testid="where">{l.pathname + l.search}</div>;
}

function setup() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Where />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  auth.user = null;
  returnFlag.value = false;
  vi.clearAllMocks();
});

describe("Landing", () => {
  it("renders the hero, capability cards and safety section", async () => {
    setup();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/say it once/i);
    expect(screen.getByText("Google Tasks", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /one sentence in/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /built to act/i })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /from sentence to/i })).toBeInTheDocument();
  });

  it("starts Google sign-in from the hero button", async () => {
    signInWithGoogle.mockResolvedValue();
    setup();
    await userEvent.click(screen.getAllByRole("button", { name: /continue with google/i })[0]);
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("shows an error toast when sign-in fails", async () => {
    signInWithGoogle.mockRejectedValue(new Error("popup blocked"));
    setup();
    await userEvent.click(screen.getAllByRole("button", { name: /continue with google/i })[0]);
    expect(await screen.findByText(/couldn't start google sign-in/i)).toBeInTheDocument();
    expect(screen.getByText(/popup blocked/i)).toBeInTheDocument();
  });

  it("shows 'Open Pixel' (no forced redirect) for a signed-in visitor on a normal visit", () => {
    auth.user = { id: "u1" };
    setup();
    expect(screen.getAllByRole("button", { name: /open pixel/i }).length).toBeGreaterThan(0);
    expect(screen.queryByTestId("where")).not.toBeInTheDocument();
  });

  it("forwards into /app with the google result after the OAuth return", async () => {
    auth.user = { id: "u1" };
    returnFlag.value = true;
    window.history.pushState({}, "", "/?google=connected");
    setup();
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("/app?google=connected"));
    window.history.pushState({}, "", "/");
  });
});
