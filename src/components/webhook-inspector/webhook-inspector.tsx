// dliy io - Webhook Inspector
// Live view of incoming webhook requests with payload, headers, and response.

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Webhook, Copy, RefreshCw, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WebhookRequest {
  id: string;
  receivedAt: string;
  method: string;
  path: string;
  status: 'success' | 'failed' | 'pending';
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  responseTime: number;
  workflowId?: string;
}

// Generate fake incoming requests for demo
function genRequest(): WebhookRequest {
  const methods = ['POST', 'GET', 'PUT', 'DELETE'];
  const paths = ['github', 'stripe', 'slack', 'support', 'lead-capture', 'webhook'];
  const method = methods[Math.floor(Math.random() * methods.length)];
  const path = paths[Math.floor(Math.random() * paths.length)];
  const statuses = [200, 200, 200, 201, 200, 400, 500, 200];
  const sc = statuses[Math.floor(Math.random() * statuses.length)];
  return {
    id: `req_${Math.random().toString(36).slice(2, 10)}`,
    receivedAt: new Date().toISOString(),
    method,
    path,
    status: sc < 400 ? 'success' : sc < 500 ? 'failed' : 'failed',
    statusCode: sc,
    headers: {
      'content-type': 'application/json',
      'user-agent': 'GitHub-Hookshot/abc123',
      'x-github-event': 'pull_request',
      'x-github-delivery': Math.random().toString(36).slice(2),
    },
    body: {
      action: 'opened',
      number: Math.floor(Math.random() * 999),
      pull_request: { title: 'Add new feature', user: { login: 'alice' } },
      repository: { full_name: 'death-legion/dliy-io' },
    },
    responseTime: Math.floor(20 + Math.random() * 200),
  };
}

export function WebhookInspector() {
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [selected, setSelected] = useState<WebhookRequest | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate incoming webhooks
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setRequests(prev => [genRequest(), ...prev].slice(0, 50));
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleClear = () => {
    setRequests([]);
    setSelected(null);
    toast.success('Inspector cleared');
  };

  const copyCurl = (r: WebhookRequest) => {
    const curl = `curl -X ${r.method} \\
  https://your-dliy-instance.com/webhook/${r.path} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(r.body, null, 2)}'`;
    navigator.clipboard.writeText(curl);
    toast.success('cURL copied');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Webhook className="h-6 w-6 text-emerald-500" /> Webhook Inspector
          </h1>
          <p className="text-sm text-muted-foreground">
            Live view of incoming webhook requests. Use this to debug triggers and inspect payloads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-capture
          </label>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Request list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Requests ({requests.length})</span>
              {autoRefresh && <span className="flex items-center gap-1 text-[10px] font-normal text-emerald-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {requests.length === 0 && (
                <div className="px-3 py-12 text-center text-xs text-muted-foreground">
                  Waiting for incoming webhooks...
                  <br />
                  <span className="text-[10px]">POST to https://your-instance.com/webhook/test</span>
                </div>
              )}
              {requests.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={cn(
                    'flex w-full items-center gap-2 border-b px-3 py-2 text-left text-xs hover:bg-accent',
                    selected?.id === r.id && 'bg-accent'
                  )}
                >
                  <Badge className={cn(
                    'text-[9px]',
                    r.method === 'GET' && 'bg-blue-500',
                    r.method === 'POST' && 'bg-emerald-500',
                    r.method === 'PUT' && 'bg-amber-500',
                    r.method === 'DELETE' && 'bg-red-500',
                  )}>{r.method}</Badge>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono">/{r.path}</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(r.receivedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge variant={r.status === 'success' ? 'default' : 'destructive'} className="text-[9px]">
                    {r.statusCode}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail view */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Request Detail</CardTitle>
            <CardDescription className="text-xs">
              {selected ? `${selected.method} /webhook/${selected.path}` : 'Select a request to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Webhook className="mx-auto mb-2 h-8 w-8" />
                No request selected
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={
                    selected.method === 'GET' ? 'bg-blue-500' :
                    selected.method === 'POST' ? 'bg-emerald-500' :
                    selected.method === 'PUT' ? 'bg-amber-500' : 'bg-red-500'
                  }>{selected.method}</Badge>
                  <code className="text-sm font-mono">/webhook/{selected.path}</code>
                  <Badge variant={selected.status === 'success' ? 'default' : 'destructive'}>
                    {selected.status === 'success' ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
                    {selected.statusCode}
                  </Badge>
                  <span className="ml-auto text-[10px] text-muted-foreground">{selected.responseTime}ms</span>
                  <Button size="sm" variant="outline" onClick={() => copyCurl(selected)}>
                    <Copy className="mr-1 h-3 w-3" /> cURL
                  </Button>
                </div>

                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Headers</div>
                  <pre className="overflow-x-auto rounded-md bg-zinc-950 p-2 text-[11px] text-zinc-100">
                    {Object.entries(selected.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
                  </pre>
                </div>

                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Body</div>
                  <pre className="overflow-x-auto rounded-md bg-zinc-950 p-2 text-[11px] text-zinc-100">
                    {JSON.stringify(selected.body, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
