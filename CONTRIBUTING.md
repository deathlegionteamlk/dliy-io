# Contributing to dliy io

Thanks for your interest in contributing! This document covers the basics.

## Development Setup

```bash
# Requirements: Node.js 20+, Bun 1.1+, Docker

git clone https://github.com/death-legion/dliy-io.git
cd dliy-io
bun install
cp .env.example .env
bun run db:push
bun run dev
```

## Code Style

- **TypeScript everywhere** — strict mode, no `any` without justification
- **ESLint + Prettier** — enforced via pre-commit hook (`.husky/pre-commit`)
- **Conventional Commits** — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- **Changesets** — every PR that changes user-facing behavior needs a changeset

## Adding a New Integration

1. Pick a category under `nodes/` (e.g. `nodes/actions/myapp/`)
2. Use the node generator: `bun run generate:node myapp`
3. Implement the `run` function — see `examples/custom-nodes/` for templates
4. Add tests under `tests/unit/nodes/myapp.test.ts`
5. Add a changeset: `bun run changeset`
6. Open a PR

## Adding an AI Provider

1. Add the provider to `packages/ai-sdk/src/providers/`
2. Implement the `ChatProvider` interface
3. Add it to the model picker in `ai.llm` and `ai.agent` nodes
4. Add docs under `docs/integrations/ai/`

## Testing

```bash
bun run test           # unit + integration
bun run test:e2e       # Playwright
bun run test:watch     # TDD mode
```

## Releasing

Releases are automated via Changesets + GitHub Actions. To release:

1. Merge PRs with changesets to `main`
2. The `release.yml` workflow opens a "Version Packages" PR
3. Merge that PR → tags + npm publish + Docker build happen automatically

## Issues & Discussions

- **Bug reports**: Use the GitHub issue template
- **Feature requests**: Open a Discussion first
- **Security reports**: See [SECURITY.md](SECURITY.md) — do NOT open public issues
