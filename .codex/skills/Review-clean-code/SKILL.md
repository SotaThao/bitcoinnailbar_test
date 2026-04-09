---
name: Review-clean-code
description: >
  Remove console/debug logging, verify structure against frontend rules/skills,
  then commit with subject = current branch name and body = minimal change summary.
argument-hint: "Optional: paths or 'staged only'"
metadata:
  author: CryptoMap360 Team
  version: 2.3.0
  model: "claude-opus-4-6"
  ide: "cursor"
---

# Review Clean Code — logs, structure, commit

## Purpose

1. **Logger cleanup** — Remove `console.log`, `console.error`, `console.warn`, `console.debug`, and `console.info` from touched source files so production code has no ad-hoc debugging leftovers.
2. **Structure & conventions** — After cleanup, verify edits align with project **rules** and **skills** (primary reference: `.cursor/skills/frontend-code-standards/SKILL.md`; also respect applicable `.cursor/rules/*.mdc` such as `agent-workflow.mdc`, `frontend-ui-ux-design.mdc`, `plan-workflow.mdc` when relevant).
3. **Commit** — When checks are done and fixes are applied, **create one commit** whose **first line (subject) is the current Git branch name** and whose **body** is a short description of what changed — optionally enriched from a **GitHub issue** (see **GitHub API & token** below).

## When to Activate

- User says: **「Tạo commit」** or **「Create Commit」** (or close variants like **「chạy commit」**) — **workspace rule:** `.cursor/rules/agent-workflow.mdc` §4 routes these phrases to **this skill**; run the full workflow including commit.
- User says: "review clean code", "clean logs before PR", "remove console", "clean logger", "PR clean", "align with frontend standards before commit"
- User wants a **pass** that combines **log removal + convention check + commit** (branch name as title)

## Model Requirement (Cursor IDE)

| Field | Value |
|-------|-------|
| **IDE** | Cursor |
| **Model** | **Claude Opus 4.6** (`claude-opus-4-6`) |
| **Why** | Opus 4.6 provides the most accurate detection of dead code, subtle console patterns, and import-order violations — critical for PR-quality reviews |

**Cursor settings:** When user triggers this skill (e.g. "Tạo commit"), Cursor must use **Opus 4.6** as the active model. If a different model is active, the agent should warn the user before proceeding.

## Authority order (what “correct structure” means)

1. **`.cursor/skills/frontend-code-standards/SKILL.md`** — File naming, import order, component layout (interface → function → hooks → derived → handlers → JSX), TypeScript, Tailwind `cn()`, API via `services/` only, TanStack Query + Zustand usage.
2. **`.cursor/rules/`** — Workspace rules that apply to the files being edited (do not contradict skills; use rules for workflow/UI/plan context).
3. **Existing code in the same folder** — Match local patterns when the skill is silent.

If a conflict appears between an old file and the skill, **prefer bringing the changed code up to the skill** for the lines you touch; avoid drive-by rewrites of unrelated files.

## Workflow

### Step 0: PR Checklist Review (Trước khi commit)

Trước khi thực hiện workflow, **kiểm tra PR checklist** để đảm bảo code đã sẵn sàng:

#### 🧹 **Clean Code & Hygiene**
- [ ] **Remove Logs:** Đã xóa toàn bộ `console.log`, `console.debug` hoặc các lệnh in log không cần thiết
- [ ] **No Hard-coding:** Các tham số (API URL, ID, hằng số cấu hình) đã được đưa vào file `environment`, `.env` hoặc `Constants`
- [ ] **Clean Logic:** Loại bỏ các biến khai báo nhưng không sử dụng, code thừa (dead code)

#### ⚙️ **Git & Configuration**
- [ ] **Gitignore:** Đã kiểm tra file `.gitignore`, đảm bảo không commit các file `.test.ts` hoặc file cấu hình cá nhân
- [ ] **File Review:** Đã kiểm tra tab "Files changed" để đảm bảo không đẩy nhầm file rác hoặc file không liên quan lên repo

#### 🛡️ **Logic & Stability**
- [ ] **Error Handling:** Các đoạn code quan trọng/gọi API đã có `try-catch` hoặc xử lý lỗi để tránh crash ứng dụng
- [ ] **Null-safety:** Đã sử dụng Optional Chaining (`?.`) hoặc check null/undefined cho các object/array
- [ ] **Performance:** Kiểm tra các vòng lặp hoặc logic xử lý nặng để đảm bảo không gây giật lag (Performance bottlenecks)

