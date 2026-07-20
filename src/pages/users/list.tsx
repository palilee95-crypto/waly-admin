import React, { useState, useEffect, useRef } from 'react';
import { useTable, useUpdate, useDelete } from '@refinedev/core';
import { Modal, Form, Input, Select, Button, message, Pagination, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustmentForm] = Form.useForm();

  // Search values state
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchRole, setSearchRole] = useState('all');

  // Fetch users from pocketbase
  const { 
    tableQueryResult, 
    setFilters,
    current,
    setCurrent,
    pageSize,
    setPageSize
  } = useTable<any>({
    resource: 'users',
    pagination: { pageSize: 10 },
    syncWithLocation: false, // Disable syncing to URL query params to prevent Vite URI malformed crashes from trailing wildcard (%) characters
  });

  const { mutate: updateUser } = useUpdate();
  const { mutate: deleteUser } = useDelete();
  const isFirstRender = useRef(true);

  // Perform search automatically when typing (with a short 250ms debounce)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handler = setTimeout(() => {
      const activeFilters = [];
      if (searchName.trim()) {
        activeFilters.push({ field: 'name', operator: 'contains', value: searchName.trim() + '%' });
      }
      if (searchPhone.trim()) {
        activeFilters.push({ field: 'phone', operator: 'contains', value: searchPhone.trim() + '%' });
      }
      if (searchRole && searchRole !== 'all') {
        activeFilters.push({ field: 'role', operator: 'eq', value: searchRole });
      }
      setFilters(activeFilters, 'replace');
    }, 250);

    return () => clearTimeout(handler);
  }, [searchName, searchPhone, searchRole]);

  // Handle immediate search / clear on Enter keydown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const activeFilters = [];
      if (searchName.trim()) {
        activeFilters.push({ field: 'name', operator: 'contains', value: searchName.trim() + '%' });
      }
      if (searchPhone.trim()) {
        activeFilters.push({ field: 'phone', operator: 'contains', value: searchPhone.trim() + '%' });
      }
      if (searchRole && searchRole !== 'all') {
        activeFilters.push({ field: 'role', operator: 'eq', value: searchRole });
      }
      setFilters(activeFilters, 'replace');
    }
  };

  const handleToggleStatus = (user: any) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    Modal.confirm({
      title: `${newStatus === 'suspended' ? 'Suspend' : 'Activate'} User Account`,
      content: `Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} the account for ${user.name}?`,
      okText: newStatus === 'suspended' ? 'Suspend' : 'Activate',
      okButtonProps: { danger: newStatus === 'suspended', style: { border: 'none' } },
      onOk: () => {
        updateUser({
          resource: 'users',
          id: user.id,
          values: { status: newStatus },
          successNotification: () => {
            message.success(`User ${user.name} status updated to ${newStatus}`);
            return {
              message: 'Status Updated',
              description: `User account is now ${newStatus}.`,
              type: 'success',
            };
          },
        });
      },
    });
  };

  const handleHardDelete = (user: any) => {
    deleteUser({
      resource: 'users',
      id: user.id,
      successNotification: () => {
        message.success(`User ${user.name} and all related data have been deleted.`);
        return {
          message: 'User Deleted',
          description: `The account for ${user.name} has been permanently removed.`,
          type: 'success',
        };
      },
    });
  };

  const handleAdjustPointsClick = (user: any) => {
    setSelectedUser(user);
    setIsAdjustmentModalOpen(true);
    adjustmentForm.resetFields();
  };

  const handleAdjustmentSubmit = (values: any) => {
    if (!selectedUser) return;
    
    // In a real application, we would create a transaction record and update the user's total points.
    // For this simulation, we update the user's total_points in PocketBase directly.
    const pointDifference = values.type === 'credit' ? Number(values.points) : -Number(values.points);
    const newPoints = (selectedUser.total_points || 0) + pointDifference;

    updateUser({
      resource: 'users',
      id: selectedUser.id,
      values: { total_points: newPoints },
      successNotification: () => {
        message.success(`Points adjusted for ${selectedUser.name}. New balance: ${newPoints}`);
        return {
          message: 'Points Adjusted',
          description: `Credited/debited points successfully.`,
          type: 'success',
        };
      },
    });

    setIsAdjustmentModalOpen(false);
  };

  const users = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">User Management</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Search and support WALY customer accounts</p>
        </div>
      </div>

      {/* Search Filter Panel */}
      <div className="glass-panel rounded-3xl p-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-11 px-4 rounded-xl bg-white/40 border-none focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by phone..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-11 px-4 rounded-xl bg-white/40 border-none focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
          />
        </div>
        <div className="flex-1 min-w-[200px] h-11 rounded-xl bg-white/40 flex items-center px-2">
          <Select
            value={searchRole}
            onChange={(value) => setSearchRole(value)}
            className="w-full text-sm font-medium border-none"
            variant="borderless"
            bordered={false}
            popupClassName="rounded-xl shadow-xl border-none"
          >
            <Select.Option value="all">All Roles</Select.Option>
            <Select.Option value="customer">Customer</Select.Option>
            <Select.Option value="merchant">Merchant</Select.Option>
            <Select.Option value="both">Both</Select.Option>
          </Select>
        </div>
        {(searchName || searchPhone || searchRole !== 'all') ? (
          <button
            onClick={() => {
              setSearchName('');
              setSearchPhone('');
              setSearchRole('all');
              setFilters([], 'replace');
            }}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-6 h-11 rounded-xl font-headline font-semibold flex items-center gap-2 transition-all border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
            Clear Search
          </button>
        ) : (
          <div className="bg-slate-100/50 text-slate-400 px-6 h-11 rounded-xl font-headline font-semibold flex items-center gap-2 border-none">
            <span className="material-symbols-outlined text-[20px]">search</span>
            Filter Active
          </div>
        )}
      </div>

      {/* Users Table view using glassmorphism layout */}
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
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">User</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Phone</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Points Balance</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant text-sm">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/40 transition-colors cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.name?.substring(0, 2).toUpperCase()}
                          </div>
                           <div>
                            <p className="font-headline text-sm font-semibold text-on-surface">{user.name}</p>
                            <p className={`text-[10px] uppercase tracking-wider font-bold ${
                              String(user.role).toLowerCase() === 'merchant'
                                ? 'text-orange-500'
                                : String(user.role).toLowerCase() === 'both'
                                ? 'text-purple-600'
                                : 'text-primary'
                            }`}>
                              {user.role || 'Customer'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 text-sm text-on-surface">{user.phone || 'N/A'}</td>
                      <td className="py-5 text-sm font-bold text-on-surface">
                        {user.total_points !== undefined ? user.total_points : 0} pts
                      </td>
                      <td className="py-5">
                        {user.status === 'suspended' ? (
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">Suspended</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                        )}
                      </td>
                      <td className="py-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/users/${user.id}`)}
                            className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleAdjustPointsClick(user)}
                            className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs hover:bg-primary/20 transition-all border-none font-bold cursor-pointer"
                          >
                            Adjust Points
                          </button>
                           <button
                             onClick={() => handleToggleStatus(user)}
                             className={`px-3 py-1.5 rounded-lg text-xs transition-all border-none font-bold cursor-pointer ${
                               user.status === 'suspended'
                                 ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                 : 'bg-red-50 text-red-600 hover:bg-red-100'
                             }`}
                           >
                             {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                           </button>
                           <Popconfirm
                             title="Delete User"
                             description={`Are you sure you want to permanently delete ${user.name}? This will remove all their loyalty cards, transactions, and related data.`}
                             onConfirm={() => handleHardDelete(user)}
                             okText="Yes, Delete"
                             cancelText="No"
                             okButtonProps={{ danger: true, style: { border: 'none' } }}
                           >
                             <button className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 transition-all border-none font-bold cursor-pointer">
                               Delete
                             </button>
                           </Popconfirm>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination Controls */}
        <div className="flex justify-end p-4 border-t border-black/5 bg-white/20">
          <Pagination
            current={current}
            pageSize={pageSize}
            total={tableQueryResult?.data?.total || 0}
            onChange={(page, size) => {
              setCurrent(page);
              setPageSize(size);
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Total ${total} users`}
          />
        </div>
      </div>

      {/* Points Adjustment Modal */}
      <Modal
        title={`Adjust Points for ${selectedUser?.name}`}
        open={isAdjustmentModalOpen}
        onOk={() => adjustmentForm.submit()}
        onCancel={() => setIsAdjustmentModalOpen(false)}
        okText="Confirm Adjustment"
        okButtonProps={{ style: { backgroundColor: '#0040e0', border: 'none' } }}
        cancelText="Cancel"
      >
        <Form
          form={adjustmentForm}
          layout="vertical"
          onFinish={handleAdjustmentSubmit}
          initialValues={{ type: 'credit', points: 100 }}
          className="py-4"
        >
          <Form.Item
            name="type"
            label="Adjustment Type"
            rules={[{ required: true }]}
          >
            <Select className="h-10 rounded-xl">
              <Select.Option value="credit">Credit (Add points)</Select.Option>
              <Select.Option value="debit">Debit (Deduct points)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="points"
            label="Points"
            rules={[
              { required: true, message: 'Please enter points amount' },
              { pattern: /^[0-9]+$/, message: 'Points must be a positive integer' }
            ]}
          >
            <Input type="number" className="h-10 rounded-xl" placeholder="e.g. 200" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason for adjustment"
            rules={[{ required: true, message: 'Please specify the reason' }]}
          >
            <Input className="h-10 rounded-xl" placeholder="e.g. Verified missing purchase receipt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
