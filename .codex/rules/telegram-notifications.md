# Telegram Notification Rules

## Thread Routing (MANDATORY)

| Thread ID | Who Reports | Purpose | Script |
|-----------|------------|---------|--------|
| `718` | System (auto) | **Changelog & Master Doc** - features released, version bumps, subagent completion | `send-changelog.js` |
| `727` | Product-Designer, Frontend-Developer, Backend-Developer | **Design & Dev Working** - wireframes, implementation, coding updates | `send-dev-report.js` |
| `735` | QA-Tester ONLY | **Pre-Commit Test Reports** - test results, quality gates, security validation | `test-pre-commit.js --telegram` |

### Thread Routing Rules

**IMPORTANT:**
- ❌ QA-Tester **DOES NOT** report to 727
- ❌ Design/Devs **DO NOT** report to 735
- ✅ 718 chỉ cho changelog & Master Doc updates (auto-triggered)
- ✅ 727 cho Product-Designer, Frontend, Backend
- ✅ 735 CHO TESTS ONLY (QA-Tester)

### Thread 718 - Changelog & Master Doc

**Khi nào gửi:**
- ✅ PR merged to main
- ✅ Feature released
- ✅ Master Doc updated với tất cả subagent changelogs
- ✅ Version bump trong package.json
- ✅ Tất cả subagents complete & QA PASS

**Không gửi khi:**
- ❌ Individual subagent updates
- ❌ In-progress work
- ❌ Test results

### Thread 727 - Design & Dev Working

**Khi nào gửi:**
- ✅ Product-Designer hoàn thành wireframes/mockups
- ✅ Frontend-Developer hoàn thành implementation
- ✅ Backend-Developer hoàn thành APIs
- ⚠️ Dev blocked (waiting for user approval)
- ✅ Bug fixes, coding, checklist updates

**Không gửi khi:**
- ❌ Test results (dùng 735)
- ❌ Changelog releases (dùng 718)

### Thread 735 - Pre-Commit Test Reports

**Khi nào gửi:**
- ✅ Pre-commit test suite completed
- ✅ Automated tests completed
- ✅ Manual testing completed
- ❌ Quality gate failed
- ✅ Security tests completed

**Không gửi khi:**
- ❌ Design updates (dùng 727)
- ❌ Code implementation (dùng 727)
- ❌ Individual test development

---

## When to Send Changelog to Telegram (Thread 718)

**ALWAYS** send a changelog notification when ANY of these occur:

### 🚀 Trigger Conditions

1. **Major Feature Added**
   - New user-facing functionality
   - New API endpoints
   - New integrations (AI providers, payment, etc.)

2. **Security Changes**
   - Authentication/authorization updates
   - CORS/rate limiting/security middleware changes
   - Vulnerability fixes
   - Environment variable changes
   - Any hardcoded secrets removed

3. **Breaking Changes**
   - API contract changes
   - Database schema migrations
   - Removed/deprecated features
   - Configuration changes

4. **Deployment/Release**
   - Version bump in package.json
   - Production deployment
   - Major refactoring completed

5. **User Requests**
   - When user explicitly asks: "send changelog", "notify telegram", "update telegram"
   - When user asks to generate a changelog summary

### 📋 How to Send

Use the changelog script with appropriate parameters:

```bash
node scripts/send-changelog.js \
  --title "Brief Summary" \
  --category "feature|fix|security|deployment|breaking" \
  --changes "Change 1\nChange 2\nChange 3"
```

**Category Options:**
- `feature` ✨ - New functionality
- `fix` 🐛 - Bug fixes
- `security` 🔒 - Security improvements
- `deployment` 🚀 - Releases/deployments
- `breaking` ⚠️ - Breaking changes
- `performance` ⚡ - Performance improvements
- `refactor` ♻️ - Code restructuring

### 📝 Format Guidelines

**Keep changes concise:**
- Max 10 items per notification
- Start with action verbs (Added, Fixed, Removed, Updated)
- Include file names when relevant
- Highlight security items first

**Example:**
```bash
node scripts/send-changelog.js \
  --title "🔒 Security Fixes Applied" \
  --category "security" \
  --changes "Removed hardcoded credentials\nRestricted CORS to tnsthao94.online\nAdded request signature validation\nImplemented IP header sanitization"
```

### ⚠️ Important Notes

1. **Never commit .env** - The .env file contains Telegram credentials
2. **Thread fallback** - Script automatically retries without thread ID if topic not found
3. **HTML format** - Messages use HTML parse mode, not Markdown
4. **Timezone** - All timestamps in Asia/Ho_Chi_Minh (Vietnam)

### 🔧 Testing

Before sending, verify the message looks good:
```bash
# Dry run - just print the message
node scripts/send-changelog.js --title "Test" --changes "Test message"
```

