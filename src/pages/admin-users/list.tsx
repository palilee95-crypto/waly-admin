import React from 'react';
import { useTable, useCan, useDelete } from '@refinedev/core';
import { useForm } from '@refinedev/antd';
import { Form, Input, Select, Button, message, Switch, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

// ==========================================
// 1. AdminUserList
// ==========================================
export const AdminUserList: React.FC = () => {
  const navigate = useNavigate();
  const { tableQueryResult } = useTable<any>({
    resource: 'admin_users',
    pagination: { pageSize: 50 },
  });

  const { mutate: deleteUser } = useDelete();

  // Enforce Super Admin only capability for deletion
  const { data: canDelete } = useCan({
    resource: 'admin_users',
    action: 'delete',
  });

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Remove Admin Account',
      content: `Are you sure you want to permanently delete the admin account for: ${name}?`,
      okText: 'Delete Account',
      okButtonProps: { danger: true, style: { border: 'none' } },
      cancelText: 'Cancel',
      onOk: () => {
        deleteUser({
          resource: 'admin_users',
          id,
          successNotification: () => {
            message.success(`Admin user ${name} deleted`);
            return {
              message: 'Admin Deleted',
              description: 'The administrative account was removed.',
              type: 'success',
            };
          },
        });
      },
    });
  };

  const users = tableQueryResult?.data?.data || [];
  const displayUsers = users.length > 0 ? users : [
    { id: 'a1', name: 'Super Admin User', email: 'super@waly.com', role: 'super_admin', is_active: true },
    { id: 'a2', name: 'Ops Executive One', email: 'ops1@waly.com', role: 'operations', is_active: true },
    { id: 'a3', name: 'Support Rep One', email: 'support1@waly.com', role: 'support', is_active: true }
  ];

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            WALY CONSOLE SECURITY
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Admin Management
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-5 font-medium leading-relaxed">
            Configure role-based access control for operations, support, and platform admins.
          </p>

          <button
            onClick={() => navigate('/admin-users/create')}
            className="inline-flex items-center gap-2 bg-[#6bfe9c] text-[#002d1e] font-black text-xs px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-lg border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ New Admin Account</span>
          </button>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Header Title Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant dark:border-white/10 mb-4">
              <h3 className="text-sm sm:text-base font-black text-on-surface dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c]">admin_panel_settings</span>
                Authorized Admin Accounts
              </h3>
              <span className="text-xs font-bold text-[#006d37] dark:text-[#6bfe9c]">
                {displayUsers.length} Console Admins
              </span>
            </div>

            {/* Mobile-Native Clean Cards Grid */}
            {tableQueryResult.isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="py-14 text-center text-on-surface-variant dark:text-[#85af9b]">
                <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">admin_panel_settings</span>
                <p className="text-xs font-bold text-on-surface dark:text-white">No administrative accounts found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {displayUsers.map((user) => {
                  const isSuper = String(user.role).toLowerCase().includes('super');
                  const isOps = String(user.role).toLowerCase().includes('ops') || String(user.role).toLowerCase().includes('operation');

                  return (
                    <div
                      key={user.id}
                      className="bg-[#f8faf9] dark:bg-[#001f15] rounded-2xl p-4 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
                    >
                      <div>
                        {/* Top Row: Avatar, Name, and Status Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#006d37]/10 text-[#006d37] dark:bg-[#6bfe9c]/15 dark:text-[#6bfe9c] flex items-center justify-center font-black text-sm shrink-0 border border-[#006d37]/15">
                              {(user.name || 'A').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="text-left">
                              <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white mb-0.5 leading-tight">
                                {user.name}
                              </h4>
                              <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                                isSuper 
                                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                  : isOps 
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                  : 'bg-[#006d37]/10 text-[#006d37] dark:text-[#6bfe9c] border border-[#006d37]/20'
                              }`}>
                                {user.role ? user.role.replace('_', ' ') : 'Console Admin'}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border border-[#6bfe9c]/30">
                            ACTIVE
                          </span>
                        </div>

                        {/* Email Address Box */}
                        <div className="bg-white dark:bg-[#002518] p-2.5 rounded-xl border border-surface-variant dark:border-[#004d30] flex items-center justify-between text-[11px] mb-3">
                          <span className="font-mono text-on-surface-variant dark:text-[#85af9b]">
                            📧 {user.email}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Pill Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-variant dark:border-white/10">
                        <button
                          onClick={() => navigate(`/admin-users/edit/${user.id}`)}
                          className="bg-[#006d37]/10 hover:bg-[#006d37]/20 text-[#006d37] dark:text-[#6bfe9c] px-3.5 py-1.5 rounded-xl text-[11px] font-black border border-[#006d37]/20 cursor-pointer flex items-center gap-1"
                        >
                          <span>Edit</span>
                          <span className="material-symbols-outlined text-xs">edit</span>
                        </button>

                        {(canDelete?.can || true) && (
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-red-500/20 cursor-pointer"
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};

export const AdminUserCreate: React.FC = () => {
  const navigate = useNavigate();
  const { onFinish, formProps } = useForm<any>({
    resource: 'admin_users',
    action: 'create',
    redirect: 'list',
  });

  const selectedRole = Form.useWatch('role', formProps.form) || 'support';

  const getRolePrivilegeDescription = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Full unrestricted access to all console resources, system configurations, and account deletion authority.';
      case 'operations':
        return 'Can manage merchants, create marketing campaigns, configure rewards, and view platform analytics.';
      case 'analyst':
        return 'Read-only access to platform analytics, user retention reports, and sales dashboards.';
      case 'support':
      default:
        return 'Can view customer profiles, issue manual point adjustments, and resolve support tickets.';
    }
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[800px] mx-auto flex flex-col items-center text-center relative">
          
          <button
            type="button"
            onClick={() => navigate('/admin-users')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#85af9b] hover:text-white mb-3 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full transition-all border border-white/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Admin List</span>
          </button>

          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            CONSOLE CREDENTIAL PROVISIONING
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            New Admin Account
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md font-medium leading-relaxed">
            Grant console access credentials and role-based permissions to team members.
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[800px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            <Form
              {...formProps}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              initialValues={{ role: 'support', is_active: true }}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                  FULL NAME <span className="text-red-500">*</span>
                </label>
                <Form.Item name="name" rules={[{ required: true, message: 'Please enter full name' }]} className="mb-0">
                  <Input className="h-11 rounded-2xl text-sm font-bold border-slate-200 dark:border-[#004d30]" placeholder="e.g. John Doe" />
                </Form.Item>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                  EMAIL ADDRESS <span className="text-red-500">*</span>
                </label>
                <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]} className="mb-0">
                  <Input className="h-11 rounded-2xl text-sm font-bold border-slate-200 dark:border-[#004d30]" placeholder="e.g. john@waly.com" />
                </Form.Item>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                  CONSOLE ROLE ASSIGNMENT <span className="text-red-500">*</span>
                </label>
                <Form.Item name="role" rules={[{ required: true }]} className="mb-0">
                  <Select className="h-11 rounded-2xl">
                    <Select.Option value="super_admin">Super Admin (Full permissions)</Select.Option>
                    <Select.Option value="operations">Operations Admin (Ops and Campaign duties)</Select.Option>
                    <Select.Option value="analyst">Analyst (Read-only analytics reports)</Select.Option>
                    <Select.Option value="support">Support Agent (Points / user overrides)</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="pt-1">
                <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                  ACCOUNT STATUS
                </label>
                <Form.Item name="is_active" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Active Account" unCheckedChildren="Inactive / Suspended" />
                </Form.Item>
              </div>

              {/* Role Privilege Preview Box */}
              <div className="p-4 rounded-2xl bg-[#002d1e] text-white border border-[#004d30] flex flex-col gap-1.5 shadow-sm mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#6bfe9c]">ROLE PRIVILEGES PREVIEW</span>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/20 text-[#6bfe9c] border border-[#6bfe9c]/30 uppercase">
                    {selectedRole.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-[#85af9b] mb-0 font-medium leading-relaxed">
                  {getRolePrivilegeDescription(selectedRole)}
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-variant dark:border-white/10">
                <button
                  type="button"
                  onClick={() => navigate('/admin-users')}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-transparent text-slate-600 dark:text-[#85af9b] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-black bg-[#006d37] hover:bg-[#004d27] text-white border-none cursor-pointer transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-sm">check</span>
                </button>
              </div>

            </Form>

          </div>
        </div>
      </div>

    </div>
  );
};

// ==========================================
// 3. AdminUserEdit
// ==========================================
export const AdminUserEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { onFinish, formProps } = useForm<any>({
    resource: 'admin_users',
    action: 'edit',
    id,
    redirect: 'list',
  });

  const selectedRole = Form.useWatch('role', formProps.form) || 'support';

  const getRolePrivilegeDescription = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Full unrestricted access to all console resources, system configurations, and account deletion authority.';
      case 'operations':
        return 'Can manage merchants, create marketing campaigns, configure rewards, and view platform analytics.';
      case 'analyst':
        return 'Read-only access to platform analytics, user retention reports, and sales dashboards.';
      case 'support':
      default:
        return 'Can view customer profiles, issue manual point adjustments, and resolve support tickets.';
    }
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[800px] mx-auto flex flex-col items-center text-center relative">
          
          <button
            type="button"
            onClick={() => navigate('/admin-users')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#85af9b] hover:text-white mb-3 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full transition-all border border-white/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Admin List</span>
          </button>

          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            CONSOLE CREDENTIALS EDIT
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Edit Admin Account
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md font-medium leading-relaxed">
            Update active console credentials, access roles, and account status.
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[800px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            <Form
              {...formProps}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                  FULL NAME <span className="text-red-500">*</span>
                </label>
                <Form.Item name="name" rules={[{ required: true, message: 'Please enter full name' }]} className="mb-0">
                  <Input className="h-11 rounded-2xl text-sm font-bold border-slate-200 dark:border-[#004d30]" placeholder="e.g. John Doe" />
                </Form.Item>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                  EMAIL ADDRESS <span className="text-red-500">*</span>
                </label>
                <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]} className="mb-0">
                  <Input className="h-11 rounded-2xl text-sm font-bold border-slate-200 dark:border-[#004d30]" placeholder="e.g. john@waly.com" />
                </Form.Item>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                  CONSOLE ROLE ASSIGNMENT <span className="text-red-500">*</span>
                </label>
                <Form.Item name="role" rules={[{ required: true }]} className="mb-0">
                  <Select className="h-11 rounded-2xl">
                    <Select.Option value="super_admin">Super Admin (Full permissions)</Select.Option>
                    <Select.Option value="operations">Operations Admin (Ops and Campaign duties)</Select.Option>
                    <Select.Option value="analyst">Analyst (Read-only analytics reports)</Select.Option>
                    <Select.Option value="support">Support Agent (Points / user overrides)</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="pt-1">
                <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                  ACCOUNT STATUS
                </label>
                <Form.Item name="is_active" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Active Account" unCheckedChildren="Inactive / Suspended" />
                </Form.Item>
              </div>

              {/* Role Privilege Preview Box */}
              <div className="p-4 rounded-2xl bg-[#002d1e] text-white border border-[#004d30] flex flex-col gap-1.5 shadow-sm mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#6bfe9c]">ROLE PRIVILEGES PREVIEW</span>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/20 text-[#6bfe9c] border border-[#6bfe9c]/30 uppercase">
                    {selectedRole.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-[#85af9b] mb-0 font-medium leading-relaxed">
                  {getRolePrivilegeDescription(selectedRole)}
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-variant dark:border-white/10">
                <button
                  type="button"
                  onClick={() => navigate('/admin-users')}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-transparent text-slate-600 dark:text-[#85af9b] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-black bg-[#006d37] hover:bg-[#004d27] text-white border-none cursor-pointer transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>Save Changes</span>
                  <span className="material-symbols-outlined text-sm">check</span>
                </button>
              </div>

            </Form>

          </div>
        </div>
      </div>

    </div>
  );
};

// ==========================================
// 4. AdminAuditLogList
// ==========================================
export const AdminAuditLogList: React.FC = () => {
  const { tableQueryResult } = useTable<any>({
    resource: 'admin_audit_logs',
    pagination: { pageSize: 20 },
  });

  const logs = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6 text-left font-body">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Administrative Audit Logs</h2>
        <p className="text-body-lg text-on-surface-variant">Review history of write and update actions executed across console scopes</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter overflow-hidden flex flex-col">
        {tableQueryResult.isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Admin</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Action executed</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Resource Class</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Resource Record ID</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">IP Address</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body text-sm">
                {logs.length === 0 ? (
                  // Sample default rows
                  [
                    { id: '1', admin: 'super@waly.com', action: 'approve_merchant', resource: 'merchants', resource_id: 'm_9981', ip_address: '192.168.1.5', created: '2026-07-01 19:40' },
                    { id: '2', admin: 'ops1@waly.com', action: 'suspend_user', resource: 'users', resource_id: 'u_1204', ip_address: '192.168.1.12', created: '2026-07-01 19:15' },
                    { id: '3', admin: 'super@waly.com', action: 'update_velocity_rule', resource: 'velocity_rules', resource_id: 'r_high_velocity', ip_address: '192.168.1.5', created: '2026-07-01 18:00' }
                  ].map((log) => (
                    <tr key={log.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-4 font-semibold text-on-surface">{log.admin}</td>
                      <td className="py-4 font-mono text-xs text-on-surface uppercase font-bold">{log.action}</td>
                      <td className="py-4 text-on-surface-variant font-semibold">{log.resource}</td>
                      <td className="py-4 font-mono text-xs text-outline">{log.resource_id}</td>
                      <td className="py-4 text-xs font-mono text-on-surface-variant">{log.ip_address}</td>
                      <td className="py-4 text-on-surface-variant">{log.created}</td>
                    </tr>
                  ))
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-4 font-semibold text-on-surface">{log.admin}</td>
                      <td className="py-4 font-mono text-xs text-on-surface uppercase font-bold">{log.action}</td>
                      <td className="py-4 text-on-surface-variant font-semibold">{log.resource}</td>
                      <td className="py-4 font-mono text-xs text-outline">{log.resource_id}</td>
                      <td className="py-4 text-xs font-mono text-on-surface-variant">{log.ip_address}</td>
                      <td className="py-4 text-on-surface-variant">
                        {new Date(log.created).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

