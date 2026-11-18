import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";

function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I can create Google Tasks, Calendar events, and Gmail drafts for you. What would you like me to do?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const result = await sendMessage(text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: result.reply },
      ]);
      result.urls?.forEach((url) => window.open(url, "_blank"));
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="msg assistant">Thinking…</div>}
        <div ref={bottomRef} />
      </div>

      <form className="input-bar" onSubmit={handleSend}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Remind me to call John tomorrow at 6 PM"
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