## When NOT to Send

- Minor typos/whitespace changes
- Development tooling updates (linters, formatters)
- Comment-only changes
- Temporary debugging code
- Test file updates (unless they reveal security issues)

---

## Pre-Commit Test Reports (Thread 735)

**ALWAYS** send test results to Telegram when running pre-commit validation.

### 🚀 Trigger Conditions

1. **Pre-Commit Test Suite Completed**
   - All 6 test suites executed
   - Quality gate status determined
   - Ready/Not-ready for commit

2. **Security Test Results**
   - 5 CRITICAL vulnerability tests
   - Pass/fail status for each
   - CVSS scores coverage

3. **Quality Gate Status Change**
   - PASS → Ready to commit
   - FAIL → Block commit, fix required

4. **User Requests**
   - When user explicitly asks: "test before commit", "run pre-commit tests", "check if ready to commit"
   - When user asks to validate code quality

### 📋 How to Send

```bash
# Run tests and send report
node test-pre-commit.js --telegram

# Or use npm script
npm run test:pre-commit:telegram

# Verbose mode with report
node test-pre-commit.js --verbose --telegram
```

### 📝 Report Format

The test report includes:
- **📊 Test Results** - Total, passed, failed, skipped counts
- **📈 Pass Rate** - Percentage
- **⏱️ Duration** - Execution time
- **🎯 Readiness** - READY_FOR_COMMIT or NOT_READY
- **🔒 Security Coverage** - All 5 CRITICAL tests status
- **🚦 Quality Gate** - PASS or FAIL status
- **✅/❌ Failed Tests** - Detailed failure messages

### 📝 Example Output

```
✅ Pre-Commit Test Report
📅 Date: 04/04/2026 15:30
⏱️ Duration: 18.45s

📊 Results:
├─ Total: 50
├─ ✅ Passed: 48
├─ ❌ Failed: 2
└─ ⏭️ Skipped: 0

📈 Pass Rate: 96.0%
✅ Status: PASSED
🎯 Readiness: READY FOR COMMIT

🧪 Security Coverage:
├─ C-01: File Deletion (CVSS 9.8) ✅
├─ C-02: SQL Injection (CVSS 8.6) ✅
├─ C-03: Error Leakage (CVSS 7.5) ✅
├─ C-04: Password Hash (CVSS 8.1) ✅
└─ C-05: reCAPTCHA Key (CVSS 9.1) ✅

Quality Gate: PASS

✅ Ready to commit!
```

### ⚠️ Important Notes

1. **Always send on failure** - Team needs to know about blockers
2. **Include failure details** - Specific test names and error messages
3. **Tag responsible developer** - If known who made the changes
4. **Security failures are critical** - Must be fixed immediately
5. **Credentials in .env** - Never commit .env file

### 🎯 When to Send vs When NOT to Send

**ALWAYS Send:**
- ✅ Pre-commit test suite completed (pass or fail)
- ✅ Security tests completed (critical)
- ✅ Quality gate status determined
- ✅ User requested validation

**DO NOT Send:**
- ❌ Individual test runs (use full suite)
- ❌ Dry runs or testing the script itself
- ❌ Intermediate test development

---

## Dev Working Reports (Thread 727)

Send dev working reports for active development tasks. Auto-includes modified files.

### 🚀 Trigger Conditions

1. **Bug Fix Completed**
2. **Feature Implementation Progress**
3. **Checklist/Todo Items**
4. **Processing/Task Status Updates**

### 📋 How to Send

```bash
node scripts/send-dev-report.js "Brief title" "Summary of changes"

# Or with explicit flags:
node scripts/send-dev-report.js \
  --title "Fix login bug" \
  --changes "Fixed session timeout\nAdded error handling"
```

### 📝 Auto-Reported Information

The script automatically includes:
- **📋 Todo Progress** (from `TODO.md`) — completed/pending with percentage
- **Modified files** (from `git status`)
- **Added files** (new files)
- **Deleted files** (removed files)
- **Diff stats** (lines changed per file)

### 📝 TODO.md Format

```markdown
# Todo List

- [x] Completed task 1
- [x] Completed task 2
- [ ] Pending task 3
- [ ] Pending task 4

*Last updated: 04/04/2026 14:30*
```

### 📝 Example Output

```
🛠️ Dev Working Report
📅 Date: 04/04/2026 14:30
📌 Title: FeatureCards redesign done

📋 Progress: 2/5 (40%)
   Updated: 04/04/2026 14:30

✅ Completed:
  ✓ Redesign FeatureCards with 3D carousel
  ✓ Fix theme consistency (light theme)

⏳ Pending:
  • Add glass-morphism card effects
  • Implement scroll-driven animations
  • Test on mobile devices

✅ Changes:
Implemented 3D carousel with glass-morphism cards
```
