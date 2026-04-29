import Anthropic from "@anthropic-ai/sdk";

let systemPrompt: string = '';

async function loadSystemPrompt() {
  if (systemPrompt) return systemPrompt;
  // const response = await fetch('/system_prompt.txt');
    const response = await fetch('/src/ai/prompts/system_prompt.txt');
  systemPrompt = await response.text();
  return systemPrompt;
}

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function callClaude({ messages, tools }: { messages: any[]; tools: any[] }) {
  const prompt = await loadSystemPrompt();
 
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: prompt,
    messages,
    tools
  });

  return response;
}