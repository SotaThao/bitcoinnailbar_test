# Commit & Pull Request Rules

## Overview
This document defines the rules and conventions for Git commits and Pull Requests in the Job360 repository.

**Reference Skill:** `.qwen/skills/Review-clean-code/SKILL.md`

---

## Rule 1: Commit Message Convention

### 1.1 Commit Subject (First Line)

**MANDATORY:** Commit subject **MUST** be the **exact current branch name**.

```bash
git branch --show-current
# Example output: feature/1_push-code
```

**Example:**
```bash
git commit -m "feature/1_push-code" -m "<body>"
```

**Why:** Easy traceability from commit → branch → issue/feature.

---

### 1.2 Commit Body Format

**Structure:**
```
<issue_title_from_github>

<first_2-3_lines_of_issue_description>

<code_changes_summary>

Refs #<issue_number>
```

**Example:**
```
Feature: Push code to repository

Implement automated code deployment pipeline with Git integration.
Support branch-based deployment and rollback strategies.

Changes:
- Add Git integration module
- Implement branch detection logic
- Update deployment configuration

Refs #1
```

---

### 1.3 Auto-Enrich Commit Body from GitHub Issue

**DEFAULT BEHAVIOR:** Tự động parse issue number từ branch name và fetch nội dung từ GitHub.

#### Step 1: Parse Issue Number từ Branch Name

**Supported patterns (try in order):**

| Pattern | Example | Issue Number |
|---------|---------|--------------|
| `*/{number}_*` | `feature/1_push-code` | `1` |
| `*/{number}-*` | `feature/125-add-search` | `125` |
| `*/*-{prefix}{number}*` | `fix/ABC-456-fix-bug` | `456` |
| `*/issue-{number}*` | `fix/issue-789-update` | `789` |

**Bash regex:**
```bash
# Pattern 1: number_ (e.g., 1_push-code)
echo "$BRANCH" | grep -oP '\d+_[a-z]' | head -1 | grep -oP '^\d+'

# Pattern 2: number- (e.g., 125-add)
echo "$BRANCH" | grep -oP '\d+-[a-z]' | head -1 | grep -oP '^\d+'

# Pattern 3: prefix-number (e.g., ABC-456)
echo "$BRANCH" | grep -oP '[A-Z]+-\d+' | head -1 | grep -oP '\d+$'

# Pattern 4: issue-number
echo "$BRANCH" | grep -oP 'issue-\d+' | grep -oP '\d+$'
```

**PowerShell (Windows):**
```powershell
$branch = git branch --show-current
$issueNumber = $null

if ($branch -match '(\d+)_[a-z]') { $issueNumber = $matches[1] }
elseif ($branch -match '(\d+)-[a-z]') { $issueNumber = $matches[1] }
elseif ($branch -match '[A-Z]+-(\d+)') { $issueNumber = $matches[1] }
elseif ($branch -match 'issue-(\d+)') { $issueNumber = $matches[1] }

if ($issueNumber) { Write-Host "Found issue: #$issueNumber" }
```

#### Step 2: Fetch Issue from GitHub

**Repository Configuration:**
- **Repo URL:** `https://github.com/PersonalProjectJob/Job360`
- **API Base:** `https://api.github.com/repos/PersonalProjectJob/Job360`
- **Issue Example:** `https://github.com/PersonalProjectJob/Job360/issues/2`

**Method 1: GitHub API (with token)**

```bash
# Bash
GITHUB_TOKEN="your_token"  # From .env.local or environment
ISSUE_NUMBER="2"

curl -sS \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/PersonalProjectJob/Job360/issues/${ISSUE_NUMBER}"
```

```powershell
# PowerShell
$headers = @{
  "Authorization" = "Bearer $env:GITHUB_TOKEN"
  "Accept" = "application/vnd.github+json"
}

$response = Invoke-RestMethod `
  -Uri "https://api.github.com/repos/PersonalProjectJob/Job360/issues/$issueNumber" `
  -Headers $headers

$issueTitle = $response.title
$issueBody = $response.body
```

**Method 2: Public API (no token, rate-limited)**
```bash
curl -sS "https://api.github.com/repos/PersonalProjectJob/Job360/issues/2"
```

