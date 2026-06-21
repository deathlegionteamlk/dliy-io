// dliy io - Real AI Service
// Wraps z-ai-web-dev-sdk so the LLM Call and AI Agent nodes can actually
// invoke GLM-4.6 (and other supported models) at execution time.
// Falls back to a simulated response if the SDK is not configured.

import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;
let initError: string | null = null;

async function getZAI() {
  if (initError) throw new Error(initError);
  if (zaiInstance) return zaiInstance;
  try {
    zaiInstance = await ZAI.create();
    return zaiInstance;
  } catch (err) {
    initError = err instanceof Error ? err.message : 'Failed to init ZAI SDK';
    throw new Error(initError);
  }
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export async function callLLM(prompt: string, options: LLMOptions = {}): Promise<{
  text: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  source: 'live' | 'simulated';
}> {
  try {
    const zai = await getZAI();
    const messages: Array<{ role: string; content: string }> = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await zai.chat.completions.create({
      messages: messages as never,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000,
      thinking: { type: 'disabled' },
    } as never);

    const text = completion.choices?.[0]?.message?.content ?? '';
    const usage = completion.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    return {
      text,
      model: options.model ?? 'glm-4.6',
      usage: {
        prompt_tokens: usage.prompt_tokens ?? 0,
        completion_tokens: usage.completion_tokens ?? 0,
        total_tokens: usage.total_tokens ?? 0,
      },
      source: 'live',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    return {
      text: `[AI unavailable: ${msg}] Simulated response to: ${prompt.slice(0, 80)}`,
      model: options.model ?? 'glm-4.6',
      usage: { prompt_tokens: prompt.length, completion_tokens: 64, total_tokens: prompt.length + 64 },
      source: 'simulated',
    };
  }
}

export interface AgentOptions extends LLMOptions {
  tools?: string[];
  maxSteps?: number;
}

export async function callAgent(
  userInput: string,
  options: AgentOptions = {},
): Promise<{
  output: string;
  steps: number;
  toolsUsed: string[];
  tokensUsed: number;
  source: 'live' | 'simulated';
}> {
  const systemPrompt = options.systemPrompt
    ? `${options.systemPrompt}\n\nYou have access to these tools: ${(options.tools ?? []).join(', ')}. Decide which to use and respond.`
    : `You are a helpful agent. Available tools: ${(options.tools ?? []).join(', ')}.`;

  try {
    const result = await callLLM(userInput, { ...options, systemPrompt });
    return {
      output: result.text,
      steps: 1,
      toolsUsed: (options.tools ?? []).slice(0, 1),
      tokensUsed: result.usage.total_tokens,
      source: result.source,
    };
  } catch {
    return {
      output: `[Agent failed] Could not process: ${userInput.slice(0, 60)}`,
      steps: 0,
      toolsUsed: [],
      tokensUsed: 0,
      source: 'simulated',
    };
  }
}
