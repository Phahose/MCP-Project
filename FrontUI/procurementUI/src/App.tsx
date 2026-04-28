import { useState, useRef, useEffect } from "react";
import "./App.css";
import { ResultsTable } from "./components/ResultsTable";
import type { Finding } from "./types/Finding";
import { runAgent } from "./ai/orchestrator";
import type { DisplayMessage } from "./ai/orchestrator";
import ReactMarkdown from "react-markdown";



// const MOCK_FINDING: Partial<Finding> = {
//   AmendmentCreepResponse: [
//     {
//       originalContractNumber: "AB-2019-0847",
//       originalVendorName: "Northern Aurora Systems Inc.",
//       originalContractValue: 180000,
//       finalContractValue: 4200000,
//       totalAmendmentCreep: 4020000,
//       totalAmendmentValue: 4020000,
//       creepRatio: 23.3,
//       totalAmendments: 14,
//       totalContractsAnalyzed: 15,
//       contractsWithCreep: [],
//       maxAmendmentValue: 800000,
//       maxAmendmentServices: "IT Systems Expansion",
//       warnings: [],
//       errors: [],
//       severity: "High",
//       department: "Health",
//       amendmentIntensity: 0.9,
//       costEscalation: 0.95,
//       contractdurationInDays: 1460,
//       originalContractServices: "IT Services",
//     },
//     {
//       originalContractNumber: "AB-2021-1133",
//       originalVendorName: "Rocky Mountain Analytics Ltd.",
//       originalContractValue: 95000,
//       finalContractValue: 812000,
//       totalAmendmentCreep: 717000,
//       totalAmendmentValue: 717000,
//       creepRatio: 7.5,
//       totalAmendments: 7,
//       totalContractsAnalyzed: 8,
//       contractsWithCreep: [],
//       maxAmendmentValue: 200000,
//       maxAmendmentServices: "Analytics Platform",
//       warnings: [],
//       errors: [],
//       severity: "Medium",
//       department: "Environment & Parks",
//       amendmentIntensity: 0.6,
//       costEscalation: 0.7,
//       contractdurationInDays: 1460,
//       originalContractServices: "Data Analytics",
//     }
//   ],
//   ThresholdSplitResponse: [
//     {
//       department: "Transportation",
//       contractCount: 5,
//       totalValue: 598000,
//       earliestStart: "2023-01-01",
//       latestStart: "2023-03-15",
//       spanDays: 73,
//       thresholdLimit: 121200,
//       combinedOverThreshold: 476800,
//       averageThresholdRatio: 0.98,
//       combinedRatioToThreshold: 4.9,
//       severity: "medium",
//       summary: "5 contracts at $118K–$121K within 90 days; NWPTA threshold $121.2K",
//       groupMembers: [],
//       vendorDependency: {
//         vendorName: "Chinook Digital Services Ltd.",
//         contractCount: 5,
//         totalValue: 598000,
//         dependencyRatio: 0.85
//       }
//     }
//   ],
//   SoleSourceResponse: [
//     {
//       department: "Service Alberta",
//       vendor: "BorealTech Consulting",
//       baseContract: {
//         contractNumber: "AB-2018-0421",
//         baseContractNumber: "AB-2018-0421",
//         isAmendment: false,
//         isSoleSource: true,
//         department: "Service Alberta",
//         departmentAddress: "",
//         vendorName: "BorealTech Consulting",
//         vendorAddress: "",
//         services: "IT Consulting",
//         value: 420000,
//         fiscalYear: "2018-2019"
//       },
//       timeSpanDays: 2190,
//       followOnContracts: [],
//       soleSourceContracts: [],
//       totalSoleSourceValue: 8900000,
//       followOnCount: 12,
//       soleSourceCount: 12,
//       severity: "high",
//       averageScore: 87,
//       summary: "Won $420K RFP in 2018; $8.9M in directed follow-on work since"
//     }
//   ]
// };



export default function App() {
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentFinding, setCurrentFinding] = useState<Partial<Finding> | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
      const { text, finding, messages: updatedMessages } = await runAgent(input);
      console.log("Final answer:", text);
      console.log("Finding:", finding);
      setMessages(updatedMessages);
      if (finding) setCurrentFinding(finding);
    } catch (error) {
      console.error("Agent error:", error);
      setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      {/* NAV */}
      <div className="nav">
        <div className="logo">GoA · <span>Procurement Oversight</span></div>
        <div className="nav-links">
          <span className="active">Findings</span>
          {/* <span>Contracts</span>
          <span>Vendors</span>
          <span>Ministries</span>
          <span>Thresholds</span> */}
        </div>
        <div className="nav-right">Nicholas Ekwom, Shub Makwana, Jay Dayani</div>
      </div>

      <div className="container">

        {/* HERO — only show when no messages yet */}
        {messages.length === 0 && (
          <div className="google-hero">
            <h1 className="google-title">Ask Anything!</h1>
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
              <p>Try asking:</p>
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
        {isLoading && messages.length === 0 && (
          <div className="loading-bar">
            <div className="loading-bar-fill" />
            <span className="loading-text">Searching contracts...</span>
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