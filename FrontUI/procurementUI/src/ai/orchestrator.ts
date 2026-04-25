import { callClaude } from "./aiClient";
import { tools } from "./tools";

const API_BASE = "https://localhost:5001";

async function callTool(name: string, args: any) {
  switch (name) {
    case "list_departments":
      return fetch(`${API_BASE}/list_departments`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json());

    case "list_vendors":
      return fetch(`${API_BASE}/list_vendors?vendorNameContains=${encodeURIComponent(args.vendorNameContains)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json());

    case "search_contracts":
      return fetch(`${API_BASE}/search_contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args)
      }).then(res => res.json());

    case "calculate_amendment_creep":
      return fetch(`${API_BASE}/calculate_amendment_creep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args)
      }).then(res => res.json());

    case "calculate_threshold_split":
      return fetch(`${API_BASE}/calculate_threshold_split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args)
      }).then(res => res.json());

    case "calculate_sole_source_followon":
      return fetch(`${API_BASE}/calculate_sole_source_followon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args)
      }).then(res => res.json());

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function runAgent(userInput: string) {
  const messages: any[] = [
    { role: "user", content: userInput }
  ];

  while (true) {
    const response = await callClaude({ messages, tools });
    const content = response.content;

    // Check if any tool calls exist in this response
    const toolCalls = content.filter((block: any) => block.type === "tool_use");

    if (toolCalls.length === 0) {
      // No tool calls — this is the final answer
      return content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n");
    }

    // Push assistant message ONCE outside the loop
    messages.push({ role: "assistant", content });

    // Process all tool calls and collect results
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

    // Push all tool results in one user message
    messages.push({ role: "user", content: toolResults });
  }
}