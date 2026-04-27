import type { Contract } from "./Contract";

export interface SoleSourceFinding {
  contract: Contract;
  permittedSituationCode: string;
  permittedSituationReason: string;
  permittedSituationWeight: number;
  score: number;
  severity: string;
}