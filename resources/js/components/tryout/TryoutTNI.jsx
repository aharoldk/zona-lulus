import React, { useState } from 'react';
import { Card, Row, Col, Button, Tag, Typography, Space, Statistic, Progress, List, Avatar, Tabs } from 'antd';
import { PlayCircleOutlined, TrophyOutlined, ClockCircleOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function TryoutTNI() {
    const tryoutPackages = [
        {
            id: 1,
            title: 'Tryout TNI - Paket Lengkap',
            description: 'Paket tryout lengkap untuk persiapan masuk TNI dengan soal terbaru',
            questions: 100,
            duration: 120,
            attempts: 3,
            price: 'Gratis',
            difficulty: 'Menengah',
            participants: 1250,
            averageScore: 75,
            category: 'Lengkap'
        },
        {
            id: 2,
            title: 'Tryout TNI - Matematika',
            description: 'Fokus pada materi matematika untuk tes masuk TNI',
            questions: 40,
            duration: 60,
            attempts: 5,
            price: 'Premium',
            difficulty: 'Sulit',
            participants: 890,
            averageScore: 68,
            category: 'Spesifik'
        },
        {
            id: 3,
            title: 'Tryout TNI - Bahasa Indonesia',
            description: 'Tes kemampuan bahasa Indonesia untuk TNI',
            questions: 30,
            duration: 45,
            attempts: 5,
            price: 'Premium',
            difficulty: 'Mudah',
            participants: 756,
            averageScore: 82,
            category: 'Spesifik'
        }
    ];

    const myAttempts = [
        {
            id: 1,
            title: 'Tryout TNI - Paket Lengkap',
            score: 85,
            maxScore: 100,
            duration: '105 menit',
            date: '2 hari yang lalu',
            rank: 45,
            status: 'completed'
        },
        {
            id: 2,
            title: 'Tryout TNI - Matematika',
            score: 72,
            maxScore: 100,
            duration: '55 menit',
            date: '5 hari yang lalu',
            rank: 125,
            status: 'completed'
        }
    ];

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Mudah': return 'green';
            case 'Menengah': return 'orange';
            case 'Sulit': return 'red';
            default: return 'default';
        }
    };

    const getPriceColor = (price) => {
        return price === 'Gratis' ? 'green' : 'blue';
    };

    return (
        <div>
            <Title level={2}>Tryout TNI</Title>
            <Paragraph type="secondary">
                Latihan soal dan simulasi tes untuk persiapan masuk TNI
            </Paragraph>

            <Tabs defaultActiveKey="available">
                <TabPane tab="Tryout Tersedia" key="available">
                    <Row gutter={[16, 16]}>
                        {tryoutPackages.map(tryout => (
                            <Col xs={24} lg={12} key={tryout.id}>
                                <Card
                                    title={tryout.title}
                                    extra={<Tag color={getPriceColor(tryout.price)}>{tryout.price}</Tag>}
                                    actions={[
                                        <Button type="primary" icon={<PlayCircleOutlined />}>
                                            Mulai Tryout
                                        </Button>
                                    ]}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Paragraph>{tryout.description}</Paragraph>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Jumlah Soal"
                                                    value={tryout.questions}
                                                    prefix={<FileTextOutlined />}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Durasi"
                                                    value={tryout.duration}
                                                    suffix="menit"
                                                    prefix={<ClockCircleOutlined />}
                                                />
                                            </Col>
                                        </Row>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                                            <Space>
                                                <Tag color={getDifficultyColor(tryout.difficulty)}>
                                                    {tryout.difficulty}
                                                </Tag>
                                                <Text type="secondary">
                                                    {tryout.attempts} percobaan
                                                </Text>
                                            </Space>
                                            <Space>
                                                <UserOutlined />
                                                <Text type="secondary">{tryout.participants} peserta</Text>
                                            </Space>
                                        </div>

                                        <div>
                                            <Text type="secondary">Rata-rata Skor: </Text>
                                            <Text strong>{tryout.averageScore}%</Text>
                                            <Progress
                                                percent={tryout.averageScore}
                                                size="small"
                                                style={{ marginTop: '4px' }}
                                            />
                                        </div>
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </TabPane>

                <TabPane tab="Riwayat Saya" key="history">
                    <List
                        dataSource={myAttempts}
                        renderItem={(attempt) => (
                            <List.Item
                                actions={[
                                    <Button type="link">Lihat Pembahasan</Button>,
                                    <Button type="primary">Ulangi</Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<TrophyOutlined />} />}
                                    title={attempt.title}
                                    description={
                                        <Space direction="vertical">
                                            <div>
                                                <Text strong>Skor: {attempt.score}/{attempt.maxScore}</Text>
                                                <Text type="secondary" style={{ marginLeft: '16px' }}>
                                                    Peringkat: #{attempt.rank}
                                                </Text>
                                            </div>
                                            <div>
                                                <Text type="secondary">
                                                    Durasi: {attempt.duration} • {attempt.date}
                                                </Text>
                                            </div>
                                            <Progress
                                                percent={(attempt.score / attempt.maxScore) * 100}
                                                size="small"
                                                status={attempt.score >= 75 ? 'success' : 'normal'}
                                            />
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </TabPane>
            </Tabs>
        </div>
    );
}
