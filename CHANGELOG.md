# Changelog

All notable changes to **dliy io** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] — 2026-06-21

### Added — Monorepo Structure (261 folders)
- `apps/` (16 standalone apps: web, api, worker, webhook, gateway, admin, docs-site, marketplace, status-page, billing, analytics, cloud-console, desktop, mobile, onboarding, support-center, auth-portal)
- `packages/` (57 shared TypeScript libraries: workflow-sdk, execution-engine, expression-engine, ai-sdk, ai-agents, ai-rag, ai-orchestrator, sandbox-runner, rbac, abac, telemetry, billing-core, marketplace-sdk, design-system, and 44 more)
- `services/` (17 microservices: auth, user, workspace, workflow, execution, webhook, credential, notification, billing, analytics, ai, search, marketplace, support, audit, storage, licensing)
- `integrations/` (21 third-party service dirs)
- `nodes/` (19 categories), `credentials/` (6 types), `database/` (7), `infrastructure/` (15), `scripts/` (7), `docs/` (9), `examples/` (4), `templates/` (4), `tests/` (7), `security/` (4)

### Added — New App Features (7 new views)
- **Marketplace**: 12 community-contributed nodes/templates/integrations with install
- **Webhook Inspector**: live auto-capturing webhook request viewer with cURL export
- **Scheduled Jobs**: cron trigger dashboard with pause/resume/run-now
- **Audit Log**: tamper-evident activity trail with CSV export and search
- **Analytics**: KPIs, latency percentiles, token usage pie, per-workflow bar chart, cost table
- **Vector DB & RAG**: document upload, vector indexes, retrieval testing
- **API Tokens**: personal access token CRUD with scoped permissions

### Added — Project Config
- `pnpm-workspace.yaml` + `turbo.json` (monorepo build orchestration)
- `.changeset/config.json` (versioned releases)
- `.storybook/main.ts` (component playground)
- `.devcontainer/devcontainer.json` (VS Code remote dev)
- `.vscode/{settings,launch,extensions,tasks}.json`
- `.husky/{pre-commit,pre-push}` hooks
- `.github/ISSUE_TEMPLATE/{bug_report,feature_request,integration_request}.md`
- `.github/DISCUSSION_TEMPLATE/q_and_a.md`
- `docs/architecture/README.md` with system diagram

## [0.1.0] — 2026-06-21

### Added
- Initial public release of dliy io
- Visual node editor with React Flow
- 115+ pre-built integrations across 11 categories (Triggers, AI, Actions, Logic, Code, Databases, Productivity, DevOps, Transform, Utilities, Communication)
- Custom JavaScript and Python code nodes with sandboxed execution
- AI Agent nodes with tools, memory, and reasoning loops
- LLM Call, RAG Search, AI Memory nodes
- Workflow execution engine (topological + queue-driven)
- Dashboard with KPIs, execution activity chart, recent workflows
- Credentials manager with envelope encryption (AES-256-GCM)
- 6 pre-built workflow templates
- Docker + docker-compose for one-command self-hosting
- Execution history view
- Integrations catalog browser
- Settings view with deployment info
- Workflow save/load via Prisma + SQLite/Postgres
- Real AI integration via GLM-4.6 (z-ai-web-dev-sdk)
- AI Workflow Builder (chat → workflow)
- Expression engine (`{{ $json.field }}` interpolation)
- Command palette (Cmd+K)
- Dark / light mode toggle
- API Docs explorer with cURL/JS/Python examples
- Custom Node Builder (visual → TypeScript SDK code)
- Execution Timeline (Gantt-style)

### Security
- HMAC-SHA256 webhook signatures
- AES-256-GCM envelope encryption for credentials
- Sandboxed code execution (Docker isolation)
- Audit logging for all workflow executions
