# 30 — Admin Portal: Leaderboard & Streaks

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Leaderboards and streaks are engagement mechanics that encourage repeat visits. Admins can configure leaderboard periods, reset streaks for support cases, and monitor top performers.

---

## 2. Leaderboard

### 2.1 Leaderboard Types

| Type | Ranking Basis | Period |
|---|---|---|
| `points_earned` | Total points earned in period | Weekly / Monthly |
| `visits` | Transaction count in period | Weekly / Monthly |
| `streak` | Current consecutive active days | Ongoing |

### 2.2 Leaderboard Page (`/gamification/leaderboard`)

Shows top 100 customers for the current period:

```typescript
// Client-side aggregation from transactions
const getLeaderboard = async (type: 'points' | 'visits', period: 'week' | 'month') => {
  const startDate = period === 'week'
    ? dayjs().startOf('week').toISOString()
    : dayjs().startOf('month').toISOString();

  const txns = await pb.collection('transactions').getFullList({
    filter: `created >= '${startDate}' && type = 'earn'`,
    fields: 'user,points',
  });

  // Aggregate by user
  const byUser = groupBy(txns, 'user');
  return Object.entries(byUser)
    .map(([userId, txns]) => ({
      userId,
      total: type === 'points'
        ? txns.reduce((s, t) => s + t.points, 0)
        : txns.length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 100);
};
```

---

## 3. Streaks

### 3.1 Streak Structure

```typescript
interface UserStreak {
  user:         string;   // → users.id
  current:      number;   // consecutive active days
  longest:      number;   // all-time longest streak
  last_active:  string;   // ISO date of last transaction
}
```

Streaks increment when a user makes at least one transaction per calendar day. A streak resets to 0 if a day is missed.

### 3.2 Streak Admin Tools

**Admin actions on streaks:**

| Action | Use Case |
|---|---|
| **View User Streak** | From User Detail page |
| **Reset Streak** | Customer reports it broke due to system error |
| **Extend Streak Protection** | Grant 1 grace day for a reported outage |

```typescript
// Reset a user's streak
const resetStreak = async (userId: string, reason: string) => {
  await pb.collection('user_streaks').update({ user: userId }, {
    current:     0,
    metadata: { reset_by_admin: true, reason },
  });
};

// Protect streak (set last_active to today)
const protectStreak = async (userId: string) => {
  await pb.collection('user_streaks').update({ user: userId }, {
    last_active: dayjs().format('YYYY-MM-DD'),
    metadata: { protected_by_admin: true },
  });
};
```

---

## 4. Streak Milestone Rewards

Admins configure rewards at streak milestones:

| Streak Milestone | Auto Reward |
|---|---|
| 7 days | +50 bonus points |
| 30 days | +200 bonus points + "Month Warrior" badge |
| 100 days | +1,000 bonus points + "Centurion" badge |
| 365 days | VIP badge + personal message |

---

## 5. Related Documents

| Doc | Description |
|---|---|
| [29-badges-challenges.md](./29-badges-challenges.md) | Badge and challenge definitions |
| [11-user-management.md](../06-user-management/11-user-management.md) | User detail page |
| [21-platform-analytics.md](../11-analytics-reporting/21-platform-analytics.md) | Engagement metrics |
