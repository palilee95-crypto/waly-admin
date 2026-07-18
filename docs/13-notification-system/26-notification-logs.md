# 26 — Admin Portal: Notification Logs

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Notification Logs module provides a full delivery audit trail for every notification sent through WALY. Admins can track delivery status, identify failures, and retry failed sends.

---

## 2. Notification Log Structure

```typescript
interface NotificationLog {
  id:           string;
  notification: string;     // → notifications.id
  recipient:    string;     // → users.id
  channel:      'in_app' | 'push' | 'whatsapp' | 'sms';
  status:       'sent' | 'delivered' | 'failed' | 'read';
  error_msg:    string | null;
  sent_at:      string;
  delivered_at: string | null;
  read_at:      string | null;
}
```

---

## 3. Notification Logs Page (`/notifications/logs`)

```typescript
const { tableProps } = useTable<NotificationLog>({
  resource: 'notification_logs',
  meta: { expand: 'notification,recipient' },
  sorters: { initial: [{ field: 'sent_at', order: 'desc' }] },
  pagination: { pageSize: 50 },
});
```

**Table columns:** Recipient, Channel, Title (from notification), Status, Sent At, Delivered At, Error

---

## 4. Delivery Status Badges

| Status | Badge Color | Meaning |
|---|---|---|
| `sent` | Blue | Dispatched to delivery provider |
| `delivered` | Green | Confirmed delivery to device |
| `failed` | Red | Delivery failed (see error_msg) |
| `read` | Purple | User opened the notification |

---

## 5. Delivery Metrics (Top of Page)

| Metric | Formula |
|---|---|
| Delivery Rate | delivered / (sent + delivered + failed) × 100% |
| Read Rate | read / delivered × 100% |
| Failure Rate | failed / total × 100% |

---

## 6. Retry Failed Notifications

```typescript
const retryFailed = async (logId: string) => {
  const log = await pb.collection('notification_logs').getOne(logId, {
    expand: 'notification,recipient',
  });

  // Re-trigger delivery via Evolution API / Push service
  await deliverNotification({
    userId:  log.recipient,
    title:   log.expand!.notification.title,
    body:    log.expand!.notification.body,
    channel: log.channel,
  });

  await pb.collection('notification_logs').update(logId, {
    status:  'sent',
    sent_at: new Date().toISOString(),
    error_msg: null,
  });
};
```

---

## 7. Filters

| Filter | Options |
|---|---|
| Status | sent, delivered, failed, read |
| Channel | in_app, push, whatsapp, sms |
| Date Range | From / To |
| Recipient | Search by name or phone |
| Failed Only | Toggle |

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [25-notification-management.md](./25-notification-management.md) | Broadcasting notifications |
| [43-monitoring.md](../22-monitoring-logging/43-monitoring.md) | Platform health monitoring |
| [44-logging.md](../22-monitoring-logging/44-logging.md) | System-level logs |
