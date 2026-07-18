# 24 — Admin Portal: Velocity Rules

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Velocity rules define the thresholds that trigger fraud flags. When a customer's point-earning activity exceeds a configured limit within a rolling time window, a `fraud_flag` record is automatically created. Admins can configure these rules via the Admin Portal.

---

## 2. Default Velocity Rules

| Rule Name | Trigger Condition | Severity |
|---|---|---|
| `high_velocity_earn` | > 500 pts earned in 10 minutes | High |
| `rapid_transactions` | > 10 transactions in 30 minutes | Medium |
| `single_tx_ceiling` | Single transaction > 1,000 pts | Medium |
| `daily_limit` | > 2,000 pts earned in 24 hours | Low |
| `multi_merchant_burst` | > 5 different merchants in 1 hour | Low |

---

## 3. Velocity Rules Page (`/fraud/velocity-rules`)

> ⚠️ Only Super Admins can edit velocity rules.

```typescript
const { tableProps } = useTable<VelocityRule>({
  resource: 'velocity_rules',
  sorters: { initial: [{ field: 'created', order: 'asc' }] },
});
```

**Table columns:** Rule Name, Description, Max Points, Max Transactions, Window (min), Status, Actions

---

## 4. VelocityRule Schema

```typescript
interface VelocityRule {
  id:               string;
  rule_name:        string;       // unique identifier
  description:      string;       // human-readable explanation
  max_points:       number;       // points threshold (0 = no limit)
  max_transactions: number;       // tx count threshold (0 = no limit)
  time_window_min:  number;       // rolling window in minutes
  severity:         'low' | 'medium' | 'high';
  is_active:        boolean;
}
```

---

## 5. Edit Velocity Rule

```typescript
const { formProps } = useForm<VelocityRule>({
  resource: 'velocity_rules',
  action: 'edit',
  id: ruleId,
});
```

Editing a rule only affects **future** transactions. Existing open flags created under the old threshold are not retroactively changed.

---

## 6. How Rules Are Evaluated

Rules are evaluated in PocketBase hooks (`pb_hooks/`) after each `transactions` record is created:

```javascript
// pb_hooks/transactions.pb.js (pseudocode)
onRecordAfterCreate('transactions', async (e) => {
  const rules = await $app.dao().findRecordsByFilter('velocity_rules',
    'is_active = true', '', 0, 0, null
  );

  for (const rule of rules) {
    const windowStart = new Date(Date.now() - rule.time_window_min * 60000);

    const recentTxns = await $app.dao().findRecordsByFilter('transactions',
      `user = '${e.record.get('user')}' && created >= '${windowStart.toISOString()}'`,
      '', 0, 0, null
    );

    const totalPoints = recentTxns.reduce((s, t) => s + t.get('points'), 0);
    const txCount     = recentTxns.length;

    if (
      (rule.max_points > 0 && totalPoints > rule.max_points) ||
      (rule.max_transactions > 0 && txCount > rule.max_transactions)
    ) {
      // Create fraud flag
      await $app.dao().saveRecord(
        new Record($app.dao().findCollectionByNameOrId('fraud_flags'), {
          user:        e.record.get('user'),
          transaction: e.record.getId(),
          rule:        rule.get('rule_name'),
          severity:    rule.get('severity'),
          status:      'open',
        })
      );
    }
  }
});
```

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [23-fraud-flags.md](./23-fraud-flags.md) | Fraud flag review queue |
| [08-database-schema.md](../04-database/08-database-schema.md) | velocity_rules schema |
| [44-logging.md](../22-monitoring-logging/44-logging.md) | PocketBase hook logs |
