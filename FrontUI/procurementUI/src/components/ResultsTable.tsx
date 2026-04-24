import { useState } from "react";
//import { useNavigate } from "react-router-dom";
import type { Finding } from "../types/Finding";
import { FindingDetails } from "../components/FindingComponent"


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
    //const navigate = useNavigate();




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
          <div className="findings-list">
            {filteredFindings.map((f) => (
              <details key={f.id} className="finding-item">
                {/* SUMMARY (collapsed view) */}
                <summary className="finding-summary">
                  <span className={`badge ${f.severity.toLowerCase()}`}>
                    {f.severity}
                  </span>

                  <span className="type">{f.type}</span>

                  <div className="finding-main">
                    <div>
                      {f.subject}
                      <div className="sub">{f.vendor}</div>
                    </div>
                  </div>

                  <div className={getScoreClass(f.score)}>
                    {f.score}
                  </div>
                </summary>

                {/* DETAILS (expanded view) */}
                <div className="finding-expanded">
                  <p>{f.summary}</p>

                  <FindingDetails
                    finding={f}
                    findingType={f.type}
                  />
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* RIGHT CHAT */}
        {/* <div className="chat">
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
        </div>  */}
      </div>
  );
}