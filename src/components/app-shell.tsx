// dliy io - App Shell
// Single-page layout with a left sidebar for navigation between views.
// Includes dark mode toggle, command palette button, and AI Builder shortcut.

'use client';

import { useUIStore, type ViewId } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Workflow, KeyRound, Sparkles, Activity,
  Boxes, Settings, Zap, Github, BookOpen, Code2, Boxes as NodesIcon,
  Wand2, Moon, Sun, Command,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TOTAL_NODE_COUNT } from '@/lib/nodes/registry';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { CommandPalette } from '@/components/command-palette/command-palette';
import { AIBuilderDialog } from '@/components/ai-builder/ai-builder-dialog';

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard; description: string }[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, description: 'Overview & stats' },
  { id: 'editor',       label: 'Editor',       icon: Workflow,        description: 'Visual workflow builder' },
  { id: 'ai-builder',   label: 'AI Builder',   icon: Wand2,           description: 'Chat → workflow' },
  { id: 'templates',    label: 'Templates',    icon: Sparkles,        description: 'Pre-built workflows' },
  { id: 'integrations', label: 'Integrations', icon: Boxes,           description: `${TOTAL_NODE_COUNT}+ nodes` },
  { id: 'node-builder', label: 'Node Builder', icon: NodesIcon,       description: 'Build custom nodes' },
  { id: 'executions',   label: 'Executions',   icon: Activity,        description: 'Run history' },
  { id: 'credentials',  label: 'Credentials',  icon: KeyRound,        description: 'API keys & secrets' },
  { id: 'api-docs',     label: 'API Docs',     icon: Code2,           description: 'REST API reference' },
  { id: 'settings',     label: 'Settings',     icon: Settings,        description: 'Platform config' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Standard next-themes pattern to avoid hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return <div className="h-7 w-7" />;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </Button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { view, setView } = useUIStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-card">
        <div className="border-b p-4">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <div className="text-base font-bold leading-tight">dliy io</div>
              <div className="text-[10px] text-muted-foreground">by Death Legion</div>
            </div>
          </button>
        </div>

        <div className="border-b p-2">
          <button
            onClick={() => setView('ai-builder')}
            className="flex w-full items-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 py-2 text-xs font-medium text-white shadow-sm hover:opacity-90"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">AI Workflow Builder</span>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium leading-tight">{item.label}</div>
                  <div className={cn('truncate text-[10px] leading-tight', active ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="border-t p-3 space-y-1">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button
              onClick={() => {
                // Trigger the global Cmd+K handler by dispatching a keydown
                const evt = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
                window.dispatchEvent(evt);
              }}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              title="Open command palette"
            >
              <Command className="h-3 w-3" /> <kbd className="rounded border bg-muted px-1">⌘K</kbd>
            </button>
          </div>
          <a
            href="https://github.com/death-legion/dliy-io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub Repo</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Docs</span>
          </a>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center justify-between border-b bg-card px-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-pink-500">
              <Zap className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-sm">dliy io</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Navigate</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {NAV.map(item => (
                  <DropdownMenuItem key={item.id} onClick={() => setView(item.id)}>
                    <item.icon className="mr-2 h-3.5 w-3.5" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      <CommandPalette />
      <AIBuilderDialog />
    </div>
  );
}
