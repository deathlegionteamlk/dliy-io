// dliy io - Workflow Editor Store
// Zustand store that holds the in-memory workflow graph being edited.
// Mirrors the React Flow state but adds node-selection, config-editing,
// execution-status tracking, and persistence hooks.

'use client';

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Edge, Node, Connection, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { getNodeDefinition } from '@/lib/nodes/registry';

export interface DliyNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  config: Record<string, unknown>;
  description?: string;
}

export type DliyNode = Node<DliyNodeData>;

export interface NodeExecState {
  status: 'idle' | 'running' | 'success' | 'failed' | 'skipped';
  durationMs?: number;
  output?: unknown;
  error?: string;
}

interface WorkflowState {
  nodes: DliyNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  isExecuting: boolean;
  nodeExecStates: Record<string, NodeExecState>;
  executionLogs: Array<{ ts: string; level: string; nodeId?: string; message: string; data?: unknown }>;
  lastExecution?: {
    status: string;
    durationMs: number;
    startedAt: string;
    finishedAt: string;
  };

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  clearExecution: () => void;
  setNodeExecState: (nodeId: string, state: NodeExecState) => void;
  setExecuting: (v: boolean) => void;
  appendLog: (entry: { level: string; nodeId?: string; message: string; data?: unknown }) => void;
  setLastExecution: (e: WorkflowState['lastExecution']) => void;
  loadGraph: (nodes: DliyNode[], edges: Edge[]) => void;
  clearAll: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isExecuting: false,
  nodeExecStates: {},
  executionLogs: [],
  lastExecution: undefined,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as DliyNode[] });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection: Connection) => {
    set({ edges: addEdge({ ...connection, animated: true }, get().edges) });
  },

  addNode: (type, position) => {
    const def = getNodeDefinition(type);
    if (!def) return;
    const id = `${type.split('.').pop()}_${nanoid(6)}`;
    // Build default config from field defaults
    const config: Record<string, unknown> = {};
    for (const field of def.fields) {
      if (field.default !== undefined) config[field.key] = field.default;
    }
    const newNode: DliyNode = {
      id,
      type: 'dliyNode',
      position,
      data: {
        label: def.name,
        type: def.type,
        config,
        description: def.description,
      },
    };
    set({ nodes: [...get().nodes, newNode], selectedNodeId: id });
  },

  updateNodeConfig: (nodeId, config) => {
    set({
      nodes: get().nodes.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } }
          : n
      ),
    });
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  duplicateNode: (nodeId) => {
    const original = get().nodes.find(n => n.id === nodeId);
    if (!original) return;
    const def = getNodeDefinition(original.data.type);
    const newId = `${original.data.type.split('.').pop()}_${nanoid(6)}`;
    const newNode: DliyNode = {
      id: newId,
      type: 'dliyNode',
      position: { x: original.position.x + 60, y: original.position.y + 60 },
      data: {
        ...original.data,
        label: `${original.data.label} copy`,
      },
    };
    set({ nodes: [...get().nodes, newNode], selectedNodeId: newId });
    void def; // suppress unused
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  clearExecution: () => set({ nodeExecStates: {}, executionLogs: [], lastExecution: undefined }),

  setNodeExecState: (nodeId, state) => {
    const prev = get().nodeExecStates;
    set({ nodeExecStates: { ...prev, [nodeId]: state } });
  },

  setExecuting: (v) => set({ isExecuting: v }),

  appendLog: (entry) => {
    set({
      executionLogs: [
        ...get().executionLogs,
        { ...entry, ts: new Date().toISOString() },
      ],
    });
  },

  setLastExecution: (e) => set({ lastExecution: e }),

  loadGraph: (nodes, edges) => set({ nodes, edges, selectedNodeId: null, nodeExecStates: {}, executionLogs: [] }),

  clearAll: () => set({ nodes: [], edges: [], selectedNodeId: null, nodeExecStates: {}, executionLogs: [], lastExecution: undefined }),
}));
