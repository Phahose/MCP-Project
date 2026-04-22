import "./App.css";
import {ResultsTable} from "./components/ResultsTable";

import type { Finding } from "./types/Finding";


type KPIProps = {
  title: string;
  value: string;
  sub: string;
};


const FINDINGS: Finding[] = [
  {
    id: "1",
    severity: "high",
    type: "Amendment creep",
    subject: "Contract AB-2019-0847",
    vendor: "Northern Aurora Systems Inc.",
    ministry: "Health",
    score: 91,
    summary: "Original $180K competitive → current $4.2M through 14 non-competitive amendments",
  },
  {
    id: "2",
    severity: "high",
    type: "Sole-source follow-on",
    subject: "Vendor: BorealTech Consulting",
    vendor: "12 directed awards",
    ministry: "Service Alberta",
    score: 87,
    summary: "Won $420K RFP in 2018; $8.9M in directed follow-on work since",
  },
  {
    id: "3",
    severity: "medium",
    type: "Threshold split",
    subject: "Cluster of 5 contracts",
    vendor: "Chinook Digital Services Ltd.",
    ministry: "Transportation",
    score: 74,
    summary: "5 contracts at $118K–$121K within 90 days; NWPTA threshold $121.2K",
  },
  {
    id: "4",
    severity: "medium",
    type: "Amendment creep",
    subject: "Contract AB-2021-1133",
    vendor: "Rocky Mountain Analytics Ltd.",
    ministry: "Environment & Parks",
    score: 61,
    summary: "$95K → $812K over 4 years, 7 amendments, 82% non-competed",
  },
  {
    id: "5",
    severity: "low",
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
 
  return (
    <div className="App">
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
        <div className="container">

        
        {/* KPI STRIP */}
        {
          FINDINGS.length >= 5 ? (<div className="kpis">
            <KPI title="Contracts analyzed" value="42,103" sub="across 18 ministries" />
            <KPI title="Total value under review" value="$2.81B" sub="2019–2026" />
            <KPI title="Findings" value="847" sub="34 high · 210 med · 603 low" />
            <KPI title="$ flagged high severity" value="$184M" sub="6.5% of total value" />
          </div>)
          : null
        }
        <div className="google-hero">
          <h1 className="google-title">
            Ask Anything!
          </h1>

          <div className="google-input-wrapper">
            <input
              className="google-input"
              placeholder="Well... anything about procurement data..."
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
        {
          FINDINGS.length >= 5 ? 
            (<ResultsTable findings={FINDINGS} /> ) 
            : 
            null
        }
      
      </div>
    </div>
    
  );
}