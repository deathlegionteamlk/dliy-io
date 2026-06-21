// dliy io - Execution Log Panel
// Shows real-time execution logs, per-node status, and the final result summary.

'use client';

import { useWorkflowStore } from '@/stores/workflow-store';
import { getNodeDefinition } from '@/lib/nodes/registry';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal, CheckCircle2, XCircle, Loader2, MinusCircle, Info, AlertTriangle, AlertCircle, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

const levelIcons: Record<string, typeof Info> = {
  debug: Bug,
  info: Info,
  warn: AlertTriangle,
  error: AlertCircle,
};

const levelColors: Record<string, string> = {
  debug: 'text-zinc-400',
  info: 'text-blue-500',
  warn: 'text-amber-500',
  error: 'text-red-500',
};

export function ExecutionLogPanel() {
  const { executionLogs, nodeExecStates, nodes, lastExecution } = useWorkflowStore();

  const totalNodes = nodes.length;
  const completed = Object.values(nodeExecStates).filter(s => s.status === 'success').length;
  const failed = Object.values(nodeExecStates).filter(s => s.status === 'failed').length;
  const skipped = Object.values(nodeExecStates).filter(s => s.status === 'skipped').length;
  const running = Object.values(nodeExecStates).filter(s => s.status === 'running').length;

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 p-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">Execution Console</span>
          </div>
          {lastExecution && (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] uppercase',
                lastExecution.status === 'success' && 'border-emerald-500/50 text-emerald-400',
                lastExecution.status === 'failed' && 'border-red-500/50 text-red-400',
                lastExecution.status === 'partial' && 'border-amber-500/50 text-amber-400',
              )}
            >
              {lastExecution.status} · {lastExecution.durationMs}ms
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-zinc-400">Nodes: {totalNodes}</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="h-2.5 w-2.5" /> {completed}
          </span>
          {failed > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <XCircle className="h-2.5 w-2.5" /> {failed}
            </span>
          )}
          {skipped > 0 && (
            <span className="flex items-center gap-1 text-zinc-400">
              <MinusCircle className="h-2.5 w-2.5" /> {skipped}
            </span>
          )}
          {running > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <Loader2 className="h-2.5 w-2.5 animate-spin" /> {running}
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 font-mono text-[11px]">
          {executionLogs.length === 0 && (
            <div className="px-2 py-8 text-center text-zinc-500">
              No logs yet. Click "Test Run" to execute the workflow.
            </div>
          )}
          {executionLogs.map((log, i) => {
            const Icon = levelIcons[log.level] ?? Info;
            const def = log.nodeId ? nodes.find(n => n.id === log.nodeId) : null;
            const defType = def?.data?.type;
            const nodeDef = defType ? getNodeDefinition(defType) : null;
            return (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2 border-b border-zinc-900 px-1 py-1',
                  log.level === 'error' && 'bg-red-950/20',
                )}
              >
                <span className="shrink-0 text-zinc-600">{log.ts.slice(11, 19)}</span>
                <Icon className={cn('mt-0.5 h-3 w-3 shrink-0', levelColors[log.level])} />
                <div className="min-w-0 flex-1">
                  {nodeDef && (
                    <span className="mr-1 text-zinc-500">[{nodeDef.name}]</span>
                  )}
                  <span className="text-zinc-200">{log.message}</span>
                  {log.data !== undefined && (
                    <pre className="mt-1 overflow-x-auto rounded bg-zinc-900 p-1 text-[10px] text-zinc-400">
                      {JSON.stringify(log.data, null, 2).slice(0, 500)}
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
