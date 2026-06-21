// dliy io - Command Palette (Cmd+K / Ctrl+K)
// Global search + quick actions overlay.

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore, type ViewId } from '@/stores/ui-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  LayoutDashboard, Workflow, KeyRound, Sparkles, Activity, Boxes, Settings,
  Play, Save, Trash, Download, Upload, Plus, Search, CornerDownLeft,
} from 'lucide-react';
import { NODE_DEFINITIONS } from '@/lib/nodes/registry';
import { cn } from '@/lib/utils';

interface Action {
  id: string;
  label: string;
  hint?: string;
  icon: typeof Search;
  group: 'Navigate' | 'Editor' | 'Add Node';
  run: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { setView, editWorkflow } = useUIStore();
  const wf = useWorkflowStore();

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const actions = useMemo<Action[]>(() => {
    const navActions: Action[] = [
      { id: 'nav-dashboard',    label: 'Go to Dashboard',    icon: LayoutDashboard, group: 'Navigate', run: () => { setView('dashboard'); setOpen(false); } },
      { id: 'nav-editor',       label: 'Go to Editor',       icon: Workflow,        group: 'Navigate', run: () => { setView('editor'); setOpen(false); } },
      { id: 'nav-templates',    label: 'Go to Templates',    icon: Sparkles,        group: 'Navigate', run: () => { setView('templates'); setOpen(false); } },
      { id: 'nav-integrations', label: 'Go to Integrations', icon: Boxes,           group: 'Navigate', run: () => { setView('integrations'); setOpen(false); } },
      { id: 'nav-executions',   label: 'Go to Executions',   icon: Activity,        group: 'Navigate', run: () => { setView('executions'); setOpen(false); } },
      { id: 'nav-credentials',  label: 'Go to Credentials',  icon: KeyRound,        group: 'Navigate', run: () => { setView('credentials'); setOpen(false); } },
      { id: 'nav-settings',     label: 'Go to Settings',     icon: Settings,        group: 'Navigate', run: () => { setView('settings'); setOpen(false); } },
    ];
    const editorActions: Action[] = [
      { id: 'ed-new',     label: 'New Workflow',     icon: Plus,    group: 'Editor', run: () => { wf.clearAll(); editWorkflow(null); setOpen(false); } },
      { id: 'ed-run',     label: 'Test Run Workflow', icon: Play,   group: 'Editor', run: () => { setOpen(false); setView('editor'); setTimeout(() => document.querySelector<HTMLButtonElement>('[data-action="test-run"]')?.click(), 100); } },
      { id: 'ed-clear',   label: 'Clear Canvas',     icon: Trash,   group: 'Editor', run: () => { wf.clearAll(); setOpen(false); } },
    ];
    const nodeActions: Action[] = NODE_DEFINITIONS.slice(0, 30).map((n, i) => ({
      id: `add-${n.type}-${i}`,
      label: `Add: ${n.name}`,
      hint: n.type,
      icon: n.icon,
      group: 'Add Node' as const,
      run: () => {
        wf.addNode(n.type, { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 });
        setView('editor');
        setOpen(false);
      },
    }));
    return [...navActions, ...editorActions, ...nodeActions];
  }, [setView, editWorkflow, wf]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return actions;
    return actions.filter(a =>
      a.label.toLowerCase().includes(q) ||
      (a.hint ?? '').toLowerCase().includes(q) ||
      a.group.toLowerCase().includes(q)
    );
  }, [query, actions]);

  const grouped = useMemo(() => {
    const map = new Map<string, Action[]>();
    for (const a of filtered) {
      if (!map.has(a.group)) map.set(a.group, []);
      map.get(a.group)!.push(a);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, nodes, views..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {grouped.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matches for "{query}"
            </div>
          )}
          {grouped.map(([group, items]) => (
            <div key={group}>
              <div className="sticky top-0 bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group}
              </div>
              {items.map((a) => (
                <button
                  key={a.id}
                  onClick={a.run}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <a.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="flex-1">{a.label}</span>
                  {a.hint && (
                    <span className="font-mono text-[10px] text-muted-foreground/60">{a.hint}</span>
                  )}
                  <CornerDownLeft className="h-3 w-3 text-muted-foreground/40" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Suppress unused-import warning for items used only for type narrowing
void cn;
