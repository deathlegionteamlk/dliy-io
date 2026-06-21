// dliy io - Templates Gallery
// Pre-built workflow templates users can install into their workspace.

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkflowStore } from '@/stores/workflow-store';
import { useUIStore } from '@/stores/ui-store';
import {
  Bot, MessageSquare, Github, ShoppingBag, Mail, Sparkles,
  TrendingUp, Zap, Filter, Search,
} from 'lucide-react';
import type { DliyNode } from '@/stores/workflow-store';
import type { Edge } from '@xyflow/react';
import { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: typeof Bot;
  color: string;
  nodes: DliyNode[];
  edges: Edge[];
}

const TEMPLATES: Template[] = [
  {
    id: 'ai-support-bot',
    name: 'AI Support Bot',
    description: 'Webhook → AI Agent → Slack escalation. Routes customer questions to an LLM and notifies a channel if confidence is low.',
    category: 'AI',
    icon: Bot,
    color: '#a855f7',
    nodes: [
      { id: 't1', type: 'dliyNode', position: { x: 80, y: 200 }, data: { label: 'Webhook', type: 'trigger.webhook', config: { method: 'POST', path: 'support', auth: true } } },
      { id: 't2', type: 'dliyNode', position: { x: 400, y: 150 }, data: { label: 'AI Agent', type: 'ai.agent', config: { model: 'glm-4.6', systemPrompt: 'You are a helpful support agent.', maxSteps: 5, temperature: 0.4 } } },
      { id: 't3', type: 'dliyNode', position: { x: 720, y: 100 }, data: { label: 'Respond', type: 'utility.respond', config: { status: 200, body: { ok: true } } } },
      { id: 't4', type: 'dliyNode', position: { x: 720, y: 300 }, data: { label: 'Escalate to Slack', type: 'action.slack', config: { operation: 'sendMessage', channel: '#support-escalations' } } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 't2', animated: true },
      { id: 'e2', source: 't2', target: 't3', animated: true },
      { id: 'e3', source: 't2', target: 't4', animated: true },
    ],
  },
  {
    id: 'github-pr-notify',
    name: 'GitHub PR Notifications',
    description: 'When a PR is opened, post a summary to Slack and create a Jira ticket for review.',
    category: 'DevOps',
    icon: Github,
    color: '#3b82f6',
    nodes: [
      { id: 'g1', type: 'dliyNode', position: { x: 80, y: 200 }, data: { label: 'GitHub Webhook', type: 'trigger.webhook', config: { method: 'POST', path: 'gh-pr' } } },
      { id: 'g2', type: 'dliyNode', position: { x: 400, y: 150 }, data: { label: 'Summarize PR', type: 'ai.llm', config: { model: 'glm-4.6', prompt: 'Summarize this PR: {{ $json.title }}', temperature: 0.3 } } },
      { id: 'g3', type: 'dliyNode', position: { x: 720, y: 100 }, data: { label: 'Notify Slack', type: 'action.slack', config: { operation: 'sendMessage', channel: '#engineering' } } },
      { id: 'g4', type: 'dliyNode', position: { x: 720, y: 300 }, data: { label: 'Create Jira', type: 'action.jira', config: { operation: 'createIssue', project: 'ENG' } } },
    ],
    edges: [
      { id: 'e1', source: 'g1', target: 'g2', animated: true },
      { id: 'e2', source: 'g2', target: 'g3', animated: true },
      { id: 'e3', source: 'g2', target: 'g4', animated: true },
    ],
  },
  {
    id: 'lead-scoring',
    name: 'Lead Scoring',
    description: 'Capture form submissions, score with AI, push hot leads to HubSpot and notify sales in Slack.',
    category: 'Sales',
    icon: TrendingUp,
    color: '#10b981',
    nodes: [
      { id: 'l1', type: 'dliyNode', position: { x: 80, y: 200 }, data: { label: 'Form Webhook', type: 'trigger.webhook', config: { method: 'POST', path: 'lead' } } },
      { id: 'l2', type: 'dliyNode', position: { x: 400, y: 200 }, data: { label: 'Score with AI', type: 'ai.llm', config: { model: 'glm-4.6', prompt: 'Score this lead 1-100: {{ $json.payload }}', temperature: 0.2 } } },
      { id: 'l3', type: 'dliyNode', position: { x: 720, y: 150 }, data: { label: 'If Hot Lead', type: 'logic.if', config: { left: '{{ $json.score }}', op: 'gt', right: '70' } } },
      { id: 'l4', type: 'dliyNode', position: { x: 1040, y: 100 }, data: { label: 'Push to HubSpot', type: 'action.hubspot', config: { operation: 'createContact' } } },
      { id: 'l5', type: 'dliyNode', position: { x: 1040, y: 250 }, data: { label: 'Notify Sales', type: 'action.slack', config: { operation: 'sendMessage', channel: '#sales' } } },
    ],
    edges: [
      { id: 'e1', source: 'l1', target: 'l2', animated: true },
      { id: 'e2', source: 'l2', target: 'l3', animated: true },
      { id: 'e3', source: 'l3', target: 'l4', animated: true },
      { id: 'e4', source: 'l3', target: 'l5', animated: true },
    ],
  },
  {
    id: 'stripe-receipt',
    name: 'Stripe Receipt Emailer',
    description: 'On successful Stripe charge, send a receipt email and log to Google Sheets.',
    category: 'Finance',
    icon: ShoppingBag,
    color: '#635bff',
    nodes: [
      { id: 's1', type: 'dliyNode', position: { x: 80, y: 200 }, data: { label: 'Stripe Webhook', type: 'trigger.webhook', config: { method: 'POST', path: 'stripe' } } },
      { id: 's2', type: 'dliyNode', position: { x: 400, y: 200 }, data: { label: 'Send Receipt', type: 'action.email', config: { provider: 'sendgrid', subject: 'Your receipt' } } },
      { id: 's3', type: 'dliyNode', position: { x: 720, y: 200 }, data: { label: 'Log to Airtable', type: 'action.airtable', config: { operation: 'create' } } },
    ],
    edges: [
      { id: 'e1', source: 's1', target: 's2', animated: true },
      { id: 'e2', source: 's2', target: 's3', animated: true },
    ],
  },
  {
    id: 'daily-ai-digest',
    name: 'Daily AI Digest',
    description: 'Every morning, summarize yesterday\'s metrics with AI and post a digest to Slack.',
    category: 'Productivity',
    icon: Mail,
    color: '#14b8a6',
    nodes: [
      { id: 'd1', type: 'dliyNode', position: { x: 80, y: 200 }, data: { label: 'Daily 9 AM', type: 'trigger.schedule', config: { cron: '0 9 * * *', timezone: 'UTC' } } },
      { id: 'd2', type: 'dliyNode', position: { x: 400, y: 200 }, data: { label: 'Fetch Metrics', type: 'action.http', config: { method: 'GET', url: 'https://api.example.com/metrics' } } },
      { id: 'd3', type: 'dliyNode', position: { x: 720, y: 200 }, data: { label: 'AI Summary', type: 'ai.llm', config: { model: 'glm-4.6', prompt: 'Summarize these metrics: {{ $json.body }}' } } },
      { id: 'd4', type: 'dliyNode', position: { x: 1040, y: 200 }, data: { label: 'Post to Slack', type: 'action.slack', config: { operation: 'sendMessage', channel: '#daily-digest' } } },
    ],
    edges: [
      { id: 'e1', source: 'd1', target: 'd2', animated: true },
      { id: 'e2', source: 'd2', target: 'd3', animated: true },
      { id: 'e3', source: 'd3', target: 'd4', animated: true },
    ],
  },
  {
    id: 'rag-search-bot',
    name: 'RAG Knowledge Bot',
    description: 'Webhook question → RAG search over your docs → LLM answer → respond.',
    category: 'AI',
    icon: Sparkles,
    color: '#a855f7',
    nodes: [
      { id: 'r1', type: 'dliyNode', position: { x: 80, y: 200 }, data: { label: 'Question Webhook', type: 'trigger.webhook', config: { method: 'POST', path: 'ask' } } },
      { id: 'r2', type: 'dliyNode', position: { x: 400, y: 200 }, data: { label: 'RAG Search', type: 'ai.rag', config: { topK: 5, index: 'docs' } } },
      { id: 'r3', type: 'dliyNode', position: { x: 720, y: 200 }, data: { label: 'LLM Answer', type: 'ai.llm', config: { model: 'glm-4.6', prompt: 'Answer using: {{ $json.results }}' } } },
      { id: 'r4', type: 'dliyNode', position: { x: 1040, y: 200 }, data: { label: 'Respond', type: 'utility.respond', config: { status: 200 } } },
    ],
    edges: [
      { id: 'e1', source: 'r1', target: 'r2', animated: true },
      { id: 'e2', source: 'r2', target: 'r3', animated: true },
      { id: 'e3', source: 'r3', target: 'r4', animated: true },
    ],
  },
];

