import { callClaude } from "./aiClient";
import { tools } from "./tools";
import type { Finding } from "../types/Finding";

const API_BASE = "https://localhost:7064";
let lastSearchResults: any = null;
let currentFinding: Partial<Finding> = {};

async function callTool(name: string, args: any) {
  switch (name) {
    case "list_departments":
      return fetch(`${API_BASE}/list_departments`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json());

    case "list_vendors":
      // console.log("Calling list_vendors with args:", args);
      return fetch(`${API_BASE}/list_vendors?vendorNameContains=${encodeURIComponent(args.vendorNameContains)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json());

    case "search_contracts":
      console.log("Calling search_contracts with args:", args);
      return fetch(`${API_BASE}/search_contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args)
      }).then(res => res.json())
        .then(result => {
          console.log("The result of search_contracts is:", result);
          lastSearchResults = result;
          return { 
            totalMatches: result.totalMatches,
            returnedCount: result.returnedCount,
            warnings: result.warnings
          };
        });

    case "calculate_amendment_creep":
      console.log("Yoooooooooooooooooooooooo The last search result before calling calculate_amendment_creep is:", lastSearchResults);
      return fetch(`${API_BASE}/calculate_amendment_creep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastSearchResults)
      }).then(res => res.json())
        .then(result => {
          console.log("The result of calculate_amendment_creep is:", result);
          currentFinding.type = "amendment_creep";
          currentFinding.AmendmentCreepResponse = [
          ...(currentFinding.AmendmentCreepResponse ?? []),
          ...result
          ];
          return result;
        });

    case "calculate_threshold_split":
      //console.log("Calling calculate_threshold_split with args:", lastSearchResults);
      return fetch(`${API_BASE}/calculate_threshold_split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastSearchResults)
      }).then(res => res.json())
        .then(result => {
          console.log("The result of calculate_threshold_split is:", result);
          currentFinding.type = "threshold_split";
          // Append to the list instead of replacing
          //... The 3 dots adds individual items to the list and not just add the new list to the findings
          currentFinding.ThresholdSplitResponse = [ ...(currentFinding.ThresholdSplitResponse ?? []), ...result];
          return result;
        });

    case "calculate_sole_source_followon":
      console.log("Calling calculate_sole_source_followon with args:", args);
      return fetch(`${API_BASE}/calculate_sole_source_followon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastSearchResults)
      }).then(res => res.json())
        .then(result => {
          console.log("RAW sole source result type:", typeof result);
          console.log("Is array?:", Array.isArray(result));
          console.log("RAW sole source result:", JSON.stringify(result));

          const resultArray = Array.isArray(result) ? result : result.soleSourceGroups ?? [];

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

let conversationHistory: any[] = []; 
let displayMessages: DisplayMessage[] = []; 

export type DisplayMessage = {
  role: "user" | "assistant";
  text: string;
}

export async function runAgent(userInput: string): Promise<AgentResult> {
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
        const result = await callTool(block.name, block.input);
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