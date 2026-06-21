// dliy io - Custom React Flow node renderer.
// Each node shows its icon, label, type, and execution status badge.
// Handles are conditional based on the node definition (triggers have no input handle).

'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { getNodeDefinition } from '@/lib/nodes/registry';
import { useWorkflowStore, type DliyNode } from '@/stores/workflow-store';
import { CheckCircle2, XCircle, Loader2, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

function DliyNodeComponentBase({ id, data, selected }: NodeProps<DliyNode>) {
  const def = getNodeDefinition(data.type);
  const execState = useWorkflowStore(s => s.nodeExecStates[id]);
  const selectNode = useWorkflowStore(s => s.selectNode);

  if (!def) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
        Unknown node type: {data.type}
      </div>
    );
  }

  const Icon = def.icon;
  const hasInput = def.inputs !== 0;
  const hasOutput = def.outputs !== 0;

  const statusStyles: Record<string, string> = {
    idle: 'opacity-0',
    running: 'text-amber-500',
    success: 'text-emerald-500',
    failed: 'text-red-500',
    skipped: 'text-zinc-400',
  };

  return (
    <div
      className={cn(
        'group relative w-56 rounded-xl border bg-card shadow-md transition-all',
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50',
        execState?.status === 'running' && 'ring-2 ring-amber-400/40',
        execState?.status === 'success' && 'ring-1 ring-emerald-500/30',
        execState?.status === 'failed' && 'ring-1 ring-red-500/40',
      )}
      onClick={() => selectNode(id)}
    >
      {/* Input handle */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !rounded-full !border-2 !border-background !bg-zinc-400 hover:!bg-primary"
        />
      )}

      {/* Header */}
      <div
        className="flex items-center gap-2 rounded-t-xl px-3 py-2"
        style={{ backgroundColor: `${def.color}1a`, borderBottom: `1px solid ${def.color}33` }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md text-white shadow-sm"
          style={{ backgroundColor: def.color }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{data.label}</div>
          <div className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">{def.category}</div>
        </div>
        {/* Status icon */}
        <div className={cn('shrink-0', statusStyles[execState?.status ?? 'idle'])}>
          {execState?.status === 'running' && <Loader2 className="h-4 w-4 animate-spin" />}
          {execState?.status === 'success' && <CheckCircle2 className="h-4 w-4" />}
          {execState?.status === 'failed' && <XCircle className="h-4 w-4" />}
          {execState?.status === 'skipped' && <MinusCircle className="h-4 w-4" />}
        </div>
      </div>

      {/* Body — show key config snippet */}
      <div className="px-3 py-2">
        <p className="line-clamp-2 text-[11px] text-muted-foreground">{def.description}</p>
        {Object.keys(data.config ?? {}).length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {Object.entries(data.config).slice(0, 3).map(([k, v]) => (
              <span key={k} className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                {k}: {typeof v === 'object' ? '…' : String(v ?? '').slice(0, 12)}
              </span>
            ))}
          </div>
        )}
        {execState?.durationMs !== undefined && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            {execState.durationMs}ms
          </div>
        )}
      </div>

      {/* Output handles — multiple if def.outputs > 1 */}
      {hasOutput && def.outputs === 1 && (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !rounded-full !border-2 !border-background !bg-primary hover:!bg-primary/80"
        />
      )}
      {hasOutput && def.outputs > 1 && (
        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col gap-1">
          {Array.from({ length: def.outputs }).map((_, i) => (
            <Handle
              key={i}
              id={`out-${i}`}
              type="source"
              position={Position.Right}
              style={{ top: `${(i + 1) * (100 / (def.outputs + 1))}%`, transform: 'translateY(-50%)' }}
              className="!h-3 !w-3 !rounded-full !border-2 !border-background !bg-primary"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const DliyNodeComponent = memo(DliyNodeComponentBase);
