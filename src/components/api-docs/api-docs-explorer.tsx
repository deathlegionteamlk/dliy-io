// dliy io - API Documentation Explorer
// Lists all REST endpoints, methods, request/response shapes, and example curl.

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Globe, Lock, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  requestExample?: string;
  responseExample: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/workflows',
    description: 'List all workflows in the current workspace',
    auth: true,
    responseExample: `{
  "workflows": [
    {
      "id": "ck...",
      "name": "AI Support Bot",
      "description": "Customer support automation",
      "active": true,
      "graph": "{\\"nodes\\":[...],\\"edges\\":[]}",
      "tags": null,
      "_count": { "executions": 42 },
      "createdAt": "2026-06-21T...",
      "updatedAt": "2026-06-21T..."
    }
  ],
  "workspace": { "id": "ck...", "name": "Default", "slug": "default" }
}`,
  },
  {
    method: 'POST',
    path: '/api/workflows',
    description: 'Create a new workflow',
    auth: true,
    requestExample: `{
  "name": "My Workflow",
  "description": "Description here",
  "graph": { "nodes": [], "edges": [] },
  "tags": "marketing, ai",
  "active": false
}`,
    responseExample: `{
  "workflow": {
    "id": "ck...",
    "name": "My Workflow",
    "description": "Description here",
    ...
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/workflows/:id',
    description: 'Fetch a single workflow with its recent executions',
    auth: true,
    responseExample: `{
  "workflow": {
    "id": "ck...",
    "name": "AI Support Bot",
    "graph": "{\\"nodes\\":[...]}",
    "executions": [
      { "id": "ck...", "status": "success", "duration": 1234, ... }
    ]
  }
}`,
  },
  {
    method: 'PUT',
    path: '/api/workflows/:id',
    description: 'Update a workflow (name, graph, active state, etc.)',
    auth: true,
    requestExample: `{
  "name": "Updated Name",
  "active": true,
  "graph": { "nodes": [...], "edges": [...] }
}`,
    responseExample: `{ "workflow": { "id": "ck...", "name": "Updated Name", ... } }`,
  },
  {
    method: 'DELETE',
    path: '/api/workflows/:id',
    description: 'Delete a workflow and all its executions',
    auth: true,
    responseExample: `{ "ok": true }`,
  },
  {
    method: 'POST',
    path: '/api/workflows/:id/execute',
    description: 'Record a workflow execution (manual or triggered)',
    auth: true,
    requestExample: `{
  "status": "success",
  "durationMs": 1234,
  "logs": [{ "ts": "...", "level": "info", "message": "Started" }]
}`,
    responseExample: `{
  "execution": {
    "id": "ck...",
    "workflowId": "ck...",
    "status": "success",
    "duration": 1234,
    "createdAt": "2026-06-21T..."
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/credentials',
    description: 'List stored credentials (sensitive values are masked)',
    auth: true,
    responseExample: `{
  "credentials": [
    {
      "id": "ck...",
      "name": "Slack Bot Token",
      "type": "api_key",
      "service": "slack",
      "data": "[encrypted]",
      "createdAt": "2026-06-21T..."
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/api/credentials',
    description: 'Store a new encrypted credential',
    auth: true,
    requestExample: `{
  "name": "OpenAI API Key",
  "type": "api_key",
  "service": "openai",
  "data": { "apiKey": "sk-..." }
}`,
    responseExample: `{
  "credential": { "id": "ck...", "name": "OpenAI API Key", "data": "[encrypted]" }
}`,
  },
  {
    method: 'GET',
    path: '/api/nodes',
    description: 'Get the full node catalog (definitions for the visual editor)',
    auth: false,
    responseExample: `{
  "categories": [...],
  "nodes": [
    { "type": "trigger.webhook", "name": "Webhook", "category": "triggers", ... }
  ],
  "total": 80
}`,
  },
  {
    method: 'GET',
    path: '/api/stats',
    description: 'Get aggregated dashboard statistics',
    auth: true,
    responseExample: `{
  "workflows": 12,
  "activeWorkflows": 5,
  "executions": 234,
  "successfulExecs": 220,
  "failedExecs": 14,
  "credentials": 8,
  "successRate": 94,
  "last7Days": [{ "date": "2026-06-15", "count": 12 }, ...]
}`,
  },
  {
    method: 'POST',
    path: '/api/ai',
    description: 'Run an AI LLM or Agent completion via z-ai-web-dev-sdk',
    auth: true,
    requestExample: `{
  "op": "llm",
  "prompt": "Summarize this: ...",
  "model": "glm-4.6",
  "temperature": 0.7,
  "maxTokens": 1000
}`,
    responseExample: `{
  "ok": true,
  "text": "Here is the summary: ...",
  "model": "glm-4.6",
  "usage": { "prompt_tokens": 124, "completion_tokens": 88, "total_tokens": 212 },
  "source": "live"
}`,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-500',
  POST: 'bg-emerald-500',
  PUT: 'bg-amber-500',
  PATCH: 'bg-orange-500',
  DELETE: 'bg-red-500',
};

export function ApiDocsExplorer() {
  const [selected, setSelected] = useState<Endpoint>(ENDPOINTS[0]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const curlExample = `curl -X ${selected.method} \\
  ${'https://your-dliy-instance.com' + selected.path} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${selected.requestExample ? ` \\\n  -d '${selected.requestExample.replace(/\n/g, '\n  ')}'` : ''}`;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Code2 className="h-6 w-6 text-purple-500" /> API Reference
        </h1>
        <p className="text-sm text-muted-foreground">
          REST API for managing workflows, credentials, executions, and AI completions.
          All endpoints return JSON. Authenticated endpoints require a Bearer token.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="flex items-start gap-3 p-4">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-xs">
            <p className="font-semibold text-amber-900">Authentication</p>
            <p className="text-amber-800">
              All <code className="rounded bg-amber-100 px-1">auth: true</code> endpoints require a Bearer token
              in the <code className="rounded bg-amber-100 px-1">Authorization</code> header. Generate tokens
              from <code className="rounded bg-amber-100 px-1">Settings → API Tokens</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Endpoints ({ENDPOINTS.length})</CardTitle>
            <CardDescription className="text-xs">Click to view details</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {ENDPOINTS.map((ep, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(ep)}
                  className={`flex w-full items-center gap-2 border-b px-3 py-2 text-left text-xs hover:bg-accent ${
                    selected.path === ep.path && selected.method === ep.method ? 'bg-accent' : ''
                  }`}
                >
                  <Badge className={`${METHOD_COLORS[ep.method]} text-[9px]`}>{ep.method}</Badge>
                  <span className="flex-1 truncate font-mono">{ep.path}</span>
                  {ep.auth && <Lock className="h-3 w-3 text-amber-500" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className={`${METHOD_COLORS[selected.method]}`}>{selected.method}</Badge>
              <code className="text-sm font-mono">{selected.path}</code>
              {selected.auth && (
                <Badge variant="outline" className="text-[10px]">
                  <Lock className="mr-1 h-2.5 w-2.5" /> auth
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs pt-1">{selected.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl">
              <TabsList className="mb-3">
                <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                <TabsTrigger value="request" className="text-xs" disabled={!selected.requestExample}>Request</TabsTrigger>
                <TabsTrigger value="response" className="text-xs">Response</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <CodeBlock
                  title="Example Request"
                  code={curlExample}
                  onCopy={() => copyToClipboard(curlExample, 'cURL')}
                />
              </TabsContent>
              {selected.requestExample && (
                <TabsContent value="request">
                  <CodeBlock
                    title="Request Body"
                    code={selected.requestExample}
                    onCopy={() => copyToClipboard(selected.requestExample!, 'Request body')}
                  />
                </TabsContent>
              )}
              <TabsContent value="response">
                <CodeBlock
                  title="Response (200 OK)"
                  code={selected.responseExample}
                  onCopy={() => copyToClipboard(selected.responseExample, 'Response')}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" /> SDK Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="js">
            <TabsList className="mb-3">
              <TabsTrigger value="js" className="text-xs">JavaScript</TabsTrigger>
              <TabsTrigger value="py" className="text-xs">Python</TabsTrigger>
              <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
            </TabsList>
            <TabsContent value="js">
              <CodeBlock
                code={`import { DliyIO } from '@dliyio/api-sdk';

const client = new DliyIO({
  baseUrl: 'https://your-instance.com',
  apiKey: process.env.DLIYIO_API_KEY,
});

// Create a workflow
const wf = await client.workflows.create({
  name: 'My Workflow',
  graph: { nodes: [...], edges: [...] },
});

// Trigger an execution
const exec = await client.workflows.execute(wf.id, {
  payload: { user: 'alice' },
});

console.log('Execution:', exec.status);`}
                onCopy={() => copyToClipboard('// JavaScript SDK', 'JS example')}
              />
            </TabsContent>
            <TabsContent value="py">
              <CodeBlock
                code={`from dliyio import DliyIO

client = DliyIO(
    base_url='https://your-instance.com',
    api_key=os.environ['DLIYIO_API_KEY'],
)

# Create a workflow
wf = client.workflows.create(
    name='My Workflow',
    graph={'nodes': [...], 'edges': [...]},
)

# Trigger an execution
exec = client.workflows.execute(wf.id, payload={'user': 'alice'})
print(f'Execution: {exec.status}')`}
                onCopy={() => copyToClipboard('# Python SDK', 'Python example')}
              />
            </TabsContent>
            <TabsContent value="curl">
              <CodeBlock
                code={`# Set your API key
export DLIYIO_API_KEY="your-key-here"

# Create a workflow
curl -X POST https://your-instance.com/api/workflows \\
  -H "Authorization: Bearer $DLIYIO_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My Workflow","graph":{"nodes":[],"edges":[]}}'`}
                onCopy={() => copyToClipboard('# cURL', 'cURL example')}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function CodeBlock({ title, code, onCopy }: { title?: string; code: string; onCopy: () => void }) {
  return (
    <div className="rounded-md border bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
        <span className="text-[10px] font-mono text-zinc-400">{title ?? 'Code'}</span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-100"
        >
          <Copy className="h-3 w-3" /> Copy
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[11px] text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
