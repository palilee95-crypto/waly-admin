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
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            risev NETWORK ACCOUNTS
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            User Management
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md font-medium leading-relaxed">
            Search customer profiles, inspect points balances, adjust points, and manage account statuses.
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Toolbar: Unified Search & Role Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant dark:border-white/10">
              
              {/* Role Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSearchRole('all')}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border cursor-pointer whitespace-nowrap ${
                    searchRole === 'all'
                      ? 'bg-[#006d37] text-white border-[#006d37] shadow-md'
                      : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                  }`}
                >
                  All Users ({users.length})
                </button>
                <button
                  onClick={() => setSearchRole('customer')}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border cursor-pointer whitespace-nowrap ${
                    searchRole === 'customer'
                      ? 'bg-[#006d37] text-white border-[#006d37] shadow-md'
                      : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                  }`}
                >
                  Customers
                </button>
                <button
                  onClick={() => setSearchRole('merchant')}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border cursor-pointer whitespace-nowrap ${
                    searchRole === 'merchant'
                      ? 'bg-[#006d37] text-white border-[#006d37] shadow-md'
                      : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                  }`}
                >
                  Merchants
                </button>
              </div>

              {/* Unified Live Search Input */}
              <div className="relative w-full sm:w-[260px]">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                <input
                  type="text"
                  placeholder="Search user name or phone..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#f6f3f2] dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-on-surface dark:text-white outline-none focus:border-[#006d37] transition-all"
                />
              </div>

            </div>

            {/* Mobile-Native Clean Cards Grid */}
            {tableQueryResult.isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="py-14 text-center text-on-surface-variant dark:text-[#85af9b]">
                <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">group</span>
                <p className="text-xs font-bold text-on-surface dark:text-white">No users found matching filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-[#f8faf9] dark:bg-[#001f15] rounded-2xl p-4 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
                  >
                    <div>
                      {/* Top Row: User Avatar, Name, Role & Status */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div 
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => navigate(`/users/${user.id}`)}
                        >
                          <div className="w-10 h-10 rounded-2xl bg-[#006d37]/10 text-[#006d37] dark:bg-[#6bfe9c]/15 dark:text-[#6bfe9c] flex items-center justify-center font-black text-sm shrink-0 border border-[#006d37]/15">
                            {(user.name || 'U').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white mb-0.5 group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c] transition-colors leading-tight">
                              {user.name}
                            </h4>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                              String(user.role).toLowerCase() === 'merchant'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-[#006d37]/10 text-[#006d37] dark:text-[#6bfe9c] border border-[#006d37]/20'
                            }`}>
                              {user.role || 'Customer'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {user.status === 'suspended' ? (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                              SUSPENDED
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border border-[#6bfe9c]/30">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Phone & Points Balance Info Box */}
                      <div className="bg-white dark:bg-[#002518] p-2.5 rounded-xl border border-surface-variant dark:border-[#004d30] flex items-center justify-between text-[11px] mb-3">
                        <span className="font-mono text-on-surface-variant dark:text-[#85af9b]">
                          📱 {user.phone || 'No Phone Added'}
                        </span>
                        <span className="font-black text-[#006d37] dark:text-[#6bfe9c] bg-[#6bfe9c]/15 px-2.5 py-0.5 rounded-full">
                          ⚡ {user.total_points || 0} pts
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Pill Buttons */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-surface-variant dark:border-white/10">
                      
                      <button
                        onClick={() => handleAdjustPointsClick(user)}
                        className="bg-[#006d37]/10 hover:bg-[#006d37]/20 text-[#006d37] dark:text-[#6bfe9c] px-3 py-1.5 rounded-xl text-[11px] font-black border border-[#006d37]/20 cursor-pointer flex items-center gap-1"
                      >
                        <span>⚡ Adjust Pts</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                            user.status === 'suspended'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>

                        <Popconfirm
                          title="Delete User"
                          description={`Delete account for ${user.name}?`}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true, style: { border: 'none' } }}
                          onConfirm={() => handleHardDelete(user)}
                        >
                          <button
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-red-500/20 cursor-pointer"
                          >
                            🗑️
                          </button>
                        </Popconfirm>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {tableQueryResult?.data?.total && tableQueryResult.data.total > pageSize && (
              <div className="flex justify-center items-center mt-6 pt-4 border-t border-surface-variant dark:border-white/10">
                <Pagination
                  current={current}
                  pageSize={pageSize}
                  total={tableQueryResult.data.total}
                  onChange={(page, pSize) => {
                    setCurrent(page);
                    setPageSize(pSize);
                  }}
                  showSizeChanger={false}
                />
              </div>
            )}

          </div>
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
