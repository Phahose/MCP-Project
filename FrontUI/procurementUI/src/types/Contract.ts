export interface Contract {
  // Identity
  contractNumber: string;
  baseContractNumber: string;
  amendmentCode?: string | null;
  isAmendment: boolean;
  isSoleSource: boolean;

  // Justification
  permittedSituation?: string | null;

  // Parties
  department: string;
  departmentAddress: string;
  vendorName: string;
  vendorAddress: string;

  // Contract body
  services: string;
  value: number;
  startDate?: string | null; // ISO string
  endDate?: string | null;
  fiscalYear: string;
}