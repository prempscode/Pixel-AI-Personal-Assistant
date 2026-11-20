import { AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({
  messages,
  isSending,
  onRetry,
}) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Conversation with Pixel"
      className="space-y-7 py-8 sm:space-y-8 sm:py-10"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isSending={isSending}
          onRetry={onRetry}
        />
      ))}

      <AnimatePresence>{isSending && <TypingIndicator />}</AnimatePresence>
    </div>
  );
}
