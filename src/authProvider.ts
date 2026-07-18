import type { AuthProvider } from '@refinedev/core';
import { pb } from './lib/pocketbase';

export const walyAuthProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      // 1. Try logging in as a Sales Agent (Option A Secure Collection)
      await pb.collection('sales_agents').authWithPassword(email, password);
      return { success: true, redirectTo: '/dashboard' };
    } catch (err) {
      try {
        // 2. Fallback: Try logging in as a Superuser Admin
        await pb.collection('_superusers').authWithPassword(email, password);
        return { success: true, redirectTo: '/dashboard' };
      } catch (err2) {
        return {
          success: false,
          error: { name: 'Login Failed', message: 'Invalid email or password' },
        };
      }
    }
  },
 
  logout: async () => {
    pb.authStore.clear();
    return { success: true, redirectTo: '/login' };
  },
 
  check: async () => {
    return pb.authStore.isValid
      ? { authenticated: true }
      : { authenticated: false, redirectTo: '/login' };
  },
 
  getIdentity: async () => {
    const model = pb.authStore.model;
    if (!model) return null;
    
    // Check if the authenticated model belongs to the sales_agents collection
    const isAgent = model.collectionName === 'sales_agents';

    return {
      id: model.id,
      name: model.name ?? model.email,
      email: model.email,
      role: model.role ?? (isAgent ? 'sales_agent' : 'super_admin'),
      referral_code: model.referral_code,
      commission_tier: model.commission_tier,
      lifetime_earnings: model.lifetime_earnings,
      clicks: model.clicks ?? 0,
      avatar: model.avatar
        ? pb.files.getUrl(model, model.avatar, { thumb: '40x40' })
        : undefined,
    };
  },

  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) {
      return { logout: true };
    }
    return { error };
  },
};
