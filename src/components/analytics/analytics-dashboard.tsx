// dliy io - Analytics Dashboard
// Per-workflow metrics, success rates, latency distributions, token usage.

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, Zap, DollarSign, Activity, Cpu } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

const execByWorkflow = [
  { name: 'AI Support Bot', executions: 1242, failures: 23 },
  { name: 'Daily Digest', executions: 365, failures: 2 },
  { name: 'Lead Scoring', executions: 8921, failures: 145 },
  { name: 'Stripe Receipt', executions: 542, failures: 0 },
  { name: 'GitHub PR Notify', executions: 234, failures: 5 },
];

const latencyData = [
  { hour: '00:00', p50: 120, p95: 340, p99: 580 },
  { hour: '04:00', p50: 110, p95: 320, p99: 540 },
  { hour: '08:00', p50: 145, p95: 420, p99: 720 },
  { hour: '12:00', p50: 180, p95: 510, p99: 920 },
  { hour: '16:00', p50: 165, p95: 470, p99: 840 },
  { hour: '20:00', p50: 130, p95: 380, p99: 640 },
];

const tokenUsage = [
  { name: 'GLM-4.6', value: 1240000, color: '#a855f7' },
  { name: 'GPT-4o', value: 580000, color: '#10b981' },
  { name: 'Claude 3.5', value: 320000, color: '#f59e0b' },
  { name: 'GLM-4-Flash', value: 890000, color: '#ec4899' },
];

const volumeTrend = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  executions: 80 + Math.floor(Math.random() * 120),
  aiCalls: 40 + Math.floor(Math.random() * 80),
}));

export function AnalyticsDashboard() {
  const totalExecs = execByWorkflow.reduce((s, w) => s + w.executions, 0);
  const totalFails = execByWorkflow.reduce((s, w) => s + w.failures, 0);
  const successRate = Math.round(((totalExecs - totalFails) / totalExecs) * 100);
  const totalTokens = tokenUsage.reduce((s, t) => s + t.value, 0);
  const estimatedCost = (totalTokens / 1_000_000) * 1.5; // rough blended cost per 1M tokens

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BarChart3 className="h-6 w-6 text-purple-500" /> Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Execution metrics, latency, AI token usage, and cost across all workflows.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Total Executions" value={totalExecs.toLocaleString()} subtitle="last 30 days" icon={Activity} color="text-blue-500" />
        <KpiCard label="Success Rate" value={`${successRate}%`} subtitle={`${totalFails} failures`} icon={TrendingUp} color="text-emerald-500" />
        <KpiCard label="Tokens Used" value={`${(totalTokens / 1000).toFixed(0)}K`} subtitle="across all models" icon={Cpu} color="text-purple-500" />
        <KpiCard label="Est. AI Cost" value={`$${estimatedCost.toFixed(2)}`} subtitle="blended rate" icon={DollarSign} color="text-amber-500" />
      </div>

      {/* Volume trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execution & AI Call Volume</CardTitle>
          <CardDescription className="text-xs">Last 14 days</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeTrend}>
              <defs>
                <linearGradient id="execGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="executions" stroke="#3b82f6" strokeWidth={2} fill="url(#execGrad2)" />
              <Area type="monotone" dataKey="aiCalls" stroke="#a855f7" strokeWidth={2} fill="url(#aiGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Per-workflow bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Executions by Workflow</CardTitle>
            <CardDescription className="text-xs">Success vs failure count</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={execByWorkflow} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="executions" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="failures" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Token usage pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Token Usage by Model</CardTitle>
            <CardDescription className="text-xs">{(totalTokens / 1000).toFixed(0)}K tokens total</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tokenUsage}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={90}
                  label={(e) => e.name}
                  labelLine={false}
                >
                  {tokenUsage.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => v.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Latency chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-amber-500" /> Execution Latency (percentiles)
          </CardTitle>
          <CardDescription className="text-xs">p50 / p95 / p99 over 24h</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="ms" />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-amber-500" /> Cost Breakdown by Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-2 border-b px-2 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
              <div>Model</div>
              <div>Tokens</div>
              <div>Rate / 1M</div>
              <div>Cost</div>
            </div>
            {tokenUsage.map(t => {
              const rate = t.name === 'GPT-4o' ? 5 : t.name === 'Claude 3.5' ? 3 : t.name === 'GLM-4-Flash' ? 0.2 : 1;
              const cost = (t.value / 1_000_000) * rate;
              return (
                <div key={t.name} className="grid grid-cols-4 items-center gap-2 px-2 py-2 text-xs hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-medium">{t.name}</span>
                  </div>
                  <div className="text-muted-foreground">{t.value.toLocaleString()}</div>
                  <div className="text-muted-foreground">${rate.toFixed(2)}</div>
                  <div className="font-mono">${cost.toFixed(2)}</div>
                </div>
              );
            })}
            <div className="grid grid-cols-4 gap-2 border-t px-2 py-2 text-xs font-semibold">
              <div>Total</div>
              <div className="text-muted-foreground">{totalTokens.toLocaleString()}</div>
              <div></div>
              <div className="font-mono">${estimatedCost.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, subtitle, icon: Icon, color }: { label: string; value: string; subtitle: string; icon: typeof Activity; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</span>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-[10px] text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
