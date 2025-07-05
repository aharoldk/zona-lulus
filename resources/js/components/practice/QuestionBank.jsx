import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Typography, Space, Select, Input, Statistic, Progress, List, Spin, Alert } from 'antd';
import { PlayCircleOutlined, SearchOutlined, FilterOutlined, BookOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../utils/axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function QuestionBank() {
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [questionSets, setQuestionSets] = useState([]);
    const [stats, setStats] = useState({
        totalSets: 0,
        completedSets: 0,
        totalQuestions: 0,
        answeredQuestions: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const subjects = ['all', 'Matematika', 'Bahasa Indonesia', 'Logika', 'Pengetahuan Umum'];
    const difficulties = ['all', 'Mudah', 'Menengah', 'Sulit'];

    useEffect(() => {
        fetchQuestionSets();
        fetchStats();
    }, [selectedSubject, selectedDifficulty, searchText]);

    const fetchQuestionSets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/question-bank', {
                params: {
                    subject: selectedSubject,
                    difficulty: selectedDifficulty,
                    search: searchText
                }
            });

            if (response.data.success) {
                setQuestionSets(response.data.data);
            } else {
                setError('Failed to load question sets');
            }
        } catch (err) {
            console.error('Error fetching question sets:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/question-bank/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const filteredQuestions = questionSets;

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Mudah': return 'green';
            case 'Menengah': return 'orange';
            case 'Sulit': return 'red';
            default: return 'default';
        }
    };

    const getProgressStatus = (completed, total) => {
        const percentage = (completed / total) * 100;
        if (percentage === 100) return 'success';
        if (percentage > 0) return 'active';
        return 'normal';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Loading question bank...</div>
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
            <Title level={2}>Bank Soal</Title>
            <Paragraph type="secondary">
                Koleksi lengkap latihan soal untuk persiapan berbagai tes seleksi
            </Paragraph>

            {/* Summary Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Set Soal"
                            value={stats.totalSets}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Set Selesai"
                            value={stats.completedSets}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Soal"
                            value={stats.totalQuestions}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Soal Terjawab"
                            value={stats.answeredQuestions}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={8}>
                        <Input
                            placeholder="Cari set soal..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <Select
                            value={selectedSubject}
                            onChange={setSelectedSubject}
                            style={{ width: '100%' }}
                            placeholder="Mata Pelajaran"
                        >
                            <Option value="all">Semua Mata Pelajaran</Option>
                            {subjects.filter(s => s !== 'all').map(subject => (
                                <Option key={subject} value={subject}>{subject}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={12} md={4}>
                        <Select
                            value={selectedDifficulty}
                            onChange={setSelectedDifficulty}
                            style={{ width: '100%' }}
                            placeholder="Tingkat Kesulitan"
                        >
                            <Option value="all">Semua Tingkat</Option>
                            {difficulties.filter(d => d !== 'all').map(difficulty => (
                                <Option key={difficulty} value={difficulty}>{difficulty}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} md={8}>
                        <Button type="primary" icon={<FilterOutlined />}>
                            Terapkan Filter
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Question Sets */}
            <Row gutter={[16, 16]}>
                {filteredQuestions.map(set => (
                    <Col xs={24} lg={12} key={set.id}>
                        <Card
                            title={set.title}
                            extra={<Tag color={getDifficultyColor(set.difficulty)}>{set.difficulty}</Tag>}
                            actions={[
                                <Button type="primary" icon={<PlayCircleOutlined />}>
                                    {set.completed > 0 ? 'Lanjutkan' : 'Mulai Latihan'}
                                </Button>
                            ]}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Paragraph>{set.description}</Paragraph>

                                <Row gutter={16}>
                                    <Col span={8}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                                                {set.questions}
                                            </div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Soal</Text>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                                                {set.completed}
                                            </div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Selesai</Text>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#722ed1' }}>
                                                {set.timeEstimate}
                                            </div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Menit</Text>
                                        </div>
                                    </Col>
                                </Row>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <Text type="secondary">Progress:</Text>
                                        <Text>{Math.round((set.completed / set.questions) * 100)}%</Text>
                                    </div>
                                    <Progress
                                        percent={Math.round((set.completed / set.questions) * 100)}
                                        status={getProgressStatus(set.completed, set.questions)}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Tag color="blue">{set.subject}</Tag>
                                    <Tag>{set.category}</Tag>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
