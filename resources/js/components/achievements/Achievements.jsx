import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Badge, Progress, List, Avatar, Tabs, Button, Spin, Alert } from 'antd';
import { TrophyOutlined, StarOutlined, FireOutlined, CrownOutlined, SafetyCertificateOutlined, GiftOutlined } from '@ant-design/icons';
import api from '../../utils/axios';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function Achievements() {
    const [badges, setBadges] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAchievementsData();
    }, []);

    const fetchAchievementsData = async () => {
        try {
            setLoading(true);
            const [badgesResponse, leaderboardResponse, certificatesResponse] = await Promise.all([
                api.get('/achievements/badges'),
                api.get('/achievements/leaderboard'),
                api.get('/achievements/certificates')
            ]);

            if (badgesResponse.data.success) {
                setBadges(badgesResponse.data.data);
            }
            if (leaderboardResponse.data.success) {
                setLeaderboard(leaderboardResponse.data.data);
            }
            if (certificatesResponse.data.success) {
                setCertificates(certificatesResponse.data.data);
            }
        } catch (err) {
            console.error('Error fetching achievements data:', err);
            setError('Failed to load achievements data');
        } finally {
            setLoading(false);
        }
    };

    const getIconComponent = (iconName) => {
        switch (iconName) {
            case 'star': return <StarOutlined />;
            case 'fire': return <FireOutlined />;
            case 'trophy': return <TrophyOutlined />;
            case 'crown': return <CrownOutlined />;
            default: return <StarOutlined />;
        }
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'common': return '#52c41a';
            case 'rare': return '#1890ff';
            case 'epic': return '#722ed1';
            case 'legendary': return '#fa8c16';
            default: return '#d9d9d9';
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1: return '#faad14';
            case 2: return '#d9d9d9';
            case 3: return '#fa8c16';
            default: return '#1890ff';
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Loading achievements...</div>
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
            />
        );
    }

    return (
        <div>
            <Title level={2}>Prestasi</Title>
            <Paragraph type="secondary">
                Pantau pencapaian dan prestasi belajar Anda
            </Paragraph>

            <Tabs defaultActiveKey="badges">
                <TabPane tab="Lencana" key="badges">
                    <Row gutter={[16, 16]}>
                        {badges.map(badge => (
                            <Col xs={24} md={12} lg={8} key={badge.id}>
                                <Card
                                    style={{
                                        opacity: badge.earned ? 1 : 0.6,
                                        border: badge.earned ? `2px solid ${getRarityColor(badge.rarity)}` : '1px solid #d9d9d9'
                                    }}
                                >
                                    <div style={{ textAlign: 'center' }}>
                                        <div
                                            style={{
                                                fontSize: '48px',
                                                color: badge.earned ? badge.color : '#d9d9d9',
                                                marginBottom: '16px'
                                            }}
                                        >
                                            {getIconComponent(badge.icon)}
                                        </div>
                                        <Title level={4}>{badge.name}</Title>
                                        <Paragraph type="secondary">{badge.description}</Paragraph>

                                        {badge.earned ? (
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                <Badge.Ribbon text={badge.rarity.toUpperCase()} color={getRarityColor(badge.rarity)}>
                                                    <div style={{ height: '20px' }}></div>
                                                </Badge.Ribbon>
                                                <Text type="success">Diperoleh: {badge.earnedDate}</Text>
                                            </Space>
                                        ) : (
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                <Text type="secondary">Progress: {badge.progress}/{badge.target}</Text>
                                                <Progress
                                                    percent={Math.round((badge.progress / badge.target) * 100)}
                                                    size="small"
                                                />
                                            </Space>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </TabPane>

                <TabPane tab="Leaderboard" key="leaderboard">
                    <Card title="Peringkat Peserta">
                        <List
                            dataSource={leaderboard}
                            renderItem={(item) => (
                                <List.Item
                                    style={{
                                        background: item.isCurrentUser ? '#f6ffed' : 'transparent',
                                        border: item.isCurrentUser ? '1px solid #b7eb8f' : 'none',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        padding: '12px'
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div style={{ position: 'relative' }}>
                                                <Avatar
                                                    style={{
                                                        backgroundColor: getRankColor(item.rank),
                                                        color: '#fff'
                                                    }}
                                                    size="large"
                                                >
                                                    {item.avatar}
                                                </Avatar>
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        left: '-8px',
                                                        background: getRankColor(item.rank),
                                                        color: '#fff',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {item.rank}
                                                </div>
                                            </div>
                                        }
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>{item.name}</span>
                                                {item.isCurrentUser && <Tag color="green">Anda</Tag>}
                                            </div>
                                        }
                                        description={`${item.points} poin`}
                                    />
                                    {item.rank <= 3 && (
                                        <TrophyOutlined style={{ color: getRankColor(item.rank), fontSize: '24px' }} />
                                    )}
                                </List.Item>
                            )}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Sertifikat" key="certificates">
                    <Row gutter={[16, 16]}>
                        {certificates.map(cert => (
                            <Col xs={24} md={12} lg={8} key={cert.id}>
                                <Card
                                    title={cert.title}
                                    extra={
                                        cert.status === 'issued' ?
                                            <Tag color="green">Terbit</Tag> :
                                            <Tag color="orange">Pending</Tag>
                                    }
                                    actions={
                                        cert.status === 'issued' ? [
                                            <Button type="primary" icon={<SafetyCertificateOutlined />}>
                                                Download
                                            </Button>
                                        ] : []
                                    }
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <SafetyCertificateOutlined
                                                style={{
                                                    fontSize: '48px',
                                                    color: cert.status === 'issued' ? '#52c41a' : '#d9d9d9'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <Text strong>Tanggal Terbit:</Text>
                                            <br />
                                            <Text>{cert.issuedDate}</Text>
                                        </div>

                                        {cert.status === 'issued' && (
                                            <div>
                                                <Text strong>Skor:</Text>
                                                <br />
                                                <Text>{cert.score}/100</Text>
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </TabPane>
            </Tabs>
        </div>
    );
}
