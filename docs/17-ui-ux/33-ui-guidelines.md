# 33 — Admin Portal: UI Guidelines

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Portal uses **Ant Design v5** as its UI library, integrated with Refine's `@refinedev/antd` package. This document defines the design tokens, component conventions, and visual language for the portal.

---

## 2. Design Principles

| Principle | Description |
|---|---|
| **Clarity** | Data-dense but scannable — admins need to process information fast |
| **Consistency** | Use Ant Design components exclusively; no custom CSS overrides unless necessary |
| **Efficiency** | Keyboard shortcuts, quick actions, minimal clicks to accomplish tasks |
| **Trust** | Conservative color palette — green for healthy, orange/red for alerts |

---

## 3. Color Palette

| Token | Value | Use Case |
|---|---|---|
| **Primary** | `#6366f1` (Indigo) | Buttons, active nav, links |
| **Success** | `#52c41a` | Active status, earn points, approvals |
| **Warning** | `#fa8c16` | Pending status, liability alerts |
| **Error / Danger** | `#ff4d4f` | Fraud flags, suspensions, deletions |
| **Info** | `#1677ff` | Informational badges |
| **Background** | `#f5f5f5` | Page background |
| **Surface** | `#ffffff` | Cards, tables |
| **Text Primary** | `#1a1a2e` | Main content |
| **Text Secondary** | `#6c757d` | Labels, timestamps |

---

## 4. Ant Design Theme Config

```typescript
// src/App.tsx — ConfigProvider theme
const walyTheme: ThemeConfig = {
  token: {
    colorPrimary:        '#6366f1',
    colorSuccess:        '#52c41a',
    colorWarning:        '#fa8c16',
    colorError:          '#ff4d4f',
    borderRadius:         8,
    fontFamily:          "'Inter', -apple-system, sans-serif",
    fontSize:            14,
  },
  components: {
    Table:   { borderRadius: 8 },
    Card:    { borderRadius: 12 },
    Button:  { borderRadius: 6 },
    Badge:   { borderRadius: 4 },
  },
};
```

---

## 5. Typography

| Style | Font | Size | Weight |
|---|---|---|---|
| Page Title | Inter | 24px | 600 |
| Section Heading | Inter | 18px | 600 |
| Table Header | Inter | 13px | 500 |
| Body / Labels | Inter | 14px | 400 |
| Code / IDs | JetBrains Mono | 13px | 400 |

---

## 6. Status Badge Conventions

Always use consistent Ant Design `Tag` colors for status fields:

| Status | Tag Color | Example |
|---|---|---|
| `active` | `success` | <Tag color="success">Active</Tag> |
| `pending` | `warning` | <Tag color="warning">Pending</Tag> |
| `suspended` | `error` | <Tag color="error">Suspended</Tag> |
| `rejected` | `default` | <Tag color="default">Rejected</Tag> |
| `open` (fraud) | `error` | <Tag color="error">Open</Tag> |
| `resolved` | `success` | <Tag color="success">Resolved</Tag> |
| `dismissed` | `default` | <Tag color="default">Dismissed</Tag> |

---

## 7. Layout Conventions

- **Sidebar width:** 240px (collapsed: 64px)
- **Content max-width:** 1440px (centered)
- **Card padding:** 24px
- **Table row height:** 56px
- **Action buttons:** Always right-aligned in table `Actions` column
- **Destructive actions:** Always require confirmation modal before executing

---

## 8. Dark Mode

Ant Design v5 supports dark mode via `theme.darkAlgorithm`. Phase 1 ships with light mode only. Dark mode toggle will be added in Phase 2.

---

## 9. Related Documents

| Doc | Description |
|---|---|
| [34-user-flow.md](./34-user-flow.md) | Key admin user journeys |
| [35-ui-pages.md](../18-page-structure/35-ui-pages.md) | Page inventory |
| [36-navigation-structure.md](../18-page-structure/36-navigation-structure.md) | Sidebar nav structure |
