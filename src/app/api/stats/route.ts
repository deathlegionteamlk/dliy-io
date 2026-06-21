// dliy io - Stats API
// Aggregated dashboard metrics.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [workflows, executions, credentials] = await Promise.all([
      db.workflow.count(),
      db.execution.count(),
      db.credential.count(),
    ]);

    const activeWorkflows = await db.workflow.count({ where: { active: true } });
    const successfulExecs = await db.execution.count({ where: { status: 'success' } });
    const failedExecs = await db.execution.count({ where: { status: 'failed' } });

    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const count = await db.execution.count({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
      });
      last7Days.push({
        date: dayStart.toISOString().slice(0, 10),
        count,
      });
    }

    return NextResponse.json({
      workflows,
      activeWorkflows,
      executions,
      successfulExecs,
      failedExecs,
      credentials,
      successRate: executions > 0 ? Math.round((successfulExecs / executions) * 100) : 100,
      last7Days,
    });
  } catch (err) {
    console.error('Failed to fetch stats', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
