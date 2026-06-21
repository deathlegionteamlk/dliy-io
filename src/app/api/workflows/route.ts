// dliy io - Workflow API
// CRUD endpoints for workflows. Each workflow stores the React Flow graph
// (nodes + edges) as serialized JSON so the editor can fully restore state.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let workspace = await db.workspace.findFirst();
    if (!workspace) {
      workspace = await db.workspace.create({
        data: { name: 'Default Workspace', slug: 'default' },
      });
    }

    const workflows = await db.workflow.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { executions: true } } },
    });

    return NextResponse.json({ workflows, workspace });
  } catch (err) {
    console.error('Failed to list workflows', err);
    return NextResponse.json(
      { error: 'Failed to list workflows' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, graph, tags } = body ?? {};

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let workspace = await db.workspace.findFirst();
    if (!workspace) {
      workspace = await db.workspace.create({
        data: { name: 'Default Workspace', slug: 'default' },
      });
    }

    const workflow = await db.workflow.create({
      data: {
        name,
        description: description ?? null,
        graph: typeof graph === 'string' ? graph : JSON.stringify(graph ?? { nodes: [], edges: [] }),
        tags: tags ?? null,
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (err) {
    console.error('Failed to create workflow', err);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 },
    );
  }
}
