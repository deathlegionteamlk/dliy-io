// dliy io - Execution Timeline (Gantt-style)
// Shows the temporal layout of node executions within the last run.

'use client';

import { useWorkflowStore } from '@/stores/workflow-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExecutionTimeline() {
  const { nodeExecStates, nodes, lastExecution, executionLogs } = useWorkflowStore();

  // Reconstruct per-node start/finish from the logs (approximate via state changes).
  // For a richer view, we'd persist execution logs in the DB and query them here.
  const executedNodes = nodes
    .map(n => ({
      node: n,
      state: nodeExecStates[n.id],
    }))
    .filter(x => x.state && x.state.status !== 'idle');

  if (executedNodes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          <Clock className="mx-auto mb-2 h-8 w-8" />
          No execution data yet. Run a workflow to see the timeline.
        </CardContent>
      </Card>
    );
  }

  const totalDuration = lastExecution?.durationMs ?? executedNodes.reduce((sum, n) => sum + (n.state?.durationMs ?? 0), 0);
  const maxBarWidth = 100; // percentage

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-blue-500" /> Execution Timeline
            </CardTitle>
            <CardDescription className="text-xs">
              Per-node timing — total: {totalDuration}ms · {executionLogs.length} log entries
            </CardDescription>
          </div>
          {lastExecution && (
            <Badge variant="outline" className={cn(
              'uppercase',
              lastExecution.status === 'success' && 'border-emerald-500/50 text-emerald-600',
              lastExecution.status === 'failed' && 'border-red-500/50 text-red-600',
              lastExecution.status === 'partial' && 'border-amber-500/50 text-amber-600',
            )}>
              {lastExecution.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {executedNodes.map(({ node, state }) => {
            const width = totalDuration > 0 ? Math.max(2, ((state?.durationMs ?? 0) / totalDuration) * maxBarWidth) : 100;
            const colorClass =
              state?.status === 'success' ? 'bg-emerald-500' :
              state?.status === 'failed' ? 'bg-red-500' :
              state?.status === 'skipped' ? 'bg-zinc-300' :
              'bg-amber-500';

            return (
              <div key={node.id} className="flex items-center gap-2">
                <div className="w-32 shrink-0 truncate text-xs font-medium" title={node.data.label}>
                  {node.data.label}
                </div>
                <div className="relative flex-1">
                  <div className="h-6 rounded bg-muted/40" />
                  <div
                    className={cn('absolute left-0 top-0 h-6 rounded', colorClass, 'opacity-80')}
                    style={{ width: `${width}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] text-white mix-blend-difference">
                    <span className="flex items-center gap-1">
                      {state?.status === 'success' && <CheckCircle2 className="h-2.5 w-2.5" />}
                      {state?.status === 'failed' && <XCircle className="h-2.5 w-2.5" />}
                      {state?.status === 'skipped' && <MinusCircle className="h-2.5 w-2.5" />}
                      <span className="uppercase">{state?.status}</span>
                    </span>
                    <span>{state?.durationMs}ms</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {executionLogs.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <div className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
              Recent Log Entries
            </div>
            <div className="max-h-32 overflow-y-auto space-y-0.5 font-mono text-[10px]">
              {executionLogs.slice(-15).map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-muted-foreground/60">{log.ts.slice(11, 19)}</span>
                  <span className={cn(
                    'uppercase',
                    log.level === 'error' && 'text-red-500',
                    log.level === 'warn' && 'text-amber-500',
                    log.level === 'info' && 'text-blue-500',
                    log.level === 'debug' && 'text-zinc-400',
                  )}>{log.level}</span>
                  <span className="flex-1 text-foreground/80">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
