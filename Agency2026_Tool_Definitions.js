const TOOL_DEFINITIONS = [
  {
    name: "list_departments",
    description: "Returns the complete list of all department names available in the Alberta Government contracts dataset. Department names in the dataset are exact strings and must match precisely when used as filters in search_contracts — a partial or misspelled name will silently return zero results. Use this tool whenever the user mentions a department by an informal, abbreviated, or partial name such as 'health', 'transport', or 'the energy department'. After receiving the list, match the user's intent to the closest exact string before proceeding. This tool has no parameters, no side effects, and is safe to call at any time.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },

  {
    name: "list_vendors",
    description: "Performs a case-insensitive partial-match lookup on vendor names and returns all matching vendor name strings from the contracts dataset. Vendor names are free-text fields and require an exact string match in search_contracts — passing a partial or misspelled name will return zero results without raising an error. Use this tool whenever the user references a vendor by a trade name, abbreviation, or informal reference such as 'Deloitte', 'that IT firm', or 'the same vendor as before'. Pass only the vendor name keyword — not a full sentence — and present the returned options to the user for confirmation before proceeding. If zero results are returned, inform the user and suggest alternative spellings.",
    input_schema: {
      type: "object",
      properties: {
        vendorNameContains: {
          type: "string",
          description: "Partial vendor name to search for. Minimum 2 characters. Case-insensitive substring match."
        }
      },
      required: ["vendorNameContains"]
    }
  },

  {
    name: "search_contracts",
    description: "Searches the Alberta Government contracts dataset using one or more filters and returns the matching contract records. This tool must always be called before any calculate_* tool — no analysis tool can run without a valid SearchContractsResponse as its input. The most critical field is RecordType: set it to 'all' when running amendment creep analysis since both original and amendment records are needed, and set it to 'original_only' for threshold split and sole source follow-on analysis to avoid inflating values with amendment records. Always resolve Department and VendorName through list_departments and list_vendors before populating those fields. After the call, verify that ReturnedCount equals TotalMatches — if the result is truncated, increase the Limit before passing the response to a calculation tool.",
    input_schema: {
      type: "object",
      properties: {
        department: {
          type: "string",
          description: "Exact department name. Must match a value returned by list_departments. Nullable."
        },
        vendorName: {
          type: "string",
          description: "Exact vendor name. Must match a value returned by list_vendors. Nullable."
        },
        servicesText: {
          type: "string",
          description: "Keyword to search within the contract services description field. Nullable."
        },
        contractNumber: {
          type: "string",
          description: "Exact contract number for direct lookup. Nullable."
        },
        startDateFrom: {
          type: "string",
          format: "date-time",
          description: "Filter contracts with a start date on or after this date. ISO8601 format. Nullable."
        },
        startDateTo: {
          type: "string",
          format: "date-time",
          description: "Filter contracts with a start date on or before this date. ISO8601 format. Nullable."
        },
        minValue: {
          type: "number",
          description: "Minimum contract value in CAD. Nullable."
        },
        maxValue: {
          type: "number",
          description: "Maximum contract value in CAD. Nullable."
        },
        fiscalYear: {
          type: "string",
          description: "Fiscal year string. Example: '2024-2025'. Nullable."
        },
        permittedSituation: {
          type: "string",
          description: "Single lowercase letter a–l representing the sole-source permitted situation code. Use only for sole-source analysis. Nullable.",
          enum: ["a","b","c","d","e","f","g","h","i","j","k","l"]
        },
        procurementMethod: {
          type: "string",
          description: "Procurement method filter. Nullable."
        },
        recordType: {
          type: "string",
          description: "Controls which records are returned. Use 'all' for amendment creep analysis (needs originals + amendments). Use 'original_only' for threshold split and sole source analysis. Use 'amendments_only' only when the user explicitly wants amendment records alone.",
          enum: ["original_only", "amendments_only", "all"]
        },
        limit: {
          type: "integer",
          description: "Maximum number of records to return. Default is 50. Increase for full population analysis."
        }
      },
      required: ["recordType"]
    }
  },

  {
    name: "calculate_amendment_creep",
    description: "Analyzes a contract population for amendment creep — a procurement risk pattern where a contract awarded at a given value is progressively expanded through post-award amendments, potentially bypassing the competitive threshold that would have applied had the full scope been known at the time of award. The tool computes key risk indicators including the CreepRatio (how many times the contract grew beyond its original value), CostEscalation (the absolute dollar increase), AmendmentIntensity (how frequently amendments were added relative to the contract duration), and a severity rating of low, medium, or high based on the combination of amendment count and growth magnitude. Severity is rated high when the contract has 3 or more amendments and a CreepRatio of 2.0 or greater, medium when it has 2 or more amendments and a CreepRatio of 1.5 or greater, and low in all other cases. This tool requires search_contracts to have been called first with RecordType set to 'all' so that both original award records and amendment records are present in the input.",
    input_schema: {
      type: "object",
      properties: {
        searchContractsResponse: {
          type: "object",
          description: "The full response object returned by search_contracts. Must have been retrieved with RecordType = 'all'. Pass the entire object without modification.",
          properties: {
            totalMatches:    { type: "integer" },
            returnedCount:   { type: "integer" },
            appliedFilters:  { type: "object" },
            warnings:        { type: "array", items: { type: "string" } },
            contracts:       { type: "array", items: { type: "object" } }
          },
          required: ["contracts"]
        }
      },
      required: ["searchContractsResponse"]
    }
  },

  {
    name: "calculate_threshold_split",
    description: "Detects groups of contracts from the same vendor that collectively exceed the Alberta Government sole-source procurement threshold — $75,000 for contracts before January 1, 2026, and $135,000 from January 1, 2026 onward — suggesting a pattern of deliberate contract splitting to avoid competitive tender requirements. The tool clusters contracts by vendor within a configurable rolling time window (default 90 days) and flags groups where the combined value crosses the applicable threshold, with each contract's proximity to the threshold measured as a ratio. Severity is rated high when a group contains 3 or more contracts and a combined ratio of 2.0 or greater, medium when it contains 2 or more contracts and a combined ratio of 1.5 or greater, and low in all other cases. Each flagged group also includes a VendorDependency breakdown showing what share of the department's total spending in that period went to the same vendor, which compounds the risk signal. This tool requires search_contracts to have been called first with RecordType set to 'original_only' — using 'all' will inflate values with amendment records and produce false positives.",
    input_schema: {
      type: "object",
      properties: {
        searchContractsResponse: {
          type: "object",
          description: "The full response object returned by search_contracts. Must have been retrieved with RecordType = 'original_only'. Pass the entire object without modification.",
          properties: {
            totalMatches:    { type: "integer" },
            returnedCount:   { type: "integer" },
            appliedFilters:  { type: "object" },
            warnings:        { type: "array", items: { type: "string" } },
            contracts:       { type: "array", items: { type: "object" } }
          },
          required: ["contracts"]
        },
        proximityLimit: {
          type: "number",
          description: "Threshold ratio floor between 0.0 and 1.0. Contracts with a value-to-threshold ratio at or above this value are flagged as near-threshold. Default is 0.85 (85% of the threshold)."
        },
        windowDays: {
          type: "integer",
          description: "Rolling time window in days within which contracts from the same vendor are grouped for split detection. Default is 90 days. Must be a positive integer."
        }
      },
      required: ["searchContractsResponse"]
    }
  },

  {
    name: "calculate_sole_source_followon",
    description: "Detects vendors that repeatedly receive sole-source contracts from the same department over time, indicating potential vendor lock-in, proprietary dependency, or improper relationship-based procurement that effectively eliminates competition permanently. A sole-source contract is legally permitted under 12 specific situations defined by Alberta regulation, each identified by a code from a to l — this tool scores each follow-on contract by the defensibility weight of its justification code, where codes like 'only one supplier' (g) and 'unforeseeable urgency' (h) carry the highest risk weight of 5 and codes for legally narrow categories like health services (d) or treasury (k) carry a weight of 1. The tool groups contracts by vendor and department, identifies the base contract, and surfaces all follow-on sole-source awards along with an average risk score, total value, time span, and a severity rating. A high average score combined with a high follow-on count represents the most significant risk pattern in this analysis. This tool requires search_contracts to have been called first with RecordType set to 'original_only' and ideally scoped to a specific department or vendor for meaningful results.",
    input_schema: {
      type: "object",
      properties: {
        searchContractsResponse: {
          type: "object",
          description: "The full response object returned by search_contracts. Must have been retrieved with RecordType = 'original_only'. Pass the entire object without modification.",
          properties: {
            totalMatches:    { type: "integer" },
            returnedCount:   { type: "integer" },
            appliedFilters:  { type: "object" },
            warnings:        { type: "array", items: { type: "string" } },
            contracts:       { type: "array", items: { type: "object" } }
          },
          required: ["contracts"]
        }
      },
      required: ["searchContractsResponse"]
    }
  }

];
