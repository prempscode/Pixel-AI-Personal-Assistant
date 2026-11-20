import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getFirstName } from "../../lib/constants";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useGoogleConnection } from "../../hooks/useGoogleConnection";
import { sendMessage } from "../../services/api";
import AuthGate from "../auth/AuthGate";
import Toast from "../ui/Toast";
import ChatHeader from "./ChatHeader";
import Composer from "./Composer";
import EmptyState from "./EmptyState";
import GoogleBanner from "./GoogleBanner";
import MessageList from "./MessageList";
import Sidebar from "./Sidebar";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readableError(error) {
  const status = error?.status;

  if (status === 401) {
    return "Your session has expired. Sign out and sign in again to keep going.";
  }

  if (status === 429) {
    return error?.retryAfter
      ? `Pixel has hit its request limit for now. Try again in about ${error.retryAfter} seconds.`
      : "Pixel has hit its request limit for now. Give it a minute and try again.";
  }

  if (status === 0) {
    return (
      error?.message ||
      "Pixel can't reach the server right now. Check the API connection and try again."
    );
  }

  return error?.message || "Something went wrong while Pixel was working.";
}

const googleReturns = {
  connected: {
    type: "success",
    message:
      "Google workspace connected. Pixel can now act in Calendar, Gmail, Tasks and Drive.",
  },
  error: {
    type: "error",
    message:
      "Google connection didn't finish. Try connecting again from your workspace panel.",
  },
  no_refresh_token: {
    type: "error",
    message:
      "Google didn't grant long-term access. Try connecting again; if it repeats, remove Pixel from your Google Account permissions and reconnect.",
  },
};

