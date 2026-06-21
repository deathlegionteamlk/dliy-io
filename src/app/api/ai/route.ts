// dliy io - AI API endpoint
// Server-side endpoint that wraps z-ai-web-dev-sdk (which is server-only).
// The client-side workflow engine calls this endpoint during execution.

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { op, prompt, systemPrompt, model, temperature, maxTokens, tools, userInput } = body ?? {};

    if (op === 'llm' || op === 'agent') {
      const finalPrompt = op === 'agent' ? (userInput ?? prompt) : prompt;
      const finalSystem = op === 'agent'
        ? `${systemPrompt ?? 'You are a helpful agent.'}\n\nYou have access to these tools: ${(tools ?? []).join(', ')}. Decide which to use and respond.`
        : systemPrompt;

      try {
        const zai = await getZAI();
        const messages: Array<{ role: string; content: string }> = [];
        if (finalSystem) messages.push({ role: 'system', content: finalSystem });
        messages.push({ role: 'user', content: String(finalPrompt ?? '') });

        const completion = await zai.chat.completions.create({
          messages: messages as never,
          temperature: Number(temperature ?? 0.7),
          max_tokens: Number(maxTokens ?? 1000),
          thinking: { type: 'disabled' },
        } as never);

        const text = completion.choices?.[0]?.message?.content ?? '';
        const usage = completion.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

        return NextResponse.json({
          ok: true,
          text,
          model: model ?? 'glm-4.6',
          usage: {
            prompt_tokens: usage.prompt_tokens ?? 0,
            completion_tokens: usage.completion_tokens ?? 0,
            total_tokens: usage.total_tokens ?? 0,
          },
          source: 'live',
          steps: op === 'agent' ? 1 : undefined,
          toolsUsed: op === 'agent' ? (tools ?? []).slice(0, 1) : undefined,
          tokensUsed: op === 'agent' ? (usage.total_tokens ?? 0) : undefined,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown error';
        return NextResponse.json({
          ok: true,
          text: `[AI unavailable: ${msg}] Simulated response to: ${String(finalPrompt ?? '').slice(0, 80)}`,
          model: model ?? 'glm-4.6',
          usage: { prompt_tokens: String(finalPrompt ?? '').length, completion_tokens: 64, total_tokens: String(finalPrompt ?? '').length + 64 },
          source: 'simulated',
          steps: op === 'agent' ? 1 : undefined,
          toolsUsed: op === 'agent' ? [] : undefined,
          tokensUsed: op === 'agent' ? 64 : undefined,
        });
      }
    }

    return NextResponse.json({ ok: false, error: 'Unknown op' }, { status: 400 });
  } catch (err) {
    console.error('AI API failed', err);
    return NextResponse.json(
      { ok: false, error: 'AI request failed' },
      { status: 500 },
    );
  }
}
