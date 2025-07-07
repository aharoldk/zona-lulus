import React, { useState, useEffect } from 'react';
import {
    Layout,
    Menu,
    Button,
    Avatar,
    Dropdown,
    Typography,
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Space,
    Badge,
    Alert
} from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    DollarOutlined,
    BookOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    TrendingUpOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';
import AdminPayments from './payments/AdminPayments';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/dashboard');
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: 'payments',
            icon: <DollarOutlined />,
            label: 'Payments',
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Users',
        },
        {
            key: 'courses',
            icon: <BookOutlined />,
            label: 'Courses',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        }
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
        },
    ];

    const handleUserMenuClick = ({ key }) => {
        if (key === 'logout') {
            logout();
        }
    };

    const DashboardOverview = () => (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>
                Admin Dashboard
            </Title>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Total Users"
                            value={dashboardData.stats?.total_users || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="success" style={{ fontSize: '12px' }}>
                                +{dashboardData.stats?.new_users_today || 0} today
                            </Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Total Revenue"
                            value={dashboardData.stats?.total_revenue || 0}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`}
                            valueStyle={{ color: '#52c41a' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="success" style={{ fontSize: '12px' }}>
                                +Rp {new Intl.NumberFormat('id-ID').format(dashboardData.stats?.revenue_today || 0)} today
                            </Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Active Courses"
                            value={dashboardData.stats?.total_courses || 0}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Pending Payments"
                            value={dashboardData.stats?.pending_payments || 0}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Revenue Chart */}
                <Col xs={24} lg={12}>
                    <Card title="Revenue Trend (30 Days)" size="small">
                        {dashboardData.revenue_chart && (
                            <Line
                                data={dashboardData.revenue_chart}
                                xField="date"
                                yField="total"
                                height={300}
                                smooth={true}
                                color="#1890ff"
                            />
                        )}
                    </Card>
                </Col>

                {/* Payment Methods */}
                <Col xs={24} lg={12}>
                    <Card title="Payment Methods" size="small">
                        {dashboardData.payment_methods && (
                            <Column
                                data={dashboardData.payment_methods}
                                xField="payment_method"
                                yField="total"
                                height={300}
                                color="#52c41a"
                            />
                        )}
                    </Card>
                </Col>

                {/* Recent Payments */}
                <Col xs={24} lg={12}>
                    <Card title="Recent Payments" size="small">
                        <Table
                            dataSource={dashboardData.recent_payments || []}
                            size="small"
                            pagination={false}
                            columns={[
                                {
                                    title: 'User',
                                    dataIndex: ['user', 'name'],
                                    key: 'user_name',
                                    ellipsis: true
                                },
                                {
                                    title: 'Amount',
                                    dataIndex: 'amount',
                                    key: 'amount',
                                    render: (amount) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (status) => (
                                        <Tag color={status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'error'}>
                                            {status}
                                        </Tag>
                                    )
                                }
                            ]}
                        />
                    </Card>
                </Col>

                {/* Recent Users */}
                <Col xs={24} lg={12}>
                    <Card title="Recent Users" size="small">
                        <Table
                            dataSource={dashboardData.recent_users || []}
                            size="small"
                            pagination={false}
                            columns={[
                                {
                                    title: 'Name',
                                    dataIndex: 'name',
                                    key: 'name',
                                    ellipsis: true
                                },
                                {
                                    title: 'Email',
                                    dataIndex: 'email',
                                    key: 'email',
                                    ellipsis: true
                                },
                                {
                                    title: 'Target',
                                    dataIndex: 'target',
                                    key: 'target',
                                    render: (target) => target && <Tag>{target.toUpperCase()}</Tag>
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );

    const renderContent = () => {
        switch (selectedKey) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'payments':
                return <AdminPayments />;
            case 'users':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Title level={3}>User Management</Title>
                        <Text type="secondary">User management features coming soon...</Text>
                    </div>
                );
            case 'courses':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Title level={3}>Course Management</Title>
                        <Text type="secondary">Course management features coming soon...</Text>
                    </div>
                );
            case 'settings':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Title level={3}>Admin Settings</Title>
                        <Text type="secondary">Settings panel coming soon...</Text>
                    </div>
                );
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    background: '#fff',
                    boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
                }}
            >
                {/* Logo */}
                <div style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? 0 : '0 24px',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    {collapsed ? (
                        <Title level={4} style={{ margin: 0, color: '#2c3e50' }}>A</Title>
                    ) : (
                        <Title level={4} style={{ margin: 0, color: '#2c3e50' }}>
                            Admin Panel
                        </Title>
                    )}
                </div>

                {/* Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={menuItems}
                    style={{ border: 'none', marginTop: '16px' }}
                    onClick={({ key }) => setSelectedKey(key)}
                />
            </Sider>

            {/* Main Layout */}
            <Layout>
                {/* Header */}
                <Header style={{
                    padding: '0 16px',
                    background: '#fff',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />

                    <Space>
                        {/* Notifications */}
                        <Badge count={5} size="small">
                            <Button type="text" icon={<BellOutlined />} shape="circle" />
                        </Badge>

                        {/* User Menu */}
                        <Dropdown
                            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
                                <Space>
                                    <Avatar size="small" icon={<UserOutlined />} />
                                    <span style={{ fontWeight: '500' }}>{user?.name} (Admin)</span>
                                </Space>
                            </Button>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Content */}
                <Content style={{
                    margin: '24px 16px',
                    padding: '24px',
                    background: '#fff',
                    borderRadius: '8px',
                    minHeight: 280,
                }}>
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
}
