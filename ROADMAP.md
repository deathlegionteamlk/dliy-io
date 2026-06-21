# dliy io — Roadmap

This document tracks the long-term direction of the project. Dates are
approximate and subject to change.

## Now (v0.1 — shipped)

- ✅ Visual node editor (React Flow)
- ✅ 52+ pre-built integrations across 11 categories
- ✅ JavaScript + Python code nodes
- ✅ AI agents with tools, memory, and reasoning loops
- ✅ LLM calls, RAG search, AI memory
- ✅ Workflow execution engine (topological + queue-driven)
- ✅ Dashboard with KPIs + execution history
- ✅ Credentials manager with envelope encryption
- ✅ Pre-built workflow templates
- ✅ Docker + docker-compose self-host

## Next (v0.2 — Q1)

- 🚧 Real-time execution streaming via WebSocket
- 🚧 Workflow versioning + diff viewer
- 🚧 Per-node retry policies + error triggers
- 🚧 Vector DB integrations (pgvector, Pinecone, Weaviate)
- 🚧 Streaming LLM responses in chat UI
- 🚧 Expression engine v2 (jq + JSONata)

## Soon (v0.3 — Q2)

- 🔜 Multi-agent orchestration (LangGraph-style graph agents)
- 🔜 On-prem SSO (SAML 2.0, OIDC, LDAP)
- 🔜 Custom node marketplace (publish + install community nodes)
- 🔜 Workflow observability dashboard (latency, error rates, cost)
- 🔜 Bulk operations (run workflow for N items in parallel)
- 🔜 Webhook retry queue with exponential backoff

## Later (v0.4+)

- 📋 Mobile apps (iOS, Android via React Native)
- 📋 Desktop app (Electron)
- 📋 Workflow templates marketplace
- 📋 Sub-workflows (workflow-as-node)
- 📋 Time-travel debugger for executions
- 📋 AI-assisted workflow builder (chat → workflow)
- 📋 Self-serve billing portal (Stripe)
- 📋 Multi-region deployment support

## Won't (this year)

- ❌ Visual SQL query builder (use Postgres node + custom SQL)
- ❌ Built-in form builder (integrate with Typeform/Tally)
- ❌ Replacing the visual editor with a text-based DSL (we love both)
