import React, { useState, useEffect } from 'react';
import { useTable, useUpdate, useDelete } from '@refinedev/core';
import { 
  Table, 
  Tag, 
  message, 
  Modal, 
  Form, 
  Select, 
  Input, 
  Button, 
  Drawer, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Space, 
  Tooltip, 
  Badge, 
  Divider, 
  Popconfirm 
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  CarOutlined, 
  EyeOutlined, 
  PrinterOutlined, 
  WhatsAppOutlined, 
  CopyOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SyncOutlined, 
  CloseCircleOutlined, 
  DollarOutlined, 
  ShoppingOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  StarFilled,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { pb } from '../../lib/pocketbase';

interface HardwareOrder {
  id: string;
  order_no: string;
  user?: string;
  merchant?: string;
  package_title: string;
  units?: number;
  amount: number;
  payment_method: 'fpx' | 'card' | 'whatsapp';
  payment_status: 'pending' | 'paid' | 'refunded' | 'unpaid';
  fulfillment_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  recipient_name: string;
  whatsapp_phone: string;
  address_line1: string;
  address_line2?: string;
  postcode: string;
  city: string;
  state: string;
  full_address?: string;
  courier_name?: string;
  tracking_number?: string;
  shipped_at?: string;
  notes?: string;
  created: string;
  updated: string;
}

const COURIER_OPTIONS = [
  { label: 'J&T Express', value: 'J&T Express', trackUrl: (t: string) => `https://www.jtexpress.my/tracking?bills=${t}` },
  { label: 'Ninja Van', value: 'Ninja Van', trackUrl: (t: string) => `https://www.ninjavan.co/en-my/tracking?id=${t}` },
  { label: 'Pos Laju', value: 'Pos Laju', trackUrl: (t: string) => `https://tracking.pos.com.my/tracking-details/${t}` },
  { label: 'Flash Express', value: 'Flash Express', trackUrl: (t: string) => `https://www.flashexpress.my/fle/tracking?se=${t}` },
  { label: 'DHL eCommerce', value: 'DHL eCommerce', trackUrl: (t: string) => `https://ecommerceportal.dhl.com/track/?locale=en&trackingNumber=${t}` },
  { label: 'City-Link Express', value: 'City-Link Express', trackUrl: (t: string) => `https://www.citylinkexpress.com/track-your-shipment/?trackingNo=${t}` },
  { label: 'Lalamove / Same Day', value: 'Lalamove', trackUrl: () => '#' },
  { label: 'Other Courier', value: 'Other', trackUrl: () => '#' },
];

export const ShippingOrderList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<HardwareOrder | null>(null);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState<boolean>(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);
  const [isPackingSlipModalOpen, setIsPackingSlipModalOpen] = useState<boolean>(false);
  
  const [fulfillForm] = Form.useForm();
  const { mutate: updateOrder, isLoading: isUpdating } = useUpdate();
  const { mutate: deleteOrder } = useDelete();

  // Refine Table for hardware_orders
  const { tableQueryResult } = useTable<HardwareOrder>({
    resource: 'hardware_orders',
    sorters: {
      initial: [
        {
          field: 'created',
          order: 'desc',
        },
      ],
    },
    pagination: {
      pageSize: 50,
    },
  });

  const rawOrders: HardwareOrder[] = (tableQueryResult?.data?.data as any) || [];
  const isLoading = tableQueryResult?.isLoading ?? false;

  // Filtered orders in-memory for instant responsive search
  const orders = rawOrders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.fulfillment_status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      (order.order_no && order.order_no.toLowerCase().includes(kw)) ||
      (order.recipient_name && order.recipient_name.toLowerCase().includes(kw)) ||
      (order.whatsapp_phone && order.whatsapp_phone.toLowerCase().includes(kw)) ||
      (order.tracking_number && order.tracking_number.toLowerCase().includes(kw)) ||
      (order.postcode && order.postcode.toLowerCase().includes(kw)) ||
      (order.city && order.city.toLowerCase().includes(kw)) ||
      (order.state && order.state.toLowerCase().includes(kw))
    );
  });

  // Calculate KPIs
  const totalOrdersCount = rawOrders.length;
  const pendingCount = rawOrders.filter(o => o.fulfillment_status === 'pending' || !o.fulfillment_status).length;
  const processingCount = rawOrders.filter(o => o.fulfillment_status === 'processing').length;
  const shippedCount = rawOrders.filter(o => o.fulfillment_status === 'shipped').length;
  const deliveredCount = rawOrders.filter(o => o.fulfillment_status === 'delivered').length;
  const totalRevenue = rawOrders
    .filter(o => o.payment_status === 'paid' || o.payment_method !== 'whatsapp')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const handleOpenFulfill = (record: HardwareOrder) => {
    setSelectedOrder(record);
    fulfillForm.setFieldsValue({
      fulfillment_status: record.fulfillment_status || 'processing',
      payment_status: record.payment_status || 'paid',
      courier_name: record.courier_name || 'J&T Express',
      tracking_number: record.tracking_number || '',
      notes: record.notes || '',
    });
    setIsFulfillModalOpen(true);
  };

  const handleSaveFulfillment = async () => {
    try {
      const values = await fulfillForm.validateFields();
      if (!selectedOrder) return;

      const updateData: any = {
        fulfillment_status: values.fulfillment_status,
        payment_status: values.payment_status,
        courier_name: values.courier_name,
        tracking_number: values.tracking_number?.trim() || '',
        notes: values.notes?.trim() || '',
      };

      if (values.fulfillment_status === 'shipped' && !selectedOrder.shipped_at) {
        updateData.shipped_at = dayjs().toISOString().replace('T', ' ').substring(0, 19);
      }

      updateOrder({
        resource: 'hardware_orders',
        id: selectedOrder.id,
        values: updateData,
        successNotification: () => {
          message.success(`Order ${selectedOrder.order_no} updated successfully!`);
          setIsFulfillModalOpen(false);
          tableQueryResult.refetch();
          return false;
        },
        errorNotification: (err: any) => {
          message.error(err?.message || 'Failed to update order.');
          return false;
        },
      });
    } catch (err) {
      console.warn('Form validation error:', err);
    }
  };

  // EasyParcel state
  const [isEasyParcelModalOpen, setIsEasyParcelModalOpen] = useState<boolean>(false);
  const [easyParcelRates, setEasyParcelRates] = useState<any[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  const [selectedCourierOption, setSelectedCourierOption] = useState<any>(null);
  const [isBookingEasyParcel, setIsBookingEasyParcel] = useState<boolean>(false);

  const handleOpenEasyParcel = async (record: HardwareOrder) => {
    setSelectedOrder(record);
    setIsEasyParcelModalOpen(true);
    setIsLoadingRates(true);
    setEasyParcelRates([]);
    setSelectedCourierOption(null);

    try {
      const resp = await pb.send('/api/risev/easyparcel/rate-check', {
        method: 'POST',
        body: {
          dest_postcode: record.postcode || '50470',
          dest_state: record.state || 'Kuala Lumpur',
          weight: 0.5,
        },
      });

      if (resp && resp.rates) {
        setEasyParcelRates(resp.rates);
        const recommended = resp.rates.find((r: any) => r.is_recommended) || resp.rates[0];
        setSelectedCourierOption(recommended);
      }
    } catch (err: any) {
      console.error('Rate check error:', err);
      message.error('Failed to load live courier rates.');
    } finally {
      setIsLoadingRates(false);
    }
  };

  const handleConfirmEasyParcelBooking = async () => {
    if (!selectedOrder || !selectedCourierOption) return;
    setIsBookingEasyParcel(true);

    try {
      const resp = await pb.send('/api/risev/easyparcel/book', {
        method: 'POST',
        body: {
          order_id: selectedOrder.id,
          courier_name: selectedCourierOption.courier_name,
          service_id: selectedCourierOption.service_id,
          notes: `EasyParcel 1-Click Booking (${selectedCourierOption.service_type || 'Standard'})`,
        },
      });

      if (resp && resp.success) {
        message.success(`Shipment booked with ${resp.courier_name}! Tracking: ${resp.tracking_number}`, 6);
        setIsEasyParcelModalOpen(false);
        tableQueryResult.refetch();
      } else {
        message.error(resp?.message || 'Failed to complete EasyParcel booking.');
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      message.error(err?.message || 'Error communicating with EasyParcel booking service.');
    } finally {
      setIsBookingEasyParcel(false);
    }
  };

  const handleOpenDetail = (record: HardwareOrder) => {
    setSelectedOrder(record);
    setIsDetailDrawerOpen(true);
  };

  const handleOpenPackingSlip = (record: HardwareOrder) => {
    setSelectedOrder(record);
    setIsPackingSlipModalOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      message.success(`${label} copied to clipboard!`);
    }
  };

  const getTrackingUrl = (courierName?: string, trackingNo?: string) => {
    if (!trackingNo) return '#';
    const found = COURIER_OPTIONS.find(c => c.value === courierName);
    return found ? found.trackUrl(trackingNo) : `https://www.google.com/search?q=${encodeURIComponent(`${courierName || ''} tracking ${trackingNo}`)}`;
  };

  const formatPhone = (phone: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '60' + clean.slice(1);
    if (!clean.startsWith('60')) clean = '60' + clean;
    return clean;
  };

  return (
    <div style={{ padding: '4px 0 32px 0' }}>
      {/* Header Title Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
            📦 Shipping & Hardware Orders
          </h1>
          <p style={{ color: '#64748B', margin: '4px 0 0 0', fontSize: 13 }}>
            Manage NFC smart stand shipments, tracking numbers, packing slips, and order fulfillment.
          </p>
        </div>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => tableQueryResult.refetch()}
            loading={tableQueryResult.isFetching}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* KPI Metric Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Total Orders</span>}
              value={totalOrdersCount}
              prefix={<ShoppingOutlined style={{ color: '#3B82F6', marginRight: 8 }} />}
              valueStyle={{ fontWeight: 800, color: '#0F172A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: '4px solid #F59E0B' }}>
            <Statistic
              title={<span style={{ color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Pending / Processing</span>}
              value={pendingCount + processingCount}
              prefix={<ClockCircleOutlined style={{ color: '#F59E0B', marginRight: 8 }} />}
              valueStyle={{ fontWeight: 800, color: '#D97706' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: '4px solid #8B5CF6' }}>
            <Statistic
              title={<span style={{ color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Shipped / In Transit</span>}
              value={shippedCount}
              prefix={<CarOutlined style={{ color: '#8B5CF6', marginRight: 8 }} />}
              valueStyle={{ fontWeight: 800, color: '#7C3AED' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: '4px solid #10B981' }}>
            <Statistic
              title={<span style={{ color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Hardware Revenue</span>}
              value={totalRevenue}
              prefix={<DollarOutlined style={{ color: '#10B981', marginRight: 8 }} />}
              formatter={(val) => `RM ${Number(val).toLocaleString()}`}
              valueStyle={{ fontWeight: 800, color: '#059669' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Tabs & Search Controls */}
      <Card bordered={false} style={{ borderRadius: 20, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Orders', count: totalOrdersCount },
              { key: 'pending', label: 'Pending', count: pendingCount, color: '#F59E0B' },
              { key: 'processing', label: 'Processing', count: processingCount, color: '#3B82F6' },
              { key: 'shipped', label: 'Shipped', count: shippedCount, color: '#8B5CF6' },
              { key: 'delivered', label: 'Delivered', count: deliveredCount, color: '#10B981' },
            ].map(tab => (
              <Button
                key={tab.key}
                type={statusFilter === tab.key ? 'primary' : 'default'}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 13,
                  height: 38,
                  backgroundColor: statusFilter === tab.key ? '#0F172A' : '#F8FAFC',
                  borderColor: statusFilter === tab.key ? '#0F172A' : '#E2E8F0',
                  color: statusFilter === tab.key ? '#FFFFFF' : '#475569',
                }}
              >
                {tab.label} <Badge count={tab.count} overflowCount={999} style={{ marginLeft: 6, backgroundColor: statusFilter === tab.key ? '#FFC700' : '#CBD5E1', color: '#000' }} />
              </Button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ width: 320 }}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              placeholder="Search order #, recipient, phone, tracking..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              style={{ borderRadius: 12, height: 38 }}
            />
          </div>
        </div>

        {/* Orders Table */}
        <Table<HardwareOrder>
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `Total ${total} orders` }}
          columns={[
            {
              title: 'Order No & Date',
              key: 'order_no',
              render: (_, record) => (
                <div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', fontSize: 13 }}>
                    {record.order_no}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    {dayjs(record.created).format('D MMM YYYY, h:mm A')}
                  </div>
                </div>
              ),
            },
            {
              title: 'Recipient & WhatsApp',
              key: 'recipient',
              render: (_, record) => {
                const waPhone = formatPhone(record.whatsapp_phone);
                return (
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{record.recipient_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 12, color: '#475569' }}>{record.whatsapp_phone}</span>
                      <Tooltip title="Chat on WhatsApp">
                        <a
                          href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(record.recipient_name)},%20update%20on%20your%20Risev%20Smart%20Stand%20order%20(${record.order_no})`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#25D366' }}
                        >
                          <WhatsAppOutlined style={{ fontSize: 15 }} />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                );
              },
            },
            {
              title: 'Shipping Destination',
              key: 'address',
              render: (_, record) => {
                const preview = record.city && record.state ? `${record.city}, ${record.postcode} (${record.state})` : record.full_address || '-';
                return (
                  <div style={{ maxWidth: 220 }}>
                    <div style={{ fontSize: 12, color: '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {preview}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.address_line1}
                    </div>
                  </div>
                );
              },
            },
            {
              title: 'Package & Amount',
              key: 'package',
              render: (_, record) => (
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 12 }}>
                    {record.package_title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: 12 }}>
                      RM {record.amount}
                    </span>
                    <Tag style={{ fontSize: 10, margin: 0, textTransform: 'uppercase', borderRadius: 4 }}>
                      {record.payment_method}
                    </Tag>
                  </div>
                </div>
              ),
            },
            {
              title: 'Payment Status',
              key: 'payment_status',
              render: (_, record) => {
                const isPaid = record.payment_status === 'paid' || (record.payment_method !== 'whatsapp' && record.payment_status !== 'unpaid');
                return (
                  <Tag color={isPaid ? 'green' : 'gold'} style={{ borderRadius: 8, fontWeight: 600, fontSize: 11 }}>
                    {isPaid ? 'PAID' : 'PENDING'}
                  </Tag>
                );
              },
            },
            {
              title: 'Fulfillment',
              key: 'fulfillment_status',
              render: (_, record) => {
                const status = record.fulfillment_status || 'pending';
                let color = 'gold';
                let icon = <ClockCircleOutlined />;
                if (status === 'processing') { color = 'blue'; icon = <SyncOutlined spin />; }
                if (status === 'shipped') { color = 'purple'; icon = <CarOutlined />; }
                if (status === 'delivered') { color = 'green'; icon = <CheckCircleOutlined />; }
                if (status === 'cancelled') { color = 'red'; icon = <CloseCircleOutlined />; }

                return (
                  <Tag color={color} icon={icon} style={{ borderRadius: 8, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', padding: '2px 8px' }}>
                    {status}
                  </Tag>
                );
              },
            },
            {
              title: 'Courier & Tracking',
              key: 'tracking',
              render: (_, record) => {
                if (!record.tracking_number) {
                  return <span style={{ color: '#94A3B8', fontSize: 12 }}>Unassigned</span>;
                }
                const url = getTrackingUrl(record.courier_name, record.tracking_number);
                return (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                      {record.courier_name || 'Courier'}
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, fontWeight: 700, color: '#3B82F6', fontFamily: 'monospace' }}
                    >
                      {record.tracking_number}
                    </a>
                  </div>
                );
              },
            },
            {
              title: 'Actions',
              key: 'actions',
              align: 'right',
              render: (_, record) => (
                <Space>
                  <Tooltip title="1-Click EasyParcel Courier Booking">
                    <Button
                      size="small"
                      icon={<ThunderboltOutlined style={{ color: '#D97706' }} />}
                      onClick={() => handleOpenEasyParcel(record)}
                      style={{ 
                        backgroundColor: '#FEF3C7', 
                        borderColor: '#FCD34D', 
                        color: '#92400E', 
                        borderRadius: 8, 
                        fontWeight: 700 
                      }}
                    >
                      EasyParcel
                    </Button>
                  </Tooltip>

                  <Tooltip title="Fulfill / Manual Tracking">
                    <Button
                      type="primary"
                      size="small"
                      icon={<CarOutlined />}
                      onClick={() => handleOpenFulfill(record)}
                      style={{ backgroundColor: '#0F172A', borderColor: '#0F172A', borderRadius: 8, fontWeight: 600 }}
                    >
                      Fulfill
                    </Button>
                  </Tooltip>

                  <Tooltip title="View Order Details">
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleOpenDetail(record)}
                      style={{ borderRadius: 8 }}
                    />
                  </Tooltip>

                  <Tooltip title="Print Packing Slip">
                    <Button
                      size="small"
                      icon={<PrinterOutlined />}
                      onClick={() => handleOpenPackingSlip(record)}
                      style={{ borderRadius: 8 }}
                    />
                  </Tooltip>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* ========================================================= */}
      {/* MODAL 1: FULFILL & ASSIGN TRACKING                        */}
      {/* ========================================================= */}
      <Modal
        title={<span style={{ fontWeight: 800, fontSize: 16 }}>🚀 Update Fulfillment & Tracking</span>}
        open={isFulfillModalOpen}
        onCancel={() => setIsFulfillModalOpen(false)}
        onOk={handleSaveFulfillment}
        confirmLoading={isUpdating}
        okText="Save & Update Status"
        okButtonProps={{ style: { backgroundColor: '#0F172A', borderColor: '#0F172A', borderRadius: 10, fontWeight: 700 } }}
        cancelButtonProps={{ style: { borderRadius: 10 } }}
        width={540}
      >
        {selectedOrder && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>{selectedOrder.order_no}</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>RM {selectedOrder.amount}</span>
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
              👤 {selectedOrder.recipient_name} ({selectedOrder.whatsapp_phone})
            </div>
          </div>
        )}

        <Form form={fulfillForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="fulfillment_status" label="Fulfillment Status" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '🟡 Pending', value: 'pending' },
                    { label: '🔵 Processing / Packing', value: 'processing' },
                    { label: '🟣 Shipped (In Transit)', value: 'shipped' },
                    { label: '🟢 Delivered', value: 'delivered' },
                    { label: '🔴 Cancelled', value: 'cancelled' },
                  ]}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="payment_status" label="Payment Status" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '🟢 Paid', value: 'paid' },
                    { label: '🟡 Pending Payment', value: 'pending' },
                    { label: '⚪ Unpaid', value: 'unpaid' },
                    { label: '🔴 Refunded', value: 'refunded' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={10}>
              <Form.Item name="courier_name" label="Courier Service">
                <Select
                  options={COURIER_OPTIONS.map(c => ({ label: c.label, value: c.value }))}
                  placeholder="Select Courier"
                />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item name="tracking_number" label="Tracking / AWB Number">
                <Input placeholder="e.g. JNTMY123456789" style={{ fontFamily: 'monospace', fontWeight: 700 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Internal Notes (Optional)">
            <Input.TextArea rows={2} placeholder="e.g. Packed in batch 2, free lanyard included..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* DRAWER 2: ORDER DETAILS INSPECTION                        */}
      {/* ========================================================= */}
      <Drawer
        title={<span style={{ fontWeight: 800 }}>Order Details: {selectedOrder?.order_no}</span>}
        placement="right"
        width={500}
        onClose={() => setIsDetailDrawerOpen(false)}
        open={isDetailDrawerOpen}
        extra={
          <Button
            type="primary"
            icon={<CarOutlined />}
            onClick={() => {
              setIsDetailDrawerOpen(false);
              if (selectedOrder) handleOpenFulfill(selectedOrder);
            }}
            style={{ backgroundColor: '#0F172A', borderRadius: 8 }}
          >
            Fulfill
          </Button>
        }
      >
        {selectedOrder && (
          <div>
            {/* Header summary */}
            <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Order Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>RM {selectedOrder.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Package</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{selectedOrder.package_title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Date Placed</span>
                <span style={{ fontSize: 13, color: '#334155' }}>{dayjs(selectedOrder.created).format('D MMMM YYYY, h:mm A')}</span>
              </div>
            </div>

            {/* Recipient Contact */}
            <h4 style={{ fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>👤 Recipient Contact</h4>
            <div style={{ padding: 14, background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{selectedOrder.recipient_name}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 13, color: '#475569' }}>{selectedOrder.whatsapp_phone}</span>
                <a
                  href={`https://wa.me/${formatPhone(selectedOrder.whatsapp_phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#25D366', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <WhatsAppOutlined /> WhatsApp
                </a>
              </div>
            </div>

            {/* Shipping Address (Slot by slot) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ fontWeight: 800, color: '#0F172A', margin: 0 }}>📍 Shipping Address</h4>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(
                  `${selectedOrder.recipient_name}\n${selectedOrder.whatsapp_phone}\n${selectedOrder.address_line1}${selectedOrder.address_line2 ? `\n${selectedOrder.address_line2}` : ''}\n${selectedOrder.postcode} ${selectedOrder.city}, ${selectedOrder.state}`,
                  'Full Shipping Address'
                )}
              >
                Copy Address
              </Button>
            </div>
            <div style={{ padding: 14, background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20, lineHeight: '22px' }}>
              <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>{selectedOrder.address_line1}</div>
              {selectedOrder.address_line2 && (
                <div style={{ fontSize: 13, color: '#475569' }}>{selectedOrder.address_line2}</div>
              )}
              <div style={{ fontSize: 13, color: '#334155', fontWeight: 700, marginTop: 4 }}>
                {selectedOrder.postcode} {selectedOrder.city}, {selectedOrder.state}
              </div>
            </div>

            {/* Courier & Tracking */}
            <h4 style={{ fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>🚚 Delivery & Tracking</h4>
            <div style={{ padding: 14, background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Courier</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{selectedOrder.courier_name || 'Not yet assigned'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Tracking No</span>
                {selectedOrder.tracking_number ? (
                  <a
                    href={getTrackingUrl(selectedOrder.courier_name, selectedOrder.tracking_number)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontWeight: 800, color: '#3B82F6', fontFamily: 'monospace' }}
                  >
                    {selectedOrder.tracking_number}
                  </a>
                ) : (
                  <span style={{ color: '#94A3B8', fontSize: 12 }}>None</span>
                )}
              </div>
              {selectedOrder.shipped_at && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Shipped At</span>
                  <span style={{ fontSize: 12, color: '#334155' }}>{dayjs(selectedOrder.shipped_at).format('D MMM YYYY, h:mm A')}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <>
                <h4 style={{ fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>📝 Notes</h4>
                <div style={{ padding: 12, background: '#FEF3C7', borderRadius: 10, border: '1px solid #FDE68A', color: '#92400E', fontSize: 12 }}>
                  {selectedOrder.notes}
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* ========================================================= */}
      {/* MODAL 3: PRINTABLE PACKING SLIP / SHIPPING LABEL          */}
      {/* ========================================================= */}
      <Modal
        title={<span style={{ fontWeight: 800 }}>🖨️ Printable Packing Slip</span>}
        open={isPackingSlipModalOpen}
        onCancel={() => setIsPackingSlipModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPackingSlipModalOpen(false)} style={{ borderRadius: 8 }}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            style={{ backgroundColor: '#0F172A', borderColor: '#0F172A', borderRadius: 8, fontWeight: 700 }}
          >
            Print Packing Slip
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && (
          <div id="printable-packing-slip" style={{ padding: 20, border: '2px dashed #CBD5E1', borderRadius: 16, backgroundColor: '#FAFAFA' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 900, fontSize: 20, color: '#0F172A', letterSpacing: 1 }}>RISEV HARDWARE</h2>
                <div style={{ fontSize: 11, color: '#64748B' }}>Smart Loyalty Hardware Fulfillment</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>{selectedOrder.order_no}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{dayjs(selectedOrder.created).format('YYYY-MM-DD')}</div>
              </div>
            </div>

            {/* Sender / Recipient 2-col */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>SHIP FROM:</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>RISEV HQ FULFILLMENT</div>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: '16px' }}>
                  Plaza Sentral, 50470 Kuala Lumpur, Malaysia<br />
                  Tel: +60 11-5622 1568
                </div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>SHIP TO:</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{selectedOrder.recipient_name}</div>
                <div style={{ fontSize: 12, color: '#0F172A', fontWeight: 600 }}>{selectedOrder.whatsapp_phone}</div>
                <div style={{ fontSize: 11, color: '#334155', lineHeight: '16px', marginTop: 4 }}>
                  {selectedOrder.address_line1}<br />
                  {selectedOrder.address_line2 && <>{selectedOrder.address_line2}<br /></>}
                  <strong>{selectedOrder.postcode} {selectedOrder.city}</strong><br />
                  {selectedOrder.state}, Malaysia
                </div>
              </Col>
            </Row>

            {/* Parcel Contents Table */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12 }}>
              <table style={{ width: '100%', fontSize: 12, textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                    <th style={{ padding: '6px 0' }}>ITEM / PACKAGE</th>
                    <th style={{ textAlign: 'center' }}>QTY</th>
                    <th style={{ textAlign: 'right' }}>PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px 0', fontWeight: 700, color: '#0F172A' }}>
                      {selectedOrder.package_title}
                      <div style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>Includes NFC Stand + Lifetime Quota + Box Package</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{selectedOrder.units || 1}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>RM {selectedOrder.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Barcode simulator */}
            <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>
                Courier: <strong>{selectedOrder.courier_name || 'Standard Post'}</strong> | Tracking: <strong>{selectedOrder.tracking_number || 'PENDING'}</strong>
              </div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>
                STATUS: {selectedOrder.payment_status?.toUpperCase() || 'PAID'}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: EASYPARCEL 1-CLICK COURIER BOOKING               */}
      {/* ========================================================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ThunderboltOutlined style={{ color: '#D97706', fontSize: 16 }} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 16 }}>EasyParcel 1-Click Courier Booking</span>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>Live Rate Quotations & Automated AWB Booking</div>
            </div>
          </div>
        }
        open={isEasyParcelModalOpen}
        onCancel={() => setIsEasyParcelModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEasyParcelModalOpen(false)} style={{ borderRadius: 8 }}>
            Cancel
          </Button>,
          <Button
            key="book"
            type="primary"
            loading={isBookingEasyParcel}
            disabled={!selectedCourierOption || isLoadingRates}
            icon={<RocketOutlined />}
            onClick={handleConfirmEasyParcelBooking}
            style={{ 
              backgroundColor: '#0F172A', 
              borderColor: '#0F172A', 
              borderRadius: 8, 
              fontWeight: 800,
              height: 38
            }}
          >
            {selectedCourierOption ? `Book with ${selectedCourierOption.courier_name} (RM ${selectedCourierOption.price?.toFixed(2)})` : 'Select a Courier'}
          </Button>,
        ]}
        width={650}
      >
        {selectedOrder && (
          <div>
            {/* Parcel Details Banner */}
            <div style={{ padding: 14, backgroundColor: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Shipment For Order</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{selectedOrder.order_no} — {selectedOrder.recipient_name}</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                  📍 {selectedOrder.city || 'Kuala Lumpur'}, {selectedOrder.postcode || '50470'} ({selectedOrder.state || 'WP'})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Tag color="purple" style={{ borderRadius: 8, fontWeight: 700, margin: 0 }}>Parcel ~0.5 KG</Tag>
              </div>
            </div>

            {/* Courier Selection List */}
            <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 13, color: '#334155' }}>
              Available Couriers ({easyParcelRates.length})
            </div>

            {isLoadingRates ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <SyncOutlined spin style={{ fontSize: 24, color: '#3B82F6', marginBottom: 10 }} />
                <div style={{ fontSize: 13, color: '#64748B' }}>Fetching live courier rates from EasyParcel...</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
                {easyParcelRates.map((rate, idx) => {
                  const isSelected = selectedCourierOption?.service_id === rate.service_id;
                  return (
                    <div
                      key={rate.service_id || idx}
                      onClick={() => setSelectedCourierOption(rate)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        border: isSelected ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease-in-out',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isSelected ? '#DBEAFE' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1E293B', fontSize: 12 }}>
                          {rate.courier_name.substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 13, color: '#0F172A' }}>{rate.courier_name}</span>
                            {rate.is_recommended && (
                              <Tag color="gold" style={{ fontSize: 10, borderRadius: 6, fontWeight: 700, margin: 0 }}>BEST VALUE</Tag>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                            {rate.service_type} • ETA: <strong>{rate.delivery_eta}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: isSelected ? '#1D4ED8' : '#059669' }}>
                          RM {rate.price?.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: '#94A3B8' }}>
                          ⭐ {rate.rating || 4.8} / 5.0
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sender / Pickup HQ Note */}
            <div style={{ marginTop: 16, padding: '10px 14px', backgroundColor: '#F1F5F9', borderRadius: 10, fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
              <SafetyCertificateOutlined style={{ color: '#10B981', fontSize: 14 }} />
              <span>Sender: <strong>Risev HQ</strong>, Plaza Sentral, 50470 Kuala Lumpur (+60 11-5622 1568)</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