#### Step 3: Generate Commit Message

**Template:**
```markdown
<issue_title>

<issue_body_first_3_lines>

<changelog_summary>

Refs #<issue_number>
```

**Full Example:**
```bash
git commit -m "feature/1_push-code" \
  -m "Push code to repository

  Implement automated code deployment pipeline with Git integration.
  Support branch-based deployment and rollback strategies.

  Changes:
  - Add Git integration module
  - Implement branch detection logic
  - Update deployment configuration
  - Add documentation

  Refs #1"
```

---

## Rule 2: Pre-Commit Checklist

**MANDATORY** before creating commit (from `.qwen/skills/Review-clean-code/SKILL.md`):

### 🧹 Clean Code & Hygiene
- [ ] **Remove Logs:** Đã xóa toàn bộ `console.log`, `console.debug`, `console.warn`, `console.error`, `console.info`
- [ ] **No Hard-coding:** Các tham số (API URL, ID, constants) đã đưa vào `environment`, `.env`, hoặc `Constants`
- [ ] **Clean Logic:** Loại bỏ biến không sử dụng, dead code

### ⚙️ Git & Configuration
- [ ] **Gitignore:** Kiểm tra `.gitignore`, không commit file `.test.ts` hoặc config cá nhân
- [ ] **File Review:** Kiểm tra "Files changed", không đẩy file rác hoặc file không liên quan

### 🛡️ Logic & Stability
- [ ] **Error Handling:** Code quan trọng/gọi API đã có `try-catch`
- [ ] **Null-safety:** Sử dụng Optional Chaining (`?.`) hoặc check null/undefined
- [ ] **Performance:** Kiểm tra vòng lặp nặng, tránh gây giật lag

### ✅ Final Verification
- [ ] **Local Build:** Code chạy thành công ở local, không lỗi tính năng hiện có
- [ ] **Reviewer:** Tag đúng người review hoặc dùng `@copilot /review`

---

## Rule 3: Pull Request Rules

### 3.1 PR Title Convention

**Format:**
```
<branch_name>: <short_summary>
```

**Examples:**
```
feature/1_push-code: Implement Git integration and deployment pipeline
bugfix/2_fix-login: Fix authentication token refresh on session expiry
hotfix/3_security-patch: Update dependencies to fix security vulnerabilities
```

**If branch name already descriptive:**
```
<branch_name>
```

---

### 3.2 PR Body Template

**MANDATORY structure:**

```markdown
## Summary
<Auto-generated from branch name and GitHub issue>

## Linked Issue (Development)
- **Issue:** #<issue_number>
- **Title:** <issue_title>
- **Link:** https://github.com/PersonalProjectJob/Job360/issues/<issue_number>
- **Status:** This PR implements and resolves the linked issue

> ⚠️ **MANDATORY:** Every PR MUST be linked to a corresponding GitHub issue.
> The issue number is auto-parsed from branch name and fetched from GitHub.

## Issue Description
<Fetched from GitHub issue body - first 5-10 lines>

## Changes Made
### Code Changes
- [ ] Change 1
- [ ] Change 2

### Documentation
- [ ] Updated Master Doc: `Docs/00-master/<filename>.md`
- [ ] Updated Product Doc: `Docs/01-product/<filename>.md`
- [ ] Updated Engineering Doc: `Docs/02-engineering/<filename>.md`
- [ ] Updated QA Doc: `Docs/03-qa/<filename>.md`

## Changelog (Code/Feature)
| Version | Date | Time | Author | Module | Description |
|---------|------|------|--------|--------|-------------|
| v1.0.0 | 2026-04-04 | 10:30 | @dev | Git Integration | Initial implementation |
| v1.0.1 | 2026-04-04 | 15:00 | @dev | Deployment | Add rollback support |

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests passed
- [ ] Manual testing completed
- [ ] No console logs in production code

## Checklist
### Pre-PR
- [ ] Code follows `Review-clean-code` skill guidelines
- [ ] All console logs removed
- [ ] No hard-coded values
- [ ] Error handling implemented
- [ ] Null-safety checks added

### Documentation
- [ ] Master Doc updated
- [ ] Engineering Doc updated
- [ ] QA Doc updated
- [ ] Changelog updated with timestamps

### Code Quality
- [ ] Self-review completed
- [ ] No dead code
- [ ] Import order follows `frontend-code-standards`
- [ ] TypeScript types correct (no `any`)

## Screenshots/Videos (if UI changes)
<!-- Add screenshots, screen recordings, or GIFs -->

## Deployment Notes
<!-- Any special deployment instructions -->

## Refs
- Issue: #<number>
- Branch: `<branch_name>`
- Docs: `Docs/<feature_folder>/`
```