#### ✅ **Final Verification**
- [ ] **Local Build:** Code đã chạy thành công ở local và không gây lỗi cho các tính năng hiện có
- [ ] **Reviewer:** Đã tag đúng người review hoặc sử dụng `@copilot /review` để kiểm tra sơ bộ

**Nếu phát hiện vấn đề:** Dừng workflow và thông báo cho user về các vấn đề cần fix trước khi commit.

### Step 1: Scope

Prefer **staged** files; if nothing is staged, use **modified** files in the current task scope (or paths the user gave).

```bash
git diff --cached --name-only
git diff --name-only
git branch --show-current
```

Record **branch name** — you will use it as the **commit subject** verbatim.

### Step 2: Logger scan & removal

For each relevant `.ts`, `.tsx`, `.js`, `.jsx` file in scope, search for:

`console.log`, `console.error`, `console.warn`, `console.debug`, `console.info`

```bash
rg "console\.(log|error|warn|debug|info)\(" -n --glob "*.ts" --glob "*.tsx"
```

- Remove **entire lines** of standalone `console.*` calls; in `try/catch`, remove only the `console` line and keep `throw`/handling.
- Do **not** strip intentional production logging libraries (e.g. Sentry, structured loggers) unless the user asked to remove those too.
- Re-run search to confirm **zero** remaining `console.*` in edited files.

**Kiểm tra hard-coded values** (từ PR checklist):
- Tìm các API URLs, IDs, constants hard-coded trong code
- Đề xuất di chuyển vào `environment.ts`, `.env`, hoặc `Constants` nếu phát hiện

```bash
rg "https?://[^\s\"']+" -n --glob "*.ts" --glob "*.tsx"  # Tìm hard-coded URLs
rg "console\.|debugger|alert\(" -n --glob "*.ts" --glob "*.tsx"  # Tìm debug statements
```

### Step 3: Structure & convention check (on the same files)

For each file you modified or that is in scope, verify **at least**:

| Check | Reference |
|-------|-----------|
| **Import order** | React → third-party → `@/` (config → lib → services → stores → hooks → contexts → models → components → utils) → relative → types — blank line between groups |
| **Component structure** | Interface/types → component → hooks → derived state → handlers → return JSX |
| **API access** | No raw `fetch` in UI for app APIs; use `services/` + `BaseService` patterns |
| **Types** | Prefer `import type`; interfaces in `src/models/` when shared; avoid `any` |
| **Styling** | Tailwind + `cn()`; avoid inline styles unless already standard in file |
| **Noise** | No dead code introduced; removals don’t leave unused imports (clean up if you caused them) |

If something is wrong **in the lines you touched**, fix it. If the file is wildly off-standard but you didn’t touch it, **don’t** refactor the whole file — stay within the user’s scope.

### Step 4: Verify

- Run **project-appropriate** checks if available, e.g. `pnpm exec tsc --noEmit` or lint script from `package.json`, for confidence after edits.
- Ensure `git diff` shows only intentional changes.

**PR Checklist - Final Verification:**

| Check | Command/Action |
|-------|----------------|
| **Local Build** | `pnpm build` hoặc `pnpm dev` - verify no errors |
| **Gitignore check** | `git status` - ensure no `.test.ts`, config files, or unrelated files |
| **Files changed review** | `git diff --stat` - verify only intended files modified |
| **Error handling** | Visual scan for API calls without try-catch |
| **Null-safety** | Look for unsafe property access, suggest `?.` |
| **Performance** | Check for large loops, suggest optimization if needed |

### Step 5: Commit (required after successful fix pass)

Only commit when **logger cleanup and/or structure fixes** were applied and the user expected this skill’s full flow (including commit).

**Subject (first line)** = **exact current branch name**:

```bash
BRANCH=$(git branch --show-current)
```

**Body (second part)** = **shortest clear description** of the code changes (English or Vietnamese per user preference; one short paragraph or a few bullets max).

Example:

```bash
git add -u
git add <paths-if-needed>
git commit -m "$BRANCH" -m "Remove console calls and align imports with frontend-code-standards in map components."
```

Rules:

- **Do not** put a generic message like "fix" or "update" alone — body must summarize **what** changed.
- If **no files changed** after review, **do not** create an empty commit; report “nothing to commit”.

