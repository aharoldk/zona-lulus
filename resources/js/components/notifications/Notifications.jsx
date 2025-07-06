import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    List,
    Typography,
    Space,
    Button,
    Badge,
    Tag,
    Dropdown,
    Menu,
    message,
    Empty,
    Spin,
    Alert,
    Row,
    Col,
    Tabs,
    Avatar,
    Popconfirm,
    Switch,
    DatePicker,
    Select,
    Input,
    Tooltip,
    Progress,
    Divider,
    Modal,
    notification,
    Checkbox,
    Statistic
} from 'antd';
import {
    BellOutlined,
    DeleteOutlined,
    CheckOutlined,
    MoreOutlined,
    FileTextOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    BookOutlined,
    StarOutlined,
    SettingOutlined,
    InfoCircleOutlined,
    ClearOutlined,
    SearchOutlined,
    FilterOutlined,
    SyncOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    CalendarOutlined,
    TeamOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import api from '../../utils/axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

dayjs.extend(relativeTime);
dayjs.locale('id');

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState(null);
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [notificationStats, setNotificationStats] = useState({});
    const [settingsVisible, setSettingsVisible] = useState(false);

    // Real-time notification updates
    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchNotifications(true); // Silent refresh
            }, 30000); // Refresh every 30 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, activeTab]);

    // Initial load and tab changes
    useEffect(() => {
        fetchNotifications();
        fetchNotificationStats();
    }, [activeTab]);

    const fetchNotifications = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const params = {};

            // Apply filters
            if (activeTab !== 'all') {
                if (activeTab === 'unread') {
                    params.is_read = 'false';
                } else if (activeTab === 'read') {
                    params.is_read = 'true';
                } else {
                    params.type = activeTab;
                }
            }

            if (searchQuery) params.search = searchQuery;
            if (priorityFilter !== 'all') params.priority = priorityFilter;
            if (typeFilter !== 'all') params.type = typeFilter;
            if (dateRange) {
                params.date_from = dateRange[0].format('YYYY-MM-DD');
                params.date_to = dateRange[1].format('YYYY-MM-DD');
            }

            const response = await api.get('/notifications', { params });

            if (response.data.success) {
                setNotifications(response.data.data.notifications);
                setUnreadCount(response.data.data.unread_count);
                setTotalCount(response.data.data.total_count);
            } else {
                setError('Failed to load notifications');
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            if (!silent) setError('Failed to connect to server');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchNotificationStats = async () => {
        try {
            const response = await api.get('/notifications/stats');
            if (response.data.success) {
                setNotificationStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching notification stats:', err);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const response = await api.put(`/notifications/${notificationId}/read`);
            if (response.data.success) {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, is_read: true }
                            : notification
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                message.success('Notifikasi ditandai sebagai sudah dibaca');
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
            message.error('Gagal menandai notifikasi');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await api.put('/notifications/mark-all-read');
            if (response.data.success) {
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, is_read: true }))
                );
                setUnreadCount(0);
                message.success('Semua notifikasi ditandai sebagai sudah dibaca');
            }
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            message.error('Gagal menandai semua notifikasi');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            const response = await api.delete(`/notifications/${notificationId}`);
            if (response.data.success) {
                setNotifications(prev =>
                    prev.filter(notification => notification.id !== notificationId)
                );
                setTotalCount(prev => prev - 1);
                message.success('Notifikasi dihapus');
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
            message.error('Gagal menghapus notifikasi');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedNotifications.length === 0) return;

        try {
            const response = await api.delete('/notifications/bulk-delete', {
                data: { notification_ids: selectedNotifications }
            });
            if (response.data.success) {
                setNotifications(prev =>
                    prev.filter(notification => !selectedNotifications.includes(notification.id))
                );
                setSelectedNotifications([]);
                setTotalCount(prev => prev - selectedNotifications.length);
                message.success(`${selectedNotifications.length} notifikasi dihapus`);
            }
        } catch (err) {
            console.error('Error bulk deleting notifications:', err);
            message.error('Gagal menghapus notifikasi');
        }
    };

    const handleClearAll = async () => {
        try {
            const response = await api.delete('/notifications/clear-all');
            if (response.data.success) {
                setNotifications([]);
                setUnreadCount(0);
                setTotalCount(0);
                message.success('Semua notifikasi dibersihkan');
            }
        } catch (err) {
            console.error('Error clearing notifications:', err);
            message.error('Gagal membersihkan notifikasi');
        }
    };

    // Enhanced notification icon mapping
    const getNotificationIcon = (type, priority) => {
        const iconStyle = {
            fontSize: '16px',
            color: priority === 'high' ? '#ff4d4f' : priority === 'medium' ? '#faad14' : '#52c41a'
        };

        const icons = {
            course: <BookOutlined style={iconStyle} />,
            test: <FileTextOutlined style={iconStyle} />,
            achievement: <TrophyOutlined style={iconStyle} />,
            reminder: <ClockCircleOutlined style={iconStyle} />,
            system: <SettingOutlined style={iconStyle} />,
            social: <TeamOutlined style={iconStyle} />,
            warning: <ExclamationCircleOutlined style={iconStyle} />,
            success: <CheckCircleOutlined style={iconStyle} />,
            error: <CloseCircleOutlined style={iconStyle} />
        };

        return icons[type] || <InfoCircleOutlined style={iconStyle} />;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'red',
            medium: 'orange',
            low: 'green'
        };
        return colors[priority] || 'default';
    };

    const getTypeColor = (type) => {
        const colors = {
            course: 'blue',
            test: 'purple',
            achievement: 'gold',
            reminder: 'cyan',
            system: 'default',
            social: 'green',
            warning: 'orange',
            success: 'green',
            error: 'red'
        };
        return colors[type] || 'default';
    };

    const formatRelativeTime = (date) => {
        return dayjs(date).fromNow();
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }

        // Handle notification actions based on type
        if (notification.action_url) {
            window.open(notification.action_url, '_blank');
        }
    };

    const handleSelectNotification = (notificationId, checked) => {
        if (checked) {
            setSelectedNotifications(prev => [...prev, notificationId]);
        } else {
            setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedNotifications(notifications.map(n => n.id));
        } else {
            setSelectedNotifications([]);
        }
    };

    // Enhanced filters and search
    const filteredNotifications = notifications.filter(notification => {
        let matches = true;

        if (searchQuery) {
            matches = matches && (
                notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.message.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return matches;
    });

    // Notification stats component
    const NotificationStats = () => (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
                <Col span={6}>
                    <Statistic
                        title="Total"
                        value={notificationStats.total || 0}
                        prefix={<BellOutlined />}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Belum Dibaca"
                        value={notificationStats.unread || 0}
                        prefix={<EyeInvisibleOutlined />}
                        valueStyle={{ color: '#cf1322' }}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Prioritas Tinggi"
                        value={notificationStats.high_priority || 0}
                        prefix={<ExclamationCircleOutlined />}
                        valueStyle={{ color: '#fa541c' }}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Hari Ini"
                        value={notificationStats.today || 0}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Col>
            </Row>
        </Card>
    );

    // Enhanced filter bar
    const FilterBar = () => (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                    <Search
                        placeholder="Cari notifikasi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onSearch={fetchNotifications}
                        enterButton={<SearchOutlined />}
                        allowClear
                    />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Select
                        placeholder="Prioritas"
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                        style={{ width: '100%' }}
                    >
                        <Option value="all">Semua Prioritas</Option>
                        <Option value="high">Tinggi</Option>
                        <Option value="medium">Sedang</Option>
                        <Option value="low">Rendah</Option>
                    </Select>
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Select
                        placeholder="Tipe"
                        value={typeFilter}
                        onChange={setTypeFilter}
                        style={{ width: '100%' }}
                    >
                        <Option value="all">Semua Tipe</Option>
                        <Option value="course">Kursus</Option>
                        <Option value="test">Tes</Option>
                        <Option value="achievement">Prestasi</Option>
                        <Option value="reminder">Pengingat</Option>
                        <Option value="system">Sistem</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        style={{ width: '100%' }}
                        placeholder={['Tanggal Mulai', 'Tanggal Akhir']}
                    />
                </Col>
                <Col xs={24} sm={12} md={2}>
                    <Space>
                        <Tooltip title="Refresh">
                            <Button
                                icon={<SyncOutlined />}
                                onClick={() => fetchNotifications()}
                                loading={loading}
                            />
                        </Tooltip>
                        <Tooltip title="Pengaturan">
                            <Button
                                icon={<SettingOutlined />}
                                onClick={() => setSettingsVisible(true)}
                            />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
        </Card>
    );

    // Bulk actions bar
    const BulkActionsBar = () => {
        if (selectedNotifications.length === 0) return null;

        return (
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Text strong>{selectedNotifications.length} notifikasi dipilih</Text>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                size="small"
                                onClick={() => setSelectedNotifications([])}
                            >
                                Batal Pilih
                            </Button>
                            <Popconfirm
                                title="Hapus notifikasi yang dipilih?"
                                onConfirm={handleBulkDelete}
                                okText="Hapus"
                                cancelText="Batal"
                            >
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                >
                                    Hapus Terpilih
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Col>
                </Row>
            </Card>
        );
    };

    // Settings modal
    const SettingsModal = () => (
        <Modal
            title="Pengaturan Notifikasi"
            visible={settingsVisible}
            onCancel={() => setSettingsVisible(false)}
            footer={[
                <Button key="cancel" onClick={() => setSettingsVisible(false)}>
                    Tutup
                </Button>
            ]}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Refresh Otomatis</Text>
                    <Switch
                        checked={autoRefresh}
                        onChange={setAutoRefresh}
                        checkedChildren="ON"
                        unCheckedChildren="OFF"
                    />
                </div>
                <Divider />
                <Text type="secondary">
                    Refresh otomatis akan memperbarui notifikasi setiap 30 detik
                </Text>
            </Space>
        </Modal>
    );

    if (error) {
        return (
            <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                action={
                    <Button size="small" onClick={() => fetchNotifications()}>
                        Coba Lagi
                    </Button>
                }
            />
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Title level={2} style={{ margin: 0 }}>
                    <BellOutlined style={{ marginRight: 8 }} />
                    Notifikasi
                    {unreadCount > 0 && (
                        <Badge count={unreadCount} style={{ marginLeft: 8 }} />
                    )}
                </Title>
                <Space wrap>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Tandai Semua Dibaca
                    </Button>
                    <Popconfirm
                        title="Hapus semua notifikasi?"
                        description="Tindakan ini tidak dapat dibatalkan"
                        onConfirm={handleClearAll}
                        okText="Hapus Semua"
                        cancelText="Batal"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<ClearOutlined />}>
                            Bersihkan Semua
                        </Button>
                    </Popconfirm>
                </Space>
            </div>

            <NotificationStats />
            <FilterBar />
            <BulkActionsBar />

            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane
                        tab={<span><InfoCircleOutlined />Semua ({totalCount})</span>}
                        key="all"
                    />
                    <TabPane
                        tab={
                            <span>
                                <EyeInvisibleOutlined />
                                Belum Dibaca
                                {unreadCount > 0 && <Badge count={unreadCount} size="small" style={{ marginLeft: 4 }} />}
                            </span>
                        }
                        key="unread"
                    />
                    <TabPane
                        tab={<span><EyeOutlined />Sudah Dibaca</span>}
                        key="read"
                    />
                    <TabPane
                        tab={<span><BookOutlined />Kursus</span>}
                        key="course"
                    />
                    <TabPane
                        tab={<span><FileTextOutlined />Tes</span>}
                        key="test"
                    />
                    <TabPane
                        tab={<span><TrophyOutlined />Prestasi</span>}
                        key="achievement"
                    />
                    <TabPane
                        tab={<span><ClockCircleOutlined />Pengingat</span>}
                        key="reminder"
                    />
                </Tabs>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <Empty
                        description="Tidak ada notifikasi"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <>
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                                type="link"
                                size="small"
                                onClick={() => handleSelectAll(selectedNotifications.length !== filteredNotifications.length)}
                            >
                                {selectedNotifications.length === filteredNotifications.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                            </Button>
                            <Text type="secondary">{filteredNotifications.length} notifikasi</Text>
                        </div>

                        <List
                            dataSource={filteredNotifications}
                            renderItem={(notification) => (
                                <List.Item
                                    key={notification.id}
                                    className={!notification.is_read ? 'unread-notification' : ''}
                                    style={{
                                        backgroundColor: !notification.is_read ? '#f6ffed' : 'transparent',
                                        borderLeft: !notification.is_read ? '4px solid #52c41a' : 'none',
                                        padding: '16px',
                                        borderRadius: '6px',
                                        marginBottom: '8px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleNotificationClick(notification)}
                                    actions={[
                                        <Checkbox
                                            checked={selectedNotifications.includes(notification.id)}
                                            onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                                            onClick={(e) => e.stopPropagation()}
                                        />,
                                        !notification.is_read && (
                                            <Tooltip title="Tandai sebagai dibaca">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<CheckOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                />
                                            </Tooltip>
                                        ),
                                        <Dropdown
                                            menu={{
                                                items: [
                                                    {
                                                        key: 'delete',
                                                        label: 'Hapus',
                                                        icon: <DeleteOutlined />,
                                                        danger: true,
                                                        onClick: () => handleDeleteNotification(notification.id)
                                                    }
                                                ]
                                            }}
                                            trigger={['click']}
                                        >
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<MoreOutlined />}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Dropdown>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar icon={getNotificationIcon(notification.type, notification.priority)} />
                                        }
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <Text strong={!notification.is_read}>
                                                    {notification.title}
                                                </Text>
                                                <Tag color={getPriorityColor(notification.priority)} size="small">
                                                    {notification.priority?.toUpperCase()}
                                                </Tag>
                                                <Tag color={getTypeColor(notification.type)} size="small">
                                                    {notification.type?.toUpperCase()}
                                                </Tag>
                                                {!notification.is_read && (
                                                    <Badge status="processing" text="Baru" />
                                                )}
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <Paragraph
                                                    ellipsis={{ rows: 2, expandable: true }}
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    {notification.message}
                                                </Paragraph>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    <ClockCircleOutlined style={{ marginRight: '4px' }} />
                                                    {formatRelativeTime(notification.created_at)}
                                                </Text>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </>
                )}
            </Card>

            <SettingsModal />
        </div>
    );
}
