import { callClaude } from "./aiClient";
import { tools } from "./tools";
import type { Finding } from "../types/Finding";
// import { on } from "events";

const API_BASE = "https://localhost:7064";
let lastSearchResults: any = null;
let currentFinding: Partial<Finding> = {};

async function callTool(name: string, args: any, onProgress?: (update: ProgressUpdate) => void) {
  switch (name) {
    case "list_departments":
      onProgress?.({ tool: "list_departments", message: "Calling List Departments tool..." });
      return fetch(`${API_BASE}/list_departments`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json());

    case "list_vendors":
      onProgress?.({ tool: "list_vendors", message: "Calling List Vendors tool..." });
      // console.log("Calling list_vendors with args:", args);
      return fetch(`${API_BASE}/list_vendors?vendorNameContains=${encodeURIComponent(args.vendorNameContains)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json());

    case "search_contracts":
      onProgress?.({ tool: "search_contracts", message: "Calling Search Contracts tool..." });
      console.log("Calling search_contracts with args:", args);
      return fetch(`${API_BASE}/search_contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args)
      }).then(res => res.json())
        .then(result => {
          console.log("The result of search_contracts is:", result);
          onProgress?.({ tool: "search_contracts", message: `Found ${result.length} contracts matching criteria` });
          lastSearchResults = result;
          return{
            lastSearchResults
          }
        });

    case "calculate_amendment_creep":
      onProgress?.({ tool: "calculate_amendment_creep", message: "Calling Calculate Amendment Creep tool..." });
      return fetch(`${API_BASE}/calculate_amendment_creep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastSearchResults)
      }).then(res => res.json())
        .then(result => {
          console.log("The result of calculate_amendment_creep is:", result);
          onProgress?.({ tool: "calculate_amendment_creep", message: `Found ${result.length} contracts with potential amendment creep` });
          currentFinding.type = "amendment_creep";
          currentFinding.AmendmentCreepResponse = [
          ...(currentFinding.AmendmentCreepResponse ?? []),
          ...result
          ];
          return result;
        });

    case "calculate_threshold_split":
      onProgress?.({ tool: "calculate_threshold_split", message: "Calling Calculate Threshold Split tool..." });
      return fetch(`${API_BASE}/calculate_threshold_split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastSearchResults)
      }).then(res => res.json())
        .then(result => {
          console.log("The result of calculate_threshold_split is:", result);
          currentFinding.type = "threshold_split";
          const resultArray = Array.isArray(result) ? result : result.thresholdSplitGroups ?? [];
          onProgress?.({ tool: "calculate_threshold_split", message: `Found ${resultArray.length} threshold split groups` });
         
          // Append to the list instead of replacing
          //... The 3 dots adds individual items to the list and not just add the new list to the findings
          currentFinding.ThresholdSplitResponse = [ ...(currentFinding.ThresholdSplitResponse ?? []), ...resultArray];
          return result;
        });

    case "calculate_sole_source_followon":
      onProgress?.({ tool: "calculate_sole_source_followon", message: "Calling Calculate Sole Source Follow-on tool..." });
      console.log("Calling calculate_sole_source_followon with args:", args);
      return fetch(`${API_BASE}/calculate_sole_source_followon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastSearchResults)
      }).then(res => res.json())
        .then(result => {
          console.log("The result of calculate_sole_source_followon is:", result);
          const resultArray = Array.isArray(result) ? result : result.soleSourceGroups ?? [];
          onProgress?.({ tool: "calculate_sole_source_followon", message: `Found ${resultArray.length} sole source groups` });

          currentFinding.type = "sole_source";
          currentFinding.SoleSourceResponse = [...(currentFinding.SoleSourceResponse ?? []),  ...resultArray];
          return result;
        });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export type AgentResult = {
  text: string;
  finding: Partial<Finding> | null;
  messages: DisplayMessage[];
}

export type ProgressUpdate = {
  tool: string;
  message: string;
}

let conversationHistory: any[] = []; 
let displayMessages: DisplayMessage[] = []; 

export type DisplayMessage = {
  role: "user" | "assistant";
  text: string;
}

export async function runAgent(userInput: string, onProgress: (update: ProgressUpdate) => void): Promise<AgentResult> {
  // Add new user message to the existing history 
  conversationHistory.push({role: "user", content: userInput})
  displayMessages.push({
    role: "user",
    text: userInput
  })

  // Reset for each new question
  lastSearchResults = null;
  currentFinding = {};

  while (true) {
    const response = await callClaude({ messages: conversationHistory, tools });
    const content = response.content;

    //Check if Claude is still trying to call more tools 
    const toolCalls = content.filter((block: any) => block.type === "tool_use");

    if (toolCalls.length === 0) {
      const text = content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n");

      
      // Add Claude's final answer to history
      conversationHistory.push({ role: "assistant", content: [{ type: "text", text }] });
      displayMessages.push({ role: "assistant", text: text });
      return {
        text,
        finding: Object.keys(currentFinding).length > 0 ? currentFinding : null,
        messages: displayMessages
      };
    }

    conversationHistory.push({ role: "assistant", content })

    const toolResults = await Promise.all(
      toolCalls.map(async (block: any) => {
        console.log("Calling tool:", block.name, block.input);
        const result = await callTool(block.name, block.input, onProgress);
        return {
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result)
        };
      })
    );

     conversationHistory.push({ role: "user", content: toolResults });
  }
}