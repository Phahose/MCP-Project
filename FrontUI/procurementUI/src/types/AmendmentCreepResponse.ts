export type AmendmentCreepResponse = {
  totalAmendmentCreep: number;
  totalAmendmentValue: number;
  finalContractValue: number;
  creepRatio: number;
  totalContractsAnalyzed: number;
  contractsWithCreep: any[];
  originalContractNumber: string;
  originalVendorName: string;
  originalContractValue: number;
  originalContractServices: string;
  maxAmendmentValue: number;
  maxAmendmentServices: string;
  warnings: string[];
  errors: string[];
  severity: string;
  department: string;
};