// dliy io - Workflow Execution API
// Persists an execution record and returns the result.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { status, durationMs, logs, error } = body ?? {};

    const workflow = await db.workflow.findUnique({ where: { id } });
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const execution = await db.execution.create({
      data: {
        workflowId: id,
        status: status ?? 'success',
        trigger: 'manual',
        startedAt: new Date(Date.now() - (durationMs ?? 0)),
        finishedAt: new Date(),
        duration: durationMs,
        logs: logs ? JSON.stringify(logs) : null,
        error: error ?? null,
      },
    });

    return NextResponse.json({ execution });
  } catch (err) {
    console.error('Failed to record execution', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const executions = await db.execution.findMany({
      where: { workflowId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ executions });
  } catch (err) {
    console.error('Failed to list executions', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
