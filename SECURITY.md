# Security Policy

## Reporting a Vulnerability

**Do NOT open public GitHub issues for security vulnerabilities.**

Instead, email security@death-legion.dev with:
- A description of the vulnerability
- Steps to reproduce (PoC if possible)
- Affected versions
- Suggested fix (optional)

We will acknowledge within **48 hours** and aim to ship a fix within **30 days**
for high-severity issues. Bounty rewards may be offered for novel findings.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.x     | ✅        |
| < 0.1   | ❌        |

## Security Measures

### Credentials
- AES-256-GCM envelope encryption (KMS-managed master key, per-credential data key)
- Plaintext is **never** logged, returned via API, or persisted unencrypted
- Masked in UI; full value only decrypted inside the sandboxed execution context

### Code Execution
- Custom JavaScript and Python run inside isolated Docker containers
- No network access by default (opt-in per node)
- Memory + CPU limits enforced
- Timeout enforced (default 30s)

### Webhooks
- HMAC-SHA256 signature verification
- Per-workflow secret rotation
- Rate limiting (100 req/min/IP, burst 20)

### Audit Trail
- Every workflow execution, credential access, config change is logged
- Logs are tamper-evident (append-only with hash chaining)
- Exportable to SIEM via OpenTelemetry

### Authentication
- NextAuth.js v4 with JWT + httpOnly cookies
- OAuth 2.0 with PKCE for supported providers
- Optional SSO (SAML, OIDC) on enterprise plans

### Dependency Security
- Dependabot enabled for all package ecosystems
- `bun audit` runs on every PR
- Snyk + Trivy scans on every Docker build
- Renovatebot for proactive upgrades
