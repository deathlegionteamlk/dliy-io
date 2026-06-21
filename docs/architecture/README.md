# dliy io Architecture

## High-level

\`\`\`
Browser (Next.js 16)
  ├─ Dashboard / Editor / Templates / API Docs / Node Builder
  └─ React Flow visual canvas
        │ REST + WebSocket
        ▼
API Gateway (Next.js API routes)
  ├─ /api/workflows      CRUD + versioning
  ├─ /api/credentials    envelope-encrypted
  ├─ /api/executions     history + timeline
  ├─ /api/ai             GLM-4.6 / GPT / Claude proxy
  └─ /api/webhook/:path  public ingress
        │
        ▼
Execution Worker (apps/worker)
  ├─ Topological executor
  ├─ Sandbox runner (Docker / gVisor)
  └─ AI orchestrator (agents + tools + RAG)
        │
        ▼
PostgreSQL  +  Redis  +  S3-compatible storage
\`\`\`

## Tenancy

- One workspace per team (multi-tenant via `workspaceId` on every row)
- RBAC: Owner / Admin / Editor / Viewer
- ABAC: per-workflow permissions for fine-grained access

## Execution model

1. Trigger fires (webhook / cron / event / manual)
2. Worker pulls job from Redis queue (BullMQ)
3. Topological sort of node graph
4. Each node runs in sandbox with timeout + memory limits
5. Outputs flow downstream via the expression engine
6. Final state persisted to `executions` table
7. WebSocket streams progress to the editor

## AI subsystem

- `packages/ai-sdk/` — unified provider interface
- `packages/ai-orchestrator/` — ReAct loop, tool dispatch
- `packages/ai-rag/` — pgvector + Pinecone + Weaviate adapters
- `packages/ai-memory/` — short-term buffer + long-term vector store
- `packages/ai-evals/` — regression harness for prompt quality
