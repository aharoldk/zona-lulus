import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
    Progress,
    List,
    Badge,
    Space,
    Divider
} from 'antd';
import {
    DashboardOutlined,
    BookOutlined,
    FileTextOutlined,
    TrophyOutlined,
    SettingOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    StarOutlined
} from '@ant-design/icons';

// Import all screen components
import AllCourses from './courses/AllCourses';
import MyCourses from './courses/MyCourses';
import Tryout from './tryout/Tryout';
import QuestionBank from './practice/QuestionBank';
import Achievements from './achievements/Achievements';
import StudySchedule from './schedule/StudySchedule';
import Profile from './settings/Profile';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState('1');
    const [isMobile, setIsMobile] = useState(false);

    // Check if device is mobile
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setCollapsed(true);
            }
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const handleLogout = () => {
        logout();
    };

    // Menu items configuration
    const menuItems = [
        {
            key: '1',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '2',
            icon: <BookOutlined />,
            label: 'Kursus',
            children: [
                {
                    key: '2-1',
                    label: 'Semua Kursus',
                },
                {
                    key: '2-2',
                    label: 'Kursus Saya',
                },
                {
                    key: '2-3',
                    label: 'Favorit',
                },
                {
                    key: '2-4',
                    label: 'Riwayat Belajar',
                },
            ],
        },
        {
            key: '3',
            icon: <FileTextOutlined />,
            label: 'Tryout & Simulasi',
            children: [
                {
                    key: '3-1',
                    label: 'Tryout TNI',
                },
                {
                    key: '3-2',
                    label: 'Tryout POLRI',
                },
                {
                    key: '3-3',
                    label: 'Tryout CPNS',
                },
                {
                    key: '3-4',
                    label: 'Tryout BUMN',
                },
                {
                    key: '3-5',
                    label: 'Simulasi CAT',
                },
                {
                    key: '3-6',
                    label: 'Riwayat Tryout',
                },
            ],
        },
        {
            key: '4',
            icon: <PlayCircleOutlined />,
            label: 'Latihan Soal',
            children: [
                {
                    key: '4-1',
                    label: 'Bank Soal',
                },
                {
                    key: '4-2',
                    label: 'Drill Soal',
                },
                {
                    key: '4-3',
                    label: 'Latihan Harian',
                },
                {
                    key: '4-4',
                    label: 'Challenge Mode',
                },
            ],
        },
        {
            key: '5',
            icon: <TrophyOutlined />,
            label: 'Prestasi',
            children: [
                {
                    key: '5-1',
                    label: 'Badge & Pencapaian',
                },
                {
                    key: '5-2',
                    label: 'Leaderboard',
                },
                {
                    key: '5-3',
                    label: 'Sertifikat',
                },
                {
                    key: '5-4',
                    label: 'Progress Report',
                },
            ],
        },
        {
            key: '6',
            icon: <StarOutlined />,
            label: 'Pembahasan',
            children: [
                {
                    key: '6-1',
                    label: 'Video Pembahasan',
                },
                {
                    key: '6-2',
                    label: 'Pembahasan Tertulis',
                },
                {
                    key: '6-3',
                    label: 'Diskusi & Forum',
                },
            ],
        },
        {
            key: '7',
            icon: <CheckCircleOutlined />,
            label: 'Evaluasi',
            children: [
                {
                    key: '7-1',
                    label: 'Analisis Performa',
                },
                {
                    key: '7-2',
                    label: 'Rekomendasi Belajar',
                },
                {
                    key: '7-3',
                    label: 'Target & Goal',
                },
                {
                    key: '7-4',
                    label: 'Laporan Kemajuan',
                },
            ],
        },
        {
            key: '8',
            icon: <ClockCircleOutlined />,
            label: 'Jadwal',
            children: [
                {
                    key: '8-1',
                    label: 'Jadwal Belajar',
                },
                {
                    key: '8-2',
                    label: 'Reminder',
                },
                {
                    key: '8-3',
                    label: 'Live Session',
                },
                {
                    key: '8-4',
                    label: 'Kalender Ujian',
                },
            ],
        },
        {
            key: '9',
            icon: <SettingOutlined />,
            label: 'Pengaturan',
            children: [
                {
                    key: '9-1',
                    label: 'Profil',
                },
                {
                    key: '9-2',
                    label: 'Notifikasi',
                },
                {
                    key: '9-3',
                    label: 'Keamanan',
                },
                {
                    key: '9-4',
                    label: 'Preferensi',
                },
                {
                    key: '9-5',
                    label: 'Bantuan',
                },
            ],
        },
    ];

    // User dropdown menu
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profil Saya',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Pengaturan',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
        },
    ];

    // Sample data for dashboard content
    const stats = [
        { title: 'Kursus Aktif', value: 3, icon: <BookOutlined style={{ color: '#1890ff' }} /> },
        { title: 'Tes Diselesaikan', value: 12, icon: <FileTextOutlined style={{ color: '#52c41a' }} /> },
        { title: 'Prestasi', value: 8, icon: <TrophyOutlined style={{ color: '#faad14' }} /> },
        { title: 'Jam Belajar', value: 45, suffix: 'jam', icon: <ClockCircleOutlined style={{ color: '#722ed1' }} /> },
    ];

    const recentActivities = [
        {
            title: 'Menyelesaikan Tes Matematika Dasar',
            description: 'Skor: 85/100',
            time: '2 jam yang lalu',
            status: 'completed'
        },
        {
            title: 'Memulai Modul Bahasa Indonesia',
            description: 'Progress: 25%',
            time: '1 hari yang lalu',
            status: 'in-progress'
        },
        {
            title: 'Mendapat Badge "Konsisten Belajar"',
            description: 'Belajar 7 hari berturut-turut',
            time: '3 hari yang lalu',
            status: 'achievement'
        },
    ];

    const renderContent = () => {
        switch (selectedKey) {
            case '1':
                return (
                    <div>
                        <Title level={2} style={{ marginBottom: '24px', fontSize: isMobile ? '20px' : '24px' }}>
                            Selamat datang, {user?.name}! 👋
                        </Title>

                        {/* Statistics Cards - Mobile Responsive */}
                        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                            {stats.map((stat, index) => (
                                <Col xs={12} sm={12} md={6} key={index}>
                                    <Card size={isMobile ? "small" : "default"}>
                                        <Statistic
                                            title={stat.title}
                                            value={stat.value}
                                            suffix={stat.suffix}
                                            prefix={stat.icon}
                                            valueStyle={{
                                                fontSize: isMobile ? '18px' : '24px',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        <Row gutter={[16, 16]}>
                            {/* Progress Section */}
                            <Col xs={24} lg={12}>
                                <Card
                                    title="Progress Belajar"
                                    extra={<Text type="secondary">Minggu ini</Text>}
                                    size={isMobile ? "small" : "default"}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <div>
                                            <Text>Matematika Dasar</Text>
                                            <Progress percent={85} status="active" />
                                        </div>
                                        <div>
                                            <Text>Bahasa Indonesia</Text>
                                            <Progress percent={60} status="active" />
                                        </div>
                                        <div>
                                            <Text>Pengetahuan Umum</Text>
                                            <Progress percent={30} />
                                        </div>
                                    </Space>
                                </Card>
                            </Col>

                            {/* Recent Activities */}
                            <Col xs={24} lg={12}>
                                <Card
                                    title="Aktivitas Terbaru"
                                    extra={<Text type="secondary">7 hari terakhir</Text>}
                                    size={isMobile ? "small" : "default"}
                                >
                                    <List
                                        dataSource={recentActivities}
                                        renderItem={(item) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Badge
                                                            status={
                                                                item.status === 'completed' ? 'success' :
                                                                item.status === 'in-progress' ? 'processing' : 'warning'
                                                            }
                                                        />
                                                    }
                                                    title={<span style={{ fontSize: isMobile ? '14px' : '16px' }}>{item.title}</span>}
                                                    description={
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                                                {item.description}
                                                            </Text>
                                                            <br />
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                {item.time}
                                                            </Text>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                );

            // Course sections
            case '2-1':
                return <AllCourses />;
            case '2-2':
                return <MyCourses />;
            case '2-3':
            case '2-4':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Title level={3}>Fitur ini akan segera hadir!</Title>
                        <Text type="secondary">
                            Kami sedang mengembangkan fitur ini untuk memberikan pengalaman belajar yang lebih baik.
                        </Text>
                    </div>
                );

            // Tryout sections
            case '3-1':
                return <Tryout />;
            case '3-2':
            case '3-3':
            case '3-4':
            case '3-5':
            case '3-6':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Title level={3}>Fitur ini akan segera hadir!</Title>
                        <Text type="secondary">
                            Kami sedang mengembangkan fitur ini untuk memberikan pengalaman belajar yang lebih baik.
                        </Text>
                    </div>
                );

            // Practice sections
            case '4-1':
                return <QuestionBank />;
            case '4-2':
            case '4-3':
            case '4-4':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Title level={3}>Fitur ini akan segera hadir!</Title>
                        <Text type="secondary">
                            Kami sedang mengembangkan fitur ini untuk memberikan pengalaman belajar yang lebih baik.
                        </Text>
                    </div>
                );

            // Achievement sections
            case '5':
            case '5-1':
            case '5-2':
            case '5-3':
            case '5-4':
                return <Achievements />;

            // Discussion sections
            case '6-1':
            case '6-2':
            case '6-3':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Title level={3}>Fitur ini akan segera hadir!</Title>
                        <Text type="secondary">
                            Kami sedang mengembangkan fitur ini untuk memberikan pengalaman belajar yang lebih baik.
                        </Text>
                    </div>
                );

            // Evaluation sections
            case '7-1':
            case '7-2':
            case '7-3':
            case '7-4':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Title level={3}>Fitur ini akan segera hadir!</Title>
                        <Text type="secondary">
                            Kami sedang mengembangkan fitur ini untuk memberikan pengalaman belajar yang lebih baik.
                        </Text>
                    </div>
                );

            // Schedule sections
            case '8-1':
            case '8-2':
            case '8-3':
            case '8-4':
                return <StudySchedule />;

            // Settings sections
            case '9-1':
            case '9-2':
            case '9-3':
            case '9-4':
            case '9-5':
                return <Profile />;

            default:
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Title level={3}>Fitur ini akan segera hadir!</Title>
                        <Text type="secondary">
                            Kami sedang mengembangkan fitur ini untuk memberikan pengalaman belajar yang lebih baik.
                        </Text>
                    </div>
                );
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                collapsedWidth={isMobile ? 0 : 80}
                width={isMobile ? 250 : 200}
                style={{
                    background: '#fff',
                    boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
                    position: isMobile ? 'fixed' : 'relative',
                    height: isMobile ? '100vh' : 'auto',
                    zIndex: isMobile ? 1000 : 'auto',
                    left: isMobile && collapsed ? '-250px' : '0',
                    transition: 'all 0.2s',
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
                    {collapsed && !isMobile ? (
                        <img src="/logo-zona-lulus.png" alt="Logo" width="32" />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img src="/logo-zona-lulus.png" alt="Logo" width="32" style={{ marginRight: '12px' }} />
                            <Title level={4} style={{ margin: 0, color: '#2c3e50', fontSize: isMobile ? '16px' : '18px' }}>
                                Zona Lulus
                            </Title>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={menuItems}
                    style={{ border: 'none', marginTop: '16px' }}
                    onClick={({ key }) => {
                        setSelectedKey(key);
                        if (isMobile) {
                            setCollapsed(true);
                        }
                    }}
                />
            </Sider>

            {/* Overlay for mobile */}
            {isMobile && !collapsed && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        zIndex: 999,
                    }}
                    onClick={() => setCollapsed(true)}
                />
            )}

            {/* Main Layout */}
            <Layout style={{ marginLeft: 0, transition: 'all 0.2s' }}>
                {/* Header */}
                <Header style={{
                    padding: isMobile ? '0 12px' : '0 16px',
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

                    <Space size={isMobile ? "small" : "middle"}>
                        {/* Notifications */}
                        <Badge count={3} size="small">
                            <Button type="text" icon={<BellOutlined />} shape="circle" size={isMobile ? "small" : "default"} />
                        </Badge>

                        {/* User Menu */}
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
                                <Space size="small">
                                    <Avatar size={isMobile ? "small" : "default"} icon={<UserOutlined />} />
                                    {!isMobile && <span style={{ fontWeight: '500' }}>{user?.name}</span>}
                                </Space>
                            </Button>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Content */}
                <Content style={{
                    margin: isMobile ? '12px 8px' : '24px 16px',
                    padding: isMobile ? '16px' : '24px',
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