### Auto-enrich commit body from GitHub issue (DEFAULT behavior)

**DEFAULT:** Tự động parse issue number từ branch name và fetch issue content từ GitHub API.

#### Step 5.1: Parse issue number từ branch name

Hỗ trợ các pattern sau:

| Pattern | Example | Issue Number |
|---------|---------|--------------|
| `*/{number}_*` | `fixbug/203_level-zoom...` | `203` |
| `*/{number}-*` | `feature/125-add-search...` | `125` |
| `*/*-{prefix}{number}*` | `fix/ABC-456-fix-bug...` | `456` |
| `*/issue-{number}*` | `fix/issue-789-update...` | `789` |

**Regex patterns (thử theo thứ tự):**

```bash
# Pattern 1: number_ (e.g., 203_level-zoom)
echo "$BRANCH" | grep -oP '\d+_[a-z]' | head -1 | grep -oP '^\d+'

# Pattern 2: number- (e.g., 125-add-search)  
echo "$BRANCH" | grep -oP '\d+-[a-z]' | head -1 | grep -oP '^\d+'

# Pattern 3: prefix-number (e.g., ABC-456, FE-789)
echo "$BRANCH" | grep -oP '[A-Z]+-\d+' | head -1 | grep -oP '\d+$'

# Pattern 4: issue-number (e.g., issue-999)
echo "$BRANCH" | grep -oP 'issue-\d+' | grep -oP '\d+$'
```

**PowerShell (Windows):**

```powershell
$branch = git branch --show-current
$issueNumber = $null

# Pattern 1: number_
if ($branch -match '(\d+)_[a-z]') { $issueNumber = $matches[1] }
# Pattern 2: number-
elseif ($branch -match '(\d+)-[a-z]') { $issueNumber = $matches[1] }
# Pattern 3: prefix-number
elseif ($branch -match '[A-Z]+-(\d+)') { $issueNumber = $matches[1] }
# Pattern 4: issue-number
elseif ($branch -match 'issue-(\d+)') { $issueNumber = $matches[1] }

if ($issueNumber) { Write-Host "Found issue: #$issueNumber" }
```

#### Step 5.2: Fetch issue từ GitHub (MCP server hoặc API)

**Phương pháp 1: GitHub MCP Server (Ưu tiên - không cần token)**

Khi GitHub MCP server đã được kết nối, dùng MCP tools để fetch issue:

```bash
# Lấy repo info từ .env.local (ưu tiên) hoặc git remote (fallback)
if [ -f .env.local ]; then
  source .env.local  # Reads GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_TOKEN
fi
REPO_OWNER=${GITHUB_REPO_OWNER:-$(git remote get-url origin | sed -E 's|.*/([^/]+)/([^/]+)(\.git)?$|\1|')}
REPO_NAME=${GITHUB_REPO_NAME:-$(git remote get-url origin | sed -E 's|.*/([^/]+)/([^/]+)(\.git)?$|\2|')}
```

Sau đó gọi GitHub MCP tool (qua MCP interface, không phải shell):
- Tool: `get_issue` hoặc `search_issues` với `repo:${OWNER}/${REPO} #${ISSUE_NUMBER}`

**Phương pháp 2: GitHub API (Fallback - cần GH_TOKEN environment)**

Nếu không có MCP server, dùng curl với `GITHUB_TOKEN` từ `.env.local` (hoặc `GH_TOKEN` từ environment):

```bash
# Lấy repo info từ .env.local (ưu tiên) hoặc git remote (fallback)
if [ -f .env.local ]; then
  source .env.local  # Reads GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_TOKEN
fi
REPO_OWNER=${GITHUB_REPO_OWNER:-$(git remote get-url origin | sed -E 's|.*/([^/]+)/([^/]+)(\.git)?$|\1|')}
REPO_NAME=${GITHUB_REPO_NAME:-$(git remote get-url origin | sed -E 's|.*/([^/]+)/([^/]+)(\.git)?$|\2|')}

# Fetch issue (chỉ cần GITHUB_TOKEN từ .env.local hoặc GH_TOKEN từ environment)
curl -sS \
  -H "Authorization: Bearer ${GITHUB_TOKEN:-$GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}"
```

**PowerShell (Windows):**

