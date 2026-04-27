import type { AmendmentCreepResponse } from "./AmendmentCreepResponse";
import type { SoleSourceGroup } from "./SoleSourceGroup";
import type { ThresholdSplitGroup } from "./ThresholdSplitGroup";

export type Finding = {
  // Mock data fields (optional)
  id?: string;
  severity?: string;
  subject?: string;
  vendor?: string;
  ministry?: string;
  score?: number;
  summary?: string;

  // Real data fields (optional)
  type?: string;
  AmendmentCreepResponse?: AmendmentCreepResponse[];
  SoleSourceResponse?: SoleSourceGroup[];
  ThresholdSplitResponse?: ThresholdSplitGroup[];
};