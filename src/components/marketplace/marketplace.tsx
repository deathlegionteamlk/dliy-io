// dliy io - Marketplace
// Browse community-contributed nodes, templates, and integrations.

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Download, Star, Verified, TrendingUp, Package, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MarketItem {
  id: string;
  name: string;
  author: string;
  verified: boolean;
  category: 'node' | 'template' | 'integration';
  description: string;
  installs: number;
  stars: number;
  trending?: boolean;
  version: string;
}

const ITEMS: MarketItem[] = [
  { id: '1', name: 'OpenAI Assistants v2', author: '@deathlegion', verified: true, category: 'integration', description: 'Full OpenAI Assistants API support with thread management and function calling.', installs: 12453, stars: 892, trending: true, version: '2.4.1' },
  { id: '2', name: 'Slack Block Kit Builder', author: '@slack-community', verified: true, category: 'node', description: 'Visually compose Slack Block Kit messages with a drag-and-drop editor.', installs: 8921, stars: 567, trending: true, version: '1.8.0' },
  { id: '3', name: 'Linear + GitHub Sync', author: '@linear-apps', verified: true, category: 'template', description: 'Two-way sync between Linear issues and GitHub issues with status mapping.', installs: 6234, stars: 423, version: '3.1.2' },
  { id: '4', name: 'Pinecone RAG Kit', author: '@rag-builder', verified: false, category: 'integration', description: 'Production-ready RAG with Pinecone vector store, chunking, and hybrid search.', installs: 4521, stars: 312, version: '0.9.4' },
  { id: '5', name: 'Stripe Subscription Engine', author: '@fintech-oss', verified: true, category: 'template', description: 'Complete subscription lifecycle: signup, upgrade, downgrade, dunning, churn.', installs: 3987, stars: 287, version: '2.0.1' },
  { id: '6', name: 'Notion Database Sync', author: '@notion-tools', verified: true, category: 'node', description: 'Bi-directional sync between Notion databases and any data source.', installs: 3542, stars: 245, version: '1.5.3' },
  { id: '7', name: 'WhatsApp Business Cloud', author: '@meta-devs', verified: true, category: 'integration', description: 'Official Meta Cloud API for WhatsApp — templates, sessions, media.', installs: 2876, stars: 198, trending: true, version: '1.2.0' },
  { id: '8', name: 'AI Customer Support Agent', author: '@ai-workflows', verified: false, category: 'template', description: 'Multi-turn agent with RAG over your docs, escalation to humans, CSAT tracking.', installs: 2534, stars: 187, version: '0.7.2' },
  { id: '9', name: 'GitHub Actions Trigger', author: '@gh-ecosystem', verified: true, category: 'node', description: 'Trigger GitHub Actions workflows from dliy io with inputs and secrets.', installs: 2123, stars: 156, version: '1.1.0' },
  { id: '10', name: 'Twilio Voice + IVR', author: '@telephony-oss', verified: false, category: 'integration', description: 'Build interactive voice response menus and call flows visually.', installs: 1876, stars: 134, version: '0.8.1' },
  { id: '11', name: 'Airtable Bulk Importer', author: '@no-code-tools', verified: false, category: 'node', description: 'Import thousands of rows into Airtable with rate limiting and retries.', installs: 1654, stars: 112, version: '1.0.5' },
  { id: '12', name: 'Discord Bot Framework', author: '@discord-devs', verified: true, category: 'integration', description: 'Full Discord bot with slash commands, components, and event handlers.', installs: 1432, stars: 98, trending: true, version: '2.2.0' },
];

const CATS = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: '🔥 Trending' },
  { id: 'integration', label: 'Integrations' },
  { id: 'node', label: 'Nodes' },
  { id: 'template', label: 'Templates' },
];

export function Marketplace() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const filtered = useMemo(() => {
    let list = ITEMS;
    if (cat === 'trending') list = list.filter(i => i.trending);
    else if (cat !== 'all') list = list.filter(i => i.category === cat);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.author.toLowerCase().includes(q));
    }
    return list;
  }, [query, cat]);

  const handleInstall = (item: MarketItem) => {
    toast.success(`Installed ${item.name} v${item.version}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Package className="h-6 w-6 text-purple-500" /> Marketplace
        </h1>
        <p className="text-sm text-muted-foreground">
          Community-contributed nodes, templates, and integrations. Verified ✅ items are reviewed by the Death Legion team.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search marketplace..."
            className="w-full rounded-md border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-1">
          {CATS.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn('rounded-md px-3 py-1.5 text-xs transition-colors',
                cat === c.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent')}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(item => (
          <Card key={item.id} className="flex flex-col transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {item.category === 'template' ? <Sparkles className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                </div>
                <div className="flex items-center gap-1">
                  {item.trending && <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[9px]"><TrendingUp className="mr-0.5 h-2.5 w-2.5" />Hot</Badge>}
                  {item.verified && <Verified className="h-4 w-4 text-blue-500" />}
                </div>
              </div>
              <CardTitle className="text-base">{item.name}</CardTitle>
              <CardDescription className="text-xs">
                by {item.author} · v{item.version}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
              <div className="mb-3 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {item.installs.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {item.stars}</span>
                <Badge variant="outline" className="text-[9px] capitalize">{item.category}</Badge>
              </div>
              <Button size="sm" className="w-full" onClick={() => handleInstall(item)}>
                <Download className="mr-1 h-3 w-3" /> Install
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          No marketplace items match your filter.
        </div>
      )}
    </div>
  );
}