---

### 3.3 PR-Issue Linking (MANDATORY)

**RULE:** Every PR **MUST** be linked to a corresponding GitHub issue in the "Development" section.

#### Workflow: Auto-Link PR to Issue

**Step 1: Parse issue number from branch name**
```bash
BRANCH=$(git branch --show-current)
# Example: feature/1_push-code → Issue #1
```

**Step 2: Fetch issue from GitHub**
```bash
curl -sS \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/PersonalProjectJob/Job360/issues/${ISSUE_NUMBER}"
```

**Step 3: Include issue link in PR body**
```markdown
## Linked Issue (Development)
- **Issue:** #1
- **Title:** Push code to repository
- **Link:** https://github.com/PersonalProjectJob/Job360/issues/1
- **Status:** This PR implements and resolves the linked issue
```

**Step 4: Use GitHub keywords to auto-close issue**
```markdown
## Description
This PR implements the feature described in issue #1.

**Closes #1**
```

**Supported GitHub Keywords:**
- `Closes #<number>` - Closes issue when PR merges
- `Fixes #<number>` - Same as Closes
- `Resolves #<number>` - Same as Closes
- `Refs #<number>` - References without closing

**Example PR Footer:**
```markdown
## Refs
- Closes #1
- Branch: `feature/1_push-code`
- Docs: `Docs/04-tasks/push-code-1_tasks_260404_v1.0.0.md`
```

#### Verification Checklist

Before creating PR, verify:
- [ ] Issue number parsed from branch name
- [ ] Issue fetched from GitHub API
- [ ] Issue title included in PR body
- [ ] Issue link present in "Linked Issue (Development)" section
- [ ] GitHub closing keyword used (`Closes #<number>`)
- [ ] PR will auto-close issue when merged

---

### 3.4 Auto-Assign PR

**MANDATORY:** Every PR **MUST** be auto-assigned to `PersonalProjectJob` (the repository owner).

**Method 1: GitHub CLI (`gh`)**
```bash
# Create PR and assign in one command
gh pr create \
  --head feature/1_push-code \
  --base test \
  --title "feature/1_push-code: <summary>" \
  --body "<pr_body>"

# Assign after creation
gh pr edit <PR_NUMBER> --add-assignee PersonalProjectJob
```

**Method 2: GitHub API**
```bash
# Assign PR via API after creation
curl -sS \
  -X PATCH \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -d '{"assignees":["PersonalProjectJob"]}' \
  "https://api.github.com/repos/PersonalProjectJob/Job360/pulls/<PR_NUMBER>"
```

**Method 3: `gh api` (Preferred)**
```bash
# Get PR number after creation
PR_NUMBER=$(gh pr view --json number -q .number)

# Assign owner
gh api --method PATCH repos/PersonalProjectJob/Job360/pulls/$PR_NUMBER \
  -f assignees[]=PersonalProjectJob
```

---

### 3.5 PR Target Branch Rule

**MANDATORY:** PR base branch is determined by source branch type:

| Source Branch Prefix | Target Base Branch | Reason |
|---------------------|-------------------|--------|
| `feature/*` | `test` | Features go to test branch for QA first |
| `bugfix/*` | `test` | Bug fixes go to test branch for QA first |
| `hotfix/*` | `main` | Hotfixes bypass test, merge directly to main |
| `release/*` | `main` | Releases merge to main |

**Logic (PowerShell):**
```powershell
$branch = git branch --show-current
if ($branch -match '^hotfix/') {
  $baseBranch = "main"
} else {
  $baseBranch = "test"
}
```

