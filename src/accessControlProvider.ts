import type { AccessControlProvider } from '@refinedev/core';
import { pb } from './lib/pocketbase';

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    const adminUser = pb.authStore.model;
    // Default to 'super_admin' if no role specified, or map to user's assigned role
    const role = adminUser?.role ?? 'super_admin';

    const permissions: Record<string, Record<string, string[]>> = {
      dashboard: {
        list: ['super_admin', 'operations', 'analyst', 'support'],
      },
      sales_dashboard: {
        list: ['super_admin', 'sales_agent'],
      },
      merchants: {
        list:   ['super_admin', 'operations', 'analyst', 'sales_agent'],
        show:   ['super_admin', 'operations', 'analyst'],
        create: ['super_admin', 'operations'],
        edit:   ['super_admin', 'operations'],
        delete: ['super_admin'],
      },
      users: {
        list:   ['super_admin', 'operations', 'analyst', 'support'],
        show:   ['super_admin', 'operations', 'analyst', 'support'],
        edit:   ['super_admin', 'operations', 'support'],
        delete: ['super_admin'],
      },
      campaigns: {
        list:   ['super_admin', 'operations', 'analyst'],
        show:   ['super_admin', 'operations', 'analyst'],
        create: ['super_admin', 'operations'],
        edit:   ['super_admin', 'operations'],
      },
      vouchers: {
        list:   ['super_admin', 'operations', 'support'],
        create: ['super_admin', 'operations', 'support'],
        edit:   ['super_admin', 'operations', 'support'],
      },
      rewards: {
        list:   ['super_admin', 'operations', 'analyst'],
        show:   ['super_admin', 'operations', 'analyst'],
        create: ['super_admin', 'operations'],
        edit:   ['super_admin', 'operations'],
        delete: ['super_admin'],
      },
      fraud_flags: {
        list:   ['super_admin', 'operations', 'analyst'],
        edit:   ['super_admin', 'operations'],
      },
      velocity_rules: {
        list:   ['super_admin', 'operations'],
        edit:   ['super_admin'],
      },
      analytics: {
        list:   ['super_admin', 'operations', 'analyst'],
      },
      notifications: {
        list:   ['super_admin', 'operations', 'analyst'],
        create: ['super_admin', 'operations'],
      },
      tiers: {
        list:   ['super_admin', 'operations', 'analyst'],
        edit:   ['super_admin', 'operations'],
      },
      loyalty_programs: {
        list:   ['super_admin', 'operations', 'analyst'],
        edit:   ['super_admin', 'operations'],
      },
      admin_users: {
        list:   ['super_admin'],
        create: ['super_admin'],
        edit:   ['super_admin'],
        delete: ['super_admin'],
      },
      pricing_settings: {
        list:   ['super_admin', 'operations', 'analyst'],
        show:   ['super_admin', 'operations', 'analyst'],
        edit:   ['super_admin', 'operations'],
      },
      subscription_promo_codes: {
        list:   ['super_admin', 'operations', 'analyst'],
        show:   ['super_admin', 'operations', 'analyst'],
        create: ['super_admin', 'operations'],
        edit:   ['super_admin', 'operations'],
        delete: ['super_admin'],
      },
    };

    const allowed = permissions[resource ?? '']?.[action]?.includes(role) ?? false;
    return { can: allowed };
  },
};
