# Backend Developer Implementation Guide

> Load from SKILL.md when executing Steps 2-3.

---

## Step 1: API Planning

### Endpoint Structure
```
src/
├── services/           # API service functions
│   ├── user.ts         # User-related API calls
│   ├── auth.ts         # Authentication
│   └── ...
├── api/                # API route handlers (if applicable)
│   └── ...
├── db/
│   ├── schema.ts       # Database schema definitions
│   └── migrations/     # Migration scripts
│       └── ...
└── types/
    └── api.ts          # API response types
```

---

## Step 2: Implementation Patterns

### API Service Function (MANDATORY structure)
```typescript
// src/services/user.ts

import { environment } from '@/config/environment';

export interface UserData {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

/**
 * Fetch user data by ID
 * @param userId - User identifier
 * @returns User data or null if not found
 * @throws Error if network fails or response is not ok
 */
export async function fetchUserById(userId: string): Promise<UserData | null> {
  const url = `${environment.apiUrl}/users/${userId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: UserData = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    throw new Error('Failed to fetch user: Unknown error');
  }
}

/**
 * Create a new user
 * @param request - User creation data
 * @returns Created user data
 * @throws Error if validation fails or network error
 */
export async function createUser(request: CreateUserRequest): Promise<UserData> {
  // 1. Input validation
  if (!request.name || request.name.trim().length === 0) {
    throw new Error('Validation error: name is required');
  }
  if (!request.email || !isValidEmail(request.email)) {
    throw new Error('Validation error: valid email is required');
  }

  const url = `${environment.apiUrl}/users`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }

    const data: UserData = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    throw new Error('Failed to create user: Unknown error');
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### Database Migration Pattern
```typescript
// src/db/migrations/001_create_users_table.ts

export const up = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_users_email ON users(email);
`;

export const down = `
  DROP TABLE IF EXISTS users;
`;
```

---

## Step 3: Security & Validation

### Mandatory Checks
| Check | How |
|-------|-----|
| No hardcoded secrets | Use `environment.ts` or `.env` |
| No API keys in code | Use environment variables |
| Input validation | Validate ALL inputs before processing |
| Null safety | Use `?.` or explicit null checks |
| Error handling | try-catch for ALL external calls |
| SQL injection | Use parameterized queries only |

### Common Vulnerabilities to Avoid
```typescript
// ❌ BAD — SQL injection
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ GOOD — Parameterized
const query = 'SELECT * FROM users WHERE id = ?';
const params = [userId];

// ❌ BAD — Hardcoded secret
const apiKey = 'sk-1234567890abcdef';

// ✅ GOOD — Environment variable
const apiKey = environment.apiKey;

// ❌ BAD — No input validation
async function createUser(name: string) { /* no checks */ }

// ✅ GOOD — Validate inputs
async function createUser(name: string) {
  if (!name || name.trim().length === 0) {
    throw new Error('Name is required');
  }
  // ... proceed
}
```

---

## Step 4: Unit Tests

```typescript
// src/services/__tests__/user.test.ts

import { fetchUserById, createUser } from '../user';

describe('fetchUserById', () => {
  it('returns user data for valid ID', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '1', name: 'Test', email: 'test@example.com' }),
      })
    );

    const result = await fetchUserById('1');
    expect(result).toEqual({ id: '1', name: 'Test', email: 'test@example.com' });
  });

  it('returns null for 404', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404 }));
    const result = await fetchUserById('999');
    expect(result).toBeNull();
  });
});

describe('createUser', () => {
  it('throws on invalid email', async () => {
    await expect(createUser({ name: 'Test', email: 'invalid' }))
      .rejects.toThrow('Validation error');
  });
});
```