**Logic (Bash):**
```bash
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" == hotfix/* ]]; then
  BASE_BRANCH="main"
else
  BASE_BRANCH="test"
fi
```

**Examples:**

| Source Branch | Target Branch | Command |
|--------------|--------------|---------|
| `feature/1_push-code` | `test` | `gh pr create --base test` |
| `bugfix/2_fix-login` | `test` | `gh pr create --base test` |
| `hotfix/3_security-patch` | `main` | `gh pr create --base main` |
| `release/1.1.0` | `main` | `gh pr create --base main` |

---

### 3.6 Auto-Generate PR Content

**Step 1: Parse branch name**
```bash
BRANCH=$(git branch --show-current)
# Example: feature/1_push-code
```

**Step 2: Fetch GitHub issue**
```bash
# Fetch issue #1
curl -sS \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  "https://api.github.com/repos/PersonalProjectJob/Job360/issues/1"
```

**Step 3: Generate summary**
```markdown
## Summary

**Branch:** `feature/1_push-code`
**Issue:** #1 - Push code to repository

This PR implements automated code deployment with Git integration.
Supports branch-based deployment and rollback strategies.
```

**Step 4: Scan commits for changelog**
```bash
# Get all commits on current branch
git log origin/main..HEAD --oneline

# Format: hash | subject | author | date
git log origin/main..HEAD --format="%h | %s | %an | %ad" --date=short
```

**Step 5: Generate changelog table**
```markdown
## Changelog (Code/Feature)
| Commit | Date | Author | Description |
|--------|------|--------|-------------|
| abc1234 | 2026-04-04 | @dev | Add Git integration module |
| def5678 | 2026-04-04 | @dev | Implement branch detection |
```

---

### 3.7 Full PR Creation Workflow (With Issue Linking)

**Complete workflow from branch to PR with issue linking:**

```bash
# Step 1: Get branch name
BRANCH=$(git branch --show-current)

# Step 2: Parse issue number from branch
# Pattern 1: feature/1_push-code → 1
# Pattern 2: bugfix/123-fix-login → 123
ISSUE_NUMBER=$(echo "$BRANCH" | grep -oP '^\w+/(\d+)' | grep -oP '\d+$')

if [ -z "$ISSUE_NUMBER" ]; then
  echo "⚠️  Could not parse issue number from branch: $BRANCH"
  exit 1
fi

echo "📌 Found issue: #$ISSUE_NUMBER"

# Step 3: Fetch issue from GitHub
ISSUE=$(curl -sS \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/PersonalProjectJob/Job360/issues/${ISSUE_NUMBER}")

ISSUE_TITLE=$(echo "$ISSUE" | jq -r '.title')
ISSUE_BODY=$(echo "$ISSUE" | jq -r '.body' | head -3)

# Step 4: Determine base branch
if [[ "$BRANCH" == hotfix/* ]]; then
  BASE_BRANCH="main"
else
  BASE_BRANCH="test"
fi

# Step 5: Push branch
git push -u origin $BRANCH

# Step 6: Create PR with issue linking
gh pr create \
  --head $BRANCH \
  --base $BASE_BRANCH \
  --title "$BRANCH: Implement $ISSUE_TITLE" \
  --body "## Summary

**Branch:** \`$BRANCH\`
**Issue:** #$ISSUE_NUMBER - $ISSUE_TITLE

This PR implements the feature described in issue #$ISSUE_NUMBER.

## Linked Issue (Development)
- **Issue:** #$ISSUE_NUMBER
- **Title:** $ISSUE_TITLE
- **Link:** https://github.com/PersonalProjectJob/Job360/issues/$ISSUE_NUMBER
- **Status:** This PR implements and resolves the linked issue

## Issue Description
$ISSUE_BODY

## Changes Made
<Fetched from git log>

## Testing
- [ ] Pre-commit tests passed
- [ ] Manual testing completed

Closes #$ISSUE_NUMBER"

# Step 7: Auto-assign
PR_NUMBER=$(gh pr view --json number -q .number)
gh pr edit $PR_NUMBER --add-assignee PersonalProjectJob

echo "✅ PR created: #$PR_NUMBER"
echo "📌 Linked to issue: #$ISSUE_NUMBER"
```

