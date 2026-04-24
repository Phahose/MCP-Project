import type { Finding } from "../types/Finding";

type Props = {
  finding: Finding;
  findingType: string;
};

function Factor({ label, value }: { label: string; value: number }) {
  return (
    <div className="factor">
      <div className="factor-head">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="bar">
        <div
          className="bar-fill"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Evidence({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="evidence-item">
      <div className="evidence-title">{title}</div>
      <div className="evidence-desc">{desc}</div>
    </div>
  );
}

export function FindingDetails({ finding, findingType }: Props) {
  return (
    <div className="finding-details">

      {/* LEFT PANEL */}
      <div className="panel">
        <p className="panel-title">
          Factor Breakdown — How the score was computed
        </p>

        <div className="finding-content">
          {findingType === "amendment_creep" && (
            <>
              <Factor label="Amendment ratio" value={finding.score} />
              <Factor label="Non-competed share" value={91} />
              <Factor label="Largest amendment" value={100} />
              <Factor label="Time span" value={78} />
              <Factor label="Amendment count" value={70} />
            </>
          )}

          {findingType === "threshold_split" && (
           <>
              <Factor label="Amendment ratio" value={finding.score} />
              <Factor label="Non-competed share" value={91} />
              <Factor label="Largest amendment" value={100} />
              <Factor label="Time span" value={78} />
              <Factor label="Amendment count" value={70} />
            </>
          )}

          {findingType === "sole_source" && (
           <>
              <Factor label="Amendment ratio" value={finding.score} />
              <Factor label="Non-competed share" value={91} />
              <Factor label="Largest amendment" value={100} />
              <Factor label="Time span" value={78} />
              <Factor label="Amendment count" value={70} />
            </>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="panel">
        <p className="panel-title">
          Evidence — The records behind this score
        </p>

        <div className="finding-content">
          {findingType === "amendment_creep" && (
            <>
              <Evidence title="Original contract" desc={finding.subject} />
              <Evidence title="Vendor" desc={finding.vendor} />
              <Evidence title="Ministry" desc={finding.ministry} />
            </>
          )}

          {findingType === "threshold_split" && (
            <p>Threshold split evidence here</p>
          )}

          {findingType === "scope_creep" && (
            <p>Scope creep evidence here</p>
          )}
        </div>
      </div>

    </div>
  );
}