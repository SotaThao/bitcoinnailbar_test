# Engineer Documentation Rules

> Rules for **Frontend & Backend Developers** — responsible for Engineering Doc (Part 2: Technical implementation).

## Related Rules
- **Naming Conventions**: [doc-naming-conventions.md](./doc-naming-conventions.md)
- **Workflow**: [doc-workflow-rules.md](./doc-workflow-rules.md)
- **PM/Lead**: [doc-pm-lead-rules.md](./doc-pm-lead-rules.md)
- **Product Designer**: [doc-product-designer-rules.md](./doc-product-designer-rules.md)
- **QA Tester**: [doc-qa-tester-rules.md](./doc-qa-tester-rules.md)

---

## Rule 1: Engineering Document (Part 2 — Technical)

### 1.1 Location
```
Docs/02-engineering/<feature>-<ticket>_engineering_<yymmdd>_v<major>.<month>.<day>.md
```

### 1.2 When to Create
- **AFTER** Product Doc is created (need wireframes + component specs)
- **BEFORE** QA Doc
- Reference: `.qwen/skills/engineering-doc/SKILL.md`

### 1.3 Structure (FE + BE Split)
```markdown
# Engineering Document: [Feature Name]

## Frontend Section (Frontend-Developer chịu trách nhiệm)
### Components to Create
### UI Specifications (từ Product Doc)
### Implementation Details
### Changelog (Frontend updates)

## Backend Section (Backend-Developer chịu trách nhiệm)
### API Endpoints
### Database Schema
### Business Logic
### Changelog (Backend updates)

## Shared Section (Cả FE & BE cùng tham khảo)
### Architecture Overview
### Technical Decisions
### Security Considerations
### Performance Implications
```

---

## Rule 2: Frontend Section

### 2.1 Components to Create
For each new component:
```markdown
### Components to Create

#### 1. `src/app/components/xxx/ComponentName.tsx` (NEW)
**Purpose**: [What this component does]

**Structure**:
```tsx
// Brief component skeleton
```

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| ... | ... | ... | ... | ... |

**Dependencies**:
- Library 1 (already installed / need to install)
- Internal module 2

**Sub-components**:
- SubComponent1: [purpose]
- SubComponent2: [purpose]
```

### 2.2 UI Specifications (từ Product Doc)
Reference wireframes and breakpoints from Product Doc:
```markdown
### UI Specifications (từ Product Doc)

#### Component Layout
| Property | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| ... | ... | ... | ... |

#### Animation Strategy
```tsx
// Animation approach (motion/react, CSS, etc.)
```

#### Responsive Design
- Breakpoints used
- Grid/flex configuration
```

### 2.3 Implementation Details
```markdown
### Implementation Details

#### File Changes Summary
| File | Action | Type | Description |
|------|--------|------|-------------|
| src/... | Create/Modify | FE/Shared | ... |

#### State Management
- Component state approach (useState, useReducer, context)
- Data flow

#### i18n Keys Added
```typescript
// New translation keys structure
```

#### Icon/Asset Mapping
```typescript
// Icon mapping if applicable
```
```

### 2.4 Frontend Checklist
- [ ] Components follow existing patterns (check similar components in codebase)
- [ ] All styling uses CSS variables (no hardcoded colors/sizes)
- [ ] Responsive design tested at 3 breakpoints
- [ ] i18n keys added to BOTH `vi.ts` and `en.ts`
- [ ] No new dependencies without approval
- [ ] Animations use transform-only properties (no layout thrashing)
- [ ] TypeScript types defined for all props and state

---

## Rule 3: Backend Section

### 3.1 API Endpoints
For each new endpoint:
```markdown
### API Endpoints

#### `POST /api/v1/endpoint-name`
**Purpose**: [What this endpoint does]

**Request**:
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**:
```json
{
  "field1": "string",
  "field2": "number"
}
```

**Response** (200 OK):
```json
{
  "data": { ... },
  "message": "Success"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Error message"
}
```

**Error Codes**:
| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_INPUT | ... |
| 401 | UNAUTHORIZED | ... |
| 403 | FORBIDDEN | ... |
| 500 | INTERNAL_ERROR | ... |
```

### 3.2 Database Schema
```markdown
### Database Schema

#### New Table: `table_name`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| created_at | TIMESTAMPTZ | NO | NOW() | Creation timestamp |
| ... | ... | ... | ... | ... |

#### RLS Policies
- Policy 1: Users can read own data
- Policy 2: Only admins can write
```

### 3.3 Business Logic
```markdown
### Business Logic

#### Flow
1. Receive request → validate input
2. Query database → transform data
3. Return response

#### Edge Cases
- Case 1: What happens when...
- Case 2: How to handle...
```

### 3.4 Backend Checklist
- [ ] API endpoints follow existing URL patterns
- [ ] Request validation on server-side (not just client)
- [ ] RLS policies defined for new tables
- [ ] Error responses use consistent format
- [ ] Rate limiting considered
- [ ] Sensitive data not logged or exposed

---

## Rule 4: Shared Section

### 4.1 Architecture Overview
```markdown
### Architecture Overview

#### Component Hierarchy
```
ParentComponent
├── ChildComponent1
│   └── GrandchildComponent
└── ChildComponent2
```

#### Data Flow
```
User Action → Component State → API Call → Response → UI Update
```
```

### 4.2 Technical Decisions
```markdown
### Technical Decisions

#### Decision 1: Why we chose X over Y
- **Context**: ...
- **Decision**: ...
- **Consequences**: ...
- **Alternatives considered**: ...
```

### 4.3 Security Considerations
```markdown
### Security Considerations
- [ ] No hardcoded secrets or API keys
- [ ] User input sanitized (XSS prevention)
- [ ] Authentication/authorization enforced
- [ ] Sensitive data encrypted at rest
- [ ] Rate limiting applied
```

### 4.4 Performance Implications
```markdown
### Performance Implications
- **Bundle size impact**: ~XKB gzipped
- **API response time target**: < Xms
- **Database query optimization**: Index on column X
- **Lighthouse target**: Maintain score > 90
```

---

## Rule 5: Engineer Checklist

### Before Starting Implementation
- [ ] Master Doc exists and is approved
- [ ] Product Doc exists (need wireframes + component specs)
- [ ] Design System Audit reviewed (know which tokens to use)
- [ ] Branch name parsed correctly

### After Creating Engineering Doc
- [ ] Architecture overview documented
- [ ] All new components listed with props and dependencies
- [ ] API endpoints specified (if applicable)
- [ ] Database schema changes documented (if applicable)
- [ ] Security considerations addressed
- [ ] Performance implications assessed
- [ ] "Related Documents" section includes links to Master + Product docs
- [ ] Changelog table with HH:mm timestamps
- [ ] Version number follows naming convention

### Before Starting Code
- [ ] Engineering Doc reviewed by Tech Lead
- [ ] All dependencies confirmed available
- [ ] i18n keys planned for all user-facing text
- [ ] Test strategy reviewed (coordinate with QA Tester)

### During Implementation
- [ ] Follow existing code patterns (check similar files)
- [ ] No hardcoded values — use CSS variables and i18n keys
- [ ] TypeScript types for all props, state, and API responses
- [ ] Components under 300 lines (split if larger)
- [ ] No secrets or API keys committed

### After Implementation
- [ ] `npm run build` passes without errors
- [ ] TypeScript type-checking passes
- [ ] Manual testing completed per QA Doc test cases
- [ ] Code follows project conventions (naming, formatting)
