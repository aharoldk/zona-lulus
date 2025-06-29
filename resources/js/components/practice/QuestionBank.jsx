import React, { useState } from 'react';
import { Card, Row, Col, Button, Tag, Typography, Space, Select, Input, Statistic, Progress, List } from 'antd';
import { PlayCircleOutlined, SearchOutlined, FilterOutlined, BookOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function QuestionBank() {
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchText, setSearchText] = useState('');

    const questionSets = [
        {
            id: 1,
            title: 'Matematika Dasar - Aritmatika',
            subject: 'Matematika',
            difficulty: 'Mudah',
            questions: 50,
            completed: 35,
            timeEstimate: 60,
            category: 'TNI',
            description: 'Latihan soal aritmatika dasar untuk persiapan tes TNI'
        },
        {
            id: 2,
            title: 'Bahasa Indonesia - Tata Bahasa',
            subject: 'Bahasa Indonesia',
            difficulty: 'Menengah',
            questions: 40,
            completed: 20,
            timeEstimate: 45,
            category: 'CPNS',
            description: 'Soal-soal tata bahasa Indonesia untuk CPNS'
        },
        {
            id: 3,
            title: 'Logika - Penalaran Analitis',
            subject: 'Logika',
            difficulty: 'Sulit',
            questions: 30,
            completed: 0,
            timeEstimate: 90,
            category: 'POLRI',
            description: 'Latihan penalaran analitis untuk tes POLRI'
        },
        {
            id: 4,
            title: 'Pengetahuan Umum - Sejarah Indonesia',
            subject: 'Pengetahuan Umum',
            difficulty: 'Menengah',
            questions: 60,
            completed: 45,
            timeEstimate: 75,
            category: 'TNI',
            description: 'Soal sejarah Indonesia untuk persiapan TNI'
        }
    ];

    const subjects = ['all', 'Matematika', 'Bahasa Indonesia', 'Logika', 'Pengetahuan Umum'];
    const difficulties = ['all', 'Mudah', 'Menengah', 'Sulit'];

    const filteredQuestions = questionSets.filter(set => {
        const matchesSubject = selectedSubject === 'all' || set.subject === selectedSubject;
        const matchesDifficulty = selectedDifficulty === 'all' || set.difficulty === selectedDifficulty;
        const matchesSearch = set.title.toLowerCase().includes(searchText.toLowerCase());
        return matchesSubject && matchesDifficulty && matchesSearch;
    });

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
                            value={questionSets.length}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Soal Diselesaikan"
                            value={questionSets.reduce((sum, set) => sum + set.completed, 0)}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Soal"
                            value={questionSets.reduce((sum, set) => sum + set.questions, 0)}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Progress Keseluruhan"
                            value={Math.round((questionSets.reduce((sum, set) => sum + set.completed, 0) / questionSets.reduce((sum, set) => sum + set.questions, 0)) * 100)}
                            suffix="%"
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
