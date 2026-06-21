// dliy io - AI Workflow Builder
// Chat interface where users describe a workflow in plain English and the AI
// generates a workflow graph (set of nodes + edges) that loads into the editor.

'use client';

import { useState } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { useWorkflowStore, type DliyNode } from '@/stores/workflow-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, Wand2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import type { Edge } from '@xyflow/react';
import { NODE_DEFINITIONS, getNodeDefinition } from '@/lib/nodes/registry';

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
];

// Heuristic generator: given a user's description, picks relevant nodes and
// connects them in a sensible order. Real version would call the LLM to
// generate a structured workflow spec.
function generateWorkflow(description: string): { nodes: DliyNode[]; edges: Edge[] } {
  const desc = description.toLowerCase();
  const picked: string[] = [];

  // Trigger selection
  if (desc.includes('webhook') || desc.includes('http')) picked.push('trigger.webhook');
  else if (desc.includes('every') || desc.includes('cron') || desc.includes('schedule') || desc.includes('morning') || desc.includes('daily') || desc.includes('9am')) picked.push('trigger.schedule');
  else if (desc.includes('github') || desc.includes('pr') || desc.includes('pull request')) picked.push('trigger.webhook');
  else if (desc.includes('stripe') || desc.includes('charge') || desc.includes('payment')) picked.push('trigger.webhook');
  else picked.push('trigger.manual');

  // AI step
  if (desc.includes('summar') || desc.includes('classif') || desc.includes('analyz') || desc.includes('ai') || desc.includes('llm') || desc.includes('agent')) {
    picked.push(desc.includes('agent') ? 'ai.agent' : 'ai.llm');
  }

  // Action selection (check keywords in order)
  if (desc.includes('slack')) picked.push('action.slack');
  if (desc.includes('email') || desc.includes('mail')) picked.push('action.email');
  if (desc.includes('github') && (desc.includes('issue') || desc.includes('pr'))) picked.push('action.github');
  if (desc.includes('stripe')) picked.push('action.stripe');
  if (desc.includes('notion')) picked.push('action.notion');
  if (desc.includes('airtable')) picked.push('action.airtable');
  if (desc.includes('hubspot')) picked.push('action.hubspot');
  if (desc.includes('jira')) picked.push('action.jira');
  if (desc.includes('telegram')) picked.push('comm.telegram');
  if (desc.includes('discord')) picked.push('action.discord');
  if (desc.includes('twilio') || desc.includes('sms')) picked.push('comm.twilio');

  // Default: end with a Slack notification if nothing else
  if (picked.length === 1) picked.push('action.slack');

  // Build the graph
  const nodes: DliyNode[] = picked.map((type, i) => {
    const def = getNodeDefinition(type);
    if (!def) return null;
    const config: Record<string, unknown> = {};
    for (const f of def.fields) {
      if (f.default !== undefined) config[f.key] = f.default;
    }
    if (type === 'trigger.webhook' && desc.includes('github')) {
      config.path = 'github-webhook';
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

export function AIBuilderDialog() {
  const [open, setOpen] = useState(false);
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
          prompt: `You are an AI workflow builder. The user wants to build this workflow:\n\n"${prompt}"\n\nBriefly describe (in 2-3 sentences) what nodes you would wire together. Use simple language. Don't use JSON.`,
          systemPrompt: 'You are a helpful workflow designer. Be concise.',
          temperature: 0.4,
          maxTokens: 250,
        }),
      });
      const json = await res.json();
      const assistantText = json.text ?? 'I have designed a workflow for you. Click "Load into Editor" to view it.';
      const wf = generateWorkflow(prompt);
      setMessages(prev => [...prev, { role: 'assistant', content: assistantText, workflow: wf }]);
    } catch (err) {
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
    setOpen(false);
    toast.success(`Workflow loaded with ${wf.nodes.length} nodes`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-1.5">
          <Wand2 className="h-3.5 w-3.5" /> AI Builder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" /> AI Workflow Builder
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="max-h-80 min-h-[200px] space-y-3 overflow-y-auto rounded-lg border bg-muted/20 p-3">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <Wand2 className="mx-auto mb-3 h-8 w-8 text-purple-500" />
                <p className="mb-3 text-sm text-muted-foreground">
                  Describe the workflow you want in plain English.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {EXAMPLE_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(p)}
                      className="rounded-full border bg-background px-2.5 py-1 text-[10px] text-muted-foreground hover:border-primary hover:text-foreground"
                    >
                      {p.slice(0, 50)}{p.length > 50 ? '…' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                <div className={`max-w-[85%] rounded-lg p-2.5 text-xs ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.workflow && (
                    <div className="mt-2 rounded-md bg-background/50 p-2">
                      <div className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                        Generated Workflow
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
                        Load into Editor ({m.workflow.nodes.length} nodes)
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
              placeholder="Describe your workflow..."
              className="min-h-[60px] text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSend();
                }
              }}
            />
            <Button onClick={() => handleSend()} disabled={loading || !input.trim()} className="self-end">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Tip: press <kbd className="rounded border bg-muted px-1">Cmd/Ctrl + Enter</kbd> to send
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Suppress unused warning
void NODE_DEFINITIONS;
