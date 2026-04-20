import  type { AmendmentCreepResponse } from "../types/AmendmentCreepResponse";
type Props = {
  data: AmendmentCreepResponse;
};

function Factor({ label, value }: any) {
  const percent = Math.min(100, value * 100);

  return (
    <div className="factor">
      <div className="factor-head">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="bar">
        <div
          className="bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function AmendmentCreepView({ data }: Props) {
  return (
    <div className="detail-container">

      {/* HEADER */}
      <div className="detail-header">
        <div className="score-circle">{Math.round(data.creepRatio * 100)}</div>

        <div>
          <h2>
            Amendment creep — {data.originalContractValue}
          </h2>
          <p>
            {data.originalVendorName} · {data.department}
          </p>

          <p>
            Original ${data.originalContractValue} → Final $
            {data.finalContractValue}
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="detail-body">

        {/* LEFT PANEL */}
        <div className="panel">
          <h4>Factor Breakdown</h4>
          <Factor
            label="Creep Ratio"
            value={data.creepRatio}
          />
          <Factor
            label="Total Amendment Value"
            value={data.totalAmendmentValue}
          />

          <Factor
            label="Largest Amendment"
            value={data.maxAmendmentValue}
          />

          <Factor
            label="Amendment Count"
            value={data.contractsWithCreep.length}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="panel">
          <h4>Evidence</h4>

          {data.contractsWithCreep.map((c, i) => (
            <div key={i} className="evidence-item">
              <div>{c.ContractNumber}</div>
              <div>${c.Value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* WARNINGS */}
      {data.warnings.length > 0 && (
        <div className="warnings">
          {data.warnings.map((w, i) => (
            <div key={i}>{w}</div>
          ))}
        </div>
      )}
    </div>
  );
}