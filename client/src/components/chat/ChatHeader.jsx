import { Loader2, Menu, Plus } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { PixelMark } from "../ui/Logo";
import GoogleStatusPill from "./GoogleStatusPill";

export default function ChatHeader({
  onOpenSidebar,
  google,
  onConnectGoogle,
  onRetryGoogle,
  onNewChat,
  isSending,
}) {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-ink/[0.07] bg-paper/82 px-3 backdrop-blur-xl sm:h-[72px] sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex size-9 items-center justify-center rounded-full text-ink/55 transition hover:bg-ink/[0.055] hover:text-ink lg:hidden"
          aria-label="Open sidebar"
          aria-controls="chat-sidebar"
        >
          <Menu className="size-[18px]" strokeWidth={1.8} />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <PixelMark className="size-6 shrink-0 text-ink sm:size-7" />
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <h1 className="truncate text-[12.5px] font-semibold tracking-[-0.02em] text-ink">
                Assistant
              </h1>
              <span className="hidden text-[9px] text-ink/20 sm:inline">/</span>
              <span className="hidden text-[9px] text-ink/45 sm:inline">
                Workspace
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-[9px] text-ink/44">
              {isSending ? (
                <>
                  <Loader2 className="size-2.5 animate-spin" />
                  Working on your request
                </>
              ) : (
                <>
                  <span className="size-1 rounded-[1px] bg-volt" />
                  Ask in plain language
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <GoogleStatusPill
          status={google.status}
          connecting={google.connecting}
          onConnect={
            google.status === "error" ? onRetryGoogle : onConnectGoogle
          }
        />
        <ThemeToggle
          size="sm"
          className="border-ink/10 text-ink/55 hover:border-ink/20 hover:bg-[var(--chat-card)] hover:text-ink"
        />
        <span className="hidden h-4 w-px bg-ink/10 sm:block" />
        <button
          type="button"
          onClick={onNewChat}
          disabled={isSending}
          title={
            isSending ? "Wait for Pixel to finish" : "Start a new chat screen"
          }
          className="group flex size-8 items-center justify-center rounded-full border border-ink/10 text-ink/55 transition hover:border-ink/20 hover:bg-[var(--chat-card)] hover:text-ink disabled:pointer-events-none disabled:opacity-35"
          aria-label="New chat"
        >
          <Plus
            className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-90"
            strokeWidth={1.8}
          />
        </button>
      </div>
    </header>
  );
}
