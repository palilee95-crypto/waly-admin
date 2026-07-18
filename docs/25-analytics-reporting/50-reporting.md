# 50 — Admin Portal: Reporting

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Reporting module defines the scheduled reports, on-demand exports, and PDF/CSV generation capabilities of the WALY Admin Portal. Reports give the WALY operations and finance teams structured data for business reviews, compliance, and investor reporting.

---

## 2. Report Types

| Report | Audience | Frequency | Format |
|---|---|---|---|
| **Platform Summary** | All admins | Daily | CSV + Dashboard |
| **Transaction Ledger Export** | Finance | Weekly | CSV |
| **Points Liability Report** | Finance | Monthly | PDF + CSV |
| **Merchant Performance** | Ops, Marketing | Weekly | CSV + PDF |
| **Fraud Summary** | Ops | Weekly | PDF |
| **Campaign ROI** | Marketing | Per-campaign | PDF |
| **User Growth** | All admins | Monthly | PDF |

---

## 3. On-Demand CSV Export

All table pages support on-demand CSV export via Refine's `useExport` hook:

```typescript
const { triggerExport, isLoading } = useExport<Transaction>({
  resource:  'transactions',
  filters:   tableProps.filters,
  sorters:   tableProps.sorters,
  mapData:   (item) => ({
    'Transaction ID':  item.id,
    'Customer Name':   item.expand?.user?.name,
    'Customer Phone':  maskPhone(item.expand?.user?.phone),
    'Merchant':        item.expand?.merchant?.name ?? 'Admin Adjustment',
    'Type':            item.type,
    'Points':          item.points,
    'Note':            item.note,
    'Date':            dayjs(item.created).format('YYYY-MM-DD HH:mm'),
  }),
  filename:  `waly-transactions-${dayjs().format('YYYY-MM-DD')}`,
  pageSize:  500,  // fetch up to 500 records per export
});

<Button loading={isLoading} onClick={triggerExport} icon={<DownloadOutlined />}>
  Export CSV
</Button>
```

---

## 4. Monthly Liability Report (PDF)

Generated on the 1st of each month, covering the previous month:

**Contents:**
1. Executive Summary (total users, active merchants, DAU)
2. Points Issued vs Redeemed (bar chart)
3. Total Liability (MYR) — trend chart
4. Tier Distribution (pie chart)
5. Top 10 Merchants by Volume
6. Fraud Flags Summary (opened, resolved, dismissed)
7. Campaign Performance Table

```typescript
// PDF generation using @react-pdf/renderer (Phase 2)
import { PDFDownloadLink, Document, Page, Text, View } from '@react-pdf/renderer';

const LiabilityReport = ({ data }: { data: ReportData }) => (
  <Document>
    <Page>
      <Text>WALY Monthly Liability Report</Text>
      <Text>{dayjs().subtract(1, 'month').format('MMMM YYYY')}</Text>
      {/* report sections */}
    </Page>
  </Document>
);
```

---

## 5. Scheduled Reports (Phase 3)

Automated report emails via PocketBase cron hooks:

```javascript
// pb_hooks/scheduled-reports.pb.js
// Runs every Monday 9AM via PocketBase cron
cronAdd('weekly-merchant-report', '0 9 * * 1', async () => {
  const report = await buildWeeklyMerchantReport();
  await sendEmail({
    to: 'ops@waly.app',
    subject: `WALY Weekly Merchant Report — ${dayjs().format('DD MMM YYYY')}`,
    attachments: [{ filename: 'report.csv', content: report.csv }],
  });
});
```

---

## 6. Report Archive

All generated PDF reports are stored in PocketBase's file storage and accessible from a Reports Archive page (`/reports`):

```typescript
interface ReportArchive {
  id:           string;
  report_type:  string;
  period:       string;         // "2026-06" or "2026-W26"
  file:         string;         // PocketBase file reference
  generated_at: string;
  generated_by: string;         // admin user ID or "system"
}
```

---

## 7. Export Limits

| Export | Max Rows | Format |
|---|---|---|
| Transactions | 10,000 | CSV |
| Users | 5,000 | CSV |
| Merchants | Unlimited | CSV |
| Notifications | 5,000 | CSV |

For larger exports, use PocketBase admin API directly.

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [49-analytics.md](./49-analytics.md) | Portal-level event tracking |
| [21-platform-analytics.md](../11-analytics-reporting/21-platform-analytics.md) | Business analytics dashboard |
| [20-liability-monitoring.md](../10-points-ledger/20-liability-monitoring.md) | Liability snapshot source |
| [38-filtering-sorting.md](../19-search-filter/38-filtering-sorting.md) | Filter state in exports |
