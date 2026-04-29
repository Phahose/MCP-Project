import { useState, useRef, useEffect } from "react";
import "./App.css";
import { ResultsTable } from "./components/ResultsTable";
import type { Finding } from "./types/Finding";
import { runAgent } from "./ai/orchestrator";
import type { DisplayMessage } from "./ai/orchestrator";
import ReactMarkdown from "react-markdown";



export default function App() {
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentFinding, setCurrentFinding] = useState<Partial<Finding> | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleChatSend = async () => {
    const input = chatInput.trim();
    if (!input || isLoading) return;
    setChatInput("");
    setIsLoading(true);

    try {
    const { text, finding, messages: updatedMessages } = await runAgent(
      input,
      (update) => {
        setProgressLog(prev => [...prev, update.message]); // append each step
      }
    );
    console.log("Agent returned finding:", finding);
    console.log("Agent returned messages:", updatedMessages);
    console.log("Final Answer:", text);
    setMessages(updatedMessages);
    if (finding) setCurrentFinding(finding);
  } catch (error) {
    console.error("Agent error:", error);
  } finally {
    setIsLoading(false);
    setProgressLog([]);
  }
  };

  return (
    <div className="App">
      {/* NAV */}
      <div className="nav">
        <div className="logo">GoA · <span>Procurement Oversight</span></div>
        <div className="nav-links">
          <span className="active">Findings</span>
        </div>
        <div className="nav-right">Nicholas Ekwom, Shub Makwana, Jay Dayani</div>
      </div>

      <div className="container">

        {/* HERO — only show when no messages yet */}
        {messages.length === 0 && (
          <div className="google-hero">
            <h1 className="google-title">Argus Says Hi!</h1>
            <div className="google-input-wrapper">
              <input
                className="google-input"
                placeholder="Well... anything about procurement data..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleChatSend();
                }}
                disabled={isLoading}
              />
            </div>
            <div className="google-suggestions">
              <p>You can ask Argus any question such as:</p>
              <ul>
                <li onClick={() => setChatInput("Amendment creep in Health")} style={{ cursor: "pointer" }}>
                  Amendment creep in Health
                </li>
                <li onClick={() => setChatInput("Find contract splitting in Transportation")} style={{ cursor: "pointer" }}>
                  Find contract splitting in Transportation
                </li>
                <li onClick={() => setChatInput("Show sole source patterns in Health")} style={{ cursor: "pointer" }}>
                  Show sole source patterns in Health
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {isLoading && (
        <div className="loading-bar">
          <div className="loading-bar-fill" />
          <div className="progress-log">
            {progressLog.map((msg, i) => (
              <div key={i} className={`progress-step ${i === progressLog.length - 1 ? "active" : "done"}`}>
                {i === progressLog.length - 1 ? "⟳" : "✓"} {msg}
              </div>
            ))}
          </div>
        </div>
      )}

        {/* MAIN CONTENT — results + chat side by side */}
        {messages.length > 0 && (
          <div className="content-with-chat">

            {/* LEFT — results table */}
            <div className="content-main">
              {isLoading && (
                <div className="loading-bar">
                  <div className="loading-bar-fill" />
                  <span className="loading-text">Searching contracts...</span>
                </div>
              )}
              {!isLoading && (
                <ResultsTable finding={currentFinding} />
              )}
            </div>

            {/* RIGHT — chat panel */}
            <div className="chat">
              <div className="chat-title">Ask the agent</div>

              <div className="chat-section">
                {messages.map((msg, i) => (
                  <div key={i} className={`msg ${msg.role === "user" ? "user" : ""}`}>
                    {msg.role === "user" 
                      ? msg.text  
                      : <ReactMarkdown>{msg.text}</ReactMarkdown>  
                    }
                  </div>
                ))}
                {isLoading && (
                  <div className="msg">
                    <span className="loading-text">Thinking...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <div className="chat-controls">
                <input
                  className="chat-input"
                  placeholder="Ask about any contract…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleChatSend();
                  }}
                  disabled={isLoading}
                />
                <button
                  className="chat-send"
                  onClick={handleChatSend}
                  disabled={isLoading}
                >
                  Send
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}