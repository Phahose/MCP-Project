import type { Contract } from "./Contract";
import type { SoleSourceFinding } from "./SoleSourceFinding.ts";

export type SoleSourceGroup = {
  // Context
  department: string;
  vendor: string;
  baseContract: Contract;
  timeSpanDays: number;

  // Evidence
  followOnContracts: SoleSourceFinding[];
  soleSourceContracts: Contract[];

  // Aggregates
  totalSoleSourceValue: number;
  followOnCount: number;
  soleSourceCount: number;

  // Scoring
  severity: "low" | "medium" | "high";
  averageScore: number;

  // UX
  summary: string;
}