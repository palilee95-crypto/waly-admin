# 48 — Admin Portal: Terms & Conditions

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

This document defines the acceptable-use policy and terms of access for the WALY Admin Portal. All admin portal users must agree to these terms as a condition of their access credentials.

---

## 2. Scope of Access

The WALY Admin Portal provides authorized WALY staff with access to:
- Customer account data and transaction history
- Merchant profiles and operational status
- Platform-wide analytics and financial data
- System configuration (fraud rules, tier thresholds)

**Access is granted solely for legitimate WALY operational purposes.**

---

## 3. Acceptable Use Policy

### 3.1 Permitted Activities
- Approving or rejecting merchant applications
- Assisting customers with account issues (points adjustments, voucher support)
- Monitoring platform health and fraud indicators
- Creating and managing campaigns and promotions
- Generating analytics reports for internal business decisions

### 3.2 Prohibited Activities

| Prohibited Action | Consequence |
|---|---|
| Accessing customer data for personal benefit | Immediate termination + legal action |
| Sharing admin credentials with unauthorized persons | Immediate termination |
| Exporting customer PII outside WALY systems | Immediate termination + PDPA liability |
| Performing unauthorized points adjustments | Termination + recovery of fraudulent points |
| Accessing admin portal from unsecured public networks | Warning → termination on repeat |
| Circumventing role-based access controls | Immediate termination |

---

## 4. Credential Management

| Requirement | Policy |
|---|---|
| Password strength | Minimum 12 characters, mixed case, numbers, symbols |
| Password rotation | Every 90 days |
| MFA | Required for Super Admin role (Phase 2 feature) |
| Credential sharing | Strictly prohibited |
| Lost/compromised credentials | Report to Super Admin immediately |

---

## 5. Device & Network Requirements

| Requirement | Standard |
|---|---|
| Browser | Chrome v120+, Firefox v120+, or Safari v17+ |
| Network | WALY corporate network or approved VPN |
| Device | WALY-issued or personally approved device |
| Screen lock | Must be enabled on all devices used to access the portal |

---

## 6. Audit and Monitoring

All admin portal access and actions are logged (see [44-logging.md](../22-monitoring-logging/44-logging.md)). By using the portal, all admin users consent to:
- Session logging (IP address, user agent, timestamps)
- Action audit logging (every create, update, delete operation)
- Real-time monitoring of unusual access patterns

---

## 7. Access Revocation

Admin access will be revoked immediately upon:
- Employment termination or resignation
- Role change that no longer requires portal access
- Violation of this acceptable-use policy
- Inactivity for more than 90 days

Super Admins are responsible for promptly deactivating accounts of departing staff.

---

## 8. Agreement

All admin portal accounts require explicit acceptance of these terms at first login. Agreement is recorded with timestamp and IP address in the `admin_audit_logs` collection.

---

## 9. Related Documents

| Doc | Description |
|---|---|
| [47-privacy-policy.md](./47-privacy-policy.md) | PDPA and privacy obligations |
| [05-user-role-permission.md](../03-security/05-user-role-permission.md) | Role-based access matrix |
| [28-admin-management.md](../14-backoffice/28-admin-management.md) | Account provisioning and deactivation |
