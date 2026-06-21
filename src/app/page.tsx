'use client';

import { AppShell } from '@/components/app-shell';
import { Dashboard } from '@/components/dashboard/dashboard';
import { WorkflowEditor } from '@/components/workflow/workflow-editor';
import { CredentialsManager } from '@/components/dashboard/credentials-manager';
import { TemplatesGallery } from '@/components/dashboard/templates-gallery';
import { IntegrationsCatalog } from '@/components/dashboard/integrations-catalog';
import { ExecutionsHistory } from '@/components/dashboard/executions-history';
import { SettingsView } from '@/components/dashboard/settings-view';
import { ApiDocsExplorer } from '@/components/api-docs/api-docs-explorer';
import { CustomNodeBuilder } from '@/components/custom-node-builder/custom-node-builder';
import { AIBuilderView } from '@/components/ai-builder/ai-builder-view';
import { useUIStore } from '@/stores/ui-store';
import { Toaster } from '@/components/ui/sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const view = useUIStore(s => s.view);

  return (
    <>
      <AppShell>
        {view === 'editor' ? (
          <WorkflowEditor />
        ) : (
          <ScrollArea className="h-full">
            <div className="min-h-full">
              {view === 'dashboard' && <Dashboard />}
              {view === 'credentials' && <CredentialsManager />}
              {view === 'templates' && <TemplatesGallery />}
              {view === 'integrations' && <IntegrationsCatalog />}
              {view === 'executions' && <ExecutionsHistory />}
              {view === 'settings' && <SettingsView />}
              {view === 'api-docs' && <ApiDocsExplorer />}
              {view === 'node-builder' && <CustomNodeBuilder />}
              {view === 'ai-builder' && <AIBuilderView />}
            </div>
          </ScrollArea>
        )}
      </AppShell>
      <Toaster richColors position="bottom-right" />
    </>
  );
}
