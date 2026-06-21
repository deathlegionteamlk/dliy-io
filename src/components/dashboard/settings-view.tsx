// dliy io - Settings
// Platform configuration, Docker info, environment variables.

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Container, Database, Globe, Shield, Code2 } from 'lucide-react';

export function SettingsView() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Server className="h-6 w-6 text-zinc-500" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Platform configuration and deployment details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Container className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-base">Docker Deployment</CardTitle>
            </div>
            <CardDescription className="text-xs">Self-host with one command</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              dliy io ships with production-ready Docker images and a docker-compose file
              that brings up the web app, API, worker, webhook gateway, Postgres, and Redis.
            </p>
            <pre className="overflow-x-auto rounded bg-zinc-950 p-2 font-mono text-[10px] text-zinc-100">
{`# Clone and start
git clone https://github.com/death-legion/dliy-io.git
cd dliy-io
cp .env.example .env
docker compose up -d

# Access at http://localhost:3000`}
            </pre>
            <Badge variant="secondary" className="text-[10px]">Image: dliyio/app:latest</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-base">Database</CardTitle>
            </div>
            <CardDescription className="text-xs">Storage configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row label="Provider" value="PostgreSQL 16" />
            <Row label="Host" value="localhost:5432" />
            <Row label="Database" value="dliyio" />
            <Row label="Migrations" value="Prisma" />
            <Row label="Connection pooling" value="PgBouncer" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-base">Webhook Gateway</CardTitle>
            </div>
            <CardDescription className="text-xs">Public endpoints for triggers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row label="Base URL" value="https://your-domain.com/webhook" />
            <Row label="Auth" value="HMAC-SHA256 signature" />
            <Row label="Rate limit" value="100 req/min/IP" />
            <Row label="Retries" value="3 with exponential backoff" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base">Security</CardTitle>
            </div>
            <CardDescription className="text-xs">Encryption and isolation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row label="Credentials at rest" value="AES-256-GCM (envelope)" />
            <Row label="Code sandbox" value="Docker-isolated (gVisor)" />
            <Row label="Audit log" value="Enabled" />
            <Row label="RBAC" value="Workspace / Org / Global" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-pink-500" />
              <CardTitle className="text-base">SDKs & Extensibility</CardTitle>
            </div>
            <CardDescription className="text-xs">Build your own nodes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <p className="text-muted-foreground">
              The <code className="rounded bg-muted px-1">@dliyio/node-sdk</code> package lets you
              define custom nodes in TypeScript with full type safety.
            </p>
            <pre className="overflow-x-auto rounded bg-zinc-950 p-2 font-mono text-[10px] text-zinc-100">
{`import { defineNode } from '@dliyio/node-sdk';

export default defineNode({
  type: 'myapp.send',
  name: 'Send via MyApp',
  category: 'actions',
  inputs: 1,
  outputs: 1,
  fields: [
    { key: 'message', type: 'string', required: true }
  ],
  async run({ inputs, config }) {
    return { ok: true, sent: config.message };
  }
});`}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-zinc-500" />
              <CardTitle className="text-base">System Info</CardTitle>
            </div>
            <CardDescription className="text-xs">Runtime details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row label="Version" value="0.1.0" />
            <Row label="Build" value="dev" />
            <Row label="Node.js" value="20.x" />
            <Row label="License" value="MIT" />
            <Row label="Repository" value="github.com/death-legion/dliy-io" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-[11px]">{value}</span>
    </div>
  );
}
