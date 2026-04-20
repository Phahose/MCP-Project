import "./App.css";
import { useState } from "react";

type Finding = {
  id: string;
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  subject: string;
  vendor: string;
  ministry: string;
  score: number;
};

type KPIProps = {
  title: string;
  value: string;
  sub: string;
};

const getScoreClass = (score: number) => {
  if (score >= 80) return "score high";
  if (score >= 60) return "score medium";
  return "score low";
};

const filterFindingsByType = (findings: Finding[], type: string) => {
  if (type === "All types") return findings;
  if (type === "High severity") return findings.filter(f => f.severity === "HIGH");
  return findings.filter(f => f.type === type);
};

const FINDINGS: Finding[] = [
  {
    id: "1",
    severity: "HIGH",
    type: "Amendment creep",
    subject: "Contract AB-2019-0847",
    vendor: "Northern Aurora Systems Inc.",
    ministry: "Health",
    score: 91,
    summary: "Original $180K competitive → current $4.2M through 14 non-competitive amendments",
  },
  {
    id: "2",
    severity: "HIGH",
    type: "Sole-source follow-on",
    subject: "Vendor: BorealTech Consulting",
    vendor: "12 directed awards",
    ministry: "Service Alberta",
    score: 87,
    summary: "Won $420K RFP in 2018; $8.9M in directed follow-on work since",
  },
  {
    id: "3",
    severity: "MEDIUM",
    type: "Threshold split",
    subject: "Cluster of 5 contracts",
    vendor: "Chinook Digital Services Ltd.",
    ministry: "Transportation",
    score: 74,
    summary: "5 contracts at $118K–$121K within 90 days; NWPTA threshold $121.2K",
  },
  {
    id: "4",
    severity: "MEDIUM",
    type: "Amendment creep",
    subject: "Contract AB-2021-1133",
    vendor: "Rocky Mountain Analytics Ltd.",
    ministry: "Environment & Parks",
    score: 61,
    summary: "$95K → $812K over 4 years, 7 amendments, 82% non-competed",
  },
  {
    id: "5",
    severity: "LOW",
    type: "Threshold split",
    subject: "Cluster of 3 contracts",
    vendor: "Prairie Supply Co-op",
    ministry: "Agriculture",
    score: 48,
    summary: "3 contracts near CFTA threshold; moderate description similarity (0.72)",
  },
];

function KPI({ title, value, sub }: KPIProps) {
  return (
    <div className="kpi">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState("All types");
  const [chatInput, setChatInput] = useState("");

  const filteredFindings = filterFindingsByType(FINDINGS, activeFilter);

  const handleChatSend = () => {
    if (chatInput.trim()) {
      // Handle sending chat message
      setChatInput("");
    }
  };

  return (
    <div className="container">
      {/* NAV */}
      <div className="nav">
        <div className="logo">
          GoA · <span>Procurement Oversight</span>
        </div>
        <div className="nav-links">
          <span className="active">Findings</span>
          <span>Contracts</span>
          <span>Vendors</span>
          <span>Ministries</span>
          <span>Thresholds</span>
        </div>
        <div className="nav-right">42,103 contracts · updated 2 hrs ago</div>
      </div>

      {/* KPI STRIP */}
      <div className="kpis">
        <KPI title="Contracts analyzed" value="42,103" sub="across 18 ministries" />
        <KPI title="Total value under review" value="$2.81B" sub="2019–2026" />
        <KPI title="Findings" value="847" sub="34 high · 210 med · 603 low" />
        <KPI title="$ flagged high severity" value="$184M" sub="6.5% of total value" />
      </div>

      {/* BODY */}
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
                <tr key={f.id}>
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
    </div>
  );
}