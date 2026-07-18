# 46 — Admin Portal: Quality Assurance

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Quality Assurance defines the code review standards, pre-release checklist, and sign-off process for the Admin Portal. All features must pass QA before being merged to `main` and deployed to `admin.waly.app`.

---

## 2. Code Review Checklist

Before every pull request merge:

### Functionality
- [ ] Feature works as described in the related doc
- [ ] RBAC enforced — unauthorized roles cannot access the feature
- [ ] Destructive actions (delete, suspend, void) have confirmation dialogs
- [ ] Form validation prevents invalid data submission
- [ ] Error states are handled (loading spinners, error messages)
- [ ] Empty states are handled (no data found → friendly message)

### Code Quality
- [ ] No `console.log` statements in production code
- [ ] No hardcoded API URLs — all use `VITE_POCKETBASE_URL`
- [ ] TypeScript — no `any` types unless explicitly justified
- [ ] All new components have associated unit tests
- [ ] No unused imports or dead code

### UI/UX
- [ ] Page matches UI guidelines (colors, typography, spacing)
- [ ] Responsive — usable at 1280px minimum width
- [ ] Loading states shown for async operations
- [ ] Success/error toasts shown after mutations
- [ ] Table columns are sortable where applicable

---

## 3. Pre-Release QA Checklist

Before each release to `admin.waly.app`:

### Automated
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run test` passes with > 80% coverage
- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] Playwright E2E tests pass for all 7 critical flows

### Manual
- [ ] Login and logout work correctly
- [ ] Dashboard KPI cards load within 2 seconds
- [ ] Merchant approval flow works end-to-end (including notification)
- [ ] Fraud flag queue shows real-time updates (SSE)
- [ ] CSV export downloads a valid file
- [ ] All 4 admin roles tested (Super Admin, Ops, Analyst, Support)
- [ ] 403 screen shown for unauthorized role/page combination

---

## 4. Bug Severity Levels

| Level | Description | SLA |
|---|---|---|
| **P0 — Critical** | Data loss, security breach, admin locked out | Fix within 2 hours |
| **P1 — High** | Core workflow broken (can't approve merchants, can't adjust points) | Fix within 24 hours |
| **P2 — Medium** | Feature broken but workaround exists | Fix within 3 days |
| **P3 — Low** | UI glitch, minor UX issue | Next release |

---

## 5. Release Process

```
1. Feature branch PR opened
2. Code review (at least 1 reviewer)
3. CI pipeline runs: lint → test → build
4. QA manual checklist signed off
5. Merge to main
6. GitHub Actions auto-deploys to admin.waly.app
7. Smoke test on production (login, dashboard, key flow)
8. DONE ✅
```

---

## 6. Known Limitations (Phase 1)

| Limitation | Plan |
|---|---|
| No PDF export | Phase 2 |
| Dark mode not available | Phase 4 |
| No session timeout warning | Phase 3 |
| Global search not across all resources | Phase 2 |
| Audit log not surfaced in Admin Portal UI | Phase 3 |

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [45-testing-strategy.md](./45-testing-strategy.md) | Test tooling and coverage targets |
| [41-development-roadmap.md](../21-devops/41-development-roadmap.md) | Phase features |
| [42-deployment-process.md](../21-devops/42-deployment-process.md) | CI/CD pipeline |
