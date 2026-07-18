# 45 — Admin Portal: Testing Strategy

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The WALY Admin Portal testing strategy covers unit tests for utilities and hooks, integration tests for key user flows, and E2E tests for critical admin actions. The goal is a fast, reliable test suite that catches regressions before deployment.

---

## 2. Testing Stack

| Layer | Tool | Purpose |
|---|---|---|
| **Unit** | Vitest | Test utilities, helpers, data transforms |
| **Component** | React Testing Library | Test individual components in isolation |
| **Integration** | Vitest + MSW | Test Refine hooks with mocked PocketBase API |
| **E2E** | Playwright | Test full user flows in a real browser |

---

## 3. Unit Tests

Test pure functions and utility logic:

```typescript
// src/utils/__tests__/points.test.ts
import { describe, it, expect } from 'vitest';
import { calculateLiability, formatPoints } from '../points';

describe('calculateLiability', () => {
  it('should calculate monetary value at 0.01 MYR per point', () => {
    expect(calculateLiability(10000)).toBe(100);
  });

  it('should handle zero points', () => {
    expect(calculateLiability(0)).toBe(0);
  });
});

describe('formatPoints', () => {
  it('should format with comma separator', () => {
    expect(formatPoints(12345)).toBe('12,345');
  });
});
```

---

## 4. Component Tests

Test UI components with React Testing Library:

```typescript
// src/components/__tests__/StatusBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders "Active" for active status', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders "Pending" for pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
```

---

## 5. Integration Tests (Mock Service Worker)

Mock PocketBase API calls to test Refine hooks and form submissions:

```typescript
// src/pages/__tests__/merchant-approve.test.tsx
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.patch('*/api/collections/merchants/records/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, status: 'active' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('approving a merchant updates status to active', async () => {
  // render MerchantShow page, click Approve, assert status changes
});
```

---

## 6. E2E Tests (Playwright)

Critical paths tested end-to-end:

```typescript
// tests/e2e/merchant-approval.spec.ts
import { test, expect } from '@playwright/test';

test('admin can approve a pending merchant', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]',    'admin@waly.app');
  await page.fill('[name=password]', 'testpassword');
  await page.click('button[type=submit]');

  await page.goto('/merchants/pending');
  await page.click('text=View Details');     // open first pending merchant
  await page.click('button:has-text("Approve")');
  await page.click('button:has-text("Confirm")');

  await expect(page.locator('.ant-message-success')).toBeVisible();
});
```

**Critical E2E test scenarios:**
1. ✅ Login / Logout
2. ✅ Approve merchant
3. ✅ Suspend user
4. ✅ Adjust points
5. ✅ Resolve fraud flag
6. ✅ Create campaign
7. ✅ Export CSV

---

## 7. Test Coverage Targets

| Layer | Target Coverage |
|---|---|
| Unit (utilities) | > 90% |
| Component | > 70% |
| E2E (critical flows) | 100% of critical paths |

---

## 8. Running Tests

```bash
# Unit + Component tests
npm run test

# E2E tests (requires running dev server)
npm run dev &
npx playwright test

# Coverage report
npm run test -- --coverage
```

---

## 9. Related Documents

| Doc | Description |
|---|---|
| [46-quality-assurance.md](./46-quality-assurance.md) | QA checklist and sign-off |
| [42-deployment-process.md](../21-devops/42-deployment-process.md) | CI runs tests before deploy |
| [04-technology-stack.md](../02-system-architecture/04-technology-stack.md) | Full dependency list |
