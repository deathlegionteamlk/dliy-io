// dliy io - Workflow Execution Engine
// Topologically executes a workflow graph, passing data between nodes.
// For demonstration purposes, runs node handlers from the registry locally
// and emits log events via a callback. In production, this would be replaced
// by a queue-driven worker (BullMQ / Temporal) running inside the `apps/worker` service.

import { getNodeDefinition } from '../nodes/registry';
import { interpolate, buildContext } from '../expression/engine';

// Client-side AI call — hits our server-side /api/ai endpoint which wraps
// z-ai-web-dev-sdk (the SDK itself can only run on the server).
async function callAIAPI(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      ok: false,
      text: `[AI request failed: ${err instanceof Error ? err.message : 'unknown'}]`,
      source: 'simulated',
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  }
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  ts: string;
  level: LogLevel;
  nodeId?: string;
  message: string;
  data?: unknown;
}

export interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'failed' | 'skipped';
  output?: unknown;
  error?: string;
  durationMs: number;
}

export interface ExecutionResult {
  status: 'success' | 'failed' | 'partial';
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  logs: LogEntry[];
  nodeResults: Record<string, NodeExecutionResult>;
}

interface InternalNodeState {
  inputs: Record<string, unknown>[];
  outputs: Record<string, unknown> | null;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  error?: string;
}

// Build a map of nodeId -> incoming edges and nodeId -> outgoing edges
function buildAdjacency(graph: WorkflowGraph) {
  const incoming: Record<string, WorkflowEdge[]> = {};
  const outgoing: Record<string, WorkflowEdge[]> = {};
  for (const node of graph.nodes) {
    incoming[node.id] = [];
    outgoing[node.id] = [];
  }
  for (const edge of graph.edges) {
    if (!outgoing[edge.source]) outgoing[edge.source] = [];
    if (!incoming[edge.target]) incoming[edge.target] = [];
    outgoing[edge.source].push(edge);
    incoming[edge.target].push(edge);
  }
  return { incoming, outgoing };
}

// Find the trigger node (node with no incoming edges and a trigger type)
function findTriggers(graph: WorkflowGraph): WorkflowNode[] {
  const { incoming } = buildAdjacency(graph);
  return graph.nodes.filter(n => incoming[n.id].length === 0);
}

