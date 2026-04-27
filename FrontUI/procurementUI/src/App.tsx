import { useState } from "react";
import "./App.css";
import { ResultsTable } from "./components/ResultsTable";
import type { Finding } from "./types/Finding";
import { runAgent } from "./ai/orchestrator";

type KPIProps = {
  title: string;
  value: string;
  sub: string;
};

const MOCK_FINDING: Partial<Finding> = {
  AmendmentCreepResponse: [
    {
      originalContractNumber: "AB-2019-0847",
      originalVendorName: "Northern Aurora Systems Inc.",
      originalContractValue: 180000,
      finalContractValue: 4200000,
      totalAmendmentCreep: 4020000,
      totalAmendmentValue: 4020000,
      creepRatio: 23.3,
      totalAmendments: 14,
      totalContractsAnalyzed: 15,
      contractsWithCreep: [],
      maxAmendmentValue: 800000,
      maxAmendmentServices: "IT Systems Expansion",
      warnings: [],
      errors: [],
      severity: "High",
      department: "Health",
      amendmentIntensity: 0.9,
      costEscalation: 0.95,
      contractdurationInDays: 1460,
      originalContractServices: "IT Services",
    },
    {
      originalContractNumber: "AB-2021-1133",
      originalVendorName: "Rocky Mountain Analytics Ltd.",
      originalContractValue: 95000,
      finalContractValue: 812000,
      totalAmendmentCreep: 717000,
      totalAmendmentValue: 717000,
      creepRatio: 7.5,
      totalAmendments: 7,
      totalContractsAnalyzed: 8,
      contractsWithCreep: [],
      maxAmendmentValue: 200000,
      maxAmendmentServices: "Analytics Platform",
      warnings: [],
      errors: [],
      severity: "Medium",
      department: "Environment & Parks",
      amendmentIntensity: 0.6,
      costEscalation: 0.7,
      contractdurationInDays: 1460,
      originalContractServices: "Data Analytics",
    }
  ],
  ThresholdSplitResponse: [
    {
      department: "Transportation",
      contractCount: 5,
      totalValue: 598000,
      earliestStart: "2023-01-01",
      latestStart: "2023-03-15",
      spanDays: 73,
      thresholdLimit: 121200,
      combinedOverThreshold: 476800,
      averageThresholdRatio: 0.98,
      combinedRatioToThreshold: 4.9,
      severity: "medium",
      summary: "5 contracts at $118K–$121K within 90 days; NWPTA threshold $121.2K",
      groupMembers: [],
      vendorDependency: {
        vendorName: "Chinook Digital Services Ltd.",
        contractCount: 5,
        totalValue: 598000,
        dependencyRatio: 0.85
      }
    }
  ],
  SoleSourceResponse: [
    {
      department: "Service Alberta",
      vendor: "BorealTech Consulting",
      baseContract: {
        contractNumber: "AB-2018-0421",
        baseContractNumber: "AB-2018-0421",
        isAmendment: false,
        isSoleSource: true,
        department: "Service Alberta",
        departmentAddress: "",
        vendorName: "BorealTech Consulting",
        vendorAddress: "",
        services: "IT Consulting",
        value: 420000,
        fiscalYear: "2018-2019"
      },
      timeSpanDays: 2190,
      followOnContracts: [],
      soleSourceContracts: [],
      totalSoleSourceValue: 8900000,
      followOnCount: 12,
      soleSourceCount: 12,
      severity: "high",
      averageScore: 87,
      summary: "Won $420K RFP in 2018; $8.9M in directed follow-on work since"
    }
  ]
};

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
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentFinding, setCurrentFinding] = useState<Partial<Finding> | null>(null);

  const handleChatSend = async () => {
    const input = chatInput.trim();
    if (!input || isLoading) return;
    setChatInput("");
    setIsLoading(true);

    try {
      const { text, finding } = await runAgent(input);
      console.log("Final answer:", text);
      console.log("Finding:", finding);
      if (finding) setCurrentFinding(finding);
    } catch (error) {
      console.error("Agent error:", error);
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
          <span>Contracts</span>
          <span>Vendors</span>
          <span>Ministries</span>
          <span>Thresholds</span>
        </div>
        <div className="nav-right">42,103 contracts · updated 2 hrs ago</div>
      </div>

      <div className="container">
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
              <li>Amendment creep in Health</li>
              <li>High severity findings by ministry</li>
              <li>Contracts over $1M with creep</li>
            </ul>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="loading-bar">
            <div className="loading-bar-fill" />
            <span className="loading-text">Searching contracts...</span>
          </div>
        )}

        {/* TABLE — mock data by default, real data when agent returns results */}
        {!isLoading && (
          <ResultsTable finding={currentFinding ?? MOCK_FINDING} />
        )}
      </div>
    </div>
  );
}