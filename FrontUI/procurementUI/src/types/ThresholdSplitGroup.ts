import type { VendorDependency } from "./VendorDependency";
import type { ThresholdSplitMember } from "./ThresholdSplitMember.ts";

export interface ThresholdSplitGroup  {
  department: string;
  groupMembers: ThresholdSplitMember[];
  vendorDependency: VendorDependency;

  // Derived (should come from backend)
  contractCount: number;
  totalValue: number;
  earliestStart: string;
  latestStart: string;
  spanDays: number;

  // Threshold context
  thresholdLimit: number;
  combinedOverThreshold: number;
  averageThresholdRatio: number;
  combinedRatioToThreshold: number;

  // UX
  severity: "low" | "medium" | "high";
  summary: string;
}