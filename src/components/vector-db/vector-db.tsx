// dliy io - Vector DB / RAG Knowledge Base
// Manage documents, embeddings, and vector indexes used by the RAG Search node.

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Database, Upload, Search, Trash2, FileText, Sparkles, Layers, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface Doc {
  id: string;
  name: string;
  size: number;
  chunks: number;
  indexedAt: string;
  status: 'indexed' | 'processing' | 'failed';
  source: string;
}

const INITIAL_DOCS: Doc[] = [
  { id: 'd1', name: 'product-docs.md', size: 245678, chunks: 142, indexedAt: new Date(Date.now() - 3600_000).toISOString(), status: 'indexed', source: 'upload' },
  { id: 'd2', name: 'api-reference.json', size: 892344, chunks: 387, indexedAt: new Date(Date.now() - 7200_000).toISOString(), status: 'indexed', source: 'upload' },
  { id: 'd3', name: 'support-tickets.csv', size: 1456789, chunks: 892, indexedAt: new Date(Date.now() - 1800_000).toISOString(), status: 'processing', source: 'sync' },
  { id: 'd4', name: 'faq.md', size: 32145, chunks: 28, indexedAt: new Date(Date.now() - 86400_000).toISOString(), status: 'indexed', source: 'upload' },
];

const INDEXES = [
  { name: 'default', dims: 1536, docs: 4, chunks: 1449, model: 'text-embedding-3-small', lastSync: '2 min ago' },
  { name: 'support-kb', dims: 1536, docs: 12, chunks: 3421, model: 'text-embedding-3-small', lastSync: '5 min ago' },
  { name: 'product-specs', dims: 1024, docs: 8, chunks: 1240, model: 'bge-large-en', lastSync: '1 hour ago' },
];

export function VectorDB() {
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; score: number; snippet: string }>>([]);

  const handleUpload = () => {
    const newDoc: Doc = {
      id: `d${Date.now()}`,
      name: `document-${Math.floor(Math.random() * 999)}.txt`,
      size: Math.floor(50000 + Math.random() * 500000),
      chunks: Math.floor(20 + Math.random() * 200),
      indexedAt: new Date().toISOString(),
      status: 'processing',
      source: 'upload',
    };
    setDocs(prev => [newDoc, ...prev]);
    toast.success(`Uploading ${newDoc.name}...`);
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'indexed' } : d));
      toast.success(`${newDoc.name} indexed`);
    }, 2500);
  };

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    toast.success('Document removed from index');
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    setResults(Array.from({ length: 5 }).map((_, i) => ({
      id: `chunk_${i}`,
      score: 0.95 - i * 0.08,
      snippet: `Matched chunk for "${query.slice(0, 40)}${query.length > 40 ? '...' : ''}" — this is a simulated retrieval result showing how the RAG Search node would return context to the LLM.`,
    })));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Database className="h-6 w-6 text-emerald-500" /> Vector DB & RAG
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage knowledge bases for the RAG Search node. Upload docs, build indexes, test retrieval.
          </p>
        </div>
        <Button onClick={handleUpload}>
          <Upload className="mr-1 h-4 w-4" /> Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Documents" value={docs.length} icon={FileText} color="text-blue-500" />
        <Stat label="Total Chunks" value={docs.reduce((s, d) => s + d.chunks, 0).toLocaleString()} icon={Layers} color="text-purple-500" />
        <Stat label="Indexes" value={INDEXES.length} icon={Database} color="text-emerald-500" />
        <Stat label="Embedding Dims" value={INDEXES[0].dims} icon={Hash} color="text-amber-500" />
      </div>

      {/* Indexes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vector Indexes</CardTitle>
          <CardDescription className="text-xs">Each index uses one embedding model and stores chunks from one or more documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-6 gap-2 border-b px-2 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
              <div className="col-span-2">Index Name</div>
              <div>Dims</div>
              <div>Chunks</div>
              <div>Model</div>
              <div>Last Sync</div>
            </div>
            {INDEXES.map(idx => (
              <div key={idx.name} className="grid grid-cols-6 items-center gap-2 px-2 py-2 text-xs hover:bg-accent">
                <div className="col-span-2 flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-mono font-medium">{idx.name}</span>
                </div>
                <div className="text-muted-foreground">{idx.dims}</div>
                <div className="text-muted-foreground">{idx.chunks.toLocaleString()}</div>
                <div className="text-muted-foreground font-mono text-[10px]">{idx.model}</div>
                <div className="text-muted-foreground text-[10px]">{idx.lastSync}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
          <CardDescription className="text-xs">Uploaded files chunked and embedded into vector indexes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-6 gap-2 border-b px-2 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
              <div className="col-span-2">Name</div>
              <div>Size</div>
              <div>Chunks</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {docs.map(d => (
              <div key={d.id} className="grid grid-cols-6 items-center gap-2 px-2 py-2 text-xs hover:bg-accent">
                <div className="col-span-2 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{d.name}</span>
                  {d.source === 'sync' && <Badge variant="outline" className="text-[9px]">synced</Badge>}
                </div>
                <div className="text-muted-foreground">{(d.size / 1024).toFixed(0)} KB</div>
                <div className="text-muted-foreground">{d.chunks}</div>
                <div>
                  {d.status === 'indexed' && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[9px]">indexed</Badge>}
                  {d.status === 'processing' && <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[9px]">processing</Badge>}
                  {d.status === 'failed' && <Badge variant="destructive" className="text-[9px]">failed</Badge>}
                </div>
                <div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Retrieval test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-purple-500" /> Test Retrieval
          </CardTitle>
          <CardDescription className="text-xs">Run a query against the default index to see what the RAG Search node would return</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question that the workflow's AI agent might ask..."
            className="min-h-[60px]"
          />
          <Button onClick={handleSearch} disabled={!query.trim()}>
            <Sparkles className="mr-1 h-3.5 w-3.5" /> Search Index
          </Button>
          {results.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase text-muted-foreground">Top {results.length} results</div>
              {results.map((r, i) => (
                <div key={i} className="rounded-md border p-2 text-xs">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">{r.id}</span>
                    <Badge variant="outline" className="text-[9px]">score: {r.score.toFixed(3)}</Badge>
                  </div>
                  <p className="text-foreground/80">{r.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof FileText; color: string }) {
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
