import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Button,
    Input,
    Select,
    DatePicker,
    Space,
    Typography,
    Tabs,
    Modal,
    Form,
    message,
    Tooltip,
    Badge,
    Progress,
    Alert
} from 'antd';
import {
    DollarOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    TrendingUpOutlined,
    EyeOutlined,
    EditOutlined,
    RefundOutlined,
    SearchOutlined,
    FilterOutlined,
    ExportOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import api from '../../../utils/axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

export default function AdminPayments() {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        payment_method: 'all',
        date_range: null
    });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [refundModalVisible, setRefundModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });

    const [form] = Form.useForm();

    useEffect(() => {
        fetchPayments();
        fetchAnalytics();
    }, [filters, pagination.current]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                ...filters,
                date_from: filters.date_range?.[0]?.format('YYYY-MM-DD'),
                date_to: filters.date_range?.[1]?.format('YYYY-MM-DD')
            };

            const response = await api.get('/admin/payments', { params });

            if (response.data.success) {
                setPayments(response.data.data.payments.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.data.payments.total
                }));
            }
        } catch (error) {
            message.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/admin/payments/analytics', {
                params: {
                    date_from: filters.date_range?.[0]?.format('YYYY-MM-DD') || dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
                    date_to: filters.date_range?.[1]?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')
                }
            });

            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    };

    const handleStatusUpdate = async (values) => {
        try {
            const response = await api.put(`/admin/payments/${selectedPayment.id}/status`, values);

            if (response.data.success) {
                message.success('Payment status updated successfully');
                setStatusModalVisible(false);
                fetchPayments();
            }
        } catch (error) {
            message.error('Failed to update payment status');
        }
    };

    const handleRefund = async (values) => {
        try {
            const response = await api.post(`/admin/payments/${selectedPayment.id}/refund`, values);

            if (response.data.success) {
                message.success('Refund processed successfully');
                setRefundModalVisible(false);
                fetchPayments();
            }
        } catch (error) {
            message.error('Failed to process refund');
        }
    };

    const handleViewDetails = async (payment) => {
        try {
            const response = await api.get(`/admin/payments/${payment.id}`);

            if (response.data.success) {
                setSelectedPayment(response.data.data);
                setDetailModalVisible(true);
            }
        } catch (error) {
            message.error('Failed to load payment details');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            completed: 'success',
            failed: 'error',
            cancelled: 'default',
            refunded: 'processing'
        };
        return colors[status] || 'default';
    };

    const columns = [
        {
            title: 'Invoice',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            render: (text) => <Text code>{text}</Text>
        },
        {
            title: 'User',
            dataIndex: ['user', 'name'],
            key: 'user_name',
            render: (text, record) => (
                <div>
                    <div>{text}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.user.email}
                    </Text>
                </div>
            )
        },
        {
            title: 'Course',
            dataIndex: ['course', 'title'],
            key: 'course_title',
            render: (text) => <Text ellipsis>{text}</Text>
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <Text strong style={{ color: '#52c41a' }}>
                    Rp {new Intl.NumberFormat('id-ID').format(amount)}
                </Text>
            )
        },
        {
            title: 'Method',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method) => {
                const methods = {
                    bank_transfer: 'Bank Transfer',
                    virtual_account: 'Virtual Account',
                    credit_card: 'Credit Card',
                    ewallet: 'E-Wallet',
                    qr_code: 'QR Code'
                };
                return <Tag>{methods[method] || method}</Tag>;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Update Status">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setSelectedPayment(record);
                                setStatusModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    {record.status === 'completed' && (
                        <Tooltip title="Process Refund">
                            <Button
                                type="text"
                                icon={<RefundOutlined />}
                                onClick={() => {
                                    setSelectedPayment(record);
                                    setRefundModalVisible(true);
                                }}
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    const StatsCards = () => (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={6}>
                <Card size="small">
                    <Statistic
                        title="Total Revenue"
                        value={analytics.revenue_data?.reduce((sum, item) => sum + item.revenue, 0) || 0}
                        prefix={<DollarOutlined />}
                        formatter={(value) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
                <Card size="small">
                    <Statistic
                        title="Total Transactions"
                        value={analytics.revenue_data?.reduce((sum, item) => sum + item.transactions, 0) || 0}
                        prefix={<ShoppingCartOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
                <Card size="small">
                    <Statistic
                        title="Success Rate"
                        value={
                            analytics.status_breakdown?.length > 0
                                ? ((analytics.status_breakdown.find(s => s.status === 'completed')?.count || 0) /
                                   analytics.status_breakdown.reduce((sum, s) => sum + s.count, 0) * 100)
                                : 0
                        }
                        suffix="%"
                        prefix={<TrendingUpOutlined />}
                        precision={1}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
                <Card size="small">
                    <Statistic
                        title="Pending Payments"
                        value={analytics.status_breakdown?.find(s => s.status === 'pending')?.count || 0}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#faad14' }}
                    />
                </Card>
            </Col>
        </Row>
    );

    const RevenueChart = () => {
        const config = {
            data: analytics.revenue_data || [],
            xField: 'date',
            yField: 'revenue',
            smooth: true,
            color: '#1890ff',
            point: {
                size: 5,
                shape: 'diamond',
            },
        };

        return <Line {...config} height={300} />;
    };

    const PaymentMethodChart = () => {
        const config = {
            data: analytics.payment_methods || [],
            angleField: 'total',
            colorField: 'payment_method',
            radius: 0.8,
            label: {
                type: 'outer',
                content: '{name} {percentage}',
            },
        };

        return <Pie {...config} height={300} />;
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>Payment Management</Title>
                <Space>
                    <Button icon={<ExportOutlined />}>Export</Button>
                    <Button icon={<ReloadOutlined />} onClick={fetchPayments}>Refresh</Button>
                </Space>
            </div>

            <Tabs defaultActiveKey="overview">
                <TabPane tab="Overview" key="overview">
                    <StatsCards />

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <Card title="Revenue Trend" size="small">
                                <RevenueChart />
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="Payment Methods" size="small">
                                <PaymentMethodChart />
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane tab="Payments" key="payments">
                    {/* Filters */}
                    <Card size="small" style={{ marginBottom: 16 }}>
                        <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={8} md={6}>
                                <Input
                                    placeholder="Search invoice, user..."
                                    prefix={<SearchOutlined />}
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    allowClear
                                />
                            </Col>
                            <Col xs={12} sm={4} md={4}>
                                <Select
                                    placeholder="Status"
                                    value={filters.status}
                                    onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="all">All Status</Option>
                                    <Option value="pending">Pending</Option>
                                    <Option value="completed">Completed</Option>
                                    <Option value="failed">Failed</Option>
                                    <Option value="refunded">Refunded</Option>
                                </Select>
                            </Col>
                            <Col xs={12} sm={6} md={6}>
                                <Select
                                    placeholder="Payment Method"
                                    value={filters.payment_method}
                                    onChange={(value) => setFilters(prev => ({ ...prev, payment_method: value }))}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="all">All Methods</Option>
                                    <Option value="bank_transfer">Bank Transfer</Option>
                                    <Option value="virtual_account">Virtual Account</Option>
                                    <Option value="credit_card">Credit Card</Option>
                                    <Option value="ewallet">E-Wallet</Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={6} md={8}>
                                <RangePicker
                                    value={filters.date_range}
                                    onChange={(dates) => setFilters(prev => ({ ...prev, date_range: dates }))}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Row>
                    </Card>

                    {/* Payments Table */}
                    <Card>
                        <Table
                            columns={columns}
                            dataSource={payments}
                            loading={loading}
                            rowKey="id"
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                                onChange: (page, pageSize) => {
                                    setPagination(prev => ({ ...prev, current: page, pageSize }));
                                }
                            }}
                            scroll={{ x: 1200 }}
                        />
                    </Card>
                </TabPane>
            </Tabs>

            {/* Payment Detail Modal */}
            <Modal
                title="Payment Details"
                visible={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedPayment && (
                    <div>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text strong>Invoice Number:</Text>
                                <br />
                                <Text code>{selectedPayment.payment?.invoice_number}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Status:</Text>
                                <br />
                                <Tag color={getStatusColor(selectedPayment.payment?.status)}>
                                    {selectedPayment.payment?.status?.toUpperCase()}
                                </Tag>
                            </Col>
                            <Col span={12}>
                                <Text strong>Amount:</Text>
                                <br />
                                <Text style={{ fontSize: '16px', color: '#52c41a' }}>
                                    Rp {new Intl.NumberFormat('id-ID').format(selectedPayment.payment?.amount)}
                                </Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Payment Method:</Text>
                                <br />
                                <Text>{selectedPayment.payment?.payment_method}</Text>
                            </Col>
                        </Row>

                        {selectedPayment.xendit_details && (
                            <div style={{ marginTop: 24 }}>
                                <Title level={4}>Xendit Details</Title>
                                <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                                    {JSON.stringify(selectedPayment.xendit_details, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Status Update Modal */}
            <Modal
                title="Update Payment Status"
                visible={statusModalVisible}
                onCancel={() => setStatusModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} onFinish={handleStatusUpdate}>
                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select>
                            <Option value="pending">Pending</Option>
                            <Option value="completed">Completed</Option>
                            <Option value="failed">Failed</Option>
                            <Option value="cancelled">Cancelled</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="admin_notes"
                        label="Admin Notes"
                    >
                        <Input.TextArea rows={3} placeholder="Optional notes..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Refund Modal */}
            <Modal
                title="Process Refund"
                visible={refundModalVisible}
                onCancel={() => setRefundModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} onFinish={handleRefund}>
                    <Form.Item
                        name="amount"
                        label="Refund Amount"
                        rules={[{ required: true, message: 'Please enter refund amount' }]}
                    >
                        <Input
                            type="number"
                            prefix="Rp"
                            placeholder={selectedPayment?.amount?.toString()}
                        />
                    </Form.Item>
                    <Form.Item
                        name="reason"
                        label="Refund Reason"
                        rules={[{ required: true, message: 'Please enter refund reason' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Reason for refund..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
