export type Finding = {
  id: string;
  type: string;
  severity: "high" | "medium" | "low";
  summary: string;
  subject: string;
  vendor: string;
  ministry: string;
  score: number;
};