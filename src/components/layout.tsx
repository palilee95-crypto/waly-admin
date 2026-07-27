import React, { useEffect, useState } from 'react';
import { useLogout, useGetIdentity } from '@refinedev/core';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Modal, Input, Drawer } from 'antd';
import { CreateProspectModal } from './CreateProspectModal';

interface LayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<any>();
  const location = useLocation();
  const currentPath = location.pathname;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateProspectOpen, setIsCreateProspectOpen] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Key listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const role = identity?.role || 'super_admin';

  const searchPages = role === 'sales_agent'
    ? [
        { title: 'Sales Dashboard', path: '/sales-dashboard', category: 'Pages' },
        { title: 'Inactive Prospects', path: '/sales-dashboard/prospects', category: 'Pages' },
        { title: 'Referred Directory', path: '/sales-dashboard/merchants', category: 'Pages' },
        { title: 'Dormant Customers', path: '/sales-dashboard/dormant', category: 'Pages' },
        { title: 'Commission Logs', path: '/sales-dashboard/earnings', category: 'Pages' },
        { title: 'Analytics Charts', path: '/sales-dashboard/analytics', category: 'Pages' },
        { title: 'Partner Leaderboard', path: '/sales-dashboard/leaderboard', category: 'Pages' },
      ]
    : [
        { title: 'Dashboard', path: '/dashboard', category: 'Pages' },
        { title: 'Merchants Queue', path: '/merchants', category: 'Pages' },
        { title: 'Users Support', path: '/users', category: 'Pages' },
        { title: 'Billing & Subscriptions', path: '/subscriptions', category: 'Pages' },
        { title: 'Points Ledger', path: '/ledger', category: 'Pages' },
        { title: 'Liability Monitor', path: '/ledger/liability', category: 'Pages' },
        { title: 'Campaigns Management', path: '/campaigns', category: 'Pages' },
        { title: 'Voucher Ledger', path: '/campaigns/vouchers', category: 'Pages' },
        { title: 'Rewards Catalog', path: '/rewards', category: 'Pages' },
        { title: 'Loyalty Tiers', path: '/loyalty/tiers', category: 'Pages' },
        { title: 'Stamp Card Templates', path: '/loyalty/stamp-cards', category: 'Pages' },
        { title: 'Platform Analytics', path: '/analytics', category: 'Pages' },
        { title: 'Fraud Flags', path: '/fraud', category: 'Pages' },
        { title: 'Velocity Rules', path: '/fraud/velocity-rules', category: 'Pages' },
        { title: 'Notification Hub', path: '/notifications', category: 'Pages' },
        { title: 'Broadcast Composer', path: '/notifications/broadcast', category: 'Pages' },
        { title: 'Admin Accounts', path: '/admin-users', category: 'Pages' },
        { title: 'Audit Logs', path: '/admin-users/audit-logs', category: 'Pages' },
        { title: 'Sales Agents Hub', path: '/sales-agents', category: 'Pages' },
      ];

  const filteredResults = searchQuery.trim() === ''
    ? []
    : searchPages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Mouse reflection logic for glass panels
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.querySelectorAll('.glass-panel').forEach((panel: any) => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        panel.style.setProperty('--mouse-x', `${x}px`);
        panel.style.setProperty('--mouse-y', `${y}px`);
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const menuItems = role === 'sales_agent'
    ? [
        { name: 'Overview', icon: 'dashboard', route: '/sales-dashboard' },
        { name: 'Pending Leads', icon: 'person_add', route: '/sales-dashboard/prospects' },
        { name: 'My Merchants', icon: 'storefront', route: '/sales-dashboard/merchants' },
        { name: 'Dormant Customers', icon: 'hourglass_empty', route: '/sales-dashboard/dormant' },
        { name: 'Commission Logs', icon: 'receipt_long', route: '/sales-dashboard/earnings' },
        { name: 'Analytics Charts', icon: 'trending_up', route: '/sales-dashboard/analytics' },
        { name: 'Partner Leaderboard', icon: 'leaderboard', route: '/sales-dashboard/leaderboard' },
      ]
    : [
        { name: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { name: 'Merchants', icon: 'storefront', route: '/merchants' },
        { name: 'Users', icon: 'group', route: '/users' },
        { name: 'Sales Agents', icon: 'badge', route: '/sales-agents' },
        { name: 'Billing', icon: 'credit_card', route: '/subscriptions' },
        { name: 'Loyalty', icon: 'groups_3', route: '/loyalty/tiers' },
        { name: 'Rewards', icon: 'payments', route: '/rewards' },
        { name: 'Campaigns', icon: 'campaign', route: '/campaigns' },
        { name: 'Ledger', icon: 'receipt_long', route: '/ledger' },
        { name: 'Analytics', icon: 'trending_up', route: '/analytics' },
        { name: 'Fraud', icon: 'security', route: '/fraud' },
        { name: 'Notifications', icon: 'notifications', route: '/notifications' },
        { name: 'Admin Users', icon: 'settings', route: '/admin-users' },
      ];

  // Helper to determine if a route is active
  const isActive = (route: string) => {
    if (route === '/dashboard' || route === '/sales-dashboard') {
      return currentPath === route;
    }
    if (route.startsWith('/sales-dashboard/')) {
      return currentPath === route;
    }
    return currentPath.startsWith('/' + route.split('/')[1]);
  };

  // Primary bottom navigation items for mobile
  const bottomNavItems = role === 'sales_agent'
    ? [
        { name: 'Home', icon: 'dashboard', route: '/sales-dashboard' },
        { name: 'Leads', icon: 'person_add', route: '/sales-dashboard/prospects' },
        { name: 'Merchants', icon: 'storefront', route: '/sales-dashboard/merchants' },
        { name: 'Analytics', icon: 'trending_up', route: '/sales-dashboard/analytics' },
      ]
    : [
        { name: 'Home', icon: 'dashboard', route: '/dashboard' },
        { name: 'Merchants', icon: 'storefront', route: '/merchants' },
        { name: 'Users', icon: 'group', route: '/users' },
        { name: 'Analytics', icon: 'trending_up', route: '/analytics' },
      ];

  return (
    <div className="flex w-screen h-screen overflow-hidden select-none">
      {/* Desktop SideNavBar - Hidden on mobile, visible on md screens and up */}
      <aside className="fixed left-4 top-4 bottom-4 w-20 rounded-xl bg-inverse-surface backdrop-blur-2xl shadow-xl hidden md:flex flex-col items-center py-base space-y-stack-md z-50">
        <div className="mb-8 mt-2 flex items-center justify-center">
          <Link to={role === 'sales_agent' ? '/sales-dashboard' : '/dashboard'} className="hover:opacity-80">
            <img src="/icon.png" alt="Risev Logo Icon" className="w-12 h-12 object-contain rounded-xl" />
          </Link>
        </div>

        <nav className="flex-1 flex flex-col items-center space-y-4 w-full px-2 overflow-y-auto custom-scroll">
          {menuItems.map((item) => {
            const active = isActive(item.route);
            return (
              <Link
                key={item.name}
                to={item.route}
                title={item.name}
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(46,91,255,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center space-y-4 pb-4">
          <button 
            className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            title="Help Support"
          >
            <span className="material-symbols-outlined">help</span>
          </button>
          <button
            onClick={() => logout()}
            className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            title="Sign Out"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer - Always opens when triggered */}
      {/* Mobile Side Menu Navigation Drawer */}
      <Drawer
        placement="left"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        closable={false}
        width={310}
        zIndex={99999}
        styles={{ body: { padding: 0, backgroundColor: '#00150e' } }}
      >
        <div className="flex flex-col h-full text-white p-6 bg-gradient-to-b from-[#002d1e] via-[#001f15] to-[#00150e]">
          
          {/* Header Branding */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <Link 
              to={role === 'sales_agent' ? '/sales-dashboard' : '/dashboard'} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center gap-3 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#002d1e] border border-[#6bfe9c]/30 p-1.5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                <img src="/icon.png" alt="Risev Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <span className="font-headline font-black text-xl tracking-wider text-white block leading-tight">RISEV</span>
                <span className="text-[10px] font-bold text-[#6bfe9c] uppercase tracking-widest block">Partner Portal</span>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white/60 hover:text-white bg-white/5 border border-white/10 cursor-pointer flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/15 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col space-y-1.5 overflow-y-auto custom-scroll pr-1">
            {menuItems.map((item, index) => {
              const active = isActive(item.route);

              // Category Dividers for Sales Agent Portal
              const showAcquisitionHeader = role === 'sales_agent' && index === 1;
              const showFinanceHeader = role === 'sales_agent' && index === 4;

              return (
                <React.Fragment key={item.name}>
                  {showAcquisitionHeader && (
                    <div className="pt-4 pb-1 px-3 text-[10px] font-black uppercase text-[#85af9b] tracking-widest">
                      ACQUISITIONS
                    </div>
                  )}
                  {showFinanceHeader && (
                    <div className="pt-4 pb-1 px-3 text-[10px] font-black uppercase text-[#85af9b] tracking-widest">
                      REVENUE & ANALYTICS
                    </div>
                  )}
                  <Link
                    to={item.route}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-[#003825] to-[#004d30] text-[#6bfe9c] font-black border border-[#6bfe9c]/30 shadow-lg shadow-[#002d1e]/50 translate-x-1'
                        : 'text-white/70 hover:text-white hover:bg-white/5 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`material-symbols-outlined text-[20px] ${active ? 'text-[#6bfe9c]' : 'text-white/60'}`}>
                        {item.icon}
                      </span>
                      <span className="font-headline text-sm">{item.name}</span>
                    </div>
                    {active && (
                      <span className="w-2 h-2 rounded-full bg-[#6bfe9c] shadow-[0_0_8px_#6bfe9c]"></span>
                    )}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>
          
          {/* User Profile & Sign Out Footer */}
          <div className="mt-auto pt-4 border-t border-white/10 flex flex-col space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl shadow-inner">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006d37] to-[#6bfe9c] p-0.5 shadow-md">
                  <div className="w-full h-full bg-[#002d1e] rounded-[10px] flex items-center justify-center text-[#6bfe9c] font-black text-xs">
                    {identity?.name?.substring(0, 2).toUpperCase() || 'HA'}
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#6bfe9c] border-2 border-[#00150e] rounded-full"></span>
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-black text-white truncate mb-0.5">{identity?.name || 'Hashiff'}</p>
                <span className="text-[9px] font-bold text-[#6bfe9c] uppercase tracking-wider bg-[#6bfe9c]/10 px-2 py-0.5 rounded-md inline-block border border-[#6bfe9c]/20">
                  {identity?.role?.replace('_', ' ') || 'Sales Agent'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/15 bg-red-500/10 border border-red-500/20 text-center w-full cursor-pointer transition-all font-headline text-xs font-black"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out Account</span>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Main Content Canvas - Left margin collapses on mobile */}
      <main className="ml-0 md:ml-28 flex-1 h-screen overflow-y-auto custom-scroll flex flex-col pb-20 md:pb-6 bg-[#fcf9f8] dark:bg-[#00150e]">
        {/* Inner Page View */}
        <div className="flex-1 w-full p-0 m-0">
          {children}
        </div>

        {/* Footer Spacer */}
        <div className="h-14 md:h-10"></div>
      </main>

      {/* Mobile & Responsive Floating Bottom Navigation Bar (Mathematically centered 5-column grid with iOS Safe Area) */}
      <nav className="md:hidden fixed bottom-6 bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.75rem))] left-1/2 -translate-x-1/2 w-[92%] max-w-[432px] z-50 grid grid-cols-5 items-center justify-items-center px-1 py-1.5 bg-[#002d1e]/95 backdrop-blur-md shadow-2xl rounded-full border border-white/10 text-white">
        {/* Col 1: Home */}
        <Link
          to={role === 'sales_agent' ? '/sales-dashboard' : '/dashboard'}
          className={`flex flex-col items-center justify-center w-full py-1 transition-all ${
            isActive(role === 'sales_agent' ? '/sales-dashboard' : '/dashboard')
              ? 'text-[#6bfe9c] font-bold scale-105'
              : 'text-[#85af9b] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="text-[10px] font-medium mt-0.5 truncate">Home</span>
        </Link>

        {/* Col 2: Leaderboard / Merchants */}
        <Link
          to={role === 'sales_agent' ? '/sales-dashboard/leaderboard' : '/merchants'}
          className={`flex flex-col items-center justify-center w-full py-1 transition-all ${
            isActive(role === 'sales_agent' ? '/sales-dashboard/leaderboard' : '/merchants')
              ? 'text-[#6bfe9c] font-bold scale-105'
              : 'text-[#85af9b] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">{role === 'sales_agent' ? 'leaderboard' : 'storefront'}</span>
          <span className="text-[10px] font-medium mt-0.5 truncate">{role === 'sales_agent' ? 'Leaderboard' : 'Merchants'}</span>
        </Link>

        {/* Col 3: Central FAB (Navigates to My Referral Card Page) */}
        <div className="flex items-center justify-center w-full relative -mt-8 z-10">
          <Link
            to={role === 'sales_agent' ? '/sales-dashboard/card' : '/merchants'}
            title="My Sales Card"
            className="w-14 h-14 rounded-full bg-[#6bfe9c] text-[#002d1e] shadow-[0_8px_25px_rgba(107,254,156,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 border-4 border-[#002d1e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl font-extrabold">style</span>
          </Link>
        </div>

        {/* Col 4: Earnings / Billing */}
        <Link
          to={role === 'sales_agent' ? '/sales-dashboard/earnings' : '/subscriptions'}
          className={`flex flex-col items-center justify-center w-full py-1 transition-all ${
            isActive(role === 'sales_agent' ? '/sales-dashboard/earnings' : '/subscriptions')
              ? 'text-[#6bfe9c] font-bold scale-105'
              : 'text-[#85af9b] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">{role === 'sales_agent' ? 'account_balance_wallet' : 'credit_card'}</span>
          <span className="text-[10px] font-medium mt-0.5 truncate">{role === 'sales_agent' ? 'Earnings' : 'Billing'}</span>
        </Link>

        {/* Col 5: Menu */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center w-full text-[#85af9b] hover:text-white py-1 transition-all bg-transparent border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
          <span className="text-[10px] font-medium mt-0.5 truncate">Menu</span>
        </button>
      </nav>

      {/* Global Command Palette / Search Modal */}
      <Modal
        open={isSearchOpen}
        onCancel={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
        footer={null}
        closable={false}
        width={500}
        destroyOnHidden
        className="glass-panel"
      >
        <div className="flex flex-col gap-4 font-body py-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
            <Input
              autoFocus
              className="pl-10 pr-4 py-2.5 h-11 bg-white/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm w-full"
              placeholder="Search users, merchants, or portal pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col max-h-60 overflow-y-auto mt-2">
            {filteredResults.length === 0 ? (
              searchQuery.trim() !== '' ? (
                <p className="text-sm text-on-surface-variant text-center py-6">No matching results found.</p>
              ) : (
                <p className="text-xs text-outline uppercase font-semibold tracking-wider text-left px-2 mb-2">Popular Shortcuts</p>
              )
            ) : (
              <p className="text-xs text-outline uppercase font-semibold tracking-wider text-left px-2 mb-2">Search Results</p>
            )}

            {(searchQuery.trim() === '' ? searchPages.slice(0, 5) : filteredResults).map((page) => (
              <div
                key={page.path}
                onClick={() => {
                  navigate(page.path);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary/10 cursor-pointer transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline text-[18px]">subdirectory_arrow_right</span>
                  <span className="text-sm text-on-surface font-semibold">{page.title}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-outline bg-black/5 px-2 py-0.5 rounded-md">{page.category}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Global Create Prospect Modal */}
      <CreateProspectModal
        open={isCreateProspectOpen}
        onClose={() => setIsCreateProspectOpen(false)}
      />
    </div>
  );
};
