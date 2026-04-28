import type { AmendmentCreepResponse } from "../types/AmendmentCreepResponse";
import type { ThresholdSplitGroup } from "../types/ThresholdSplitGroup";
import type { SoleSourceGroup } from "../types/SoleSourceGroup";

type Props = {
  item: AmendmentCreepResponse | ThresholdSplitGroup | SoleSourceGroup;
  type: "amendment_creep" | "threshold_split" | "sole_source";
};

const formatCurrency = (value: number) =>  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);

function Factor({ label, value }: { label: string; value: number }) {
  return (
    <div className="factor">
      <div className="factor-head">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function Evidence({ title, desc }: { title: string; desc?: any }) {
  return (
    <div className="evidence-item">
      <div className="evidence-title">{title}</div>
      <div className="evidence-desc">{desc}</div>
    </div>
  );
}

export function FindingDetails({ item, type }: Props) {
  return (
    <div className="finding-details">

      {/* LEFT PANEL — Factor Breakdown */}
      <div className="panel">
        <p className="panel-title">Factor Breakdown</p>
        <div className="finding-content">

          {type === "amendment_creep" && (() => {
            const c = item as AmendmentCreepResponse;
            return (
              <>
                <Factor label="Creep ratio" value={c.creepRatio * 100} />
                <Factor label="Amendment intensity" value={c.amendmentIntensity * 100} />
                <Factor label="Cost escalation" value={c.costEscalation * 100} />
                <Factor label="Total amendments" value={c.totalAmendments} />
                <Factor label="Duration (days)" value={c.contractdurationInDays} />
              </>
            );
          })()}

          {type === "threshold_split" && (() => {
            const c = item as ThresholdSplitGroup;
            return (
              <>
                <Factor label="Combined ratio to threshold" value={c.combinedRatioToThreshold * 100} />
                <Factor label="Average threshold ratio" value={c.averageThresholdRatio * 100} />
                <Factor label="Contract count" value={c.contractCount} />
                <Factor label="Span (days)" value={c.spanDays} />
              </>
            );
          })()}

          {type === "sole_source" && (() => {
            const c = item as SoleSourceGroup;
            return (
              <>
                <Factor label="Sole source count" value={c.soleSourceCount} />
                <Factor label="Follow-on count" value={c.followOnCount} />
                <Factor label="Average score" value={c.averageScore} />
                <Factor label="Time span (days)" value={c.timeSpanDays} />
              </>
            );
          })()}

        </div>
      </div>

      {/* RIGHT PANEL — Evidence */}
      <div className="panel">
        <p className="panel-title">Evidence</p>
        <div className="finding-content">

          {type === "amendment_creep" && (() => {
            const c = item as AmendmentCreepResponse;
            return (
              <>
                <Evidence title="Contract number" desc={c.originalContractNumber} />
                <Evidence title="Vendor" desc={c.originalVendorName} />
                <Evidence title="Department" desc={c.department} />
                <Evidence title="Original value" desc={formatCurrency(c.originalContractValue)} />
                <Evidence title="Final value" desc={formatCurrency(c.finalContractValue)} />
                <Evidence title="Total creep" desc={formatCurrency(c.totalAmendmentCreep)} />
                <Evidence title="Services" desc={c.originalContractServices} />
                <Evidence title="Max amendment" desc={formatCurrency(c.maxAmendmentValue)} />
                <Evidence title="Max amendment services" desc={c.maxAmendmentServices} />
              </>
            );
          })()}

          {type === "threshold_split" && (() => {
            const c = item as ThresholdSplitGroup;
            return (
              <>
                <Evidence title="Vendor" desc={c.vendorDependency?.vendorName} />
                <Evidence title="Department" desc={c.department} />
                <Evidence title="Total value" desc={formatCurrency(c.totalValue)} />
                <Evidence title="Threshold" desc={formatCurrency(c.thresholdLimit)} />
                <Evidence title="Over threshold by" desc={formatCurrency(c.combinedOverThreshold)} />
                <Evidence title="Date range" desc={`${c.earliestStart} → ${c.latestStart}`} />
                <Evidence title="Summary" desc={c.summary} />
              </>
            );
          })()}

          {type === "sole_source" && (() => {
            const c = item as SoleSourceGroup;
            return (
              <>
                <Evidence title="Vendor" desc={c.vendor} />
                <Evidence title="Department" desc={c.department} />
                <Evidence title="Total sole source value" desc={formatCurrency(c.totalSoleSourceValue)} />
                <Evidence title="Follow-on contracts" desc={String(c.followOnCount)} />
                <Evidence title="Summary" desc={c.summary} />
              </>
            );
          })()}

        </div>
      </div>

    </div>
  );
}