// Topologically process nodes, executing each once all its predecessors are done.
export async function executeWorkflow(
  graph: WorkflowGraph,
  options: {
    onLog?: (entry: LogEntry) => void;
    onNodeStart?: (nodeId: string) => void;
    onNodeFinish?: (result: NodeExecutionResult) => void;
    initialPayload?: Record<string, unknown>;
    signal?: { canceled: boolean };
  } = {},
): Promise<ExecutionResult> {
  const startedAt = Date.now();
  const logs: LogEntry[] = [];
  const nodeResults: Record<string, NodeExecutionResult> = {};
  const state: Record<string, InternalNodeState> = {};

  const log = (entry: Omit<LogEntry, 'ts'>) => {
    const full: LogEntry = { ts: new Date().toISOString(), ...entry };
    logs.push(full);
    options.onLog?.(full);
  };

  log({ level: 'info', message: 'Workflow execution started' });

  // Initialize state for all nodes
  for (const node of graph.nodes) {
    state[node.id] = {
      inputs: [],
      outputs: null,
      status: 'pending',
    };
  }

  const { incoming, outgoing } = buildAdjacency(graph);
  const triggers = findTriggers(graph);

  if (triggers.length === 0) {
    log({ level: 'error', message: 'No trigger node found in workflow' });
    return {
      status: 'failed',
      startedAt: new Date(startedAt).toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      logs,
      nodeResults,
      error: 'No trigger node found',
    } as ExecutionResult;
  }

  // Seed the trigger nodes with initial payload
  for (const trigger of triggers) {
    state[trigger.id].inputs.push(options.initialPayload ?? {});
    log({ level: 'info', nodeId: trigger.id, message: `Trigger node "${trigger.data.label}" primed` });
  }

  // Process queue
  const queue: string[] = [...triggers.map(t => t.id)];
  const processed = new Set<string>();

  while (queue.length > 0) {
    if (options.signal?.canceled) {
      log({ level: 'warn', message: 'Execution canceled by user' });
      break;
    }

    const nodeId = queue.shift()!;
    if (processed.has(nodeId)) continue;

    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) continue;

    const nodeState = state[nodeId];

    // Check if all predecessors are done
    const predecessors = incoming[nodeId];
    const allPredsDone = predecessors.every(e => {
      const s = state[e.source];
      return s.status === 'success' || s.status === 'failed' || s.status === 'skipped';
    });

    if (!allPredsDone) {
      // Requeue — wait for predecessors
      queue.push(nodeId);
      continue;
    }

    // If any predecessor failed and this is not a logic.catch node, skip
    const anyPredFailed = predecessors.some(e => state[e.source].status === 'failed');
    if (anyPredFailed && !node.type.includes('catch')) {
      nodeState.status = 'skipped';
      nodeResults[nodeId] = {
        nodeId,
        status: 'skipped',
        durationMs: 0,
      };
      processed.add(nodeId);
      options.onNodeFinish?.(nodeResults[nodeId]);
      // Propagate skip downstream
      for (const edge of outgoing[nodeId]) {
        if (!processed.has(edge.target)) queue.push(edge.target);
      }
      continue;
    }

    // Run the node
    nodeState.status = 'running';
    options.onNodeStart?.(nodeId);
    const nodeStart = Date.now();
    log({ level: 'info', nodeId, message: `Executing "${node.data.label}" (${node.type})` });

    const def = getNodeDefinition(node.type);
    if (!def) {
      nodeState.status = 'failed';
      nodeState.error = `Unknown node type: ${node.type}`;
      nodeResults[nodeId] = {
        nodeId,
        status: 'failed',
        error: nodeState.error,
        durationMs: Date.now() - nodeStart,
      };
      log({ level: 'error', nodeId, message: nodeState.error });
      options.onNodeFinish?.(nodeResults[nodeId]);
      processed.add(nodeId);
      continue;
    }

    try {
      // Aggregate inputs from all incoming edges
      const aggregated: Record<string, unknown> = {};
      for (const edge of predecessors) {
        const predOutput = state[edge.source].outputs ?? {};
        for (const [k, v] of Object.entries(predOutput)) {
          aggregated[k] = v;
        }
      }
      // Merge in node config (config takes priority for explicit fields)
      const mergedInputs = { ...aggregated, ...node.data.config };

      // Interpolate {{ $json.field }} expressions in the node config
      // against the upstream outputs so nodes receive real resolved values.
      const interpolatedConfig = interpolate(node.data.config, buildContext(aggregated));

      // AI nodes call the real LLM via the /api/ai endpoint
      let output: Record<string, unknown>;
      if (node.type === 'ai.llm') {
        const prompt = String(interpolatedConfig.prompt ?? '');
        log({ level: 'debug', nodeId, message: `LLM prompt: ${prompt.slice(0, 80)}` });
        const result = await callAIAPI({
          op: 'llm',
          prompt,
          model: String(interpolatedConfig.model ?? 'glm-4.6'),
          temperature: Number(interpolatedConfig.temperature ?? 0.7),
          maxTokens: Number(interpolatedConfig.maxTokens ?? 1000),
        });
        output = {
          text: result.text,
          model: result.model,
          usage: result.usage,
          source: result.source,
        };
      } else if (node.type === 'ai.agent') {
        const userInput = aggregated.payload ? JSON.stringify(aggregated.payload) : JSON.stringify(aggregated);
        log({ level: 'debug', nodeId, message: `Agent input: ${userInput.slice(0, 80)}` });
        const toolsArr = Array.isArray(interpolatedConfig.tools)
          ? interpolatedConfig.tools.map(String)
          : (interpolatedConfig.tools ? [String(interpolatedConfig.tools)] : []);
        const result = await callAIAPI({
          op: 'agent',
          userInput,
          model: String(interpolatedConfig.model ?? 'glm-4.6'),
          systemPrompt: String(interpolatedConfig.systemPrompt ?? ''),
          temperature: Number(interpolatedConfig.temperature ?? 0.7),
          tools: toolsArr,
          maxSteps: Number(interpolatedConfig.maxSteps ?? 10),
        });
        output = {
          output: result.text,
          agent: {
            model: interpolatedConfig.model,
            steps: result.steps ?? 1,
            toolsUsed: result.toolsUsed ?? [],
          },
          tokensUsed: result.tokensUsed ?? 0,
          source: result.source,
        };
      } else {
        // Standard node — simulated delay for visual feedback, then handler
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250));
        output = def.run
          ? await def.run(mergedInputs, interpolatedConfig)
          : { executed: true };
      }

      nodeState.outputs = output;
      nodeState.status = 'success';
      nodeResults[nodeId] = {
        nodeId,
        status: 'success',
        output,
        durationMs: Date.now() - nodeStart,
      };
      log({
        level: 'info',
        nodeId,
        message: `Completed in ${nodeResults[nodeId].durationMs}ms`,
        data: output,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      nodeState.status = 'failed';
      nodeState.error = msg;
      nodeResults[nodeId] = {
        nodeId,
        status: 'failed',
        error: msg,
        durationMs: Date.now() - nodeStart,
      };
      log({ level: 'error', nodeId, message: `Failed: ${msg}` });
    }

    options.onNodeFinish?.(nodeResults[nodeId]);
    processed.add(nodeId);

    // Enqueue successors
    for (const edge of outgoing[nodeId]) {
      if (!processed.has(edge.target)) queue.push(edge.target);
    }
  }

  const finishedAt = Date.now();
  const anyFailed = Object.values(nodeResults).some(r => r.status === 'failed');
  const anySuccess = Object.values(nodeResults).some(r => r.status === 'success');
  const overall = anyFailed && anySuccess ? 'partial' : anyFailed ? 'failed' : 'success';

  log({ level: overall === 'success' ? 'info' : 'warn', message: `Workflow ${overall}` });

  return {
    status: overall,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date(finishedAt).toISOString(),
    durationMs: finishedAt - startedAt,
    logs,
    nodeResults,
  };
}

// Validate that the workflow graph is well-formed
export function validateWorkflow(graph: WorkflowGraph): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (graph.nodes.length === 0) {
    errors.push('Workflow has no nodes');
    return { valid: false, errors };
  }

  // Check at least one trigger
  const triggers = findTriggers(graph);
  if (triggers.length === 0) {
    errors.push('Workflow must have at least one trigger node (a node with no incoming connections)');
  }

  // Check all non-trigger nodes have at least one input
  const { incoming } = buildAdjacency(graph);
  for (const node of graph.nodes) {
    if (incoming[node.id].length === 0) continue;
    // OK — has input
  }

  // Check for cycles
  const visited = new Set<string>();
  const inStack = new Set<string>();
  function hasCycle(nodeId: string): boolean {
    if (inStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    inStack.add(nodeId);
    for (const edge of outgoing[nodeId] ?? []) {
      if (hasCycle(edge.target)) return true;
    }
    inStack.delete(nodeId);
    return false;
  }

  const { outgoing } = buildAdjacency(graph);
  for (const node of graph.nodes) {
    if (hasCycle(node.id)) {
      errors.push('Workflow contains a cycle — cycles are not allowed');
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}
