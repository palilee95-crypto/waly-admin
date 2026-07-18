# 29 — Admin Portal: Badges & Challenges

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Gamification drives customer engagement through badges and challenges. Admins can define new badges, configure challenge rules, and monitor customer progress — all from the Admin Portal.

---

## 2. Badges

### 2.1 Badge Structure

```typescript
interface Badge {
  id:          string;
  name:        string;        // "First Purchase", "Loyal Regular"
  description: string;
  icon:        string;        // file reference (SVG/PNG)
  category:    'milestone' | 'streak' | 'social' | 'special';
  criteria:    {
    type:      'transaction_count' | 'points_total' | 'streak_days' | 'merchant_visits';
    threshold: number;        // e.g., 10 transactions, 1000 points
    merchant?: string | null; // specific merchant or any
  };
  is_active:   boolean;
}
```

### 2.2 Badges List Page (`/gamification/badges`)

```typescript
const { tableProps } = useTable<Badge>({
  resource: 'badges',
  sorters: { initial: [{ field: 'category', order: 'asc' }] },
});
```

**Table columns:** Icon, Name, Category, Criteria, Earned By (count), Status, Actions

### 2.3 Create / Edit Badge

Form fields: Name, Description, Icon (upload), Category, Criteria Type, Threshold, Merchant filter, Active status

---

## 3. Challenges

### 3.1 Challenge Structure

```typescript
interface Challenge {
  id:          string;
  title:       string;        // "Weekend Warrior"
  description: string;
  type:        'earn_points' | 'visit_merchant' | 'complete_stamp_card' | 'refer_friend';
  target:      number;        // e.g., earn 500 pts this week
  reward_points: number;      // bonus points on completion
  reward_badge: string | null; // → badges.id (optional badge reward)
  start_date:  string;
  end_date:    string;
  merchant:    string | null; // merchant-specific or platform-wide
  is_active:   boolean;
}
```

### 3.2 Challenges List Page (`/gamification/challenges`)

**Table columns:** Title, Type, Target, Reward, Participants, Completions, Dates, Status, Actions

---

## 4. Challenge Analytics

Per-challenge stats:
- Total enrolled users
- Completion rate (%)
- Average progress %
- Points awarded total

---

## 5. Badge Award (Manual)

Super Admins can manually award a badge to a specific user (e.g., for special event participation):

```typescript
const awardBadge = async (userId: string, badgeId: string, reason: string) => {
  await pb.collection('user_badges').create({
    user:      userId,
    badge:     badgeId,
    earned_at: new Date().toISOString(),
    metadata:  { manual_award: true, reason },
  });
};
```

---

## 6. Related Documents

| Doc | Description |
|---|---|
| [30-leaderboard-streaks.md](./30-leaderboard-streaks.md) | Leaderboard and streak management |
| [17-campaign-management.md](../09-campaigns-promotions/17-campaign-management.md) | Campaign + challenge combination |
| [21-platform-analytics.md](../11-analytics-reporting/21-platform-analytics.md) | Gamification engagement metrics |
