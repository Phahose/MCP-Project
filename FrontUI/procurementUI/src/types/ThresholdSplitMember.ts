import type { Contract } from "./Contract";

export interface ThresholdSplitMember {
  contract: Contract;
  isBelowThreshold: boolean;
  thresholdRatio: number;
}