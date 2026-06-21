// dliy io - Node registry API
// Returns the full node catalog for the visual editor's palette.

import { NextResponse } from 'next/server';
import { NODE_DEFINITIONS, NODE_CATEGORIES, TOTAL_NODE_COUNT } from '@/lib/nodes/registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Strip the `run` function and React icon component — not serializable
  const nodes = NODE_DEFINITIONS.map(n => ({
    type: n.type,
    name: n.name,
    description: n.description,
    category: n.category,
    color: n.color,
    inputs: n.inputs,
    outputs: n.outputs,
    popular: n.popular,
    tags: n.tags,
    fields: n.fields,
  }));
  return NextResponse.json({
    categories: NODE_CATEGORIES,
    nodes,
    total: TOTAL_NODE_COUNT,
  });
}