const CATEGORIES = ['All', 'AI', 'DevOps', 'Sales', 'Finance', 'Productivity'];

export function TemplatesGallery() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const { loadGraph } = useWorkflowStore();
  const { editWorkflow } = useUIStore();

  const filtered = TEMPLATES.filter(t => {
    if (category !== 'All' && t.category !== category) return false;
    if (query && !t.name.toLowerCase().includes(query.toLowerCase()) && !t.description.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const handleInstall = (tpl: Template) => {
    loadGraph(tpl.nodes, tpl.edges);
    editWorkflow(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-purple-500" /> Workflow Templates
        </h1>
        <p className="text-sm text-muted-foreground">
          Start from a pre-built automation. Click <strong>Use Template</strong> to load it into the editor.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-md border bg-background py-1.5 pl-7 pr-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-md px-2 py-1 text-xs transition-colors ${
                category === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(tpl => {
          const Icon = tpl.icon;
          return (
            <Card key={tpl.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ backgroundColor: tpl.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">{tpl.category}</Badge>
                </div>
                <CardTitle className="text-base">{tpl.name}</CardTitle>
                <CardDescription className="text-xs">{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="mb-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Zap className="h-2.5 w-2.5" /> {tpl.nodes.length} nodes · {tpl.edges.length} connections
                </div>
                <Button size="sm" className="w-full" onClick={() => handleInstall(tpl)}>
                  Use Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No templates match your filter.</p>
        </div>
      )}
    </div>
  );
}
