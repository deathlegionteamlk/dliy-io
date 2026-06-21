# Pushing dliy io to GitHub — Step-by-Step

> **⚠️ Important:** The GitHub token you shared in chat (`ghp_...`) is compromised.
> **Revoke it immediately** at https://github.com/settings/tokens before doing anything else.

This guide walks you through pushing the dliy-io repo to your own GitHub account safely.

---

## Step 1: Revoke the Leaked Token

1. Go to https://github.com/settings/tokens
2. Find the token starting with `ghp_EdbQ...`
3. Click **Delete** (or **Regenerate** if you still need a token)
4. Done — you've prevented anyone from using it

## Step 2: Create a New GitHub Repository

1. Go to https://github.com/new
2. **Owner**: your username (e.g. `death-legion`)
3. **Repository name**: `dliy-io`
4. **Visibility**: Public (recommended — it's MIT-licensed open source) or Private
5. **Do NOT** initialize with README/license/gitignore — we already have those
6. Click **Create repository**

## Step 3: Generate a Fresh Personal Access Token

1. Go to https://github.com/settings/tokens?type=beta (fine-grained tokens — recommended)
2. Click **Generate new token**
3. **Token name**: `dliy-io-push`
4. **Expiration**: 30 days (or shorter if you only need to push once)
5. **Repository access**: Only select repositories → `dliy-io`
6. **Permissions** → Repository permissions:
   - **Contents**: Read and write
   - **Metadata**: Read-only (auto-selected)
7. Click **Generate token**
8. **Copy the token immediately** — you won't see it again
9. **Do NOT paste it anywhere except the git push command below**

## Step 4: Initialize and Push the Repo

Open a terminal in the `dliy-io/` directory and run:

```bash
cd dliy-io

# Initialize git
git init -b main

# Add all files (respecting .gitignore)
git add .

# First commit
git commit -m "feat: initial release of dliy io — workflow automation platform

- 115+ pre-built integrations across 11 categories
- Visual node editor (React Flow)
- Real AI integration via GLM-4.6 (z-ai-web-dev-sdk)
- AI Workflow Builder (chat → workflow)
- Expression engine ({{ $json.field }} interpolation)
- JavaScript + Python code nodes (sandboxed)
- AI agents with tools, memory, and reasoning loops
- Command palette (Cmd+K)
- Dark/light mode
- Dashboard with KPIs + 7-day activity chart
- Credentials manager with envelope encryption
- 6 pre-built workflow templates
- API Docs explorer with cURL/JS/Python examples
- Custom Node Builder (visual → TypeScript SDK code)
- Execution Timeline (Gantt-style)
- Docker + docker-compose + Helm chart for self-host
- 8 GitHub workflows (CI/CD/security/lint/tests/release/docker)
- MIT License

By Death Legion Team"

# Add your GitHub repo as remote
# Replace <YOUR-USERNAME> with your actual GitHub username
git remote add origin https://github.com/<YOUR-USERNAME>/dliy-io.git

# Push — you'll be prompted for username + password
# Username: your GitHub username
# Password: paste the fresh token you generated in Step 3
git push -u origin main
```

## Step 5: Verify

1. Visit `https://github.com/<YOUR-USERNAME>/dliy-io`
2. You should see all the files
3. The README will render with the architecture diagram and full structure tree

---

## Alternative: GitHub CLI (recommended)

If you have the `gh` CLI installed (https://cli.github.com/), this is even simpler:

```bash
cd dliy-io
git init -b main
git add .
git commit -m "feat: initial release of dliy io"

# Log in (opens a browser — no token pasting needed)
gh auth login

# Create the repo + push in one step
gh repo create dliy-io --public --source=. --remote=origin --push

# Set the description
gh repo edit --description "Open-source, self-hostable workflow automation platform — a more powerful alternative to Zapier. By Death Legion Team."
gh repo edit --add-topic workflow
gh repo edit --add-topic automation
gh repo edit --add-topic zapier-alternative
gh repo edit --add-topic open-source
gh repo edit --add-topic ai
gh repo edit --add-topic low-code
gh repo edit --add-topic self-hosted
gh repo edit --add-topic nextjs
gh repo edit --add-topic typescript
gh repo edit --add-topic react-flow
```

---

## After Pushing

1. **Enable GitHub Pages** (Settings → Pages → Source: `main` / root) if you want a public docs site
2. **Add repository secrets** for CI (Settings → Secrets and variables → Actions):
   - `NPM_TOKEN` — for publishing the SDK packages
   - `GITHUB_TOKEN` is automatic — no setup needed
3. **Set up branch protection** (Settings → Branches → Add rule):
   - Require status checks to pass before merging (CI, lint, security)
   - Require PR reviews (1+ approval)
4. **Add a logo + social preview** (Settings → General → Social preview)
5. **Create a release**:
   ```bash
   git tag -a v0.1.0 -m "v0.1.0 — Initial public release"
   git push origin v0.1.0
   ```
   Then go to Releases → Draft a new release → Select the tag → Publish

---

## If You Get Stuck

| Error | Fix |
|-------|-----|
| `fatal: remote origin already exists` | `git remote remove origin` then re-add |
| `Permission denied (publickey)` | Use HTTPS URL instead of SSH, or set up SSH keys |
| `Authentication failed` | Token expired or wrong scope — regenerate with `repo` scope |
| `refusing to allow an OAuth App to create or update workflow` | Use a Personal Access Token (classic) with `workflow` scope, not OAuth |

---

**Remember:** Never paste tokens in chat logs, screenshots, or commit messages. Use environment variables, password managers, or `gh auth login`.