function ChatWorkspace({ user }) {
  useDocumentTitle("Pixel — Assistant");
  const { authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const google = useGoogleConnection();
  const {
    refresh: refreshGoogle,
    retry: retryGoogle,
    connect: connectGoogle,
  } = google;

  const [messages, setMessages] = useState([]);
  const [composerValue, setComposerValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [toast, setToast] = useState(null);

  const sendingRef = useRef(false);
  const autoScrollRef = useRef(true);
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const composerRef = useRef(null);
  const googleReturnHandled = useRef(false);

  const showToast = useCallback((type, message) => {
    setToast({ id: createId(), type, message });
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    if (!authError) return;
    showToast("error", authError);
    clearAuthError();
  }, [authError, clearAuthError, showToast]);

  useEffect(() => {
    if (googleReturnHandled.current) return;
    const result = searchParams.get("google");
    if (!result) return;

    googleReturnHandled.current = true;
    const content = googleReturns[result];

    if (content) {
      showToast(content.type, content.message);
    }

    if (result === "connected") {
      refreshGoogle();
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("google");
    const search = nextParams.toString();
    navigate(`/chat${search ? `?${search}` : ""}`, { replace: true });
  }, [searchParams, navigate, showToast, refreshGoogle]);

  useEffect(() => {
    if (!autoScrollRef.current) return undefined;
    if (messages.length === 0 && !isSending) return undefined;

    const frame = window.requestAnimationFrame(() => scrollToBottom("smooth"));
    return () => window.cancelAnimationFrame(frame);
  }, [messages, isSending, scrollToBottom]);

  const sendText = useCallback(
    async (rawText, { appendUser = true } = {}) => {
      const text = rawText.trim();
      if (!text || sendingRef.current) return;

      if (text.length > 4000) {
        showToast("error", "That message is too long. Keep it under 4,000 characters.");
        return;
      }

      sendingRef.current = true;
      autoScrollRef.current = true;
      setShowJumpToLatest(false);
      setIsSending(true);

      if (appendUser) {
        setMessages((previous) => [
          ...previous,
          {
            id: createId(),
            role: "user",
            text,
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      try {
        const result = await sendMessage(text);
        setMessages((previous) => [
          ...previous,
          {
            id: createId(),
            role: "assistant",
            text: result.reply,
            urls: result.urls,
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        setMessages((previous) => [
          ...previous,
          {
            id: createId(),
            role: "error",
            text: readableError(error),
            retryText: text,
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        sendingRef.current = false;
        setIsSending(false);
      }
    },
    [showToast],
  );

  const handleComposerSubmit = useCallback(() => {
    const text = composerValue.trim();
    if (!text || sendingRef.current) return;
    setComposerValue("");
    sendText(text);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  }, [composerValue, sendText]);

  const handleRetry = useCallback(
    (errorMessage) => {
      if (sendingRef.current || !errorMessage?.retryText) return;
      setMessages((previous) =>
        previous.filter((message) => message.id !== errorMessage.id),
      );
      sendText(errorMessage.retryText, { appendUser: false });
    },
    [sendText],
  );

  const handleNewChat = useCallback(() => {
    if (sendingRef.current) return;
    setMessages([]);
    setComposerValue("");
    setShowJumpToLatest(false);
    autoScrollRef.current = true;
    setSidebarOpen(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.requestAnimationFrame(() => composerRef.current?.focus());
  }, []);

  const handlePickPrompt = useCallback((prompt) => {
    setComposerValue(prompt);
    setSidebarOpen(false);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  }, []);

  const handleConnectGoogle = useCallback(async () => {
    try {
      await connectGoogle();
    } catch {
      // The hook exposes the error in the connection card and banner.
    }
  }, [connectGoogle]);

  const handleRetryGoogle = useCallback(() => {
    retryGoogle();
  }, [retryGoogle]);

  const handleScroll = useCallback((event) => {
    const element = event.currentTarget;
    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    autoScrollRef.current = distanceFromBottom < 140;
    setShowJumpToLatest(distanceFromBottom > 280);
  }, []);

  const firstName = getFirstName(user);
  const showGoogleBanner =
    !bannerDismissed &&
    (google.status === "disconnected" || google.status === "error");

  const sidebarProps = useMemo(
    () => ({
      user,
      open: sidebarOpen,
      onClose: () => setSidebarOpen(false),
      onNewChat: handleNewChat,
      onPickPrompt: handlePickPrompt,
      google,
      onConnectGoogle: handleConnectGoogle,
      onRetryGoogle: handleRetryGoogle,
      isSending,
    }),
    [
      user,
      sidebarOpen,
      handleNewChat,
      handlePickPrompt,
      google,
      handleConnectGoogle,
      handleRetryGoogle,
      isSending,
    ],
  );

  return (
    <div className="chat-shell flex h-dvh w-full overflow-hidden bg-paper text-ink">
      <Sidebar {...sidebarProps} />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          google={google}
          onConnectGoogle={handleConnectGoogle}
          onRetryGoogle={handleRetryGoogle}
          onNewChat={handleNewChat}
          isSending={isSending}
        />

        <AnimatePresence initial={false}>
          {showGoogleBanner && (
            <GoogleBanner
              key="google-banner"
              status={google.status}
              error={google.error}
              connecting={google.connecting}
              onConnect={handleConnectGoogle}
              onRetry={handleRetryGoogle}
              onDismiss={() => setBannerDismissed(true)}
            />
          )}
        </AnimatePresence>

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="chat-canvas thin-scrollbar relative flex-1 overflow-y-auto"
          >
            <div className="mx-auto flex min-h-full w-full max-w-[900px] flex-col px-4 sm:px-8">
              {messages.length === 0 && !isSending ? (
                <EmptyState
                  firstName={firstName}
                  onSelect={(prompt) => sendText(prompt)}
                  disabled={isSending}
                />
              ) : (
                <MessageList
                  messages={messages}
                  isSending={isSending}
                  onRetry={handleRetry}
                />
              )}
              <div ref={bottomRef} className="h-3 w-full shrink-0" />
            </div>
          </div>

          <AnimatePresence>
            {showJumpToLatest && (
              <motion.button
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  autoScrollRef.current = true;
                  scrollToBottom("smooth");
                }}
                className="absolute bottom-4 left-1/2 z-10 inline-flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full border border-ink/10 bg-[var(--chat-jump)] px-3 text-[9px] font-semibold text-ink/55 shadow-soft backdrop-blur-md transition hover:bg-[var(--chat-card-hover)] hover:text-ink"
              >
                <ArrowDown className="size-3" />
                Latest
              </motion.button>
            )}
          </AnimatePresence>
        </main>

        <Composer
          value={composerValue}
          onChange={setComposerValue}
          onSubmit={handleComposerSubmit}
          isSending={isSending}
          inputRef={composerRef}
        />
      </div>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  if (!user) return <AuthGate />;
  return <ChatWorkspace user={user} />;
}
