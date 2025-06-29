import React, { useState } from 'react';
import { Card, Row, Col, Progress, Button, Tag, Typography, Space, List, Avatar } from 'antd';
import { PlayCircleOutlined, BookOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function MyCourses() {
    const myCourses = [
        {
            id: 1,
            title: 'Persiapan TNI - Akademi Militer',
            progress: 65,
            lastAccessed: '2 hari yang lalu',
            nextLesson: 'Tes Psikologi - Bagian 3',
            totalLessons: 24,
            completedLessons: 16,
            status: 'active',
            thumbnail: '/course-tni.jpg',
            instructor: 'Mayor Budi Santoso',
            timeSpent: '45 jam'
        },
        {
            id: 2,
            title: 'CPNS 2024 - Seleksi Kompetensi Dasar',
            progress: 30,
            lastAccessed: '1 hari yang lalu',
            nextLesson: 'Matematika Dasar - Soal Cerita',
            totalLessons: 18,
            completedLessons: 5,
            status: 'active',
            thumbnail: '/course-cpns.jpg',
            instructor: 'Dr. Sari Melati',
            timeSpent: '15 jam'
        },
        {
            id: 3,
            title: 'Persiapan POLRI - Akademi Kepolisian',
            progress: 100,
            lastAccessed: '1 minggu yang lalu',
            nextLesson: 'Selesai',
            totalLessons: 20,
            completedLessons: 20,
            status: 'completed',
            thumbnail: '/course-polri.jpg',
            instructor: 'Komisaris Andi Wijaya',
            timeSpent: '60 jam'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'processing';
            case 'completed': return 'success';
            case 'paused': return 'warning';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Sedang Berjalan';
            case 'completed': return 'Selesai';
            case 'paused': return 'Ditunda';
            default: return 'Tidak Aktif';
        }
    };

    return (
        <div>
            <Title level={2}>Kursus Saya</Title>
            <Paragraph type="secondary">
                Kelola dan lanjutkan pembelajaran Anda
            </Paragraph>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                                {myCourses.filter(c => c.status === 'active').length}
                            </div>
                            <Text type="secondary">Kursus Aktif</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                                {myCourses.filter(c => c.status === 'completed').length}
                            </div>
                            <Text type="secondary">Kursus Selesai</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#722ed1' }}>
                                {myCourses.reduce((total, course) => total + parseInt(course.timeSpent), 0)}
                            </div>
                            <Text type="secondary">Total Jam Belajar</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Course List */}
            <Row gutter={[16, 16]}>
                {myCourses.map(course => (
                    <Col xs={24} key={course.id}>
                        <Card>
                            <Row gutter={16} align="middle">
                                <Col xs={24} sm={4}>
                                    <div style={{
                                        height: '80px',
                                        background: 'linear-gradient(45deg, #1890ff, #722ed1)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <BookOutlined style={{ fontSize: '32px', color: 'white' }} />
                                    </div>
                                </Col>
                                <Col xs={24} sm={14}>
                                    <div>
                                        <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>
                                            {course.title}
                                        </Title>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <Tag color={getStatusColor(course.status)}>
                                                    {getStatusText(course.status)}
                                                </Tag>
                                                <Text type="secondary">
                                                    Terakhir diakses: {course.lastAccessed}
                                                </Text>
                                            </div>
                                            <div>
                                                <Text type="secondary">Progress:</Text>
                                                <Progress
                                                    percent={course.progress}
                                                    status={course.status === 'completed' ? 'success' : 'active'}
                                                    style={{ marginTop: '4px' }}
                                                />
                                                <Text type="secondary">
                                                    {course.completedLessons}/{course.totalLessons} pelajaran selesai
                                                </Text>
                                            </div>
                                            <div style={{ display: 'flex', gap: '24px' }}>
                                                <Space>
                                                    <ClockCircleOutlined />
                                                    <Text type="secondary">{course.timeSpent}</Text>
                                                </Space>
                                                <Space>
                                                    <Avatar size="small" />
                                                    <Text type="secondary">{course.instructor}</Text>
                                                </Space>
                                            </div>
                                        </Space>
                                    </div>
                                </Col>
                                <Col xs={24} sm={6}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {course.status === 'completed' ? (
                                            <>
                                                <Button type="default" block icon={<CheckCircleOutlined />}>
                                                    Lihat Sertifikat
                                                </Button>
                                                <Button type="primary" block>
                                                    Ulangi Kursus
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Text strong>Selanjutnya:</Text>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {course.nextLesson}
                                                </Text>
                                                <Button type="primary" block icon={<PlayCircleOutlined />}>
                                                    Lanjutkan Belajar
                                                </Button>
                                            </>
                                        )}
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
