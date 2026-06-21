// dliy io - API Tokens Manager
// Issue, list, and revoke personal access tokens for the REST API.

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

interface ApiToken {
  id: string;
  name: string;
  prefix: string;        // first 8 chars shown
  scopes: string[];
  lastUsed?: string;
  expiresAt: string;
  createdAt: string;
}

const SCOPES = [
  { id: 'workflows:read',  label: 'Read workflows' },
  { id: 'workflows:write', label: 'Write workflows' },
  { id: 'executions:read', label: 'Read executions' },
  { id: 'executions:run',  label: 'Run executions' },
  { id: 'credentials:read', label: 'Read credentials' },
  { id: 'credentials:write', label: 'Write credentials' },
  { id: 'ai:call',         label: 'Call AI endpoints' },
  { id: 'admin',           label: 'Admin access' },
];

const INITIAL_TOKENS: ApiToken[] = [
  { id: 't1', name: 'Production Worker', prefix: 'dliy_prod_', scopes: ['workflows:read', 'executions:run', 'ai:call'], lastUsed: new Date(Date.now() - 60_000).toISOString(), expiresAt: new Date(Date.now() + 86400_000 * 90).toISOString(), createdAt: new Date(Date.now() - 86400_000 * 30).toISOString() },
  { id: 't2', name: 'CI/CD Pipeline', prefix: 'dliy_ci___', scopes: ['workflows:read', 'workflows:write'], lastUsed: new Date(Date.now() - 3600_000).toISOString(), expiresAt: new Date(Date.now() + 86400_000 * 365).toISOString(), createdAt: new Date(Date.now() - 86400_000 * 60).toISOString() },
  { id: 't3', name: 'Analytics Export', prefix: 'dliy_anlt_', scopes: ['executions:read'], lastUsed: new Date(Date.now() - 7200_000).toISOString(), expiresAt: new Date(Date.now() + 86400_000 * 14).toISOString(), createdAt: new Date(Date.now() - 86400_000 * 7).toISOString() },
];

export function ApiTokensManager() {
  const [tokens, setTokens] = useState<ApiToken[]>(INITIAL_TOKENS);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newScopes, setNewScopes] = useState<string[]>(['workflows:read']);
  const [newExpiry, setNewExpiry] = useState('30');
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) { toast.error('Token name required'); return; }
    const token = `dliy_${nanoid(40)}`;
    const newRec: ApiToken = {
      id: `t${Date.now()}`,
      name: newName,
      prefix: token.slice(0, 12),
      scopes: newScopes,
      expiresAt: new Date(Date.now() + 86400_000 * Number(newExpiry)).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setTokens(prev => [newRec, ...prev]);
    setNewToken(token);
    setCopied(false);
    toast.success('Token created — copy it now, it won\'t be shown again');
  };

  const handleRevoke = (id: string) => {
    if (!confirm('Revoke this token? This cannot be undone.')) return;
    setTokens(prev => prev.filter(t => t.id !== id));
    toast.success('Token revoked');
  };

  const copyToken = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken);
      setCopied(true);
      toast.success('Token copied to clipboard');
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setNewName('');
    setNewScopes(['workflows:read']);
    setNewExpiry('30');
    setNewToken(null);
  };

  const toggleScope = (s: string) => {
    setNewScopes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Key className="h-6 w-6 text-amber-500" /> API Tokens
          </h1>
          <p className="text-sm text-muted-foreground">
            Personal access tokens for authenticating REST API requests. Tokens are hashed at rest — we can't show them after creation.
          </p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) closeDialog(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> New Token</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{newToken ? 'Token Created' : 'Create API Token'}</DialogTitle>
            </DialogHeader>
            {newToken ? (
              <div className="space-y-3">
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-3 text-xs text-amber-900">
                    <strong>⚠️ Copy this token now.</strong> It will not be shown again for security.
                  </CardContent>
                </Card>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md bg-zinc-950 px-3 py-2 text-xs text-zinc-100">
                    {newToken}
                  </code>
                  <Button size="icon" onClick={copyToken}>
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button className="w-full" onClick={closeDialog}>Done</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Token Name</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Production Worker" />
                </div>
                <div>
                  <Label className="mb-1 block text-xs">Expiration</Label>
                  <Select value={newExpiry} onValueChange={setNewExpiry}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="3650">No expiry (10 years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block text-xs">Scopes</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SCOPES.map(s => (
                      <label key={s.id} className="flex items-center gap-1.5 rounded border p-2 text-xs cursor-pointer hover:bg-accent">
                        <input
                          type="checkbox"
                          checked={newScopes.includes(s.id)}
                          onChange={() => toggleScope(s.id)}
                        />
                        <span className="flex-1">{s.label}</span>
                        <code className="text-[9px] text-muted-foreground">{s.id}</code>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button onClick={handleCreate}><Shield className="mr-1 h-3.5 w-3.5" /> Generate Token</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Tokens ({tokens.length})</CardTitle>
          <CardDescription className="text-xs">Use the token as a Bearer header: <code className="rounded bg-muted px-1">Authorization: Bearer dliy_...</code></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-2 border-b px-2 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Token</div>
              <div className="col-span-3">Scopes</div>
              <div className="col-span-2">Last Used</div>
              <div className="col-span-1">Expires</div>
              <div className="col-span-1"></div>
            </div>
            {tokens.map(t => (
              <div key={t.id} className="grid grid-cols-12 items-center gap-2 px-2 py-2 text-xs hover:bg-accent">
                <div className="col-span-3">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="col-span-2 font-mono text-[10px]">
                  {t.prefix}<span className="text-muted-foreground">••••••••••</span>
                </div>
                <div className="col-span-3 flex flex-wrap gap-1">
                  {t.scopes.slice(0, 2).map(s => <Badge key={s} variant="outline" className="text-[9px]">{s}</Badge>)}
                  {t.scopes.length > 2 && <Badge variant="outline" className="text-[9px]">+{t.scopes.length - 2}</Badge>}
                </div>
                <div className="col-span-2 text-muted-foreground">
                  {t.lastUsed ? new Date(t.lastUsed).toLocaleString() : 'Never'}
                </div>
                <div className="col-span-1 text-muted-foreground text-[10px]">
                  {Math.round((new Date(t.expiresAt).getTime() - Date.now()) / 86400_000)}d
                </div>
                <div className="col-span-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => handleRevoke(t.id)}>
                    <Trash2 className="h-3 w-3" />
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
