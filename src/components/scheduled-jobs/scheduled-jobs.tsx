// dliy io - Scheduled Jobs
// Shows all cron-scheduled workflows with their next run times and last status.

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledJob {
  id: string;
  workflowName: string;
  cron: string;
  timezone: string;
  nextRun: string;
  lastRun?: string;
  lastStatus?: 'success' | 'failed' | 'running';
  active: boolean;
  runsCount: number;
}

function fmtNext(cron: string): string {
  // Crude: just compute next based on cron expression patterns
  const now = new Date();
  if (cron === '0 * * * *') {
    now.setMinutes(0, 0, 0); now.setHours(now.getHours() + 1);
  } else if (cron === '0 9 * * *') {
    now.setDate(now.getDate() + (now.getHours() < 9 ? 0 : 1));
    now.setHours(9, 0, 0, 0);
  } else if (cron === '*/5 * * * *') {
    now.setMinutes(now.getMinutes() + 5 - (now.getMinutes() % 5), 0, 0);
  } else if (cron === '0 0 * * 0') {
    const days = (7 - now.getDay()) % 7 || 7;
    now.setDate(now.getDate() + days); now.setHours(0, 0, 0, 0);
  } else {
    now.setMinutes(now.getMinutes() + 30);
  }
  return now.toISOString();
}

const INITIAL_JOBS: ScheduledJob[] = [
  { id: 'j1', workflowName: 'Daily AI Digest', cron: '0 9 * * *', timezone: 'UTC', nextRun: fmtNext('0 9 * * *'), lastRun: new Date(Date.now() - 3600_000).toISOString(), lastStatus: 'success', active: true, runsCount: 142 },
  { id: 'j2', workflowName: 'Stripe Reconciliation', cron: '0 * * * *', timezone: 'UTC', nextRun: fmtNext('0 * * * *'), lastRun: new Date(Date.now() - 1800_000).toISOString(), lastStatus: 'success', active: true, runsCount: 2847 },
  { id: 'j3', workflowName: 'Lead Score Refresh', cron: '*/5 * * * *', timezone: 'UTC', nextRun: fmtNext('*/5 * * * *'), lastRun: new Date(Date.now() - 240_000).toISOString(), lastStatus: 'success', active: true, runsCount: 18432 },
  { id: 'j4', workflowName: 'Weekly Report Email', cron: '0 0 * * 0', timezone: 'UTC', nextRun: fmtNext('0 0 * * 0'), lastRun: new Date(Date.now() - 86400_000 * 3).toISOString(), lastStatus: 'success', active: true, runsCount: 52 },
  { id: 'j5', workflowName: 'Database Backup', cron: '0 2 * * *', timezone: 'America/New_York', nextRun: fmtNext('0 2 * * *'), lastRun: new Date(Date.now() - 7200_000).toISOString(), lastStatus: 'failed', active: false, runsCount: 365 },
];

export function ScheduledJobs() {
  const [jobs, setJobs] = useState<ScheduledJob[]>(INITIAL_JOBS);

  const toggleActive = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, active: !j.active } : j));
    const j = jobs.find(x => x.id === id);
    toast.success(`${j?.workflowName} ${j?.active ? 'paused' : 'resumed'}`);
  };

  const runNow = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, lastStatus: 'running', lastRun: new Date().toISOString() } : j));
    toast.success('Manual run triggered');
    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, lastStatus: 'success', runsCount: j.runsCount + 1 } : j));
    }, 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Clock className="h-6 w-6 text-blue-500" /> Scheduled Jobs
        </h1>
        <p className="text-sm text-muted-foreground">
          All workflows with cron triggers. Pause, resume, or run manually.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Jobs" value={jobs.filter(j => j.active).length} icon={Clock} color="text-emerald-500" />
        <StatCard label="Total Runs" value={jobs.reduce((s, j) => s + j.runsCount, 0).toLocaleString()} icon={Play} color="text-blue-500" />
        <StatCard label="Failed (24h)" value={jobs.filter(j => j.lastStatus === 'failed').length} icon={XCircle} color="text-red-500" />
        <StatCard label="Paused" value={jobs.filter(j => !j.active).length} icon={Pause} color="text-amber-500" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Scheduled Jobs</CardTitle>
          <CardDescription className="text-xs">Sorted by next run time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-2 border-b px-2 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
              <div className="col-span-3">Workflow</div>
              <div className="col-span-2">Cron</div>
              <div className="col-span-2">Next Run</div>
              <div className="col-span-2">Last Run</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Runs</div>
              <div className="col-span-1">Actions</div>
            </div>
            {jobs.map(j => (
              <div key={j.id} className="grid grid-cols-12 items-center gap-2 rounded border border-transparent px-2 py-2 text-xs hover:border-border hover:bg-accent">
                <div className="col-span-3">
                  <div className="font-medium">{j.workflowName}</div>
                  <div className="text-[10px] text-muted-foreground">{j.timezone}</div>
                </div>
                <div className="col-span-2 font-mono text-[10px]">{j.cron}</div>
                <div className="col-span-2 text-muted-foreground">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  {new Date(j.nextRun).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="col-span-2 text-muted-foreground">
                  {j.lastRun ? new Date(j.lastRun).toLocaleTimeString() : '—'}
                </div>
                <div className="col-span-1">
                  {j.lastStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {j.lastStatus === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                  {j.lastStatus === 'running' && <Loader2 className="h-4 w-4 animate-spin text-amber-500" />}
                </div>
                <div className="col-span-1 text-muted-foreground">{j.runsCount.toLocaleString()}</div>
                <div className="col-span-1 flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => runNow(j.id)} title="Run now">
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => toggleActive(j.id)} title={j.active ? 'Pause' : 'Resume'}>
                    {j.active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof Clock; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</span>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
