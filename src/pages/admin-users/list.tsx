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
    pagination: { pageSize: 10 },
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

  return (
    <div className="flex flex-col gap-6 text-left font-body">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Admin Management</h2>
          <p className="text-body-lg text-on-surface-variant">Configure role-based access for operations and support team members</p>
        </div>
        <button
          onClick={() => navigate('/admin-users/create')}
          className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Admin Account
        </button>
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
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Name</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Email Address</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Assigned Role</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {users.length === 0 ? (
                  // Render mockup administrators if collection is empty
                  [
                    { id: 'a1', name: 'Super Admin User', email: 'super@waly.com', role: 'super_admin', is_active: true },
                    { id: 'a2', name: 'Ops Executive One', email: 'ops1@waly.com', role: 'operations', is_active: true },
                    { id: 'a3', name: 'Support Rep One', email: 'support1@waly.com', role: 'support', is_active: true }
                  ].map((user) => (
                    <tr key={user.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-semibold text-on-surface text-sm">{user.name}</td>
                      <td className="py-5 text-sm text-on-surface-variant font-mono">{user.email}</td>
                      <td className="py-5 text-sm text-on-surface uppercase font-semibold">{user.role?.replace('_', ' ')}</td>
                      <td className="py-5">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin-users/edit/${user.id}`)}
                            className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Edit
                          </button>
                          {canDelete?.can && (
                            <button
                              onClick={() => handleDelete(user.id, user.name)}
                              className="text-error font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-semibold text-on-surface text-sm">{user.name}</td>
                      <td className="py-5 text-sm text-on-surface-variant font-mono">{user.email}</td>
                      <td className="py-5 text-sm text-on-surface uppercase font-semibold">{user.role?.replace('_', ' ')}</td>
                      <td className="py-5">
                        {user.is_active ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Inactive</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin-users/edit/${user.id}`)}
                            className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Edit
                          </button>
                          {canDelete?.can && (
                            <button
                              onClick={() => handleDelete(user.id, user.name)}
                              className="text-error font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
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

// ==========================================
// 2. AdminUserCreate
// ==========================================
export const AdminUserCreate: React.FC = () => {
  const navigate = useNavigate();
  const { onFinish, formProps } = useForm<any>({
    resource: 'admin_users',
    action: 'create',
    redirect: 'list',
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto text-left font-body">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">New Admin Account</h2>
        <p className="text-body-lg text-on-surface-variant">Grant console access to a team member</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{ role: 'support', is_active: true }}
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input className="h-10 rounded-xl" placeholder="e.g. John Doe" />
          </Form.Item>

          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input className="h-10 rounded-xl" placeholder="e.g. john@waly.com" />
          </Form.Item>

          <Form.Item name="role" label="Console Role Assignment" rules={[{ required: true }]}>
            <Select className="h-10 rounded-xl">
              <Select.Option value="super_admin">Super Admin (All permissions)</Select.Option>
              <Select.Option value="operations">Operations Admin (Ops and Campaign duties)</Select.Option>
              <Select.Option value="analyst">Analyst (Read-only analytics reports)</Select.Option>
              <Select.Option value="support">Support Agent (Points / user overrides)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active Account" unCheckedChildren="Inactive / Suspended" />
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button onClick={() => navigate('/admin-users')} className="h-11 rounded-xl px-6 font-bold cursor-pointer">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
              Create Account
            </Button>
          </div>
        </Form>
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

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto text-left font-body">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Edit Admin Account</h2>
        <p className="text-body-lg text-on-surface-variant">Update active console credentials and permissions</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="role" label="Console Role Assignment" rules={[{ required: true }]}>
            <Select className="h-10 rounded-xl">
              <Select.Option value="super_admin">Super Admin</Select.Option>
              <Select.Option value="operations">Operations Admin</Select.Option>
              <Select.Option value="analyst">Analyst</Select.Option>
              <Select.Option value="support">Support Agent</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active Account" unCheckedChildren="Inactive / Suspended" />
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button onClick={() => navigate('/admin-users')} className="h-11 rounded-xl px-6 font-bold cursor-pointer">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
              Save Account Changes
            </Button>
          </div>
        </Form>
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

