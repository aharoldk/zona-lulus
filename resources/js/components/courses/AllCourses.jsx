import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, Tag, Typography, Space, Pagination, Spin, Alert } from 'antd';
import { SearchOutlined, BookOutlined, PlayCircleOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../../utils/axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function AllCourses() {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0
    });

    // Fetch courses from API
    useEffect(() => {
        fetchCourses();
    }, [selectedCategory, searchText, pagination.current]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                per_page: pagination.pageSize,
                category: selectedCategory,
                search: searchText
            };

            const response = await api.get('/courses', { params });

            if (response.data.success) {
                setCourses(response.data.data.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.data.total
                }));
            } else {
                setError('Failed to load courses');
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            const response = await api.post(`/courses/${courseId}/enroll`);

            if (response.data.success) {
                // Refresh courses to update enrollment status
                fetchCourses();
                // You might want to show a success message here
            }
        } catch (err) {
            console.error('Error enrolling in course:', err);
            // You might want to show an error message here
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, current: page }));
    };

    const getDifficultyColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'beginner': return 'green';
            case 'intermediate': return 'orange';
            case 'advanced': return 'red';
            default: return 'blue';
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading courses...</div>
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
            <Title level={2}>All Courses</Title>
            <Text type="secondary">
                Discover and enroll in TNI/POLRI preparation courses
            </Text>

            {/* Search and Filter Section */}
            <div style={{ margin: '24px 0', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Search courses..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={(e) => handleSearch(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Category"
                            style={{ width: '100%' }}
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            <Option value="all">All Categories</Option>
                            <Option value="TNI">TNI</Option>
                            <Option value="POLRI">POLRI</Option>
                            <Option value="CPNS">CPNS</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => handleSearch(searchText)}
                            style={{ width: '100%' }}
                        >
                            Search
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Courses Grid */}
            <Row gutter={[24, 24]}>
                {courses.map((course) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={course.id}>
                        <Card
                            hoverable
                            cover={
                                <div style={{
                                    height: 200,
                                    background: `linear-gradient(135deg, ${course.metadata?.color || '#1890ff'}, ${course.metadata?.color || '#40a9ff'})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '24px'
                                }}>
                                    <BookOutlined />
                                </div>
                            }
                            actions={[
                                <Button
                                    type="primary"
                                    icon={<PlayCircleOutlined />}
                                    onClick={() => handleEnroll(course.id)}
                                    size="small"
                                >
                                    Enroll
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
                                            <Tag color={getDifficultyColor(course.difficulty)}>
                                                {course.difficulty || 'Beginner'}
                                            </Tag>
                                            <Tag color="blue">{course.category}</Tag>
                                        </div>
                                    </div>
                                }
                                description={
                                    <div>
                                        <Paragraph
                                            ellipsis={{ rows: 2 }}
                                            style={{ marginBottom: '12px', color: '#666' }}
                                        >
                                            {course.description}
                                        </Paragraph>

                                        <Space size="middle">
                                            <Space size="small">
                                                <BookOutlined style={{ color: '#666' }} />
                                                <Text type="secondary">{course.modules_count} modules</Text>
                                            </Space>
                                            <Space size="small">
                                                <ClockCircleOutlined style={{ color: '#666' }} />
                                                <Text type="secondary">{course.tests_count} tests</Text>
                                            </Space>
                                            <Space size="small">
                                                <UserOutlined style={{ color: '#666' }} />
                                                <Text type="secondary">{course.students_count} students</Text>
                                            </Space>
                                        </Space>

                                        {course.price > 0 && (
                                            <div style={{ marginTop: '12px' }}>
                                                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                                                    Rp {course.price.toLocaleString('id-ID')}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* No courses found */}
            {courses.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <BookOutlined style={{ fontSize: '64px', color: '#ccc' }} />
                    <Title level={4} style={{ color: '#999', marginTop: '16px' }}>
                        No courses found
                    </Title>
                    <Text type="secondary">
                        Try adjusting your search criteria or check back later for new courses.
                    </Text>
                </div>
            )}

            {/* Pagination */}
            {pagination.total > pagination.pageSize && (
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Pagination
                        current={pagination.current}
                        total={pagination.total}
                        pageSize={pagination.pageSize}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} courses`
                        }
                    />
                </div>
            )}
        </div>
    );
}
