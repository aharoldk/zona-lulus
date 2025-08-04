import React from 'react';
import {useAuth} from '../../context/AuthContext.jsx';
import {useResponsive} from '../../hooks/useResponsive.js';
import {
    Typography,
    Card,
    Row,
    Col,
    Statistic,
    Progress,
    List,
    Badge,
    Space
} from 'antd';
import {
    BookOutlined,
    FileTextOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';

const {Title, Text} = Typography;

export default function DashboardPage() {
    const {user} = useAuth();
    const {isMobile} = useResponsive();

    const stats = [
        {title: 'Kursus Aktif', value: 3, icon: <BookOutlined style={{color: '#1890ff'}}/>},
        {title: 'Tes Diselesaikan', value: 12, icon: <FileTextOutlined style={{color: '#52c41a'}}/>},
        {title: 'Prestasi', value: 8, icon: <TrophyOutlined style={{color: '#faad14'}}/>},
        {title: 'Jam Belajar', value: 45, suffix: 'jam', icon: <ClockCircleOutlined style={{color: '#722ed1'}}/>},
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in-progress': return 'processing';
            case 'achievement': return 'warning';
            default: return 'default';
        }
    };

    return (
        <div>
            <Title level={2} style={{marginBottom: '24px', fontSize: isMobile ? '20px' : '24px'}}>
                Selamat datang, {user?.name}! 👋
            </Title>

            {/* Statistics Cards - Mobile Responsive */}
            <Row gutter={[16, 16]} style={{marginBottom: '24px'}}>
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
                        <Space direction="vertical" style={{width: '100%'}} size="large">
                            <div>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                    <Text>Target Harian</Text>
                                    <Text strong>4/5 hari</Text>
                                </div>
                                <Progress percent={80} strokeColor="#52c41a" />
                            </div>
                            <div>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                    <Text>Jam Belajar</Text>
                                    <Text strong>12/15 jam</Text>
                                </div>
                                <Progress percent={80} strokeColor="#1890ff" />
                            </div>
                            <div>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                    <Text>Tes Selesai</Text>
                                    <Text strong>3/5 tes</Text>
                                </div>
                                <Progress percent={60} strokeColor="#faad14" />
                            </div>
                        </Space>
                    </Card>
                </Col>

                {/* Recent Activities */}
                <Col xs={24} lg={12}>
                    <Card
                        title="Aktivitas Terbaru"
                        size={isMobile ? "small" : "default"}
                    >
                        <List
                            dataSource={recentActivities}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Badge status={getStatusColor(item.status)} />
                                                <Text style={{fontSize: isMobile ? '14px' : '16px'}}>
                                                    {item.title}
                                                </Text>
                                            </Space>
                                        }
                                        description={
                                            <div>
                                                <Text type="secondary" style={{fontSize: isMobile ? '12px' : '14px'}}>
                                                    {item.description}
                                                </Text>
                                                <br />
                                                <Text type="secondary" style={{fontSize: '12px'}}>
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

            {/* Quick Actions */}
            <Row gutter={[16, 16]} style={{marginTop: '24px'}}>
                <Col span={24}>
                    <Card title="Aksi Cepat" size={isMobile ? "small" : "default"}>
                        <Row gutter={[16, 16]}>
                            <Col xs={12} sm={6}>
                                <Card hoverable style={{textAlign: 'center'}}>
                                    <BookOutlined style={{
                                        fontSize: isMobile ? '20px' : '24px',
                                        color: '#1890ff',
                                        marginBottom: '8px'
                                    }} />
                                    <div style={{fontSize: isMobile ? '12px' : '14px'}}>
                                        Mulai Belajar
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card hoverable style={{textAlign: 'center'}}>
                                    <FileTextOutlined style={{
                                        fontSize: isMobile ? '20px' : '24px',
                                        color: '#52c41a',
                                        marginBottom: '8px'
                                    }} />
                                    <div style={{fontSize: isMobile ? '12px' : '14px'}}>
                                        Ambil Tryout
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card hoverable style={{textAlign: 'center'}}>
                                    <TrophyOutlined style={{
                                        fontSize: isMobile ? '20px' : '24px',
                                        color: '#faad14',
                                        marginBottom: '8px'
                                    }} />
                                    <div style={{fontSize: isMobile ? '12px' : '14px'}}>
                                        Lihat Prestasi
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card hoverable style={{textAlign: 'center'}}>
                                    <ClockCircleOutlined style={{
                                        fontSize: isMobile ? '20px' : '24px',
                                        color: '#722ed1',
                                        marginBottom: '8px'
                                    }} />
                                    <div style={{fontSize: isMobile ? '12px' : '14px'}}>
                                        Jadwal Belajar
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
