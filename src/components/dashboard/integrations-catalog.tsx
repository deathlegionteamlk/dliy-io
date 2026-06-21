// dliy io - Integrations Catalog
// Browse the full library of available node integrations, grouped by category.

'use client';

import { useMemo, useState } from 'react';
import { NODE_DEFINITIONS, NODE_CATEGORIES, searchNodes, type NodeCategory } from '@/lib/nodes/registry';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';

export function IntegrationsCatalog() {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<NodeCategory | 'all'>('all');

  const filtered = useMemo(() => {
    let list = searchNodes(query);
    if (activeCat !== 'all') list = list.filter(n => n.category === activeCat);
    return list;
  }, [query, activeCat]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const n of NODE_DEFINITIONS) map[n.category] = (map[n.category] ?? 0) + 1;
    return map;
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-purple-500" /> Integrations
        </h1>
        <p className="text-sm text-muted-foreground">
          {NODE_DEFINITIONS.length}+ pre-built integrations across {NODE_CATEGORIES.length} categories.
          All open source — extend or build your own with the Node SDK.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations..."
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveCat('all')}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
              activeCat === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
            }`}
          >
            All ({NODE_DEFINITIONS.length})
          </button>
          {NODE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
                activeCat === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.label} ({counts[cat.id] ?? 0})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map(n => {
          const Icon = n.icon;
          return (
            <Card key={n.type} className="overflow-hidden transition-shadow hover:shadow-md">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: n.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold">{n.name}</span>
                      {n.popular && <Badge variant="secondary" className="h-3.5 text-[8px]">POPULAR</Badge>}
                    </div>
                    <p className="line-clamp-2 text-[10px] text-muted-foreground">{n.description}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="font-mono text-[8px] text-muted-foreground/60">{n.type}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No integrations found for "{query}".</p>
        </div>
      )}
    </div>
  );
}
