// dliy io - Dashboard
// Landing view: shows KPIs, recent workflows, and quick actions.

'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Workflow, Activity, CheckCircle2, AlertTriangle, KeyRound, Plus,
  Zap, TrendingUp, Cpu, Clock, ArrowRight, Sparkles, Bot, Code2, Github
} from 'lucide-react';
import { TOTAL_NODE_COUNT } from '@/lib/nodes/registry';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface Stats {
  workflows: number;
  activeWorkflows: number;
  executions: number;
  successfulExecs: number;
  failedExecs: number;
  credentials: number;
  successRate: number;
  last7Days: { date: string; count: number }[];
}

interface WorkflowListItem {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  updatedAt: string;
  _count?: { executions: number };
}

export function Dashboard() {
  const { setView, editWorkflow } = useUIStore();
  const { loadGraph, clearAll } = useWorkflowStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, wfRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/workflows'),
      ]);
      const statsJson = await statsRes.json();
      const wfJson = await wfRes.json();
      setStats(statsJson);
      setWorkflows(wfJson.workflows ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleNew = () => {
    clearAll();
    editWorkflow(null);
  };

  const handleOpen = async (wf: WorkflowListItem) => {
    try {
      const res = await fetch(`/api/workflows/${wf.id}`);
      const json = await res.json();
      const graph = JSON.parse(json.workflow.graph || '{}');
      loadGraph(graph.nodes ?? [], graph.edges ?? []);
      editWorkflow(wf.id);
    } catch (err) {
      console.error('Failed to load workflow', err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Zap className="h-5 w-5 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">dliy io</h1>
                <p className="text-xs text-zinc-400">by Death Legion Team</p>
              </div>
            </div>
            <h2 className="mb-1 text-xl font-semibold">Automate anything. Connect everything.</h2>
            <p className="max-w-xl text-sm text-zinc-300">
              The open-source, self-hostable workflow automation platform. Build AI-powered
              workflows visually with {TOTAL_NODE_COUNT}+ pre-built integrations, custom code, and AI agents.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleNew} className="bg-white text-zinc-900 hover:bg-zinc-100">
              <Plus className="mr-1 h-4 w-4" /> New Workflow
            </Button>
            <Button variant="outline" onClick={() => setView('templates')} className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white">
              <Sparkles className="mr-1 h-4 w-4" /> Browse Templates
            </Button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Workflows"
          value={stats?.workflows ?? 0}
          subtitle={`${stats?.activeWorkflows ?? 0} active`}
          icon={Workflow}
          color="text-purple-500"
          loading={loading}
        />
        <StatCard
          title="Executions"
          value={stats?.executions ?? 0}
          subtitle="all time"
          icon={Activity}
          color="text-blue-500"
          loading={loading}
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.successRate ?? 100}%`}
          subtitle={`${stats?.successfulExecs ?? 0} ok · ${stats?.failedExecs ?? 0} failed`}
          icon={CheckCircle2}
          color="text-emerald-500"
          loading={loading}
        />
        <StatCard
          title="Credentials"
          value={stats?.credentials ?? 0}
          subtitle="stored securely"
          icon={KeyRound}
          color="text-amber-500"
          loading={loading}
        />
      </div>

      {/* Chart + Quick Start */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Execution Activity</CardTitle>
              <CardDescription className="text-xs">Last 7 days</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[200px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.last7Days ?? []}>
                  <defs>
                    <linearGradient id="execGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    labelStyle={{ fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} fill="url(#execGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Capabilities</CardTitle>
            <CardDescription className="text-xs">What ships out of the box</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <CapabilityRow icon={Workflow} text={`${TOTAL_NODE_COUNT}+ pre-built nodes`} color="text-purple-500" />
            <CapabilityRow icon={Bot} text="AI agents & RAG" color="text-pink-500" />
            <CapabilityRow icon={Code2} text="JavaScript & Python code" color="text-amber-500" />
            <CapabilityRow icon={Cpu} text="Sandboxed execution" color="text-blue-500" />
            <CapabilityRow icon={Github} text="100% open source, self-hostable" color="text-emerald-500" />
          </CardContent>
        </Card>
      </div>

      {/* Recent workflows */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Workflows</CardTitle>
            <CardDescription className="text-xs">Click to open in the visual editor</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setView('editor')}>
            Open Editor <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : workflows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Workflow className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No workflows yet</p>
              <p className="mb-3 text-xs text-muted-foreground">Get started by creating your first automation</p>
              <Button size="sm" onClick={handleNew}>
                <Plus className="mr-1 h-4 w-4" /> Create Workflow
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {workflows.map(wf => (
                <button
                  key={wf.id}
                  onClick={() => handleOpen(wf)}
                  className="group flex w-full items-center gap-3 rounded-lg border border-transparent p-2 text-left hover:border-border hover:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <Workflow className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{wf.name}</span>
                      {wf.active && <Badge variant="secondary" className="h-4 text-[9px] bg-emerald-100 text-emerald-700">Active</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {wf.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {wf._count?.executions ?? 0}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(wf.updatedAt).toLocaleDateString()}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title, value, subtitle, icon: Icon, color, loading,
}: {
  title: string; value: number | string; subtitle: string;
  icon: typeof Workflow; color: string; loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function CapabilityRow({ icon: Icon, text, color }: { icon: typeof Workflow; text: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className="text-foreground/80">{text}</span>
    </div>
  );
}
