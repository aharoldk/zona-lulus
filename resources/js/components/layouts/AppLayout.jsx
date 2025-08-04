import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation, Outlet} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {useResponsive} from '../../hooks/useResponsive';
import {
    Layout,
    Menu,
    Button,
    Dropdown,
    Typography,
    Space
} from 'antd';
import {
    DashboardOutlined,
    FileTextOutlined,
    TrophyOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    StarOutlined,
    DollarCircleOutlined
} from '@ant-design/icons';

const {Header, Sider, Content} = Layout;
const {Text} = Typography;

export default function AppLayout({children}) {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const {isMobile, isTablet, isDesktop} = useResponsive();

    // Auto-collapse sidebar on mobile
    useEffect(() => {
        if (isMobile) {
            setCollapsed(true);
        }
    }, [isMobile]);

    // Menu items configuration
    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined/>,
            label: 'Dashboard',
        },
        // {
        //     key: '/courses',
        //     icon: <BookOutlined />,
        //     label: 'Kursus',
        //     children: [
        //         {
        //             key: '/courses/all',
        //             label: 'Semua Kursus',
        //         },
        //         {
        //             key: '/courses/my-courses',
        //             label: 'Kursus Saya',
        //         },
        //     ],
        // },
        {
            key: '/tryouts',
            icon: <FileTextOutlined/>,
            label: 'Tryout',
            // TODO: Implement tryout navigation
        },
        // {
        //     key: '/practice',
        //     icon: <BookOutlined />,
        //     label: 'Latihan Soal',
        //     children: [
        //         {
        //             key: '/practice/question-bank',
        //             label: 'Bank Soal',
        //         },
        //     ],
        // },
        {
            key: '/achievements',
            icon: <TrophyOutlined/>,
            label: 'Prestasi',
            // TODO: Implement achievements navigation
        },
        // {
        //     key: '/schedule',
        //     icon: <ClockCircleOutlined />,
        //     label: 'Jadwal Belajar',
        // },
        {
            key: '/analytics',
            icon: <DashboardOutlined/>,
            label: 'Analytics',
            // TODO: Implement analytics navigation
        },
        // {
        //     key: '/study-tracker',
        //     icon: <BookOutlined />,
        //     label: 'Study Tracker',
        // },
        // {
        //     key: '/ai-assistant',
        //     icon: <StarOutlined />,
        //     label: 'AI Assistant',
        // },
    ];

    // Get current selected key based on current path
    const getSelectedKey = () => {
        const path = location.pathname;

        // Check for exact matches first
        const exactMatch = menuItems.find(item => item.key === path);
        if (exactMatch) return [path];

        // Check for parent-child matches
        for (const item of menuItems) {
            if (item.children) {
                const childMatch = item.children.find(child => child.key === path);
                if (childMatch) return [path];
            }
        }

        // Check for partial matches (e.g., /courses/123 should match /courses)
        const partialMatch = menuItems.find(item =>
            path.startsWith(item.key) && item.key !== '/'
        );
        if (partialMatch) return [partialMatch.key];

        return ['/'];
    };

    // Get open keys for expanded menu items
    const getOpenKeys = () => {
        const path = location.pathname;
        const openKeys = [];

        for (const item of menuItems) {
            if (item.children) {
                const hasActiveChild = item.children.some(child =>
                    path === child.key || path.startsWith(child.key)
                );
                if (hasActiveChild) {
                    openKeys.push(item.key);
                }
            }
        }

        return openKeys;
    };

    const handleMenuClick = ({key}) => {
        navigate(key);
    };

    // User dropdown menu items
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined/>,
            label: 'Profil Saya',
            // TODO: Implement profile navigation
            onClick: () => navigate('/profile'),
        },
        {
            key: 'help',
            icon: <StarOutlined/>,
            label: 'Bantuan & Dukungan',
            // TODO: Implement help navigation
            onClick: () => navigate('/help'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined/>,
            label: 'Logout',
            danger: true,
            onClick: logout,
        },
    ];

    return (
        <Layout style={{minHeight: '100vh'}}>
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
                    padding: '16px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                    {!collapsed ? (
                        <Text strong style={{fontSize: '18px', color: '#1890ff'}}>
                            Zona Lulus
                        </Text>
                    ) : (
                        <Text strong style={{fontSize: '16px', color: '#1890ff'}}>
                            ZL
                        </Text>
                    )}
                </div>

                {/* Navigation Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={getSelectedKey()}
                    openKeys={getOpenKeys()}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        borderRight: 0,
                        height: 'calc(100vh - 64px)',
                        overflowY: 'auto',
                    }}
                />
            </Sider>

            <Layout>
                {/* Header */}
                <Header style={{
                    padding: '0 24px',
                    background: '#fff',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                            }}
                        />
                    </div>

                    <Space size={isMobile ? "small" : "middle"}>
                        <Button
                            type="text"
                            onClick={() => setSelectedKey('topup')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                height: 'auto',
                                padding: '4px 8px'
                            }}
                        >
                            <DollarCircleOutlined style={{fontSize: '18px', color: '#faad14', marginRight: '8px'}}/>
                            <Text style={{margin: 0, fontSize: isMobile ? '14px' : '16px', fontWeight: '500'}}>
                                {user?.coins} Koin
                            </Text>
                        </Button>

                        {/* User Dropdown */}
                        <Dropdown
                            menu={{items: userMenuItems}}
                            placement="bottomRight"
                            arrow
                        >
                            <Space style={{cursor: 'pointer'}}>
                                {!isMobile && (
                                    <Text strong>Hi, {user?.name}!</Text>
                                )}
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Main Content */}
                <Content style={{
                    margin: '24px',
                    padding: '24px',
                    background: '#fff',
                    borderRadius: '8px',
                    minHeight: 'calc(100vh - 112px)',
                    overflow: 'auto',
                }}>
                    <Outlet/>
                </Content>
            </Layout>

            {/* Mobile Overlay */}
            {isMobile && !collapsed && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.45)',
                        zIndex: 999,
                    }}
                    onClick={() => setCollapsed(true)}
                />
            )}
        </Layout>
    );
}
