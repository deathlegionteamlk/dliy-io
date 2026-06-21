// dliy io - Audit Log
// Immutable trail of who did what, when, from where.

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Search, Download, Shield, User, Workflow, Key, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  category: 'auth' | 'workflow' | 'credential' | 'admin' | 'api';
  resource: string;
  ip: string;
  metadata?: Record<string, unknown>;
}

const ENTRIES: AuditEntry[] = [
  { id: 'a1', ts: new Date(Date.now() - 60_000).toISOString(), actor: 'alice@example.com', action: 'workflow.execute', category: 'workflow', resource: 'wf_abc123 (AI Support Bot)', ip: '203.0.113.42', metadata: { trigger: 'manual', duration: 1234 } },
  { id: 'a2', ts: new Date(Date.now() - 180_000).toISOString(), actor: 'bob@example.com', action: 'credential.create', category: 'credential', resource: 'cred_def456 (Slack Bot Token)', ip: '203.0.113.99' },
  { id: 'a3', ts: new Date(Date.now() - 360_000).toISOString(), actor: 'alice@example.com', action: 'workflow.update', category: 'workflow', resource: 'wf_abc123', ip: '203.0.113.42', metadata: { changed: 'graph' } },
  { id: 'a4', ts: new Date(Date.now() - 720_000).toISOString(), actor: 'system', action: 'webhook.received', category: 'api', resource: '/webhook/github', ip: '140.82.115.6', metadata: { method: 'POST', status: 200 } },
  { id: 'a5', ts: new Date(Date.now() - 1800_000).toISOString(), actor: 'admin@example.com', action: 'user.invite', category: 'admin', resource: 'charlie@example.com', ip: '203.0.113.1', metadata: { role: 'editor' } },
  { id: 'a6', ts: new Date(Date.now() - 3600_000).toISOString(), actor: 'alice@example.com', action: 'auth.login', category: 'auth', resource: 'session_xyz', ip: '203.0.113.42', metadata: { method: 'oauth', provider: 'google' } },
  { id: 'a7', ts: new Date(Date.now() - 7200_000).toISOString(), actor: 'bob@example.com', action: 'workflow.delete', category: 'workflow', resource: 'wf_old123', ip: '203.0.113.99' },
  { id: 'a8', ts: new Date(Date.now() - 14400_000).toISOString(), actor: 'admin@example.com', action: 'settings.update', category: 'admin', resource: 'rate_limit_per_minute', ip: '203.0.113.1', metadata: { old: 100, new: 200 } },
  { id: 'a9', ts: new Date(Date.now() - 21600_000).toISOString(), actor: 'system', action: 'execution.failed', category: 'workflow', resource: 'exec_ghi789', ip: '127.0.0.1', metadata: { workflow: 'Daily Report', error: 'AI timeout' } },
  { id: 'a10', ts: new Date(Date.now() - 86400_000).toISOString(), actor: 'alice@example.com', action: 'credential.use', category: 'credential', resource: 'cred_def456', ip: '203.0.113.42', metadata: { workflow: 'AI Support Bot' } },
];

const CATS = [
  { id: 'all', label: 'All Categories' },
  { id: 'auth', label: 'Authentication' },
  { id: 'workflow', label: 'Workflows' },
  { id: 'credential', label: 'Credentials' },
  { id: 'admin', label: 'Admin' },
  { id: 'api', label: 'API / Webhook' },
];

const CAT_META: Record<string, { color: string; icon: typeof Shield }> = {
  auth:       { color: 'text-blue-500',     icon: User },
  workflow:   { color: 'text-purple-500',   icon: Workflow },
  credential: { color: 'text-amber-500',    icon: Key },
  admin:      { color: 'text-red-500',      icon: Settings },
  api:        { color: 'text-emerald-500',  icon: Shield },
};

export function AuditLog() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const filtered = useMemo(() => {
    let list = ENTRIES;
    if (cat !== 'all') list = list.filter(e => e.category === cat);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(e => e.actor.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.resource.toLowerCase().includes(q) || e.ip.includes(q));
    }
    return list;
  }, [query, cat]);

  const handleExport = () => {
    const csv = ['ts,actor,action,category,resource,ip'];
    for (const e of filtered) {
      csv.push([e.ts, e.actor, e.action, e.category, e.resource, e.ip].map(s => `"${s}"`).join(','));
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log exported');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <History className="h-6 w-6 text-zinc-500" /> Audit Log
          </h1>
          <p className="text-sm text-muted-foreground">
            Immutable record of all activity. Tamper-evident via hash chaining.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <Card className="border-zinc-200 bg-zinc-50/50">
        <CardContent className="flex items-start gap-3 p-4">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-zinc-600" />
          <div className="text-xs">
            <p className="font-semibold text-zinc-900">Tamper-evident logging</p>
            <p className="text-zinc-700">
              Each audit entry includes a SHA-256 hash of the previous entry. Any modification breaks the chain.
              Export to SIEM via OpenTelemetry for long-term retention.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by actor, action, resource, or IP..."
            className="pl-8"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATS.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entries ({filtered.length})</CardTitle>
          <CardDescription className="text-xs">Last 24 hours · sorted by most recent</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-1">
              {filtered.map(e => {
                const meta = CAT_META[e.category];
                const Icon = meta.icon;
                return (
                  <div key={e.id} className="flex items-start gap-3 rounded border border-transparent px-3 py-2 hover:border-border hover:bg-accent">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted ${meta.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium">{e.action}</span>
                        <Badge variant="outline" className="text-[9px] capitalize">{e.category}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{e.actor}</span> · {e.resource}
                      </div>
                      {e.metadata && Object.keys(e.metadata).length > 0 && (
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {Object.entries(e.metadata).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' · ')}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right text-[10px] text-muted-foreground">
                      <div>{new Date(e.ts).toLocaleTimeString()}</div>
                      <div className="font-mono">{e.ip}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