---

## Rule 4: Clean Code Workflow (Before Commit/PR)

### 4.1 Full Workflow (from `Review-clean-code` skill)

```
Step 0: Review PR Checklist
  ↓
Step 1: Determine scope (staged or modified files)
  ↓
Step 2: Scan & remove console.* calls
  ↓
Step 3: Verify structure & conventions
  ↓
Step 4: Run build/lint checks
  ↓
Step 5: Create commit with branch name + enriched body
  ↓
Step 6: Push & create PR with auto-generated content
```

### 4.2 Commands Reference

```bash
# Step 1: Scope
git branch --show-current
git diff --cached --name-only
git diff --name-only

# Step 2: Remove console logs
rg "console\.(log|error|warn|debug|info)\(" -n --glob "*.ts" --glob "*.tsx"

# Step 3: Check structure (import order, etc.)
# Reference: .qwen/skills/frontend-code-standards/SKILL.md

# Step 4: Verify
pnpm exec tsc --noEmit  # TypeScript check
pnpm lint               # Linting
pnpm build              # Build check

# Step 5: Commit
git add -u
BRANCH=$(git branch --show-current)
git commit -m "$BRANCH" -m "<enriched_body>"

# Step 6: Push
git push origin $BRANCH
```

---

## Rule 5: Documentation Integration

### 5.1 PR Must Link to Documentation

Every PR **MUST** reference related documentation in `Docs/` folder:

```markdown
## Documentation
- **Master Doc:** [link to Docs/00-master/...]
- **Product Doc:** [link to Docs/01-product/...]
- **Engineering Doc:** [link to Docs/02-engineering/...]
- **QA Doc:** [link to Docs/03-qa/...]
```

### 5.2 Changelog Synchronization

**Code changelog** (in PR) ↔ **Doc changelog** (in Docs) must match:

| PR Changelog | Doc Changelog |
|--------------|---------------|
| Commit hash | Version number |
| Date + Time | Date + Time (HH:mm) |
| Author | Author |
| Description | Description |

**Example sync:**
```markdown
# PR Changelog
| Commit | Date | Time | Author | Description |
| abc1234 | 2026-04-04 | 10:30 | @dev | Add Git integration |

# Doc Changelog (in Engineering Doc)
| Version | Date | Time | Author | Description |
| v1.0.0 | 2026-04-04 | 10:30 | @dev | Add Git integration |
```

---

## Rule 6: Repository Configuration

### 6.1 GitHub Repository

- **URL:** `https://github.com/PersonalProjectJob/Job360`
- **Issues:** `https://github.com/PersonalProjectJob/Job360/issues`
- **Example Issue:** `https://github.com/PersonalProjectJob/Job360/issues/2`
- **Default Assignee:** `PersonalProjectJob` (auto-assigned on every PR per Rule 3.4)

### 6.2 Token Configuration

**Priority order:**
1. `.env.local` → `GITHUB_TOKEN` (dev environment)
2. Environment variable → `GH_TOKEN` or `GITHUB_TOKEN`
3. GitHub MCP server (if connected, preferred method)

**Security:**
- ❌ **NEVER** hardcode token in repo, scripts, skills, or chat
- ❌ **NEVER** ask user to paste token in chat
- ✅ Use fine-grained PAT with minimum **Issues: Read-only** scope

### 6.3 API Endpoints

```bash
# Fetch issue
GET https://api.github.com/repos/PersonalProjectJob/Job360/issues/{number}

# Headers
Authorization: Bearer ${GITHUB_TOKEN}
Accept: application/vnd.github+json
```

---

## Rule 7: Branch Naming & Documentation

### 7.1 Branch Format

```
feature/<issue-id>_<feature-description>
bugfix/<issue-id>_<bug-description>
hotfix/<issue-id>_<fix-description>
```

**Example:**
- `feature/1_push-code`
- `bugfix/2_fix-login-error`

### 7.2 Documentation Naming (from branch)

