// dliy io - Save Workflow Dialog
// Saves the current graph to the database via POST/PUT /api/workflows.

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useWorkflowStore } from '@/stores/workflow-store';
import { useUIStore } from '@/stores/ui-store';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveWorkflowDialog({ open, onOpenChange }: Props) {
  const { nodes, edges } = useWorkflowStore();
  const { editingWorkflowId, setView } = useUIStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Workflow name is required');
      return;
    }
    if (nodes.length === 0) {
      toast.error('Cannot save an empty workflow');
      return;
    }
    setSaving(true);
    try {
      const graph = JSON.stringify({ nodes, edges });
      const method = editingWorkflowId ? 'PUT' : 'POST';
      const url = editingWorkflowId
        ? `/api/workflows/${editingWorkflowId}`
        : '/api/workflows';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, graph, active }),
      });

      if (!res.ok) throw new Error('Failed to save');
      toast.success(editingWorkflowId ? 'Workflow updated' : 'Workflow saved');
      onOpenChange(false);
      setView('dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Workflow
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Automation"
              className="text-sm"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-xs">Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this workflow do?"
              className="text-sm min-h-[60px]"
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-2">
            <div>
              <Label className="text-xs">Activate immediately</Label>
              <p className="text-[10px] text-muted-foreground">Triggers will start firing once active</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          <div className="rounded bg-muted/50 p-2 text-[10px] text-muted-foreground">
            <strong>Graph:</strong> {nodes.length} nodes · {edges.length} edges
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Saving...</> : <><Save className="mr-1 h-3.5 w-3.5" /> Save</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
