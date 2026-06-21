// dliy io - UI Store
// Top-level navigation state for the single-page app.
// All views (dashboard, editor, credentials, etc.) are rendered on the `/` route
// and toggled via this store.

'use client';

import { create } from 'zustand';

export type ViewId =
  | 'dashboard'
  | 'editor'
  | 'credentials'
  | 'templates'
  | 'executions'
  | 'integrations'
  | 'settings'
  | 'api-docs'
  | 'node-builder'
  | 'ai-builder';

interface UIState {
  view: ViewId;
  editingWorkflowId: string | null;   // when in editor, the saved workflow ID (null = new)
  setView: (v: ViewId) => void;
  editWorkflow: (id: string | null) => void;   // also flips view to 'editor'
}

export const useUIStore = create<UIState>((set) => ({
  view: 'dashboard',
  editingWorkflowId: null,
  setView: (view) => set({ view }),
  editWorkflow: (id) => set({ view: 'editor', editingWorkflowId: id }),
}));
