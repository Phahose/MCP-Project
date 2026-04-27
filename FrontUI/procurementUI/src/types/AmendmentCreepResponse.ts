import type { Contract } from "./Contract";
export interface AmendmentCreepResponse {
  totalAmendmentCreep: number;
  totalAmendmentValue: number;
  finalContractValue: number;

  creepRatio: number;

  totalContractsAnalyzed: number;
  contractsWithCreep: Contract[];

  totalAmendments: number;

  originalContractNumber: string;
  originalVendorName: string;
  originalContractValue: number;
  originalContractServices: string;

  maxAmendmentValue: number;
  maxAmendmentServices: string;

  warnings: string[];
  errors: string[];

  severity: "Low" | "Medium" | "High";
  department: string;

  amendmentIntensity: number;
  costEscalation: number;

  contractdurationInDays: number;
}