**Branch:** `feature/1_push-code`
**Date:** April 4, 2026 (`260404`)
**Version:** `v1.0.0`

```
Docs/
├── 00-master/push-code-1_master_260404_v1.0.0.md
├── 01-product/push-code-1_product_260404_v1.0.0.md
├── 02-engineering/push-code-1_engineering_260404_v1.0.0.md
├── 03-qa/push-code-1_qa_260404_v1.0.0.md
└── 04-tasks/push-code-1_tasks_260404_v1.0.0.md
```

---

## Quick Reference

### Create Commit (Full Workflow)
```bash
# 1. Check scope
git branch --show-current
git status

# 2. Remove console logs
rg "console\.(log|error|warn|debug|info)\(" -n

# 3. Fix & verify
pnpm build
pnpm lint

# 4. Commit with enriched body
BRANCH=$(git branch --show-current)
# Parse issue number from $BRANCH
# Fetch issue from GitHub API
# Generate commit body
git commit -m "$BRANCH" -m "<enriched_body>"

# 5. Push
git push origin $BRANCH
```

### Create PR (Auto-Generate Content with Issue Linking)
```bash
# 1. Parse branch name → get issue number
BRANCH=$(git branch --show-current)
ISSUE_NUMBER=$(echo "$BRANCH" | grep -oP '^\w+/(\d+)' | grep -oP '\d+$')

# 2. Determine base branch (Rule 3.5)
if [[ "$BRANCH" == hotfix/* ]]; then
  BASE_BRANCH="main"
else
  BASE_BRANCH="test"
fi

# 3. Fetch GitHub issue content
ISSUE=$(curl -sS \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/PersonalProjectJob/Job360/issues/${ISSUE_NUMBER}")
ISSUE_TITLE=$(echo "$ISSUE" | jq -r '.title')

# 4. Scan commits for changelog
git log origin/main..HEAD --oneline

# 5. Generate PR title: "<branch>: Implement <issue_title>"
# 6. Generate PR body with template (Rule 3.2)
#    - MUST include "Linked Issue (Development)" section
#    - MUST use "Closes #<number>" keyword
# 7. Create PR via GitHub CLI
gh pr create \
  --title "$BRANCH: Implement $ISSUE_TITLE" \
  --body "<pr_body_with_issue_link>" \
  --base $BASE_BRANCH \
  --head $BRANCH

# 8. Auto-assign (MANDATORY per Rule 3.4)
PR_NUMBER=$(gh pr view --json number -q .number)
gh pr edit $PR_NUMBER --add-assignee PersonalProjectJob

# 9. Verify issue linking
echo "✅ PR #$PR_NUMBER linked to Issue #$ISSUE_NUMBER"
```

---

## Examples

### Example 1: Feature Branch

**Branch:** `feature/1_push-code`

**Commit:**
```bash
git commit -m "feature/1_push-code" \
  -m "Push code to repository

  Implement automated code deployment pipeline with Git integration.
  Support branch-based deployment and rollback strategies.

  Changes:
  - Add Git integration module
  - Implement branch detection logic
  - Update deployment configuration

  Refs #1"
```

**PR Title:**
```
feature/1_push-code: Implement Git integration and deployment pipeline
```

**PR Body:** (Use template from Rule 3.2)

---

### Example 2: Bug Fix Branch

**Branch:** `bugfix/2_fix-login-error`

**Commit:**
```bash
git commit -m "bugfix/2_fix-login-error" \
  -m "Fix login error on session expiry

  Authentication token refresh fails when session expires.
  Users get logged out unexpectedly.

  Changes:
  - Fix token refresh logic
  - Add error handling
  - Update session management

  Refs #2"
```

**PR Title:**
```
bugfix/2_fix-login-error: Fix authentication token refresh on session expiry
```

---

## References

- **Clean Code Skill:** `.qwen/skills/Review-clean-code/SKILL.md`
- **Frontend Standards:** `.qwen/skills/frontend-code-standards/SKILL.md`
- **Documentation Rules:** `.qwen/rules/system-documentation-rules.md`
- **GitHub Repo:** `https://github.com/PersonalProjectJob/Job360`
