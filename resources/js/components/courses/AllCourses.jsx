import React, { useState } from 'react';
import { Card, Row, Col, Input, Select, Button, Tag, Avatar, Rate, Typography, Space, Pagination } from 'antd';
import { SearchOutlined, BookOutlined, PlayCircleOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function AllCourses() {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const courses = [
        {
            id: 1,
            title: 'Persiapan TNI - Akademi Militer',
            description: 'Program lengkap untuk persiapan masuk TNI Akademi Militer dengan materi terlengkap.',
            instructor: 'Mayor Budi Santoso',
            rating: 4.8,
            students: 1250,
            duration: '6 bulan',
            level: 'Menengah',
            price: 'Rp 750.000',
            image: '/course-tni.jpg',
            category: 'TNI',
            modules: 24,
            tests: 12
        },
        {
            id: 2,
            title: 'Persiapan POLRI - Akademi Kepolisian',
            description: 'Kursus komprehensif untuk persiapan masuk POLRI dengan simulasi tes terlengkap.',
            instructor: 'Komisaris Andi Wijaya',
            rating: 4.9,
            students: 980,
            duration: '5 bulan',
            level: 'Menengah',
            price: 'Rp 650.000',
            image: '/course-polri.jpg',
            category: 'POLRI',
            modules: 20,
            tests: 10
        },
        {
            id: 3,
            title: 'CPNS 2024 - Seleksi Kompetensi Dasar',
            description: 'Persiapan lengkap untuk tes CPNS dengan fokus pada SKD dan materi terkini.',
            instructor: 'Dr. Sari Melati',
            rating: 4.7,
            students: 2100,
            duration: '4 bulan',
            level: 'Pemula',
            price: 'Rp 500.000',
            image: '/course-cpns.jpg',
            category: 'CPNS',
            modules: 18,
            tests: 15
        },
        {
            id: 4,
            title: 'BUMN - Tes Potensi Akademik',
            description: 'Program khusus untuk persiapan tes masuk BUMN dengan materi TPA terlengkap.',
            instructor: 'Prof. Joko Susilo',
            rating: 4.6,
            students: 750,
            duration: '3 bulan',
            level: 'Menengah',
            price: 'Rp 450.000',
            image: '/course-bumn.jpg',
            category: 'BUMN',
            modules: 15,
            tests: 8
        }
    ];

    const categories = [
        { value: 'all', label: 'Semua Kategori' },
        { value: 'TNI', label: 'TNI' },
        { value: 'POLRI', label: 'POLRI' },
        { value: 'CPNS', label: 'CPNS' },
        { value: 'BUMN', label: 'BUMN' }
    ];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchText.toLowerCase()) ||
                            course.description.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            <Title level={2}>Semua Kursus</Title>
            <Paragraph type="secondary">
                Temukan kursus terbaik untuk persiapan seleksi TNI, POLRI, CPNS, dan BUMN
            </Paragraph>

            {/* Search and Filter */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={12}>
                        <Input
                            placeholder="Cari kursus..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            size="large"
                        />
                    </Col>
                    <Col xs={24} md={8}>
                        <Select
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            style={{ width: '100%' }}
                            size="large"
                        >
                            {categories.map(cat => (
                                <Option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} md={4}>
                        <Button type="primary" size="large" block>
                            Filter
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Courses Grid */}
            <Row gutter={[16, 16]}>
                {filteredCourses.map(course => (
                    <Col xs={24} md={12} lg={8} key={course.id}>
                        <Card
                            hoverable
                            cover={
                                <div style={{
                                    height: '200px',
                                    background: 'linear-gradient(45deg, #1890ff, #722ed1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <BookOutlined style={{ fontSize: '48px', color: 'white' }} />
                                </div>
                            }
                            actions={[
                                <Button type="primary" block>
                                    Lihat Detail
                                </Button>
                            ]}
                        >
                            <Card.Meta
                                title={course.title}
                                description={
                                    <div>
                                        <Paragraph ellipsis={{ rows: 2 }}>
                                            {course.description}
                                        </Paragraph>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar size="small" icon={<UserOutlined />} />
                                                <Text style={{ marginLeft: '8px' }}>{course.instructor}</Text>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Rate disabled defaultValue={course.rating} />
                                                <Text type="secondary">({course.students} siswa)</Text>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Tag color="blue">{course.level}</Tag>
                                                <Text strong style={{ color: '#1890ff' }}>{course.price}</Text>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Space>
                                                    <BookOutlined />
                                                    <Text type="secondary">{course.modules} modul</Text>
                                                </Space>
                                                <Space>
                                                    <ClockCircleOutlined />
                                                    <Text type="secondary">{course.duration}</Text>
                                                </Space>
                                            </div>
                                        </Space>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Pagination */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Pagination
                    defaultCurrent={1}
                    total={filteredCourses.length}
                    pageSize={6}
                    showSizeChanger={false}
                    showQuickJumper
                />
            </div>
        </div>
    );
}
