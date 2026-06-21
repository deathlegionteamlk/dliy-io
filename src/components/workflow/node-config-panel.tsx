// dliy io - Node Config Panel
// Right-hand drawer that lets users edit the selected node's label and
// all of its declared fields (string, text, number, boolean, select, json, code).

'use client';

import { useWorkflowStore } from '@/stores/workflow-store';
import { getNodeDefinition, type NodeField } from '@/lib/nodes/registry';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Copy, X, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NodeConfigPanel() {
  const { nodes, selectedNodeId, updateNodeConfig, updateNodeLabel, deleteNode, duplicateNode, selectNode } = useWorkflowStore();
  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-3 rounded-full bg-muted p-3">
          <Code2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-sm font-semibold">No node selected</h3>
        <p className="text-xs text-muted-foreground">
          Click a node on the canvas to edit its configuration, or pick one from the palette.
        </p>
      </div>
    );
  }

  const def = getNodeDefinition(node.data.type);
  if (!def) return null;

  const config = node.data.config ?? {};

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-start justify-between border-b p-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: def.color }} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {def.category}
            </span>
          </div>
          <input
            value={node.data.label}
            onChange={(e) => updateNodeLabel(node.id, e.target.value)}
            className="w-full bg-transparent text-sm font-semibold outline-none focus:text-primary"
          />
          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{def.description}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => selectNode(null)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          <div>
            <Label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Node Type
            </Label>
            <Badge variant="outline" className="font-mono text-[10px]">{def.type}</Badge>
          </div>

          <Separator />

          {def.fields.map((field) => {
            const handle = (v: unknown) => updateNodeConfig(node.id, { [field.key]: v });
            return (
              <FieldEditor
                key={field.key}
                field={field}
                value={config[field.key]}
                onChange={handle}
              />
            );
          })}

          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateNode(node.id)}
              className="text-xs"
            >
              <Copy className="mr-1 h-3 w-3" /> Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteNode(node.id)}
              className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-1 h-3 w-3" /> Delete
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: NodeField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const labelEl = (
    <Label className="mb-1 flex items-center gap-1 text-[11px] font-medium">
      {field.label}
      {field.required && <span className="text-red-500">*</span>}
    </Label>
  );

  const helpEl = field.help && (
    <p className="mt-1 text-[10px] text-muted-foreground">{field.help}</p>
  );

  if (field.type === 'boolean') {
    return (
      <div className="flex items-center justify-between rounded-md border p-2">
        <div className="flex-1">
          <Label className="text-[11px] font-medium">{field.label}</Label>
          {field.help && <p className="text-[10px] text-muted-foreground">{field.help}</p>}
        </div>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        {labelEl}
        <Select value={String(value ?? '')} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {helpEl}
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div>
        {labelEl}
        <Input
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          placeholder={field.placeholder}
          className="h-8 text-xs"
        />
        {helpEl}
      </div>
    );
  }

  if (field.type === 'string') {
    return (
      <div>
        {labelEl}
        <Input
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="h-8 text-xs"
        />
        {helpEl}
      </div>
    );
  }

  if (field.type === 'text') {
    return (
      <div>
        {labelEl}
        <Textarea
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="min-h-[80px] resize-y text-xs"
        />
        {helpEl}
      </div>
    );
  }

  if (field.type === 'json') {
    const strValue = typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2);
    return (
      <div>
        {labelEl}
        <Textarea
          value={strValue}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              // keep raw string until valid
              onChange(e.target.value);
            }
          }}
          className={cn('min-h-[100px] resize-y font-mono text-[11px]')}
          placeholder='{ "key": "value" }'
        />
        {helpEl}
      </div>
    );
  }

  if (field.type === 'code') {
    return (
      <div>
        {labelEl}
        <div className="rounded-md border bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 px-2 py-1">
            <span className="font-mono text-[10px] text-zinc-400">{field.language ?? 'javascript'}</span>
            <Badge variant="outline" className="border-zinc-700 bg-zinc-900 text-[9px] text-zinc-300">Sandboxed</Badge>
          </div>
          <Textarea
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[200px] resize-y border-0 bg-transparent font-mono text-[11px] text-zinc-100 focus-visible:ring-0"
            spellCheck={false}
          />
        </div>
        {helpEl}
      </div>
    );
  }

  if (field.type === 'credentials') {
    return (
      <div>
        {labelEl}
        <Select value={String(value ?? '')} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select credential..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default" className="text-xs">Default credential</SelectItem>
          </SelectContent>
        </Select>
        {helpEl}
      </div>
    );
  }

  return null;
}
