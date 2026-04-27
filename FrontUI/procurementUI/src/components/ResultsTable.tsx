import { useState } from "react";
import type { Finding } from "../types/Finding";
import type { AmendmentCreepResponse } from "../types/AmendmentCreepResponse";
import type { ThresholdSplitGroup } from "../types/ThresholdSplitGroup";
import type { SoleSourceGroup } from "../types/SoleSourceGroup";
import { FindingDetails } from "./FindingComponent";

type Props = {
  finding: Partial<Finding>;
};

const getScoreClass = (severity: string) => {
  if (severity?.toLowerCase() === "high") return "score high";
  if (severity?.toLowerCase() === "medium") return "score medium";
  return "score low";
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);

// ── Amendment Creep Row ──────────────────────────────────────────────
function AmendmentCreepRow({ item }: { item: AmendmentCreepResponse }) {
  return (
    <details className="finding-item">
      <summary className="finding-summary">
        <span className={`badge ${item.severity.toLowerCase()}`}>
          {item.severity}
        </span>
        <span className="type">Amendment Creep</span>
        <div className="finding-main">
          <div>
            {item.originalContractNumber}
            <div className="sub">{item.originalVendorName}</div>
          </div>
        </div>
        <div className="finding-meta">
          <span>{formatCurrency(item.originalContractValue)} → {formatCurrency(item.finalContractValue)}</span>
          <span className="sub">{(item.creepRatio * 100).toFixed(0)}% increase</span>
        </div>
        <div className={getScoreClass(item.severity)}>
          {item.severity}
        </div>
      </summary>
      <div className="finding-expanded">
        <FindingDetails item={item} type="amendment_creep" />
      </div>
    </details>
  );
}

// ── Threshold Split Row ──────────────────────────────────────────────
function ThresholdSplitRow({ item }: { item: ThresholdSplitGroup }) {
  return (
    <details className="finding-item">
      <summary className="finding-summary">
        <span className={`badge ${item.severity.toLowerCase()}`}>
          {item.severity}
        </span>
        <span className="type">Threshold Split</span>
        <div className="finding-main">
          <div>
            {item.vendorDependency?.vendorName}
            <div className="sub">{item.department}</div>
          </div>
        </div>
        <div className="finding-meta">
          <span>{item.contractCount} contracts · {formatCurrency(item.totalValue)}</span>
          <span className="sub">Threshold: {formatCurrency(item.thresholdLimit)}</span>
        </div>
        <div className={getScoreClass(item.severity)}>
          {item.severity}
        </div>
      </summary>
      <div className="finding-expanded">
        <FindingDetails item={item} type="threshold_split" />
      </div>
    </details>
  );
}

// ── Sole Source Row ──────────────────────────────────────────────────
function SoleSourceRow({ item }: { item: SoleSourceGroup }) {
  return (
    <details className="finding-item">
      <summary className="finding-summary">
        <span className={`badge ${item.severity.toLowerCase()}`}>
          {item.severity}
        </span>
        <span className="type">Sole Source</span>
        <div className="finding-main">
          <div>
            {item.vendor}
            <div className="sub">{item.department}</div>
          </div>
        </div>
        <div className="finding-meta">
          <span>{item.soleSourceCount} sole source · {formatCurrency(item.totalSoleSourceValue)}</span>
          <span className="sub">{item.timeSpanDays} day span</span>
        </div>
        <div className={getScoreClass(item.severity)}>
          {item.severity}
        </div>
      </summary>
      <div className="finding-expanded">
        <FindingDetails item={item} type="sole_source" />
      </div>
    </details>
  );
}

// ── Main Table ───────────────────────────────────────────────────────
export function ResultsTable({ finding }: Props) {
  const [activeFilter, setActiveFilter] = useState("All types");

  const hasAmendment = finding.AmendmentCreepResponse?.length ?? 0 > 0;
  const hasThreshold = finding.ThresholdSplitResponse?.length ?? 0 > 0;
  const hasSoleSource = finding.SoleSourceResponse?.length ?? 0 > 0;

  const filters = [
    "All types",
    ...(hasAmendment ? ["Amendment creep"] : []),
    ...(hasThreshold ? ["Threshold split"] : []),
    ...(hasSoleSource ? ["Sole source"] : []),
  ];

  return (
    <div className="body">
      <div className="main">
        {/* FILTERS */}
        <div className="filters">
          <input placeholder="Search findings, contracts, vendors…" />
          {filters.map(filter => (
            <button
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* FINDINGS LIST */}
        <div className="findings-list">

          {/* Amendment Creep */}
          {(activeFilter === "All types" || activeFilter === "Amendment creep") &&
            finding.AmendmentCreepResponse?.map((item, i) => (
              <AmendmentCreepRow key={i} item={item} />
            ))
          }

          {/* Threshold Split */}
          {(activeFilter === "All types" || activeFilter === "Threshold split") &&
            finding.ThresholdSplitResponse?.map((item, i) => (
              <ThresholdSplitRow key={i} item={item} />
            ))
          }

          {/* Sole Source */}
          {(activeFilter === "All types" || activeFilter === "Sole source") &&
            finding.SoleSourceResponse?.map((item, i) => (
              <SoleSourceRow key={i} item={item} />
            ))
          }

        </div>
      </div>
    </div>
  );
}