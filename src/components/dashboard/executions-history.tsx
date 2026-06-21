// dliy io - Executions History
// Lists recent executions across all workflows with status and duration.

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, RefreshCw, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

interface Execution {
  id: string;
  workflowId: string;
  status: string;
  trigger: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  duration: number | null;
  error: string | null;
  createdAt: string;
}

export function ExecutionsHistory() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExec = async () => {
    setLoading(true);
    try {
      // Pull from all workflows via the stats endpoint patterns. For the demo we just fetch
      // the most recent executions across the workspace by querying the workflows list.
      const wfRes = await fetch('/api/workflows');
      const wfJson = await wfRes.json();
      const all: Execution[] = [];
      await Promise.all(
        (wfJson.workflows ?? []).map(async (wf: { id: string }) => {
          const res = await fetch(`/api/workflows/${wf.id}/execute`);
          const json = await res.json();
          for (const e of (json.executions ?? [])) all.push(e);
        })
      );
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setExecutions(all.slice(0, 100));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExec(); }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Activity className="h-6 w-6 text-blue-500" /> Execution History
          </h1>
          <p className="text-sm text-muted-foreground">
            View past workflow executions, statuses, and durations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchExec} disabled={loading}>
          <RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Executions</CardTitle>
          <CardDescription className="text-xs">Last 100 runs across all workflows</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : executions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Activity className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No executions yet</p>
              <p className="text-xs text-muted-foreground">Run a workflow to see history here</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-2 border-b px-2 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Workflow ID</div>
                <div className="col-span-2">Trigger</div>
                <div className="col-span-3">Started</div>
                <div className="col-span-2">Duration</div>
                <div className="col-span-2">Error</div>
              </div>
              {executions.map(e => (
                <div key={e.id} className="grid grid-cols-12 items-center gap-2 rounded border border-transparent px-2 py-1.5 text-xs hover:border-border hover:bg-accent">
                  <div className="col-span-1 flex items-center">
                    {e.status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {e.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                    {(e.status === 'running' || e.status === 'pending') && <Loader2 className="h-4 w-4 animate-spin text-amber-500" />}
                  </div>
                  <div className="col-span-2 truncate font-mono text-[10px]">{e.workflowId.slice(-8)}</div>
                  <div className="col-span-2"><Badge variant="outline" className="text-[9px]">{e.trigger ?? 'manual'}</Badge></div>
                  <div className="col-span-3 text-muted-foreground">
                    {e.startedAt ? new Date(e.startedAt).toLocaleString() : '—'}
                  </div>
                  <div className="col-span-2 flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {e.duration ? `${e.duration}ms` : '—'}
                  </div>
                  <div className="col-span-2 truncate text-red-500 text-[10px]" title={e.error ?? ''}>
                    {e.error ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
