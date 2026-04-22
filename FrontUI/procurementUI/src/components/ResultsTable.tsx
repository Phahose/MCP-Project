import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Finding } from "../types/Finding";


const filterFindingsByType = (findings: Finding[], type: string) => {
 
  if (type === "All types") return findings;
  if (type === "High severity") return findings.filter(f => f.severity === "high");
  return findings.filter(f => f.type === type);
};

const getScoreClass = (score: number) => {
  if (score >= 80) return "score high";
  if (score >= 60) return "score medium";
  return "score low";
};

export function ResultsTable({ findings }: { findings: Finding[] }) {

    const [activeFilter, setActiveFilter] = useState("All types");
    const filteredFindings = filterFindingsByType(findings, activeFilter);
    const navigate = useNavigate();
    const [chatInput, setChatInput] = useState("");

    const handleChatSend = () => {
        if (chatInput.trim()) {
        // Handle sending chat message
        setChatInput("");
        }
    };

  return (
      <div className="body">
        {/* LEFT */}
        <div className="main">
          <div className="filters">
            <input placeholder="Search findings, contracts, vendors…" />

            {["All types", "Amendment creep", "Threshold split", "Sole-source follow-on", "High severity"].map(
              (filter) => (
                <button
                  key={filter}
                  className={activeFilter === filter ? "active" : ""}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              )
            )}
          </div>

          {/* TABLE */}
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Ministry</th>
                <th>Score</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {filteredFindings.map((f) => (
                <tr key={f.id} onClick={() => navigate(`/finding/${f.id}`)}>
                  <td>
                    <span className={`badge ${f.severity.toLowerCase()}`}>
                      {f.severity}
                    </span>
                  </td>
                  <td>
                    <span className="type">{f.type}</span>
                  </td>
                  <td>
                    {f.subject}
                    <div className="sub">{f.vendor}</div>
                  </td>
                  <td>{f.ministry}</td>
                  <td>
                    <div className={getScoreClass(f.score)}>
                      {f.score}
                    </div>
                  </td>
                  <td>{f.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT CHAT */}
        <div className="chat">
          <div className="chat-title">● Ask the agent</div>
          <div className="chat-section">
            <div className="msg user">
              Which ministry has the worst amendment creep this year?
            </div>

            <div className="msg">
              Health has the highest amendment-creep exposure in 2025 — 23 findings totalling $94M.
            </div>

          </div>

        <div className="chat-controls">
          <input
            className="chat-input"
            placeholder="Ask about any contract…"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
          />
        </div>
        </div> 
      </div>
  );
}