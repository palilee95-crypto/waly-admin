# 25 — Admin Portal: Notification Management

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Notification Management module allows WALY operations admins to compose and broadcast push notifications, SMS, or in-app messages to targeted customer segments — without requiring engineering intervention. All notifications are stored in PocketBase and delivered via the existing Evolution API / WhatsApp hook.

---

## 2. Notification Types

| Type | Channel | Triggered By |
|---|---|---|
| `system` | In-app | Admin actions (approval, fraud, etc.) |
| `broadcast` | In-app + Push | Manual admin broadcast |
| `campaign` | In-app + Push | Campaign engine (auto) |
| `sms` | WhatsApp / SMS | Admin manual or Evolution API hook |

---

## 3. Broadcast Page (`/notifications/broadcast`)

The broadcast form allows targeting by user segment:

```typescript
interface BroadcastForm {
  title:   string;
  body:    string;
  type:    'broadcast';
  target:  'all' | 'tier' | 'merchant_customers' | 'custom_ids';

  // Conditional target options:
  tier?:       string;              // tier_id if target = 'tier'
  merchant?:   string;              // merchant_id if target = 'merchant_customers'
  user_ids?:   string[];            // explicit IDs if target = 'custom_ids'
}
```

---

## 4. Broadcast Implementation

```typescript
const broadcastNotification = async (form: BroadcastForm) => {
  // 1. Resolve target users
  let filter = '';
  if (form.target === 'tier')               filter = `tier_id = '${form.tier}'`;
  if (form.target === 'merchant_customers') {
    // Get user IDs from transactions where merchant = form.merchant
    const txns = await pb.collection('transactions').getFullList({
      filter: `merchant = '${form.merchant}'`,
      fields: 'user',
    });
    const userIds = [...new Set(txns.map(t => t.user))];
    filter = userIds.map(id => `id = '${id}'`).join(' || ');
  }

  const users = form.target === 'all'
    ? await pb.collection('users').getFullList({ fields: 'id' })
    : form.target === 'custom_ids'
    ? form.user_ids!.map(id => ({ id }))
    : await pb.collection('users').getFullList({ filter, fields: 'id' });

  // 2. Create notification record per user
  await Promise.all(
    users.map(user =>
      pb.collection('notifications').create({
        recipient: user.id,
        title:     form.title,
        body:      form.body,
        type:      'broadcast',
      })
    )
  );
};
```

---

## 5. Notification Templates

Pre-built templates for common broadcasts:

| Template | Title | Body |
|---|---|---|
| Campaign Launch | "🔥 New Campaign Live!" | "Double points this weekend at all participating merchants." |
| Tier Upgrade | "🎉 You've been upgraded!" | "Welcome to [tier]. Enjoy your new benefits." |
| System Maintenance | "🔧 Scheduled Maintenance" | "WALY will be down from [time] to [time]." |
| Reward Reminder | "⏰ Your reward expires soon" | "Redeem your points before [date]!" |

---

## 6. Target Audience Summary

Before sending, the broadcast form shows a preview count:

```
Recipients: 2,847 users
  - Tier: Gold + Platinum
  - Active in last 30 days: ✅
  - Estimated delivery: < 5 minutes
```

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [26-notification-logs.md](./26-notification-logs.md) | Delivery status and failure tracking |
| [17-campaign-management.md](../09-campaigns-promotions/17-campaign-management.md) | Campaign-triggered notifications |
| [09-merchant-onboarding.md](../05-merchant-management/09-merchant-onboarding.md) | Approval notifications |
