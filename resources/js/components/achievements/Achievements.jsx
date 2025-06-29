import React, { useState } from 'react';
import { Card, Row, Col, Typography, Space, Badge, Progress, List, Avatar, Tabs, Button } from 'antd';
import { TrophyOutlined, StarOutlined, FireOutlined, CrownOutlined, SafetyCertificateOutlined, GiftOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function Achievements() {
    const badges = [
        {
            id: 1,
            name: 'First Step',
            description: 'Menyelesaikan kursus pertama',
            icon: <StarOutlined />,
            earned: true,
            earnedDate: '15 Juni 2024',
            color: '#52c41a',
            rarity: 'common'
        },
        {
            id: 2,
            name: 'Streak Master',
            description: 'Belajar selama 7 hari berturut-turut',
            icon: <FireOutlined />,
            earned: true,
            earnedDate: '20 Juni 2024',
            color: '#fa8c16',
            rarity: 'rare'
        },
        {
            id: 3,
            name: 'Quiz Champion',
            description: 'Mendapat skor 100% dalam 5 quiz',
            icon: <TrophyOutlined />,
            earned: false,
            progress: 3,
            target: 5,
            color: '#1890ff',
            rarity: 'epic'
        },
        {
            id: 4,
            name: 'Knowledge King',
            description: 'Menyelesaikan 10 kursus',
            icon: <CrownOutlined />,
            earned: false,
            progress: 3,
            target: 10,
            color: '#722ed1',
            rarity: 'legendary'
        }
    ];

    const leaderboard = [
        { rank: 1, name: 'Ahmad Yusuf', points: 2850, avatar: 'A' },
        { rank: 2, name: 'Siti Nurhaliza', points: 2720, avatar: 'S' },
        { rank: 3, name: 'Budi Santoso', points: 2650, avatar: 'B' },
        { rank: 4, name: 'Rina Kartika', points: 2580, avatar: 'R' },
        { rank: 5, name: 'Anda', points: 2450, avatar: 'A', isCurrentUser: true }
    ];

    const certificates = [
        {
            id: 1,
            title: 'Sertifikat Penyelesaian - Persiapan TNI',
            issuedDate: '25 Juni 2024',
            score: 95,
            status: 'issued'
        },
        {
            id: 2,
            title: 'Sertifikat Penyelesaian - CPNS Dasar',
            issuedDate: 'Dalam Progress',
            score: 0,
            status: 'pending'
        }
    ];

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

    return (
        <div>
            <Title level={2}>Prestasi</Title>
            <Paragraph type="secondary">
                Lihat pencapaian, peringkat, dan sertifikat Anda
            </Paragraph>

            <Tabs defaultActiveKey="badges">
                <TabPane tab="Badge & Pencapaian" key="badges">
                    <Row gutter={[16, 16]}>
                        {badges.map(badge => (
                            <Col xs={24} sm={12} md={8} lg={6} key={badge.id}>
                                <Card
                                    style={{
                                        textAlign: 'center',
                                        opacity: badge.earned ? 1 : 0.6,
                                        border: badge.earned ? `2px solid ${badge.color}` : '1px solid #f0f0f0'
                                    }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <div style={{
                                            fontSize: '48px',
                                            color: badge.earned ? badge.color : '#d9d9d9',
                                            marginBottom: '8px'
                                        }}>
                                            {badge.icon}
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>
                                            {badge.name}
                                        </Title>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {badge.description}
                                        </Text>

                                        {badge.earned ? (
                                            <div>
                                                <Badge
                                                    color={getRarityColor(badge.rarity)}
                                                    text={badge.rarity.toUpperCase()}
                                                />
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                                    Diperoleh: {badge.earnedDate}
                                                </Text>
                                            </div>
                                        ) : (
                                            <div>
                                                <Progress
                                                    percent={Math.round((badge.progress / badge.target) * 100)}
                                                    size="small"
                                                />
                                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                                    {badge.progress}/{badge.target}
                                                </Text>
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </TabPane>

                <TabPane tab="Leaderboard" key="leaderboard">
                    <Card title="Peringkat Bulanan">
                        <List
                            dataSource={leaderboard}
                            renderItem={(item) => (
                                <List.Item
                                    style={{
                                        backgroundColor: item.isCurrentUser ? '#f6ffed' : 'transparent',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        marginBottom: '8px'
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: getRankColor(item.rank),
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    marginRight: '12px'
                                                }}>
                                                    #{item.rank}
                                                </div>
                                                <Avatar>{item.avatar}</Avatar>
                                            </div>
                                        }
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: item.isCurrentUser ? 'bold' : 'normal' }}>
                                                    {item.name} {item.isCurrentUser && '(Anda)'}
                                                </span>
                                                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                                                    {item.points} poin
                                                </span>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Sertifikat" key="certificates">
                    <Row gutter={[16, 16]}>
                        {certificates.map(cert => (
                            <Col xs={24} md={12} key={cert.id}>
                                <Card
                                    title={cert.title}
                                    extra={
                                        cert.status === 'issued' ? (
                                            <Button type="primary" size="small">
                                                Download
                                            </Button>
                                        ) : (
                                            <Text type="secondary">Pending</Text>
                                        )
                                    }
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <div style={{ textAlign: 'center', padding: '24px' }}>
                                            <SafetyCertificateOutlined style={{
                                                fontSize: '64px',
                                                color: cert.status === 'issued' ? '#faad14' : '#d9d9d9'
                                            }} />
                                        </div>

                                        {cert.status === 'issued' ? (
                                            <>
                                                <div style={{ textAlign: 'center' }}>
                                                    <Text strong>Skor Akhir: {cert.score}%</Text>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <Text type="secondary">
                                                        Diterbitkan: {cert.issuedDate}
                                                    </Text>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <Text type="secondary">
                                                    Selesaikan kursus untuk mendapatkan sertifikat
                                                </Text>
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