```powershell
# Đọc .env.local nếu tồn tại
$envLocal = Join-Path $PSScriptRoot "../../../.env.local"
if (Test-Path $envLocal) {
  Get-Content $envLocal | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
      [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim('"'), 'Process')
    }
  }
}

# Sử dụng biến từ .env.local hoặc fallback về git remote
$repoOwner = $env:GITHUB_REPO_OWNER
$repoName = $env:GITHUB_REPO_NAME
$githubToken = $env:GITHUB_TOKEN

if (-not $repoOwner -or -not $repoName) {
  $remoteUrl = git remote get-url origin
  $repoOwner = ($remoteUrl -replace '.*/([^/]+)/([^/]+)(\.git)?$', '$1')
  $repoName = ($remoteUrl -replace '.*/([^/]+)/([^/]+)(\.git)?$', '$2')
}

# Fetch issue
$headers = @{}
if ($githubToken) { $headers["Authorization"] = "Bearer $githubToken" }
$headers["Accept"] = "application/vnd.github+json"

$response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoOwner/$repoName/issues/$issueNumber" -Headers $headers
$issueTitle = $response.title
$issueBody = ($response.body -split "`n" | Select-Object -First 3) -join "`n"
```

**Parse response (lấy title + body):**

```bash
# Dùng jq để parse JSON
ISSUE_TITLE=$(echo "$RESPONSE" | jq -r '.title')
ISSUE_BODY=$(echo "$RESPONSE" | jq -r '.body' | head -3)  # 3 dòng đầu
```

#### Step 5.3: Generate commit body với issue content

**Format:**

```
<issue_title>

<first_2-3_lines_of_issue_body>

Refs #<issue_number>
```

**Ví dụ commit hoàn chỉnh:**

```bash
git commit -m "fixbug/203_level-zoom-khong-phu-hop-khi-search" \
  -m "Fix: Level zoom không phù hợp khi search

  Cập nhật zoom level phù hợp khi tìm kiếm merchant từ danh sách.
  Fix issue zoom bản đồ không đúng khi click từ merchant list.

  Refs #203"
```

### GitHub API & token (**MCP Server ưu tiên**)

| Rule | Detail |
|------|--------|
| **Phương pháp ưu tiên** | **GitHub MCP Server** - đã được auth sẵn, không cần token từ environment. |
| **Repo configuration** | **Đọc từ `.env.local`** (ưu tiên): `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`, `GITHUB_TOKEN`. Fallback về `git remote get-url origin` nếu không có `.env.local`. |
| **Token source** | Đọc từ `.env.local` (`GITHUB_TOKEN`) → environment variable (`GH_TOKEN`) → MCP server (đã auth sẵn). **Không** hardcode token trong repo, script, skill, hoặc chat. |
| **Không** | Không yêu cầu user **dán token** vào Cursor chat; không lưu token vào file đã commit; không dùng `.env.local` cho token trong CI. |
| **Nơi set (CI/fallback)** | CI: GitHub Actions `secrets.GITHUB_TOKEN` / custom secret; dev: `.env.local` hoặc `export GITHUB_TOKEN=ghp_...` trong shell. |
| **Khi không có token/MCP** | Gọi API **public** không cần token (rate limit thấp hơn); repo **private** hoặc quota → **không** fetch được issue qua API — dùng mô tả tay trong commit body, **đừng** xin token qua chat. |
| **API** | `GET https://api.github.com/repos/{owner}/{repo}/issues/{n}` với header `Authorization: Bearer <GITHUB_TOKEN>` khi có token; `Accept: application/vnd.github+json`. |
| **Default behavior** | **Tự động parse issue number** từ branch name → **đọc `.env.local`** để lấy repo info → **tự động fetch** issue content (qua MCP hoặc API) → **tự động enrich** commit body (không cần user cung cấp URL). |

Example (shell — token **never** echoed):

```bash
# bash - với GH_TOKEN từ environment (không cần .env.local)
curl -sS -H "Authorization: Bearer ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/ORG/REPO/issues/123"
```

**Scopes (Fine-grained PAT):** tối thiểu **Issues: Read-only** cho repo liên quan (và **Metadata** nếu GitHub yêu cầu).

Tham chiếu file mẫu env: **`.env.example`** (root repo).


## Important notes

1. **Console**: Default is remove all `console.*` in scope; clarify if the user wants to keep `console.error` in specific files.
2. **Structure**: This skill is a **lightweight** pass — full repo audits belong in a dedicated refactor or ESLint rollout.
3. **Commit identity**: Subject **must** be the branch name (`git branch --show-current`), not a conventional “feat:” string, unless the user overrides for that run.

