// dliy io - Workflow by ID API
// GET, PUT, DELETE a single workflow by ID.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const workflow = await db.workflow.findUnique({
      where: { id },
      include: {
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!workflow) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ workflow });
  } catch (err) {
    console.error('Failed to fetch workflow', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, graph, tags, active } = body ?? {};

    const data: Record<string, unknown> = {};
    if (typeof name === 'string') data.name = name;
    if (description !== undefined) data.description = description;
    if (graph !== undefined) {
      data.graph = typeof graph === 'string' ? graph : JSON.stringify(graph);
    }
    if (tags !== undefined) data.tags = tags;
    if (typeof active === 'boolean') data.active = active;

    const workflow = await db.workflow.update({ where: { id }, data });
    return NextResponse.json({ workflow });
  } catch (err) {
    console.error('Failed to update workflow', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db.workflow.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete workflow', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
