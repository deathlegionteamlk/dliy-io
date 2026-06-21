# Changelog

All notable changes to **dliy io** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial public release of dliy io
- Visual node editor with React Flow
- 52+ pre-built integrations across 11 categories (Triggers, AI, Actions, Logic, Code, Databases, Productivity, DevOps, Transform, Utilities, Communication)
- Custom JavaScript and Python code nodes with sandboxed execution
- AI Agent nodes with tools, memory, and reasoning loops
- LLM Call, RAG Search, AI Memory nodes
- Workflow execution engine (topological + queue-driven)
- Dashboard with KPIs, execution activity chart, recent workflows
- Credentials manager with envelope encryption (AES-256-GCM)
- 6 pre-built workflow templates (AI Support Bot, GitHub PR Notify, Lead Scoring, Stripe Receipt, Daily AI Digest, RAG Knowledge Bot)
- Docker + docker-compose for one-command self-hosting
- Execution history view
- Integrations catalog browser
- Settings view with deployment info
- Workflow save/load via Prisma + SQLite/Postgres

### Security
- HMAC-SHA256 webhook signatures
- AES-256-GCM envelope encryption for credentials
- Sandboxed code execution (Docker isolation)
- Audit logging for all workflow executions

## [0.1.0] — 2026-06-21

Initial public release by the Death Legion Team.