## Commands reference

```bash
git branch --show-current
git diff --cached --name-only
git diff --name-only
git status
git diff
rg "console\.(log|error|warn|debug|info)\(" -n src/
```

## Example interaction

**User:** “Review clean code on staged files and commit.”

**Assistant:**

1. `git branch --show-current` → e.g. `feature/map-cluster-tuning`
2. List staged files; scan and remove `console.*`
3. Re-read edits for import order and component structure per `frontend-code-standards`
4. Run `tsc` or lint if configured
5. `git commit -m "feature/map-cluster-tuning" -m "Strip debug logs and reorder imports in GoogleMapView and cluster utils."`

### Example 2: Auto-fetch GitHub issue (default)

**User:** "Tạo commit"

**Assistant:**

1. `git branch --show-current` → `fixbug/203_level-zoom-khong-phu-hop-khi-search`
2. **Parse issue number:** Pattern `\d+_` → Issue **#203**
3. **Lấy repo info từ `.env.local`:**
   ```bash
   # Đọc .env.local (ưu tiên)
   cat .env.local
   # GITHUB_REPO_OWNER=vlink-group
   # GITHUB_REPO_NAME=crypto-map-360
   # GITHUB_TOKEN=ghp_...
   → OWNER=vlink-group, REPO=crypto-map-360
   ```
4. **Fetch issue qua GitHub MCP** (ưu tiên) hoặc API (fallback với `GITHUB_TOKEN` từ `.env.local`):
   ```bash
   # GitHub MCP (không cần token)
   # Hoặc fallback: curl -sS -H "Authorization: Bearer $GITHUB_TOKEN" \
   #   "https://api.github.com/repos/vlink-group/crypto-map-360/issues/203"
   ```
5. **Parse response:**
   - Title: "Level zoom không phù hợp khi search"
   - Body: "Khi click vào merchant từ danh sách, zoom level không đúng..."
6. **Scan & remove console logs** from staged files
7. **Verify structure** per `frontend-code-standards`
8. **Commit với enriched body:**
   ```bash
   git commit -m "fixbug/203_level-zoom-khong-phu-hop-khi-search" \
     -m "Fix: Level zoom không phù hợp khi search

     Khi click vào merchant từ danh sách, zoom level không đúng.
     Cần cập nhật zoom level phù hợp khi tìm kiếm.

     Refs #203"
   ```

## Tools

- Shell: git, ripgrep, package scripts; GitHub MCP server (ưu tiên) hoặc `curl` + `GH_TOKEN` environment variable (fallback)
- Read / StrReplace: edits
- Read `frontend-code-standards` skill when unsure about conventions

---

## Appendix: PR Checklist Template

### 🧹 Clean Code & Hygiene
- [ ] **Remove Logs:** Đã xóa toàn bộ `console.log`, `debug` hoặc các lệnh in log không cần thiết.
- [ ] **No Hard-coding:** Các tham số (API URL, ID, hằng số cấu hình) đã được đưa vào file `environment`, `.env` hoặc `Constants`.
- [ ] **Clean Logic:** Loại bỏ các biến khai báo nhưng không sử dụng, code thừa (dead code).

### ⚙️ Git & Configuration
- [ ] **Gitignore:** Đã kiểm tra file `.gitignore`, đảm bảo không commit các file `.test.ts` hoặc file cấu hình cá nhân.
- [ ] **File Review:** Đã kiểm tra tab "Files changed" để đảm bảo không đẩy nhầm file rác hoặc file không liên quan lên repo.

### 🛡️ Logic & Stability
- [ ] **Error Handling:** Các đoạn code quan trọng/gọi API đã có `try-catch` hoặc xử lý lỗi để tránh crash ứng dụng.
- [ ] **Null-safety:** Đã sử dụng Optional Chaining (`?.`) hoặc check null/undefined cho các object/array.
- [ ] **Performance:** Kiểm tra các vòng lặp hoặc logic xử lý nặng để đảm bảo không gây giật lag (Performance bottlenecks).

### ✅ Final Verification
- [ ] **Local Build:** Code đã chạy thành công ở local và không gây lỗi cho các tính năng hiện có.
- [ ] **Reviewer:** Đã tag đúng người review hoặc sử dụng `@copilot /review` để kiểm tra sơ bộ.

---
