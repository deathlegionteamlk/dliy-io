// dliy io - Visual Workflow Editor
// The core canvas built on React Flow. Wires node palette, config panel,
// execution console, and the run button together.

'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore, type DliyNode } from '@/stores/workflow-store';
import { DliyNodeComponent } from './dliy-node';
import { NodePalette } from './node-palette';
import { NodeConfigPanel } from './node-config-panel';
import { ExecutionLogPanel } from './execution-log-panel';
import { executeWorkflow } from '@/lib/workflow/engine';
import { Button } from '@/components/ui/button';
import { Play, Square, Save, Trash, Download, Upload, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { SaveWorkflowDialog } from './save-workflow-dialog';
import { useState } from 'react';

const nodeTypes: NodeTypes = { dliyNode: DliyNodeComponent };

function FlowCanvas() {
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    selectedNodeId, selectNode, isExecuting, setExecuting,
    clearExecution, setNodeExecState, appendLog, setLastExecution,
    loadGraph, clearAll,
  } = useWorkflowStore();

  const cancelRef = useRef<{ canceled: boolean }>({ canceled: false });
  const { screenToFlowPosition } = useReactFlow();
  const [saveOpen, setSaveOpen] = useState(false);

  // Drag-over from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    useWorkflowStore.getState().addNode(type, position);
  }, [screenToFlowPosition]);

  // Seed a starter workflow if empty
  useEffect(() => {
    if (nodes.length === 0) {
      const starter: DliyNode[] = [
        {
          id: 'manual_start',
          type: 'dliyNode',
          position: { x: 80, y: 200 },
          data: { label: 'Manual Trigger', type: 'trigger.manual', config: { payload: { message: 'hello' } } },
        },
        {
          id: 'llm_1',
          type: 'dliyNode',
          position: { x: 400, y: 150 },
          data: {
            label: 'Summarize',
            type: 'ai.llm',
            config: { model: 'glm-4.6', prompt: 'Summarize: {{ $json.payload.message }}', temperature: 0.5, maxTokens: 500 },
          },
        },
        {
          id: 'slack_1',
          type: 'dliyNode',
          position: { x: 720, y: 250 },
          data: {
            label: 'Post to Slack',
            type: 'action.slack',
            config: { operation: 'sendMessage', channel: '#general', text: 'Summary ready!' },
          },
        },
      ];
      const starterEdges: Edge[] = [
        { id: 'e1', source: 'manual_start', target: 'llm_1', animated: true },
        { id: 'e2', source: 'llm_1', target: 'slack_1', animated: true },
      ];
      loadGraph(starter, starterEdges);
    }
  }, [nodes.length, loadGraph]);

  const handleRun = async () => {
    if (isExecuting) {
      cancelRef.current.canceled = true;
      return;
    }
    clearExecution();
    setExecuting(true);
    cancelRef.current = { canceled: false };

    const graph = {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.data.type,
        position: n.position,
        data: { label: n.data.label, config: n.data.config ?? {} },
      })),
      edges,
    };

    const result = await executeWorkflow(graph, {
      signal: cancelRef.current,
      onLog: (entry) => appendLog({ level: entry.level, nodeId: entry.nodeId, message: entry.message, data: entry.data }),
      onNodeStart: (nodeId) => setNodeExecState(nodeId, { status: 'running' }),
      onNodeFinish: (r) => {
        setNodeExecState(r.nodeId, {
          status: r.status,
          durationMs: r.durationMs,
          output: r.output,
          error: r.error,
        });
      },
    });

    setLastExecution({
      status: result.status,
      durationMs: result.durationMs,
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
    });
    setExecuting(false);
  };

  const handleClear = () => {
    if (confirm('Clear the canvas? This cannot be undone.')) {
      clearAll();
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(String(ev.target?.result));
          if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
            loadGraph(parsed.nodes, parsed.edges);
          }
        } catch {
          alert('Invalid workflow file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-card px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRun}
            disabled={false}
            className={cn('h-7 gap-1 text-xs', isExecuting ? 'bg-red-500 hover:bg-red-600' : '')}
          >
            {isExecuting ? <><Square className="h-3 w-3" /> Stop</> : <><Play className="h-3 w-3" /> Test Run</>}
          </Button>
          <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => setSaveOpen(true)}>
            <Save className="h-3 w-3" /> Save
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={handleExport}>
            <Download className="h-3 w-3" /> Export
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={handleImport}>
            <Upload className="h-3 w-3" /> Import
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={handleClear}>
            <Trash className="h-3 w-3" /> Clear
          </Button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Drag from the left palette or click nodes to add · Drag between handles to connect</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Palette */}
          <ResizablePanel defaultSize={18} minSize={14} maxSize={28}>
            <NodePalette />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Canvas */}
          <ResizablePanel defaultSize={57}>
            <div className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={(_, n) => selectNode(n.id)}
                onPaneClick={() => selectNode(null)}
                fitView
                deleteKeyCode={['Backspace', 'Delete']}
                proOptions={{ hideAttribution: true }}
                defaultEdgeOptions={{
                  animated: true,
                  style: { stroke: '#94a3b8', strokeWidth: 2 },
                }}
              >
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
                <Controls className="!bg-card !border !border-border !shadow-md" />
                <MiniMap
                  className="!bg-card !border !border-border"
                  nodeColor={(n: Node) => {
                    const data = (n as DliyNode).data;
                    return '#a855f7';
                  }}
                  maskColor="rgba(0,0,0,0.05)"
                />
              </ReactFlow>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right panel — config or logs */}
          <ResizablePanel defaultSize={25} minSize={18} maxSize={40}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={60} minSize={20}>
                <NodeConfigPanel />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={15}>
                <ExecutionLogPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <SaveWorkflowDialog open={saveOpen} onOpenChange={setSaveOpen} />
    </div>
  );
}

export function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
