import React, { useState } from 'react';
import { useTable, useShow } from '@refinedev/core';
import { useForm, useSelect } from '@refinedev/antd';
import { Form, Input, Select, Button, InputNumber, DatePicker, message, Switch, Table, Segmented } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

// ==========================================
// 1. BadgeList
// ==========================================
export const BadgeList: React.FC = () => {
  const navigate = useNavigate();
  const { tableQueryResult } = useTable<any>({
    resource: 'badges',
    pagination: { pageSize: 10 },
  });

  const badges = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Gamification Badges</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Configure system badges and awards for users</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/gamification/challenges')}
            className="bg-slate-200 text-on-surface px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
          >
            Challenges
          </button>
          <button
            onClick={() => navigate('/gamification/leaderboards')}
            className="bg-slate-200 text-on-surface px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
          >
            Leaderboards
          </button>
          <button
            onClick={() => navigate('/gamification/badges/create')}
            className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Badge
          </button>
        </div>
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
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Icon</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Name</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Category</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Criteria Type</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Threshold</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {badges.length === 0 ? (
                  // Sample seed data if DB is empty
                  [
                    { id: '1', name: 'First Milestone', category: 'milestone', criteria_type: 'transaction_count', threshold: 1, is_active: true },
                    { id: '2', name: 'Super Shopper', category: 'milestone', criteria_type: 'transaction_count', threshold: 10, is_active: true },
                    { id: '3', name: 'Centurion Warrior', category: 'streak', criteria_type: 'streak_days', threshold: 100, is_active: true }
                  ].map((badge) => (
                    <tr key={badge.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-semibold text-on-surface text-sm">🏆</td>
                      <td className="py-5 font-semibold text-on-surface text-sm">{badge.name}</td>
                      <td className="py-5 text-sm text-on-surface uppercase">{badge.category}</td>
                      <td className="py-5 text-sm text-on-surface uppercase">{badge.criteria_type.replace('_', ' ')}</td>
                      <td className="py-5 text-sm font-bold text-on-surface">{badge.threshold}</td>
                      <td className="py-5">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => navigate(`/gamification/badges/edit/${badge.id}`)}
                          className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  badges.map((badge) => (
                    <tr key={badge.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 text-sm">🏆</td>
                      <td className="py-5 font-semibold text-on-surface text-sm">{badge.name}</td>
                      <td className="py-5 text-sm text-on-surface uppercase">{badge.category}</td>
                      <td className="py-5 text-sm text-on-surface uppercase">{(badge.criteria?.type || badge.criteria_type || '').replace('_', ' ')}</td>
                      <td className="py-5 text-sm font-bold text-on-surface">{badge.criteria?.threshold || badge.threshold || 0}</td>
                      <td className="py-5">
                        {badge.is_active ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Inactive</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => navigate(`/gamification/badges/edit/${badge.id}`)}
                          className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Edit
                        </button>
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
// 2. BadgeCreate
// ==========================================
export const BadgeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { onFinish, formProps } = useForm<any>({
    resource: 'badges',
    action: 'create',
    redirect: 'list',
  });

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const handleSubmit = (values: any) => {
    // Structure criteria properly
    const formattedValues = {
      name: values.name,
      description: values.description,
      category: values.category,
      is_active: values.is_active,
      criteria: {
        type: values.criteria_type,
        threshold: values.threshold,
        merchant: values.merchant || null,
      },
    };
    onFinish(formattedValues);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto text-left">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Create Badge</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Design a new system badge award</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{ category: 'milestone', criteria_type: 'transaction_count', threshold: 1, is_active: true }}
        >
          <Form.Item name="name" label="Badge Name" rules={[{ required: true }]}>
            <Input className="h-10 rounded-xl" placeholder="e.g. Early Adopter" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} className="rounded-xl" placeholder="Detail description of the badge rules..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="milestone">Milestone Achievement</Select.Option>
                <Select.Option value="streak">Streak Maintenance</Select.Option>
                <Select.Option value="social">Social / Referral</Select.Option>
                <Select.Option value="special">Special Events</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="criteria_type" label="Criteria Type" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="transaction_count">Transaction Count</Select.Option>
                <Select.Option value="points_total">Points Accumulated</Select.Option>
                <Select.Option value="streak_days">Consecutive Streak Days</Select.Option>
                <Select.Option value="merchant_visits">Specific Merchant Visits</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="threshold" label="Threshold Value" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>

            <Form.Item name="merchant" label="Merchant Limitation (Optional)">
              <Select {...merchantSelectProps} allowClear className="h-10 rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button onClick={() => navigate('/gamification/badges')} className="h-11 rounded-xl px-6 font-bold cursor-pointer">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
              Create Badge
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

// ==========================================
// 3. BadgeEdit
// ==========================================
export const BadgeEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onFinish, formProps, queryResult } = useForm<any>({
    resource: 'badges',
    action: 'edit',
    id,
    redirect: 'list',
  });

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const record = queryResult?.data?.data;

  React.useEffect(() => {
    if (record) {
      formProps.form?.setFieldsValue({
        criteria_type: record.criteria?.type || record.criteria_type,
        threshold: record.criteria?.threshold || record.threshold,
        merchant: record.criteria?.merchant || record.merchant,
      });
    }
  }, [record, formProps.form]);

  const handleSubmit = (values: any) => {
    const formattedValues = {
      name: values.name,
      description: values.description,
      category: values.category,
      is_active: values.is_active,
      criteria: {
        type: values.criteria_type,
        threshold: values.threshold,
        merchant: values.merchant || null,
      },
    };
    onFinish(formattedValues);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto text-left">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Edit Badge</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Update active rules or parameters</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item name="name" label="Badge Name" rules={[{ required: true }]}>
            <Input className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} className="rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="milestone">Milestone Achievement</Select.Option>
                <Select.Option value="streak">Streak Maintenance</Select.Option>
                <Select.Option value="social">Social / Referral</Select.Option>
                <Select.Option value="special">Special Events</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="criteria_type" label="Criteria Type" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="transaction_count">Transaction Count</Select.Option>
                <Select.Option value="points_total">Points Accumulated</Select.Option>
                <Select.Option value="streak_days">Consecutive Streak Days</Select.Option>
                <Select.Option value="merchant_visits">Specific Merchant Visits</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="threshold" label="Threshold Value" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>

            <Form.Item name="merchant" label="Merchant Limitation (Optional)">
              <Select {...merchantSelectProps} allowClear className="h-10 rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button onClick={() => navigate('/gamification/badges')} className="h-11 rounded-xl px-6 font-bold cursor-pointer">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

// ==========================================
// 4. ChallengeList
// ==========================================
export const ChallengeList: React.FC = () => {
  const navigate = useNavigate();
  const { tableQueryResult } = useTable<any>({
    resource: 'challenges',
    pagination: { pageSize: 10 },
  });

  const challenges = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Challenges Ledger</h2>
          <p className="font-body text-body-lg text-on-surface-variant">View active gamified challenges and rewards</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/gamification/badges')}
            className="bg-slate-200 text-on-surface px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
          >
            Badges Catalog
          </button>
          <button
            onClick={() => navigate('/gamification/challenges/create')}
            className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Challenge
          </button>
        </div>
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
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Title</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Type</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Target Value</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Points Reward</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Timeline</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {challenges.length === 0 ? (
                  // Sample data if DB is empty
                  [
                    { id: 'c1', title: 'Weekend Warrior', type: 'earn_points', target: 500, reward_points: 50, start_date: '2026-07-04', end_date: '2026-07-06', is_active: true },
                    { id: 'c2', title: 'Coffee Lover', type: 'visit_merchant', target: 5, reward_points: 30, start_date: '2026-07-01', end_date: '2026-07-15', is_active: true }
                  ].map((ch) => (
                    <tr key={ch.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-semibold text-on-surface text-sm">{ch.title}</td>
                      <td className="py-5 text-sm text-on-surface uppercase">{ch.type.replace('_', ' ')}</td>
                      <td className="py-5 text-sm text-on-surface">{ch.target}</td>
                      <td className="py-5 text-sm font-bold text-primary">+{ch.reward_points} pts</td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {ch.start_date} to {ch.end_date}
                      </td>
                      <td className="py-5">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => navigate(`/gamification/challenges/edit/${ch.id}`)}
                          className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  challenges.map((ch) => (
                    <tr key={ch.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-semibold text-on-surface text-sm">{ch.title}</td>
                      <td className="py-5 text-sm text-on-surface uppercase">{ch.type?.replace('_', ' ')}</td>
                      <td className="py-5 text-sm text-on-surface">{ch.target}</td>
                      <td className="py-5 text-sm font-bold text-primary">+{ch.reward_points} pts</td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {new Date(ch.start_date).toLocaleDateString()} to {new Date(ch.end_date).toLocaleDateString()}
                      </td>
                      <td className="py-5">
                        {ch.is_active ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Inactive</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => navigate(`/gamification/challenges/edit/${ch.id}`)}
                          className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Edit
                        </button>
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
// 5. ChallengeCreate
// ==========================================
export const ChallengeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { onFinish, formProps } = useForm<any>({
    resource: 'challenges',
    action: 'create',
    redirect: 'list',
  });

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const { selectProps: badgeSelectProps } = useSelect<any>({
    resource: 'badges',
  });

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      start_date: values.start_date ? values.start_date.toISOString() : null,
      end_date: values.end_date ? values.end_date.toISOString() : null,
    };
    onFinish(formattedValues);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto text-left">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">New Challenge</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Create a time-limited customer engagement task</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{ type: 'earn_points', reward_points: 50, is_active: true }}
        >
          <Form.Item name="title" label="Challenge Title" rules={[{ required: true }]}>
            <Input className="h-10 rounded-xl" placeholder="e.g. Coffee Marathon" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} className="rounded-xl" placeholder="Describe the goal of the challenge..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Challenge Type" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="earn_points">Accumulate Points</Select.Option>
                <Select.Option value="visit_merchant">Visit Partner Merchants</Select.Option>
                <Select.Option value="complete_stamp_card">Complete Stamp Cards</Select.Option>
                <Select.Option value="refer_friend">Refer New Friends</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="target" label="Target Criteria Value" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="reward_points" label="Bonus Points Awarded" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>

            <Form.Item name="reward_badge" label="Bonus Badge Reward (Optional)">
              <Select {...badgeSelectProps} allowClear className="h-10 rounded-xl" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: 'Please pick start date' }]}>
              <DatePicker className="w-full h-10 rounded-xl" />
            </Form.Item>

            <Form.Item name="end_date" label="End Date" rules={[{ required: true, message: 'Please pick end date' }]}>
              <DatePicker className="w-full h-10 rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item name="merchant" label="Merchant Association (Optional)">
            <Select {...merchantSelectProps} allowClear className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button onClick={() => navigate('/gamification/challenges')} className="h-11 rounded-xl px-6 font-bold cursor-pointer">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
              Create Challenge
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

// ==========================================
// 6. ChallengeEdit
// ==========================================
export const ChallengeEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onFinish, formProps, queryResult } = useForm<any>({
    resource: 'challenges',
    action: 'edit',
    id,
    redirect: 'list',
  });

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const { selectProps: badgeSelectProps } = useSelect<any>({
    resource: 'badges',
  });

  const record = queryResult?.data?.data;

  React.useEffect(() => {
    if (record) {
      formProps.form?.setFieldsValue({
        start_date: record.start_date ? dayjs(record.start_date) : null,
        end_date: record.end_date ? dayjs(record.end_date) : null,
      });
    }
  }, [record, formProps.form]);

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      start_date: values.start_date ? values.start_date.toISOString() : null,
      end_date: values.end_date ? values.end_date.toISOString() : null,
    };
    onFinish(formattedValues);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto text-left">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Edit Challenge</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Update active rules and duration dates</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item name="title" label="Challenge Title" rules={[{ required: true }]}>
            <Input className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} className="rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Challenge Type" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="earn_points">Accumulate Points</Select.Option>
                <Select.Option value="visit_merchant">Visit Partner Merchants</Select.Option>
                <Select.Option value="complete_stamp_card">Complete Stamp Cards</Select.Option>
                <Select.Option value="refer_friend">Refer New Friends</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="target" label="Target Criteria Value" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="reward_points" label="Bonus Points Awarded" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>

            <Form.Item name="reward_badge" label="Bonus Badge Reward (Optional)">
              <Select {...badgeSelectProps} allowClear className="h-10 rounded-xl" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: 'Please pick start date' }]}>
              <DatePicker className="w-full h-10 rounded-xl" />
            </Form.Item>

            <Form.Item name="end_date" label="End Date" rules={[{ required: true, message: 'Please pick end date' }]}>
              <DatePicker className="w-full h-10 rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item name="merchant" label="Merchant Association (Optional)">
            <Select {...merchantSelectProps} allowClear className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button onClick={() => navigate('/gamification/challenges')} className="h-11 rounded-xl px-6 font-bold cursor-pointer">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

// ==========================================
// 7. LeaderboardPage
// ==========================================
export const LeaderboardPage: React.FC = () => {
  const [metric, setMetric] = useState<'points' | 'visits' | 'streak'>('points');

  // Sample seed leaderboards mapping
  const mockLeaderboards = {
    points: [
      { key: '1', rank: 1, name: 'Alice Tan', metricValue: '4,500 pts', tier: 'Platinum' },
      { key: '2', rank: 2, name: 'Bob Lim', metricValue: '3,800 pts', tier: 'Gold' },
      { key: '3', rank: 3, name: 'Charlie Wong', metricValue: '3,200 pts', tier: 'Gold' },
      { key: '4', rank: 4, name: 'David Lee', metricValue: '2,900 pts', tier: 'Silver' },
    ],
    visits: [
      { key: '1', rank: 1, name: 'Charlie Wong', metricValue: '42 visits', tier: 'Gold' },
      { key: '2', rank: 2, name: 'Alice Tan', metricValue: '35 visits', tier: 'Platinum' },
      { key: '3', rank: 3, name: 'Eva Low', metricValue: '28 visits', tier: 'Silver' },
    ],
    streak: [
      { key: '1', rank: 1, name: 'Bob Lim', metricValue: '120 days', tier: 'Gold' },
      { key: '2', rank: 2, name: 'David Lee', metricValue: '85 days', tier: 'Silver' },
      { key: '3', rank: 3, name: 'Alice Tan', metricValue: '64 days', tier: 'Platinum' },
    ]
  };

  const columns = [
    { title: 'Rank', dataIndex: 'rank', key: 'rank', render: (val: number) => <span className="font-bold">#{val}</span> },
    { title: 'Customer Name', dataIndex: 'name', key: 'name', render: (val: string) => <span className="font-semibold">{val}</span> },
    { title: 'Tier', dataIndex: 'tier', key: 'tier' },
    { title: 'Score Metric', dataIndex: 'metricValue', key: 'metricValue', render: (val: string) => <span className="text-primary font-bold">{val}</span> }
  ];

  return (
    <div className="flex flex-col gap-6 text-left font-body">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Leaderboard Analytics</h2>
          <p className="text-body-lg text-on-surface-variant">Review top active platform customer rankings</p>
        </div>
      </div>

      <div className="flex justify-start">
        <Segmented
          options={[
            { label: 'Points Earned', value: 'points' },
            { label: 'Merchant Visits', value: 'visits' },
            { label: 'Active Streaks', value: 'streak' }
          ]}
          value={metric}
          onChange={(value: any) => setMetric(value)}
          className="rounded-xl p-1"
        />
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Table
          dataSource={mockLeaderboards[metric]}
          columns={columns}
          pagination={false}
          className="bg-transparent"
        />
      </div>
    </div>
  );
};
