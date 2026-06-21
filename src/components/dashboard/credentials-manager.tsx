// dliy io - Credentials Manager
// Lists stored credentials and a form to add new ones.
// In production this view would call envelope-encryption-backed APIs.

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { KeyRound, Plus, Trash2, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface Credential {
  id: string;
  name: string;
  type: string;
  service: string;
  data: string;
  createdAt: string;
}

const CREDENTIAL_TYPES = [
  { value: 'api_key',    label: 'API Key' },
  { value: 'oauth2',     label: 'OAuth 2.0' },
  { value: 'basic',      label: 'Basic Auth' },
  { value: 'bearer',     label: 'Bearer Token' },
  { value: 'jwt',        label: 'JWT' },
];

const SERVICES = [
  'slack', 'github', 'gitlab', 'openai', 'anthropic', 'stripe', 'notion',
  'airtable', 'hubspot', 'salesforce', 'google', 'twitter', 'postgres',
  'mysql', 'mongodb', 'redis', 'aws', 'azure', 'gcp',
];

export function CredentialsManager() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchCreds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/credentials');
      const json = await res.json();
      setCredentials(json.credentials ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCreds(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this credential?')) return;
    // For the demo we just remove it locally; production would call DELETE /api/credentials/[id]
    setCredentials(prev => prev.filter(c => c.id !== id));
    toast.success('Credential removed');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <KeyRound className="h-6 w-6 text-amber-500" /> Credentials
          </h1>
          <p className="text-sm text-muted-foreground">
            Store and manage API keys, OAuth tokens, and database connections securely.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> Add Credential</Button>
          </DialogTrigger>
          <AddCredentialDialog
            onCreated={() => { setOpen(false); fetchCreds(); }}
          />
        </Dialog>
      </div>

      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardContent className="flex items-start gap-3 p-4">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-xs">
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              Encryption at Rest
            </p>
            <p className="text-amber-800 dark:text-amber-300">
              All credentials are encrypted with AES-256-GCM using envelope encryption
              (KMS-managed master key). The plaintext is never logged or exposed via the API.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stored Credentials ({credentials.length})</CardTitle>
          <CardDescription className="text-xs">Masked for security — plaintext is never returned by the API</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : credentials.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Lock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No credentials stored</p>
              <p className="mb-3 text-xs text-muted-foreground">Add your first credential to use it in workflows</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {credentials.map(c => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{c.name}</span>
                      <Badge variant="outline" className="text-[9px] uppercase">{c.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.service} · {c.data}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddCredentialDialog({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('api_key');
  const [service, setService] = useState('slack');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, type, service,
          data: { apiKey, apiSecret },
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Credential saved');
      setName(''); setApiKey(''); setApiSecret('');
      onCreated();
    } catch {
      toast.error('Failed to save credential');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add Credential</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Slack Bot Token" className="text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CREDENTIAL_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-sm">{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Service</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SERVICES.map(s => <SelectItem key={s} value={s} className="text-sm capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs">API Key / Token</Label>
          <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="xoxb-..." className="text-sm font-mono" />
        </div>
        <div>
          <Label className="text-xs">API Secret (optional)</Label>
          <Input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="shhhh-..." className="text-sm font-mono" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Credential'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
