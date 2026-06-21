# dliy io

[![Docker Pulls](https://img.shields.io/docker/pulls/deathlegion/dliy-io.svg)](https://hub.docker.com/r/deathlegion/dliy-io)
[![Docker Image Size](https://img.shields.io/docker/image-size/deathlegion/dliy-io/latest)](https://hub.docker.com/r/deathlegion/dliy-io/tags)
[![Docker Automated build](https://img.shields.io/docker/automated/deathlegion/dliy-io)](https://hub.docker.com/r/deathlegion/dliy-io)
[![GitHub release](https://img.shields.io/github/v/release/deathlegionteamlk/dliy-io)](https://github.com/deathlegionteamlk/dliy-io/releases)
[![GitHub stars](https://img.shields.io/github/stars/deathlegionteamlk/dliy-io.svg)](https://github.com/deathlegionteamlk/dliy-io/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/deathlegionteamlk/dliy-io.svg)](https://github.com/deathlegionteamlk/dliy-io/network/members)
[![GitHub issues](https://img.shields.io/github/issues/deathlegionteamlk/dliy-io.svg)](https://github.com/deathlegionteamlk/dliy-io/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-deathlegion%2Fdliy--io-blue)](https://hub.docker.com/r/deathlegion/dliy-io)

> **The open-source, self-hostable workflow automation platform.**
> A more powerful and flexible alternative to Zapier — built with TypeScript and Node.js.

**by Death Legion Team**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## What is dliy io?

**dliy io** is a low-code-first, full-power-second automation platform. Visually wire
together hundreds of pre-built integrations, drop in custom JavaScript or Python
where you need it, and orchestrate AI agents that reason over your data — all from
a self-hosted instance you fully control.

| Feature | Description |
|---|---|
| **Visual Node Editor** | Drag-and-drop flowchart editor powered by React Flow. Connect triggers, actions, logic, and AI nodes into any DAG. |
| **52+ Built-in Integrations** | Slack, GitHub, OpenAI, Anthropic, Stripe, Notion, Airtable, Postgres, MongoDB, AWS, and many more — out of the box. |
| **Custom Code Nodes** | Write JavaScript or Python inline. Sandboxed execution with isolated Docker containers. |
| **Native AI Agents** | Autonomous agents with tools, memory, and reasoning loops. RAG search, LLM calls, and chat engines built in. |
| **Self-Hostable** | One-command Docker deployment. Your data never leaves your infrastructure. |
| **Enterprise-Ready** | Workspaces, RBAC, audit logs, envelope-encrypted credentials. |

---

## Quick Start

### Option 1: Docker (Recommended for production)

```bash
git clone https://github.com/death-legion/dliy-io.git
cd dliy-io
cp .env.example .env
# Edit .env — set NEXTAUTH_SECRET and ENCRYPTION_KEY
docker compose up -d
```

Open `http://localhost:3000` — you're running dliy io.

### Option 2: Local Development

```bash
git clone https://github.com/death-legion/dliy-io.git
cd dliy-io
bun install
cp .env.example .env
bun run db:push       # initialize the database
bun run dev           # start on http://localhost:3000
```

### Option 3: Docker Dev Stack (just infra)

```bash
docker compose -f docker-compose.dev.yml up -d
# Starts Postgres, Redis, MailHog for local development
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser (Next.js)                      │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │ Dashboard  │  │ Visual Editor│  │ Credentials/Logs   │   │
│  └────────────┘  └──────────────┘  └────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST + WebSocket
┌─────────────────────────▼───────────────────────────────────┐
│                  API Gateway (Next.js API Routes)            │
└──────┬──────────┬──────────────┬──────────────┬─────────────┘
       │          │              │              │
       ▼          ▼              ▼              ▼
  ┌─────────┐ ┌────────┐  ┌──────────┐  ┌─────────────┐
  │Workflow │ │Cred.   │  │Execution │  │ Webhook     │
  │Service  │ │Service │  │Service   │  │ Gateway     │
  └────┬────┘ └───┬────┘  └────┬─────┘  └──────┬──────┘
       │          │            │               │
       ▼          ▼            ▼               ▼
  ┌─────────────────────────────────────────────────┐
  │           Execution Engine (Worker)             │
  │   ┌─────────────┐  ┌──────────────┐             │
  │   │ Sandbox     │  │ AI Orchestr. │             │
  │   │ (Docker)    │  │ (LLM/RAG)    │             │
  │   └─────────────┘  └──────────────┘             │
  └─────────────────────────────────────────────────┘
       │                                  │
       ▼                                  ▼
  ┌──────────┐                      ┌──────────┐
  │PostgreSQL│                      │  Redis   │
  │ (state)  │                      │ (queue)  │
  └──────────┘                      └──────────┘
```

---

## Project Structure

```
dliy-io/
│
├── .github/
│   ├── workflows/         # CI/CD pipelines (ci, cd, release, docker, lint, tests, security, dependency-update, publish-sdk)
│   ├── ISSUE_TEMPLATE/
│   ├── DISCUSSION_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   ├── FUNDING.yml
│   └── dependabot.yml
│
├── .vscode/               # Editor config (settings, launch, extensions, tasks)
├── .husky/                # Git hooks
├── .changeset/            # Versioned releases
├── .storybook/            # Component playground
├── .devcontainer/         # VS Code remote dev
│
├── apps/
│   ├── web/               # Next.js 16 frontend (visual editor, dashboard, admin)
│   ├── api/               # Standalone API service (REST + GraphQL)
│   ├── worker/            # Workflow execution worker (consumes queue)
│   ├── webhook/           # Public webhook ingress for triggers
│   ├── gateway/           # API gateway / auth proxy
│   ├── admin/             # Admin panel
│   ├── docs-site/         # Public docs (Next.js + MDX)
│   ├── marketplace/       # Community node marketplace
│   ├── status-page/       # Public status page
│   ├── billing/           # Self-serve billing portal (Stripe)
│   ├── analytics/         # Product analytics
│   ├── cloud-console/     # Cloud-hosted management console
│   ├── desktop/           # Electron desktop app
│   ├── mobile/            # React Native mobile app
│   ├── onboarding/        # Guided onboarding flow
│   ├── support-center/    # Customer support portal
│   └── auth-portal/       # SSO / OAuth portal
│
├── packages/              # Shared libraries (published to npm)
│   ├── workflow-sdk/      # Public SDK for building workflows programmatically
│   ├── execution-engine/  # Core execution engine (topological + queue-driven)
│   ├── expression-engine/ # {{ $json.field }} template expression engine
│   ├── node-sdk/          # SDK for building custom nodes
│   ├── node-generator/    # CLI to scaffold new node packages
│   ├── credentials-sdk/   # Envelope encryption helpers
│   ├── trigger-sdk/       # Trigger SDK (webhook, cron, event-bus)
│   ├── ai-sdk/            # Unified AI provider abstraction
│   ├── api-sdk/           # Typed API client
│   ├── workflow-validator/# Graph validation (cycles, missing inputs)
│   ├── execution-runner/  # Per-execution lifecycle runner
│   ├── webhook-runner/    # Webhook ingress handler
│   ├── sandbox-runner/    # JS/Python sandboxed execution
│   ├── queue-engine/      # BullMQ wrapper
│   ├── scheduler/         # Cron scheduler
│   ├── event-bus/         # Internal pub/sub
│   ├── telemetry/         # OpenTelemetry
│   ├── logging/           # Structured logging (pino)
│   ├── monitoring/        # Health + metrics
│   ├── audit/             # Audit log writer
│   ├── notifications/     # In-app + email notifications
│   ├── permissions/       # Permission engine
│   ├── rbac/              # Role-based access control
│   ├── abac/              # Attribute-based access control
│   ├── billing-core/      # Usage metering + invoicing
│   ├── licensing/         # Self-host license keys
│   ├── cloud-core/        # Cloud-specific (SaaS mode)
│   ├── tenancy/           # Multi-tenant isolation
│   ├── workspace-core/    # Workspace management
│   ├── marketplace-sdk/   # Publish/install community nodes
│   ├── analytics-core/    # Event tracking
│   ├── ai-agents/         # Agent runtime (ReAct, planner)
│   ├── ai-memory/         # Conversational memory store
│   ├── ai-tools/          # Tool definitions for agents
│   ├── ai-evals/          # Evaluation harness
│   ├── ai-prompts/        # Prompt versioning + management
│   ├── ai-rag/            # Vector store + retrieval
│   ├── ai-orchestrator/   # Multi-agent orchestration
│   ├── chat-engine/       # Streaming chat UI engine
│   ├── config/            # Env config loader
│   ├── database/          # Prisma client + migrations
│   ├── cache/             # Redis cache wrapper
│   ├── search/            # Full-text + vector search
│   ├── shared/            # Cross-package shared utilities
│   ├── utils/             # Generic utilities
│   ├── crypto/            # Crypto helpers
│   ├── logger/            # Logger interface
│   ├── errors/            # Error types
│   ├── constants/         # Shared constants
│   ├── types/             # Shared TypeScript types
│   ├── contracts/         # Service contracts (OpenAPI, JSON Schema)
│   ├── api-types/         # API request/response types
│   ├── design-system/     # Design tokens + theme
│   ├── ui-components/     # React UI components (shadcn-based)
│   ├── icons/             # SVG icon library
│   ├── themes/            # Theme presets
│   └── testing/           # Test utilities
│
├── services/              # Microservices (independently deployable)
│   ├── auth-service/      # Authentication (OAuth, SSO, JWT)
│   ├── user-service/      # User management
│   ├── workspace-service/ # Workspace + membership
│   ├── workflow-service/  # CRUD + version control for workflows
│   ├── execution-service/ # Execution lifecycle
│   ├── webhook-service/   # Webhook ingress
│   ├── credential-service/# Encrypted credential storage
│   ├── notification-service/
│   ├── billing-service/
│   ├── analytics-service/
│   ├── ai-service/        # AI provider proxy
│   ├── search-service/
│   ├── marketplace-service/
│   ├── support-service/
│   ├── audit-service/
│   ├── storage-service/   # S3-compatible file storage
│   └── licensing-service/
│
├── integrations/          # Third-party service integrations
│   ├── google/            # Gmail, Drive, Calendar, Sheets, Docs
│   ├── microsoft/         # Outlook, Teams, OneDrive
│   ├── slack/             # Slack API
│   ├── discord/
│   ├── github/            # GitHub App
│   ├── gitlab/
│   ├── stripe/
│   ├── paypal/
│   ├── openai/
│   ├── anthropic/
│   ├── aws/               # S3, Lambda, SQS, DynamoDB
│   ├── azure/
│   ├── gcp/
│   ├── hubspot/
│   ├── salesforce/
│   ├── notion/
│   ├── airtable/
│   ├── mongodb/
│   ├── mysql/
│   ├── postgres/
│   └── redis/
│
├── nodes/                 # Node packages, organized by category
│   ├── triggers/          # Webhook, Schedule, Manual, Event Bus
│   ├── actions/           # HTTP, Slack, GitHub, Stripe, etc.
│   ├── ai/                # AI Agent, LLM, RAG, Memory
│   ├── databases/         # Postgres, MySQL, MongoDB, Redis
│   ├── files/             # File read/write, S3, Drive
│   ├── communication/     # Email, Slack, Discord, SMS
│   ├── social/            # Twitter, LinkedIn, Mastodon
│   ├── marketing/         # Mailchimp, HubSpot, SendGrid
│   ├── crm/               # Salesforce, HubSpot, Pipedrive
│   ├── ecommerce/         # Shopify, WooCommerce, Stripe
│   ├── devops/            # Docker, K8s, AWS, Jenkins
│   ├── cloud/             # AWS, Azure, GCP
│   ├── finance/           # Stripe, PayPal, QuickBooks
│   ├── productivity/      # Notion, Trello, Asana, Linear
│   ├── utilities/         # Log, Notify, Encrypt, Respond
│   ├── logic/             # IF, Switch, Loop, Wait, Merge, Filter
│   ├── transform/         # Map, Parse, Format
│   ├── code/              # JavaScript, Python, JSON Transform
│   └── custom/            # User-defined nodes
│
├── credentials/           # Credential type definitions
│   ├── oauth/
│   ├── api-key/
│   ├── jwt/
│   ├── basic-auth/
│   ├── cloud/
│   └── enterprise/
│
├── database/
│   ├── prisma/            # Prisma schema
│   ├── migrations/        # SQL migrations
│   ├── seeds/             # Seed data
│   ├── entities/          # Domain entities
│   ├── repositories/      # Data access layer
│   ├── views/             # Materialized views
│   ├── triggers/          # DB triggers
│   └── backups/           # Backup scripts
│
├── infrastructure/
│   ├── docker/            # Dockerfiles + compose
│   ├── kubernetes/        # K8s manifests
│   ├── helm/              # Helm charts
│   ├── terraform/         # IaC (AWS, GCP, Azure)
│   ├── ansible/           # Config management
│   ├── nginx/             # Reverse proxy
│   ├── traefik/           # Alternative proxy
│   ├── cloudflare/        # CDN + Workers
│   ├── aws/               # AWS-specific
│   ├── gcp/
│   ├── azure/
│   ├── monitoring/        # Prometheus + Grafana
│   ├── logging/           # Loki + Promtail
│   ├── backup/            # Backup automation
│   └── disaster-recovery/
│
├── scripts/
│   ├── build/             # Build scripts
│   ├── deploy/            # Deployment scripts
│   ├── migrate/           # DB migration helpers
│   ├── release/           # Release tooling
│   ├── codegen/           # Code generation
│   ├── bootstrap/         # Project setup
│   └── maintenance/       # Operational scripts
│
├── docs/                  # Documentation
│   ├── architecture/      # ADRs + system diagrams
│   ├── workflows/         # Workflow authoring guide
│   ├── sdk/               # SDK reference
│   ├── api/               # REST API reference
│   ├── integrations/      # Integration docs
│   ├── deployment/        # Self-host guide
│   ├── security/          # Security model
│   ├── enterprise/        # Enterprise features
│   └── roadmap/           # Public roadmap
│
├── examples/
│   ├── workflows/         # Example workflow JSON
│   ├── custom-nodes/      # Custom node examples
│   ├── ai-agents/         # AI agent examples
│   └── sdk-usage/         # SDK usage examples
│
├── templates/
│   ├── workflow-templates/# Pre-built workflows
│   ├── node-templates/    # Scaffolds for new nodes
│   ├── app-templates/     # Full app templates
│   └── starter-kits/      # Quick-start kits
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/               # Playwright
│   ├── performance/       # k6
│   ├── security/          # OWASP ZAP
│   ├── load/              # Artillery
│   └── chaos/             # Chaos engineering
│
├── security/
│   ├── policies/          # Security policies
│   ├── scans/             # Scan results
│   ├── reports/           # Audit reports
│   └── compliance/        # SOC2, GDPR, HIPAA
│
├── assets/                # Static assets
├── public/                # Public files served by Next.js
├── tmp/                   # Temporary files
├── logs/                  # Application logs
├── backups/               # Backup data
│
├── package.json
├── pnpm-workspace.yaml    # Monorepo workspace config
├── turbo.json             # Turborepo pipeline
├── tsconfig.json          # TypeScript config
├── docker-compose.yml     # Production stack
├── docker-compose.dev.yml # Dev stack (Postgres, Redis, MailHog)
├── Dockerfile             # Production image
├── LICENSE                # MIT
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── ROADMAP.md
├── CHANGELOG.md
└── README.md
```

---

## Built-in Integrations

dliy io ships with **115+ nodes** across 11 categories:

| Category | Count | Examples |
|---|---|---|
| **Triggers** | 6 | Webhook, Schedule (cron), Manual, Event Bus, HTTP Polling, Webhook Alias |
| **AI** | 12 | AI Agent, LLM Call, AI Memory, RAG Search, AI Image Gen, AI Transcribe, Sentiment, Classifier, Translate, Summarize, AI Workflow Builder |
| **Actions** | 27 | HTTP, Slack, Discord, GitHub, GitLab, Email, Stripe, Notion, Airtable, HubSpot, Salesforce, Twitter, LinkedIn, Jira, Trello, Figma, OpenAI, Anthropic, Mailchimp, SendGrid, Intercom, ActiveCampaign, Postmark, Shopify, WooCommerce, Etsy, Amazon, BigCommerce, PayPal, QuickBooks, Xero, Plaid |
| **Logic** | 6 | IF/Else, Switch, Loop, Wait, Merge, Filter |
| **Code** | 3 | JavaScript, Python, JSON Transform |
| **Databases** | 8 | PostgreSQL, MySQL, MongoDB, Redis, Supabase, Firebase, AWS S3, Google Cloud Storage |
| **Communication** | 12 | Telegram, WhatsApp, Twilio SMS, Zoom, MS Teams, Matrix, SMS, Mastodon, Reddit, YouTube, Instagram, TikTok |
| **Productivity** | 12 | Google Calendar, Google Docs, Notion DB, Asana, Linear, ClickUp, monday.com, Todoist, Confluence, PagerDuty, Dropbox, Google Drive, OneDrive |
| **DevOps** | 13 | Docker, Kubernetes, AWS, GCP, Azure, Cloudflare, Vercel, Netlify, Jenkins, CircleCI, Sentry, Datadog, Grafana |
| **Transform** | 3 | Map Fields, Parse, Format |
| **Utilities** | 9 | Log, Notify, Encrypt, Respond, QR Code, Hash, Timestamp, UUID Generator, AI Workflow Builder |

---

## Building a Custom Node

```typescript
import { defineNode } from '@dliyio/node-sdk';

export default defineNode({
  type: 'myapp.send',
  name: 'Send via MyApp',
  category: 'actions',
  inputs: 1,
  outputs: 1,
  fields: [
    { key: 'message', type: 'string', required: true },
    { key: 'recipient', type: 'string', required: true },
  ],
  async run({ inputs, config, credential }) {
    const res = await fetch('https://api.myapp.com/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credential.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: config.recipient,
        message: config.message,
        source: inputs,
      }),
    });
    return { ok: res.ok, status: res.status };
  },
});
```

---

## Building an AI Agent Workflow

```typescript
// Define an AI agent that can call tools
const agent = defineAgent({
  model: 'glm-4.6',
  systemPrompt: 'You are a customer support agent. Use tools to look up orders.',
  tools: ['http', 'db', 'search'],
  memory: { type: 'buffer', maxItems: 20 },
  maxSteps: 10,
});

const workflow = defineWorkflow({
  trigger: webhook({ path: 'support' }),
  steps: [
    agent({ inputs: '{{ $json.payload.question }}' }),
    ifElse({ condition: '{{ $json.confidence > 0.7 }}' })
      .then(respond({ body: '{{ $json.answer }}' }))
      .else(slack({ channel: '#support', text: 'Escalation needed' })),
  ],
});
```

---

## Self-Hosting

### Single Command

```bash
docker compose up -d
```

That's it. The compose file provisions:
- **app** — Next.js web app (port 3000)
- **worker** — Workflow execution worker
- **webhook** — Public webhook gateway (port 8081)
- **postgres** — PostgreSQL 16 (with healthcheck)
- **redis** — Redis 7 (for queue, cache, pub/sub)

### Kubernetes

```bash
helm install dliyio ./infrastructure/helm/dliyio
```

### Terraform (AWS)

```bash
cd infrastructure/terraform/aws
terraform init
terraform apply
```

---

## Security

- **Credentials at rest**: AES-256-GCM envelope encryption (KMS-managed master key)
- **Code sandbox**: Each Python/JavaScript execution runs in an isolated Docker container with resource limits and no network by default
- **Audit log**: Every workflow execution, credential access, and config change is logged
- **RBAC**: Workspace, organization, and global permission scopes
- **Webhook auth**: HMAC-SHA256 signatures on all webhook triggers

---

## Roadmap

### Shipped (v0.1)

- [x] Visual node editor (React Flow) with drag-and-drop, multi-handle nodes
- [x] **115+ pre-built integrations** across 11 categories
- [x] JavaScript + Python code nodes (sandboxed)
- [x] **Real AI integration via GLM-4.6** (z-ai-web-dev-sdk) — LLM and Agent nodes call the live API
- [x] AI agents with tools, memory, and reasoning loops
- [x] LLM calls, RAG search, AI memory, image gen, transcription, sentiment, classification, translation, summarization
- [x] **AI Workflow Builder** — describe a workflow in plain English, AI generates the graph
- [x] **Expression engine** — `{{ $json.field }}`, `{{ $items[0].name }}`, `{{ $json.value > 100 }}` actually evaluate
- [x] Workflow execution engine (topological + queue-driven) with live per-node status
- [x] **Command palette** (Cmd/Ctrl+K) for fast navigation and node insertion
- [x] **Dark / light mode** toggle
- [x] Dashboard with KPIs + execution history + 7-day activity chart
- [x] Credentials manager with envelope encryption messaging
- [x] 6 pre-built workflow templates
- [x] **API Docs explorer** with cURL/JS/Python examples
- [x] **Custom Node Builder** — visually design a node, export TypeScript SDK code
- [x] **Execution Timeline** (Gantt-style) showing per-node timing
- [x] Docker + docker-compose + Helm chart for self-host

### Planned (v0.2+)

- [ ] Vector DB integration (pgvector, Pinecone, Weaviate)
- [ ] Multi-agent orchestration (LangGraph-style)
- [ ] Workflow versioning + rollback
- [ ] Real-time execution streaming via WebSocket
- [ ] Mobile apps (iOS, Android)
- [ ] On-prem enterprise SSO (SAML, LDAP)

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening a PR.

```bash
# Fork & clone
git clone https://github.com/<your-username>/dliy-io.git
cd dliy-io

# Install deps
bun install

# Set up pre-commit hooks
bun run prepare

# Start dev server
bun run dev
```

---

## License

**MIT** — see [LICENSE](LICENSE).

---

## Credits

**dliy io** is built and maintained by the **Death Legion Team**.

Built with [Next.js](https://nextjs.org/), [React Flow](https://reactflow.dev/),
[Prisma](https://www.prisma.io/), [Tailwind CSS](https://tailwindcss.com/),
and [shadcn/ui](https://ui.shadcn.com/).
