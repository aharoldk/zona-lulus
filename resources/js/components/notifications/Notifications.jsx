import React, { useState, useEffect } from 'react';
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
    Popconfirm
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
    ClearOutlined
} from '@ant-design/icons';
import api from '../../utils/axios';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, [activeTab]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = {};

            if (activeTab !== 'all') {
                if (activeTab === 'unread') {
                    params.is_read = 'false';
                } else if (activeTab === 'read') {
                    params.is_read = 'true';
                } else {
                    params.type = activeTab;
                }
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
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
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

    const getNotificationIcon = (type, iconName) => {
        const iconMap = {
            FileTextOutlined: <FileTextOutlined />,
            TrophyOutlined: <TrophyOutlined />,
            ClockCircleOutlined: <ClockCircleOutlined />,
            BookOutlined: <BookOutlined />,
            StarOutlined: <StarOutlined />,
            SettingOutlined: <SettingOutlined />,
            InfoCircleOutlined: <InfoCircleOutlined />
        };

        return iconMap[iconName] || <BellOutlined />;
    };

    const getNotificationTypeColor = (type) => {
        const colorMap = {
            info: '#1890ff',
            success: '#52c41a',
            reminder: '#faad14',
            course: '#722ed1',
            achievement: '#fa8c16',
            system: '#8c8c8c'
        };
        return colorMap[type] || '#1890ff';
    };

    const getNotificationTypeTag = (type) => {
        const tagMap = {
            info: { color: 'blue', text: 'Info' },
            success: { color: 'green', text: 'Berhasil' },
            reminder: { color: 'orange', text: 'Pengingat' },
            course: { color: 'purple', text: 'Kursus' },
            achievement: { color: 'gold', text: 'Prestasi' },
            system: { color: 'default', text: 'Sistem' }
        };
        return tagMap[type] || { color: 'default', text: 'Lainnya' };
    };

    const getNotificationMenu = (notification) => (
        <Menu>
            {!notification.is_read && (
                <Menu.Item
                    key="read"
                    icon={<CheckOutlined />}
                    onClick={() => handleMarkAsRead(notification.id)}
                >
                    Tandai Sudah Dibaca
                </Menu.Item>
            )}
            <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDeleteNotification(notification.id)}
            >
                Hapus Notifikasi
            </Menu.Item>
        </Menu>
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Loading notifications...</div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                style={{ margin: '20px 0' }}
                action={
                    <Button size="small" onClick={fetchNotifications}>
                        Retry
                    </Button>
                }
            />
        );
    }

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                <Col>
                    <Title level={2} style={{ margin: 0 }}>
                        <BellOutlined style={{ marginRight: '8px' }} />
                        Notifikasi
                        {unreadCount > 0 && (
                            <Badge
                                count={unreadCount}
                                style={{ marginLeft: '8px' }}
                                overflowCount={99}
                            />
                        )}
                    </Title>
                    <Text type="secondary">
                        {totalCount} total notifikasi, {unreadCount} belum dibaca
                    </Text>
                </Col>
                <Col>
                    <Space>
                        {unreadCount > 0 && (
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={handleMarkAllAsRead}
                            >
                                Tandai Semua Dibaca
                            </Button>
                        )}
                        {totalCount > 0 && (
                            <Popconfirm
                                title="Apakah Anda yakin ingin menghapus semua notifikasi?"
                                onConfirm={handleClearAll}
                                okText="Ya"
                                cancelText="Tidak"
                            >
                                <Button
                                    danger
                                    icon={<ClearOutlined />}
                                >
                                    Bersihkan Semua
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                </Col>
            </Row>

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'all',
                            label: `Semua (${totalCount})`,
                        },
                        {
                            key: 'unread',
                            label: (
                                <Badge count={unreadCount} size="small">
                                    Belum Dibaca
                                </Badge>
                            ),
                        },
                        {
                            key: 'read',
                            label: `Sudah Dibaca`,
                        },
                        {
                            key: 'info',
                            label: 'Info',
                        },
                        {
                            key: 'achievement',
                            label: 'Prestasi',
                        },
                        {
                            key: 'reminder',
                            label: 'Pengingat',
                        }
                    ]}
                />

                {notifications.length === 0 ? (
                    <Empty
                        description="Tidak ada notifikasi"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ margin: '40px 0' }}
                    />
                ) : (
                    <List
                        dataSource={notifications}
                        renderItem={(notification) => (
                            <List.Item
                                style={{
                                    background: notification.is_read ? 'transparent' : '#f6ffed',
                                    border: notification.is_read ? 'none' : '1px solid #b7eb8f',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    padding: '16px',
                                    cursor: notification.action_url ? 'pointer' : 'default'
                                }}
                                onClick={() => {
                                    if (notification.action_url && !notification.is_read) {
                                        handleMarkAsRead(notification.id);
                                    }
                                }}
                                actions={[
                                    <Dropdown
                                        overlay={getNotificationMenu(notification)}
                                        trigger={['click']}
                                        placement="bottomRight"
                                    >
                                        <Button
                                            type="text"
                                            icon={<MoreOutlined />}
                                            size="small"
                                        />
                                    </Dropdown>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            style={{
                                                backgroundColor: notification.data?.color || '#1890ff',
                                                color: '#fff'
                                            }}
                                            icon={getNotificationIcon(notification.type, notification.data?.icon)}
                                        />
                                    }
                                    title={
                                        <Space>
                                            <span style={{ fontWeight: notification.is_read ? 'normal' : 'bold' }}>
                                                {notification.title}
                                            </span>
                                            {!notification.is_read && (
                                                <Badge status="processing" />
                                            )}
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <Paragraph
                                                style={{
                                                    margin: '8px 0',
                                                    color: notification.is_read ? '#8c8c8c' : '#000'
                                                }}
                                            >
                                                {notification.message}
                                            </Paragraph>
                                            <Space size="small">
                                                <Tag color={getNotificationTypeTag(notification.type).color}>
                                                    {getNotificationTypeTag(notification.type).text}
                                                </Tag>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {notification.time_ago}
                                                </Text>
                                            </Space>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
}
