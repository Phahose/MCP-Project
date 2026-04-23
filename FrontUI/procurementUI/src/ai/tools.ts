export const tools = [
  {
    name: "search_contracts",
    description:
      "Search contracts by department, vendor, date range, or procurement method",
    input_schema: {
      type: "object",
      properties: {
        department: { type: "string" },
        vendor: { type: "string" },
        startDate: { type: "string" },
        endDate: { type: "string" }
      }
    }
  },
  {
    name: "calculate_amendment_creep",
    description:"Calculate amendment creep risk score for a set of contracts",
    input_schema: {
      type: "object",
      properties: {
        contracts: { type: "array" }
      },
      required: ["contracts"]
    }
  },
  {
    name: "calculate_threshold_split",
    description:"Detect possible threshold splitting patterns in contracts",
    input_schema: {
      type: "object",
      properties: {
        contracts: { type: "array" }
      },
      required: ["contracts"]
    }
  },
  {
    name: "calculate_sole_source_followon",
    description:"Analyze vendor patterns for sole source follow-on risk",
    input_schema: {
      type: "object",
      properties: {
        contracts: { type: "array" }
      },
      required: ["contracts"]
    }
  }
];