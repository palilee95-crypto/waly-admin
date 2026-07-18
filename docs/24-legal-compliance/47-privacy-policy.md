# 47 — Admin Portal: Privacy Policy

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

This document outlines the data privacy obligations that the WALY Admin Portal must adhere to, particularly regarding access to customer PII (Personally Identifiable Information), compliance with Malaysia's PDPA (Personal Data Protection Act 2010), and GDPR principles for any EU data subjects.

---

## 2. Data Categories Accessed by Admin Portal

| Data Category | Examples | Sensitivity |
|---|---|---|
| Customer PII | Name, phone number | High |
| Transaction data | Points history, dates | Medium |
| Device / session info | IP address, user agent | Medium |
| Financial data | Points liability, redemptions | High |
| Merchant data | Business name, owner info | Medium |

---

## 3. PDPA Compliance (Malaysia)

Under the Personal Data Protection Act 2010 (PDPA), WALY must:

| Obligation | How Admin Portal Complies |
|---|---|
| **Notice** | Admin staff informed via employment agreement of data access rights |
| **Consent** | Customer PII accessed for operational purposes only |
| **Data Integrity** | No modification of PII except for support purposes; all changes logged |
| **Security** | HTTPS-only, token-based auth, role-based access |
| **Retention** | Audit logs retained 2 years; deleted accounts retained 7 years for tax |
| **Access** | Customers can request data export — fulfilled by Support Agent role |

---

## 4. Admin Staff Data Access Policy

All admin portal users must agree to:

1. Access customer data only for legitimate operational purposes
2. Not export or share customer data outside WALY systems
3. Not cache or copy sensitive data to personal devices
4. Report any suspected data breach immediately to the CTO

---

## 5. PII Masking in Admin Portal

For non-critical views, phone numbers are partially masked:

```typescript
// Mask phone: "+60123456789" → "+601****6789"
const maskPhone = (phone: string) =>
  phone.slice(0, 4) + '****' + phone.slice(-4);
```

Full phone numbers are visible only on the User Detail page for Support Agents and above.

---

## 6. Data Breach Response

In the event of unauthorized access to admin portal:

1. Immediately revoke all admin_users tokens (`pb.authStore.clear()` on all sessions)
2. Change PocketBase superuser password
3. Notify affected customers within 72 hours (PDPA requirement)
4. File report with PDPA Commissioner if > 100 records affected
5. Conduct root cause analysis

---

## 7. Right to Erasure

When a customer requests account deletion:

1. Support Agent soft-deletes the user (`metadata.deleted_at`)
2. Name replaced with "Deleted User"
3. Phone number hashed (SHA-256)
4. Transaction history retained for 7 years (financial compliance)
5. Points balance zeroed via expire transaction

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [48-terms-conditions.md](./48-terms-conditions.md) | Admin portal acceptable-use terms |
| [06-authentication.md](../03-security/06-authentication.md) | Auth and session security |
| [44-logging.md](../22-monitoring-logging/44-logging.md) | Audit log retention |
