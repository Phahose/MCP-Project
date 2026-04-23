import { callClaude } from "./aiClient";
import { tools } from "./tools";

const API_BASE = "https://localhost:5001"; // // C# web API endpoint

// Helper function to call tools
async function callTool(name: string, args: any) {
  switch (name) {
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

// Main agent loop
export async function runAgent(userInput: string) {
  const messages: any[] = [
    {
      role: "user",
      content: userInput
    }
  ];

  // The agent will keep calling Claude until it produces a response that doesn't use any tools, which we treat as the final answer
  while (true) {
    // Call Claude with the current conversation and available tools
    const response = await callClaude({ messages, tools});

    // The response content is an array of blocks, which may include text and/or tool calls
    const content = response.content;

    let toolUsed = false;

    // Check if the response includes any tool calls
    for (const block of content) {

      if (block.type === "tool_use") {
        toolUsed = true;

        const toolName = block.name;
        const toolArgs = block.input;

        console.log("Calling tool:", toolName, toolArgs);

        // Call the appropriate tool function based on the tool name and get the result
        const result = await callTool(toolName, toolArgs);

        messages.push({
          role: "assistant",
          content: content
        });

        messages.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify(result)
            }
          ]
        });
      }
    }

    // If no tools were used, we assume the response is the final answer and return it
    if (!toolUsed) {
      const finalText = content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n");

      return finalText;
    }
  }
}