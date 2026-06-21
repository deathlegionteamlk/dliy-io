// dliy io - AI Builder View
// Standalone page version of the AI Workflow Builder chat.
// Same logic as the dialog but rendered inline in the main view.

'use client';

import { useState } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { useWorkflowStore, type DliyNode } from '@/stores/workflow-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, Wand2, ArrowRight } from 'lucide-react';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import type { Edge } from '@xyflow/react';
import { getNodeDefinition } from '@/lib/nodes/registry';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  workflow?: { nodes: DliyNode[]; edges: Edge[] };
}

const EXAMPLE_PROMPTS = [
  'When a new GitHub PR is opened, summarize it with AI and post to Slack',
  'Every morning at 9am, fetch metrics from my API, summarize with GLM-4.6, email me',
  'When a Stripe charge succeeds, send a receipt email and log to Airtable',
  'On a webhook, classify the lead with AI, push hot leads to HubSpot and notify sales in Slack',
  'When a Sentry error occurs, create a Linear issue and notify the team in Slack',
];

function generateWorkflow(description: string): { nodes: DliyNode[]; edges: Edge[] } {
  const desc = description.toLowerCase();
  const picked: string[] = [];

  // Trigger
  if (desc.includes('every') || desc.includes('cron') || desc.includes('schedule') || desc.includes('morning') || desc.includes('daily') || desc.includes('9am')) {
    picked.push('trigger.schedule');
  } else if (desc.includes('sentry') || desc.includes('error') || desc.includes('stripe') || desc.includes('github') || desc.includes('webhook') || desc.includes('when')) {
    picked.push('trigger.webhook');
  } else {
    picked.push('trigger.manual');
  }

  // AI step
  if (desc.includes('summar') || desc.includes('classif') || desc.includes('analyz') || desc.includes('ai') || desc.includes('llm') || desc.includes('agent')) {
    picked.push(desc.includes('agent') ? 'ai.agent' : 'ai.llm');
  }

  // Actions
  if (desc.includes('slack')) picked.push('action.slack');
  if (desc.includes('email') || desc.includes('mail')) picked.push('action.email');
  if (desc.includes('github') && (desc.includes('issue') || desc.includes('pr'))) picked.push('action.github');
  if (desc.includes('stripe')) picked.push('action.stripe');
  if (desc.includes('notion')) picked.push('action.notion');
  if (desc.includes('airtable')) picked.push('action.airtable');
  if (desc.includes('hubspot')) picked.push('action.hubspot');
  if (desc.includes('jira')) picked.push('action.jira');
  if (desc.includes('linear')) picked.push('prod.linear');
  if (desc.includes('sentry')) picked.push('devops.sentry');
  if (desc.includes('telegram')) picked.push('comm.telegram');
  if (desc.includes('discord')) picked.push('action.discord');
  if (desc.includes('twilio') || desc.includes('sms')) picked.push('comm.twilio');

  if (picked.length === 1) picked.push('action.slack');

  const nodes: DliyNode[] = picked.map((type, i) => {
    const def = getNodeDefinition(type);
    if (!def) return null;
    const config: Record<string, unknown> = {};
    for (const f of def.fields) {
      if (f.default !== undefined) config[f.key] = f.default;
    }
    if (type === 'trigger.webhook') {
      if (desc.includes('github')) config.path = 'github';
      else if (desc.includes('stripe')) config.path = 'stripe';
      else if (desc.includes('sentry')) config.path = 'sentry';
    }
    if (type === 'trigger.schedule' && desc.includes('morning')) {
      config.cron = '0 9 * * *';
    }
    if (type === 'ai.llm') {
      config.prompt = `Process: {{ $json.payload || $json.body || $json }}\n\nContext: ${description.slice(0, 200)}`;
    }
    return {
      id: `${type.split('.').pop()}_${nanoid(6)}`,
      type: 'dliyNode',
      position: { x: 80 + i * 280, y: 200 + (i % 2) * 120 },
      data: { label: def.name, type: def.type, config, description: def.description },
    };
  }).filter(Boolean) as DliyNode[];

  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `e_${nodes[i].id}_${nodes[i+1].id}`,
      source: nodes[i].id,
      target: nodes[i+1].id,
      animated: true,
    });
  }

  return { nodes, edges };
}

export function AIBuilderView() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { loadGraph, editWorkflow } = useWorkflowStore();
  const { setView } = useUIStore();

  const handleSend = async (text?: string) => {
    const prompt = (text ?? input).trim();
    if (!prompt || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          op: 'llm',
          prompt: `You are an AI workflow builder. The user wants to build this workflow:\n\n"${prompt}"\n\nIn 2-3 sentences, describe what nodes you would wire together. Be specific about which services to use. Don't use JSON or code.`,
          systemPrompt: 'You are a helpful workflow designer. Be concise and specific.',
          temperature: 0.4,
          maxTokens: 250,
        }),
      });
      const json = await res.json();
      const assistantText = json.text ?? `I've designed a workflow for: "${prompt.slice(0, 60)}". Click "Load into Editor" to view it.`;
      const wf = generateWorkflow(prompt);
      setMessages(prev => [...prev, { role: 'assistant', content: assistantText, workflow: wf }]);
    } catch {
      const wf = generateWorkflow(prompt);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'll generate a workflow for: "${prompt.slice(0, 60)}". Click "Load into Editor" to view it.`,
        workflow: wf,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (wf: { nodes: DliyNode[]; edges: Edge[] }) => {
    loadGraph(wf.nodes, wf.edges);
    editWorkflow(null);
    setView('editor');
    toast.success(`Workflow loaded with ${wf.nodes.length} nodes`);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Wand2 className="h-6 w-6 text-purple-500" /> AI Workflow Builder
        </h1>
        <p className="text-sm text-muted-foreground">
          Describe what you want to automate in plain English. The AI will design a workflow and load it into the visual editor.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-purple-500" /> Try one of these
          </CardTitle>
          <CardDescription className="text-xs">Click an example to generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {EXAMPLE_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                disabled={loading}
                className="rounded-lg border p-3 text-left text-xs text-muted-foreground transition-all hover:border-primary hover:bg-accent disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border bg-muted/20 p-3">
            {messages.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Wand2 className="mx-auto mb-2 h-8 w-8" />
                Your AI-designed workflows will appear here.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                <div className={`max-w-[85%] rounded-lg p-3 text-xs ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.workflow && (
                    <div className="mt-3 rounded-md bg-background/50 p-2">
                      <div className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">
                        Generated Workflow ({m.workflow.nodes.length} nodes)
                      </div>
                      <div className="mb-2 flex flex-wrap gap-1">
                        {m.workflow.nodes.map((n, idx) => (
                          <Badge key={n.id} variant="outline" className="text-[9px]">
                            {idx + 1}. {n.data.label}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        className="h-7 w-full text-xs"
                        onClick={() => handleLoad(m.workflow!)}
                      >
                        Load into Editor <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>AI is designing your workflow...</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your workflow... (e.g. When I get a new email, summarize it with AI and post to Slack)"
              className="min-h-[80px] text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
              }}
            />
            <Button onClick={() => handleSend()} disabled={loading || !input.trim()} className="self-end">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Tip: press <kbd className="rounded border bg-muted px-1">Cmd/Ctrl + Enter</kbd> to send
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
