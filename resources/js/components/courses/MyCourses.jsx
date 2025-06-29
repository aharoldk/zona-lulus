import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Button, Tag, Typography, Space, Empty, Spin, Alert } from 'antd';
import { PlayCircleOutlined, BookOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../utils/axios';

const { Title, Text, Paragraph } = Typography;

export default function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/courses/my-courses');

            if (response.data.success) {
                setCourses(response.data.data);
            } else {
                setError('Failed to load your courses');
            }
        } catch (err) {
            console.error('Error fetching my courses:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'tni': 'green',
            'polri': 'blue',
            'kedinasan': 'orange'
        };
        return colors[category] || 'default';
    };

    const getProgressStatus = (percentage) => {
        if (percentage === 100) return 'success';
        if (percentage > 0) return 'active';
        return 'normal';
    };

    const formatPrice = (price) => {
        if (!price || price === 0) return 'Free';
        return `Rp ${price.toLocaleString('id-ID')}`;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading your courses...</div>
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
        <div style={{ padding: '24px' }}>
            <Title level={2}>My Courses</Title>
            <Text type="secondary">
                Continue your TNI/POLRI preparation journey
            </Text>

            {courses.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{
                        '--image-height': '60px'
                    }}
                    description={
                        <div>
                            <Text strong>No enrolled courses yet</Text>
                            <br />
                            <Text type="secondary">Explore available courses to start your preparation</Text>
                        </div>
                    }
                    style={{ margin: '60px 0' }}
                >
                    <Button type="primary" href="/courses">
                        Browse Courses
                    </Button>
                </Empty>
            ) : (
                <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                    {courses.map((course) => (
                        <Col xs={24} sm={12} lg={8} key={course.id}>
                            <Card
                                hoverable
                                cover={
                                    <div style={{
                                        height: 180,
                                        background: `linear-gradient(135deg, ${course.metadata?.color || '#1890ff'}, ${course.metadata?.color || '#40a9ff'})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '32px',
                                        position: 'relative'
                                    }}>
                                        <BookOutlined />
                                        {course.completed_at && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: '50%',
                                                padding: '4px'
                                            }}>
                                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                                            </div>
                                        )}
                                    </div>
                                }
                                actions={[
                                    <Button
                                        type="primary"
                                        icon={<PlayCircleOutlined />}
                                        href={`/courses/${course.id}`}
                                        size="small"
                                    >
                                        {course.progress_percentage > 0 ? 'Continue' : 'Start'}
                                    </Button>
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <div>
                                            <Text strong style={{ fontSize: '16px' }}>
                                                {course.title}
                                            </Text>
                                            <div style={{ marginTop: '8px' }}>
                                                <Tag color={getCategoryColor(course.category.toLowerCase())}>
                                                    {course.category}
                                                </Tag>
                                                {course.completed_at && (
                                                    <Tag color="success" icon={<CheckCircleOutlined />}>
                                                        Completed
                                                    </Tag>
                                                )}
                                            </div>
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <Paragraph
                                                ellipsis={{ rows: 2 }}
                                                style={{ marginBottom: '16px', color: '#666' }}
                                            >
                                                {course.description}
                                            </Paragraph>

                                            {/* Progress Bar */}
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>Progress</Text>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {Math.round(course.progress_percentage || 0)}%
                                                    </Text>
                                                </div>
                                                <Progress
                                                    percent={Math.round(course.progress_percentage || 0)}
                                                    size="small"
                                                    status={getProgressStatus(course.progress_percentage || 0)}
                                                    showInfo={false}
                                                />
                                            </div>

                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                <Space size="middle">
                                                    <Space size="small">
                                                        <BookOutlined style={{ color: '#666' }} />
                                                        <Text type="secondary">{course.modules_count} modules</Text>
                                                    </Space>
                                                    <Space size="small">
                                                        <ClockCircleOutlined style={{ color: '#666' }} />
                                                        <Text type="secondary">{course.duration || 'Self-paced'}</Text>
                                                    </Space>
                                                </Space>

                                                {course.price > 0 && (
                                                    <div>
                                                        <Text style={{ fontSize: '14px', color: '#1890ff' }}>
                                                            {formatPrice(course.price)}
                                                        </Text>
                                                    </div>
                                                )}

                                                {course.completed_at && (
                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            Completed on {new Date(course.completed_at).toLocaleDateString('id-ID')}
                                                        </Text>
                                                    </div>
                                                )}
                                            </Space>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Summary Stats */}
            {courses.length > 0 && (
                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                }}>
                    <Title level={4}>Your Learning Progress</Title>
                    <Row gutter={[24, 16]}>
                        <Col xs={24} sm={8}>
                            <div style={{ textAlign: 'center' }}>
                                <Text strong style={{ fontSize: '24px', color: '#1890ff' }}>
                                    {courses.length}
                                </Text>
                                <br />
                                <Text type="secondary">Enrolled Courses</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={8}>
                            <div style={{ textAlign: 'center' }}>
                                <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>
                                    {courses.filter(c => c.completed_at).length}
                                </Text>
                                <br />
                                <Text type="secondary">Completed</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={8}>
                            <div style={{ textAlign: 'center' }}>
                                <Text strong style={{ fontSize: '24px', color: '#faad14' }}>
                                    {Math.round(
                                        courses.reduce((acc, course) => acc + (course.progress_percentage || 0), 0) / courses.length
                                    )}%
                                </Text>
                                <br />
                                <Text type="secondary">Average Progress</Text>
                            </div>
                        </Col>
                    </Row>
                </div>
            )}
        </div>
    );
}
