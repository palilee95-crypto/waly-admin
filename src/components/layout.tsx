import React, { useEffect, useState } from 'react';
import { useLogout, useGetIdentity } from '@refinedev/core';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Modal, Input, Drawer } from 'antd';
import { CreateProspectModal } from './CreateProspectModal';
import { SalesCardModal } from './SalesCardModal';

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
  const [isSalesCardOpen, setIsSalesCardOpen] = useState(false);

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
        { name: 'Inactive Prospects', icon: 'person_add', route: '/sales-dashboard/prospects' },
        { name: 'Referred Directory', icon: 'storefront', route: '/sales-dashboard/merchants' },
        { name: 'Dormant Customers', icon: 'hourglass_empty', route: '/sales-dashboard/dormant' },
        { name: 'Commission Logs', icon: 'receipt_long', route: '/sales-dashboard/earnings' },
        { name: 'Analytics Charts', icon: 'trending_up', route: '/sales-dashboard/analytics' },
        { name: 'Partner Leaderboard', icon: 'leaderboard', route: '/sales-dashboard/leaderboard' },
      ]
    : [
        { name: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { name: 'Merchants', icon: 'storefront', route: '/merchants' },
        { name: 'Users', icon: 'group', route: '/users' },
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
        { name: 'Prospects', icon: 'person_add', route: '/sales-dashboard/prospects' },
        { name: 'Directory', icon: 'storefront', route: '/sales-dashboard/merchants' },
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
      <Drawer
        placement="left"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        closable={false}
        width={290}
        zIndex={99999}
        styles={{ body: { padding: 0, backgroundColor: '#0f172a' } }}
      >
        <div className="flex flex-col h-full text-white p-6 bg-[#0f172a]">
          <div className="flex items-center justify-between mb-6 mt-1 pb-4 border-b border-white/10">
            <Link 
              to={role === 'sales_agent' ? '/sales-dashboard' : '/dashboard'} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center gap-2.5"
            >
              <img src="/icon.png" alt="Risev Logo" className="w-10 h-10 object-contain rounded-xl" />
              <span className="font-headline font-black text-xl tracking-wider text-white">RISEV</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white/60 hover:text-white bg-transparent border-none cursor-pointer flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <nav className="flex-1 flex flex-col space-y-1.5 overflow-y-auto custom-scroll">
            {menuItems.map((item) => {
              const active = isActive(item.route);
              return (
                <Link
                  key={item.name}
                  to={item.route}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-headline text-sm font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-auto pt-4 border-t border-white/10 flex flex-col space-y-2">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-2">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {identity?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{identity?.name || 'Administrator'}</p>
                <p className="text-[10px] text-white/60 uppercase tracking-wider">{identity?.role?.replace('_', ' ') || 'User'}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 bg-transparent border-none text-left w-full cursor-pointer transition-colors font-headline text-sm font-bold"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Main Content Canvas - Left margin collapses on mobile */}
      <main className={`ml-0 md:ml-28 flex-1 h-screen overflow-y-auto custom-scroll flex flex-col pb-20 md:pb-6 ${currentPath === '/sales-dashboard' ? 'bg-[#002d1e]' : ''}`}>
        {/* Responsive Header (Scrolls away naturally with page content) */}
        {currentPath !== '/sales-dashboard' && (
          <header className="flex justify-between items-center h-16 sm:h-20 w-full bg-white dark:bg-slate-900 border-b border-black/5 dark:border-white/10 px-2 sm:px-4 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer flex items-center justify-center md:hidden mr-1"
                title="Open Navigation Menu"
              >
                <span className="material-symbols-outlined text-on-surface text-[24px]">menu</span>
              </button>
              <Link to={role === 'sales_agent' ? '/sales-dashboard' : '/dashboard'} className="flex items-center hover:opacity-90">
                <img src="/logo.png" alt="Risev Logo" className="h-9 sm:h-12 object-contain" />
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div 
                onClick={() => setIsSearchOpen(true)}
                className="relative hidden lg:block cursor-pointer"
              >
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  className="pl-10 pr-4 py-2 bg-white/40 border-none rounded-full w-64 text-body-sm transition-all outline-none cursor-pointer"
                  placeholder="Search portal... (Ctrl+K)"
                  readOnly
                  type="text"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer flex items-center justify-center lg:hidden"
                title="Search Portal"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              </button>
              <button 
                onClick={() => setIsDark(prev => !prev)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer flex items-center justify-center"
                title="Toggle Dark/Light Mode"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-black/10 dark:border-white/10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 overflow-hidden border border-white dark:border-slate-700 flex items-center justify-center shrink-0">
                  {identity?.avatar ? (
                    <img className="w-full h-full object-cover" src={identity.avatar} alt="Avatar" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
                      {identity?.name?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-body text-body-sm font-semibold text-on-surface leading-tight truncate max-w-[120px]">{identity?.name || 'Administrator'}</p>
                  <p className="font-body text-[10px] text-on-surface-variant uppercase tracking-wider">{identity?.role?.replace('_', ' ') || 'Operations'}</p>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Inner Page View */}
        <div className={`flex-1 w-full ${currentPath === '/sales-dashboard' ? 'p-0 m-0' : 'px-1 sm:px-4 py-4 sm:py-6'}`}>
          {children}
        </div>

        {/* Footer Spacer */}
        <div className="h-14 md:h-10"></div>
      </main>

      {/* Mobile & Responsive Floating Bottom Navigation Bar (Mathematically centered 5-column grid) */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[432px] z-50 grid grid-cols-5 items-center justify-items-center px-1 py-1.5 bg-[#002d1e]/95 backdrop-blur-md shadow-2xl rounded-full border border-white/10 text-white">
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

        {/* Col 3: Central FAB (Exact 50% Mathematical Center - Opens Sales Card) */}
        <div className="flex items-center justify-center w-full relative -mt-8 z-10">
          <button
            onClick={() => setIsSalesCardOpen(true)}
            title="My Sales Card"
            className="w-14 h-14 rounded-full bg-[#6bfe9c] text-[#002d1e] shadow-[0_8px_25px_rgba(107,254,156,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 border-4 border-[#002d1e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl font-extrabold">style</span>
          </button>
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

      {/* Official Sales Card Modal */}
      <SalesCardModal
        open={isSalesCardOpen}
        onClose={() => setIsSalesCardOpen(false)}
      />
    </div>
  );
};
