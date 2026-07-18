import React, { useEffect, useState } from 'react';
import { useLogout, useGetIdentity } from '@refinedev/core';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Modal, Input, Drawer } from 'antd';

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

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* SideNavBar exactly like code.html - Hidden on mobile, visible on medium screens and up */}
      <aside className="fixed left-4 top-4 bottom-4 w-20 rounded-xl bg-inverse-surface backdrop-blur-2xl shadow-xl hidden md:flex flex-col items-center py-base space-y-stack-md z-50">
        <div className="mb-8 mt-2 flex items-center justify-center">
          <Link to="/dashboard" className="hover:opacity-80">
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
            className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Help Support"
          >
            <span className="material-symbols-outlined">help</span>
          </button>
          <button
            onClick={() => logout()}
            className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Sign Out"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer menu using Ant Design */}
      <Drawer
        placement="left"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        closable={false}
        width={280}
        styles={{ body: { padding: 0, backgroundColor: '#1e222b' } }}
      >
        <div className="flex flex-col h-full text-white p-6 bg-[#1e222b]">
          <div className="flex items-center justify-between mb-8 mt-2">
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
              <img src="/icon.png" alt="Risev Logo" className="w-10 h-10 object-contain rounded-xl" />
              <span className="font-headline font-black text-lg tracking-wider text-white">RISEV</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white/60 hover:text-white bg-transparent border-none cursor-pointer flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto custom-scroll">
            {menuItems.map((item) => {
              const active = isActive(item.route);
              return (
                <Link
                  key={item.name}
                  to={item.route}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-primary-container text-white shadow-[0_0_15px_rgba(46,91,255,0.4)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-headline text-sm font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-auto pt-4 border-t border-white/10 flex flex-col space-y-2">
            <button 
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 bg-transparent border-none text-left w-full cursor-pointer"
              title="Help Support"
            >
              <span className="material-symbols-outlined">help</span>
              <span className="font-headline text-sm font-semibold text-white/60">Help Support</span>
            </button>
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 bg-transparent border-none text-left w-full cursor-pointer"
              title="Sign Out"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-headline text-sm font-semibold text-white/60">Sign Out</span>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Main Content Canvas - Left margin collapses on mobile */}
      <main className="ml-0 md:ml-28 flex-1 h-screen overflow-y-auto custom-scroll px-4 md:px-8 md:pr-container-padding flex flex-col">
        {/* TopNavBar exactly like code.html */}
        <header className="flex justify-between items-center h-20 w-full sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/20 px-4">
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-full hover:bg-surface-container-high/50 transition-all relative border-none bg-transparent cursor-pointer flex items-center justify-center md:hidden mr-1"
              title="Open Menu"
            >
              <span className="material-symbols-outlined text-on-surface-variant">menu</span>
            </button>
            <Link to="/dashboard" className="flex items-center hover:opacity-90">
              <img src="/logo.png" alt="Risev Logo" className="h-12 object-contain" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
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
              className="p-2 rounded-full hover:bg-surface-container-high/50 transition-all relative border-none bg-transparent cursor-pointer flex items-center justify-center lg:hidden"
              title="Search Portal"
            >
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
            </button>
            <button 
              onClick={() => setIsDark(prev => !prev)}
              className="p-2 rounded-full hover:bg-surface-container-high/50 transition-all relative border-none bg-transparent cursor-pointer flex items-center justify-center"
              title="Toggle Dark/Light Mode"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button className="p-2 rounded-full hover:bg-surface-container-high/50 transition-all relative border-none bg-transparent cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            
            <div className="flex items-center gap-3 pl-2 border-l border-black/10">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-white">
                {identity?.avatar ? (
                  <img className="w-full h-full object-cover" src={identity.avatar} alt="Avatar" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {identity?.name?.substring(0, 2).toUpperCase() || 'AD'}
                  </div>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-body text-body-sm font-semibold text-on-surface leading-tight">{identity?.name || 'Administrator'}</p>
                <p className="font-body text-[10px] text-on-surface-variant uppercase tracking-wider">{identity?.role?.replace('_', ' ') || 'Operations'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Inner Page View */}
        <div className="flex-1 px-4 py-6">
          {children}
        </div>

        {/* Footer Spacer */}
        <div className="h-10"></div>
      </main>

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
    </div>
  );
};
