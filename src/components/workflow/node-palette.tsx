// dliy io - Node Palette
// Searchable catalog of all node definitions, grouped by category.
// Drag a node onto the canvas or click to add it at center.

'use client';

import { useMemo, useState } from 'react';
import { NODE_DEFINITIONS, NODE_CATEGORIES, searchNodes, type NodeDefinition, type NodeCategory } from '@/lib/nodes/registry';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Search, ChevronDown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function NodePalette() {
  const [query, setQuery] = useState('');
  const addNode = useWorkflowStore(s => s.addNode);
  const nodes = useWorkflowStore(s => s.nodes);

  const filtered = useMemo(() => searchNodes(query), [query]);
  const grouped = useMemo(() => {
    const map = new Map<NodeCategory, NodeDefinition[]>();
    for (const n of filtered) {
      if (!map.has(n.category)) map.set(n.category, []);
      map.get(n.category)!.push(n);
    }
    return map;
  }, [filtered]);

  const handleAdd = (type: string) => {
    // Place new nodes at a random offset so they don't stack
    const offset = nodes.length * 30;
    addNode(type, { x: 250 + offset, y: 150 + offset });
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Node Library</h3>
          <Badge variant="secondary" className="text-[10px]">{NODE_DEFINITIONS.length}+ nodes</Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full rounded-md border bg-background py-1.5 pl-7 pr-2 text-xs outline-none focus:border-primary"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Popular first when no query */}
          {!query && (
            <div className="mb-2">
              <div className="px-1 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Popular
              </div>
              <div className="grid grid-cols-1 gap-1">
                {NODE_DEFINITIONS.filter(n => n.popular).map(n => (
                  <PaletteItem key={n.type} node={n} onAdd={handleAdd} featured />
                ))}
              </div>
            </div>
          )}

          {NODE_CATEGORIES.map(cat => {
            const items = grouped.get(cat.id);
            if (!items || items.length === 0) return null;
            return (
              <Collapsible key={cat.id} defaultOpen className="mb-1">
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded px-1 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.label}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-[9px]">{items.length}</span>
                    <ChevronDown className="h-3 w-3" />
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-1 grid grid-cols-1 gap-1">
                    {items.map(n => (
                      <PaletteItem key={n.type} node={n} onAdd={handleAdd} />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-2 py-8 text-center text-xs text-muted-foreground">
              No nodes match "{query}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function PaletteItem({
  node,
  onAdd,
  featured,
}: {
  node: NodeDefinition;
  onAdd: (type: string) => void;
  featured?: boolean;
}) {
  const Icon = node.icon;
  return (
    <button
      onClick={() => onAdd(node.type)}
      className={cn(
        'group flex w-full items-start gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition-all hover:border-border hover:bg-accent',
        featured && 'bg-amber-50/50 dark:bg-amber-950/10',
      )}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-white"
        style={{ backgroundColor: node.color }}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-xs font-medium">{node.name}</span>
          {featured && <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />}
        </div>
        <p className="line-clamp-1 text-[10px] text-muted-foreground">{node.description}</p>
      </div>
    </button>
  );
}
