export const tools = [
  {
    name: "list_departments",
    description: `Call this tool FIRST before any other tool whenever the user mentions 
    a ministry, department, or government body — even if you think you know the name. 
    Returns the exact list of department names as they appear in the database. 
    Use the returned names exactly when calling search_contracts.`,
    input_schema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "list_vendors",
    description: `Search for vendors by partial name. Call this when the user mentions 
    a specific company or vendor name, to find the exact name as it appears in the 
    database before calling search_contracts. For example if user says "find contracts 
    for Atwell" call this with vendorNameContains = "Atwell" to get the exact name.`,
    input_schema: {
      type: "object",
      properties: {
        vendorNameContains: {
          type: "string",
          description: "Partial vendor name to search for. Example: 'Atwell' or 'Engineering'"
        }
      },
      required: ["vendorNameContains"]
    }
  },
  {
    name: "search_contracts",
    description: `Search Alberta government contracts and sole source records from the database. 
    Always use exact department names from list_departments and exact vendor names from 
    list_vendors. 
    
    Set recordType based on the user's question:
    - "all" → when user asks about amendments, creep, or contract history
    - "amendments_only" → when user asks specifically about amendments
    - "original_only" → for all other questions (default)
    
    Set isSoleSource based on question:
    - true → when user asks about sole source contracts
    - false → when user asks about regular contracts
    - omit → when user wants both`,
    input_schema: {
      type: "object",
      properties: {
        department: {
          type: "string",
          description: "Exact department name from list_departments"
        },
        vendorName: {
          type: "string",
          description: "Exact vendor name from list_vendors"
        },
        servicesText: {
          type: "string",
          description: "Keyword to search in contract services description. Example: 'engineering' or 'consulting'"
        },
        contractNumber: {
          type: "string",
          description: "Specific contract number to look up"
        },
        startDateFrom: {
          type: "string",
          description: "Filter contracts starting after this date. Format: YYYY-MM-DD"
        },
        startDateTo: {
          type: "string",
          description: "Filter contracts starting before this date. Format: YYYY-MM-DD"
        },
        minValue: {
          type: "number",
          description: "Minimum contract value in dollars"
        },
        maxValue: {
          type: "number",
          description: "Maximum contract value in dollars"
        },
        fiscalYear: {
          type: "string",
          description: "Fiscal year in format '2022-2023'"
        },
        permittedSituation: {
          type: "string",
          description: "Sole source justification code. Example: 'b' or 'z'"
        },
        recordType: {
          type: "string",
          enum: ["original_only", "amendments_only", "all"],
          description: "Use 'all' for amendment/creep analysis, 'original_only' for everything else"
        },
        isSoleSource: {
          type: "boolean",
          description: "true = sole source only, false = regular contracts only, omit = both"
        },
        limit: {
          type: "number",
          description: "Maximum number of records to return. Default 50, max 500. Use higher values for analysis tools."
        }
      }
    }
  },
  {
    name: "calculate_amendment_creep",
    description: `Analyze contracts for amendment creep — when a contract starts small 
    and grows significantly through amendments. 
    
    ALWAYS call search_contracts first with recordType = "all" to get the data, 
    then pass the full response to this tool.
    
    Use this when user asks about:
    - "amendment creep" or "scope creep"
    - "contracts that grew over time"
    - "how much did this contract grow"
    - "contracts with lots of amendments"`,
    input_schema: {
      type: "object",
      properties: {
        searchResponse: {
          type: "object",
          description: "The full response object returned by search_contracts"
        }
      },
      required: ["searchResponse"]
    }
  },
  {
    name: "calculate_threshold_split",
    description: `Detect contract splitting — when a vendor receives multiple small 
    contracts in a short time window that together exceed a procurement threshold, 
    suggesting the contracts were intentionally split to avoid oversight.
    
    Alberta thresholds to watch for:
    - $10,000 — below this no competitive process needed
    - $75,000 — below this limited competitive process
    - $200,000 — above this full competitive process required
    
    ALWAYS call search_contracts first with recordType = "original_only", 
    then pass the full response to this tool.
    
    Use this when user asks about:
    - "contract splitting" or "split contracts"  
    - "threshold avoidance"
    - "suspicious small contracts"
    - "breaking up contracts"`,
    input_schema: {
      type: "object",
      properties: {
        searchResponse: {
          type: "object",
          description: "The full response object returned by search_contracts"
        },
        proximityLimit: {
          type: "number",
          description: "How close to the threshold counts as suspicious. Default 0.85 means within 85% of threshold. Example: a $63,000 contract is 84% of the $75,000 threshold."
        },
        windowDays: {
          type: "number",
          description: "How many days to look back when grouping contracts for splitting detection. Default 90 days."
        }
      },
      required: ["searchResponse"]
    }
  },
  {
    name: "calculate_sole_source_followon",
    description: `Detect sole source follow-on risk — when a vendor keeps getting 
    sole sourced repeatedly for the same or similar services, suggesting they have 
    become a de-facto monopoly supplier without ever going through proper competition.
    
    ALWAYS call search_contracts first with isSoleSource = true and recordType = "all", 
    then pass the full response to this tool.
    
    Use this when user asks about:
    - "sole source patterns" or "repeated sole source"
    - "vendor dependency" or "vendor lock-in"  
    - "sole source justification"
    - "which vendors keep getting sole sourced"
    - "is this vendor always sole sourced"`,
    input_schema: {
      type: "object",
      properties: {
        searchResponse: {
          type: "object",
          description: "The full response object returned by search_contracts"
        }
      },
      required: ["searchResponse"]
    }
  }
];