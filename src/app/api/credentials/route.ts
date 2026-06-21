// dliy io - Credentials API
// CRUD for stored credentials. In production, the `data` field would be
// encrypted at rest with envelope encryption (KMS-managed key + AES-GCM data key).

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
    const credentials = await db.credential.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: 'desc' },
    });
    // Mask sensitive data on read
    const masked = credentials.map(c => ({
      ...c,
      data: '[encrypted]',
    }));
    return NextResponse.json({ credentials: masked });
  } catch (err) {
    console.error('Failed to list credentials', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, service, data } = body ?? {};

    if (!name || !type || !service) {
      return NextResponse.json(
        { error: 'name, type, and service are required' },
        { status: 400 },
      );
    }

    let workspace = await db.workspace.findFirst();
    if (!workspace) {
      workspace = await db.workspace.create({
        data: { name: 'Default Workspace', slug: 'default' },
      });
    }

    const credential = await db.credential.create({
      data: {
        name,
        type,
        service,
        data: JSON.stringify(data ?? {}),
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json({
      credential: { ...credential, data: '[encrypted]' },
    }, { status: 201 });
  } catch (err) {
    console.error('Failed to create credential', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
