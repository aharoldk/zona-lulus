import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Typography, Space, Statistic, Progress, List, Avatar, Tabs, Spin, Alert } from 'antd';
import { PlayCircleOutlined, TrophyOutlined, ClockCircleOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../../utils/axios';

// Import the new components
import TryoutTest from './TryoutTest';
import TryoutResult from './TryoutResult';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function Tryout() {
    const [currentView, setCurrentView] = useState('list'); // 'list', 'tryout', 'result'
    const [selectedTryout, setSelectedTryout] = useState(null);
    const [tryoutResult, setTryoutResult] = useState(null);
    const [tryoutPackages, setTryoutPackages] = useState([]);
    const [myAttempts, setMyAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tryout packages from API
    useEffect(() => {
        fetchTryoutPackages();
        fetchMyAttempts();
    }, []);

    const fetchTryoutPackages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tryouts', {
                params: { category: 'tni' }
            });

            if (response.data.success) {
                const transformedData = response.data.data.map(test => ({
                    id: test.id,
                    title: test.title,
                    description: test.description,
                    questions: test.questions_count,
                    duration: test.time_limit,
                    attempts: test.attempts_allowed,
                    price: test.price_formatted,
                    difficulty: test.difficulty,
                    participants: test.participants_count,
                    averageScore: test.average_score,
                    category: test.category,
                    isActive: test.is_active,
                    isFree: test.is_free,
                    showResult: test.show_result,
                    randomizeQuestions: test.randomize_questions
                }));
                setTryoutPackages(transformedData);
            } else {
                setError('Failed to load tryout packages');
            }
        } catch (err) {
            console.error('Error fetching tryout packages:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyAttempts = async () => {
        try {
            const response = await api.get('/tryouts/my-attempts');

            if (response.data.success) {
                const transformedAttempts = response.data.data
                    .filter(attempt => attempt.category === 'tni') // Filter TNI attempts
                    .map(attempt => ({
                        id: attempt.id,
                        title: attempt.test_title,
                        score: Math.round(attempt.score),
                        maxScore: 100,
                        duration: `${Math.round(attempt.time_taken / 60)} menit`,
                        date: attempt.date_formatted,
                        rank: attempt.rank,
                        status: attempt.status,
                        testId: attempt.test_id
                    }));
                setMyAttempts(transformedAttempts);
            }
        } catch (err) {
            console.error('Error fetching user attempts:', err);
        }
    };

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

    // Handle start tryout
    const handleStartTryout = (tryout) => {
        setSelectedTryout(tryout);
        setCurrentView('tryout');
    };

    // Handle back to list
    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedTryout(null);
        setTryoutResult(null);
    };

    // Handle tryout finish
    const handleTryoutFinish = (result) => {
        setTryoutResult(result);
        setCurrentView('result');
    };

    // Handle retake tryout
    const handleRetakeTryout = () => {
        setCurrentView('tryout');
        setTryoutResult(null);
    };

    // Handle view discussion
    const handleViewDiscussion = () => {
        // This would navigate to discussion/review page
        console.log('View discussion clicked');
    };

    // Render based on current view
    if (currentView === 'tryout') {
        return (
            <TryoutTest
                tryoutData={selectedTryout}
                onBack={handleBackToList}
                onFinish={handleTryoutFinish}
            />
        );
    }

    if (currentView === 'result') {
        return (
            <TryoutResult
                result={tryoutResult}
                tryoutData={selectedTryout}
                onRetake={handleRetakeTryout}
                onBackToList={handleBackToList}
                onViewDiscussion={handleViewDiscussion}
            />
        );
    }

    if (loading) {
        return <Spin size="large" />;
    }

    if (error) {
        return <Alert message={error} type="error" />;
    }

    // Default list view
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
                                        <Button
                                            type="primary"
                                            icon={<PlayCircleOutlined />}
                                            onClick={() => handleStartTryout(tryout)}
                                        >
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
                                    <Button type="link" onClick={handleViewDiscussion}>
                                        Lihat Pembahasan
                                    </Button>,
                                    <Button type="primary" onClick={() => {
                                        const tryout = tryoutPackages.find(t => t.title === attempt.title);
                                        if (tryout) handleStartTryout(tryout);
                                    }}>
                                        Ulangi
                                    </Button>
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
