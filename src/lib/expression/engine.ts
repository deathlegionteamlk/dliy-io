// dliy io - Expression Engine
// Resolves {{ ... }} template expressions in strings against the current
// execution context. Supports:
//   {{ $json.field }}        — upstream node JSON output
//   {{ $json.field.nested }} — dotted paths
//   {{ $items[0].name }}     — array indexing
//   {{ $now }}               — current ISO timestamp
//   {{ $workflow.id }}       — current workflow ID
//   {{ $env.NAME }}          — environment variable (whitelisted)
//   {{ 1 + 1 }}              — simple arithmetic
//   {{ $json.value > 100 }}  — comparison (returns boolean)

import safeStableStringify from 'safe-stable-stringify';

export interface ExpressionContext {
  $json?: unknown;        // upstream node's output
  $items?: unknown[];     // array form of upstream
  $now?: string;
  $workflow?: { id?: string; name?: string };
  $env?: Record<string, string | undefined>;
  $node?: Record<string, unknown>;  // outputs by node id
  [key: string]: unknown;
}

const EXPR_RE = /\{\{\s*([^}]+?)\s*\}\}/g;

export function interpolate(input: unknown, ctx: ExpressionContext): unknown {
  if (typeof input === 'string') {
    return interpolateString(input, ctx);
  }
  if (Array.isArray(input)) {
    return input.map(v => interpolate(v, ctx));
  }
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      out[k] = interpolate(v, ctx);
    }
    return out;
  }
  return input;
}

function interpolateString(s: string, ctx: ExpressionContext): unknown {
  // If the entire string is a single expression, return the raw value
  // (preserves type — numbers, booleans, objects).
  const singleMatch = /^\{\{\s*([^}]+?)\s*\}\}$/.exec(s);
  if (singleMatch) {
    return resolveExpression(singleMatch[1].trim(), ctx);
  }
  // Otherwise, replace each occurrence with its stringified value
  return s.replace(EXPR_RE, (full, expr: string) => {
    const v = resolveExpression(expr.trim(), ctx);
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') {
      try { return JSON.stringify(v); } catch { return safeStableStringify(v) ?? ''; }
    }
    return String(v);
  });
}

function resolveExpression(expr: string, ctx: ExpressionContext): unknown {
  // Arithmetic: only digits, operators, spaces, and a single dot
  if (/^[\d\s+\-*/.()]+$/.test(expr)) {
    try {
      const fn = new Function(`return (${expr})`);
      const result = fn();
      return result;
    } catch {
      return undefined;
    }
  }
  // Comparison: $json.value > 100  etc.
  const cmpMatch = /^(\S+)\s*(>=|<=|==|!=|>|<)\s*(\S+)$/.exec(expr);
  if (cmpMatch) {
    const left = resolveExpression(cmpMatch[1], ctx);
    const right = resolveExpression(cmpMatch[3], ctx);
    const op = cmpMatch[2];
    switch (op) {
      case '>':  return Number(left) > Number(right);
      case '<':  return Number(left) < Number(right);
      case '>=': return Number(left) >= Number(right);
      case '<=': return Number(left) <= Number(right);
      case '==': return left === right;
      case '!=': return left !== right;
    }
  }
  // Path access: $json.foo.bar, $items[0].name
  return resolvePath(expr, ctx);
}

function resolvePath(path: string, ctx: ExpressionContext): unknown {
  // Tokenize: split on . and [N]
  const tokens: string[] = [];
  const re = /([^.\[\]]+)|\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(path)) !== null) {
    if (m[1] !== undefined) tokens.push(m[1]);
    else if (m[2] !== undefined) tokens.push(m[2]);
  }
  if (tokens.length === 0) return undefined;

  let cur: unknown = ctx;
  for (const tok of tokens) {
    if (cur === null || cur === undefined) return undefined;
    if (/^\d+$/.test(tok)) {
      cur = (cur as unknown[])[Number(tok)];
    } else {
      cur = (cur as Record<string, unknown>)[tok];
    }
  }
  return cur;
}

// Convenience: build a context from the aggregated inputs of a node
export function buildContext(inputs: Record<string, unknown>): ExpressionContext {
  return {
    $json: inputs,
    $items: Array.isArray(inputs) ? inputs : [inputs],
    $now: new Date().toISOString(),
    $env: {},
    ...inputs,
  };
}
