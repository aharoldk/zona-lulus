import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Empty, Alert, Select, Input, Button, Space, Typography, Tabs } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, TrophyOutlined } from '@ant-design/icons';
import TryoutCard from './TryoutCard';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const TryoutList = () => {
    const [tryouts, setTryouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: 'all',
        difficulty: 'all',
        type: 'all',
        search: ''
    });

    useEffect(() => {
        fetchTryouts();
    }, [filters]);

    const fetchTryouts = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.category !== 'all') params.append('category', filters.category);
            if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
            if (filters.type !== 'all') params.append('type', filters.type);

            const response = await axios.get(`/api/tryouts?${params.toString()}`);

            let filteredTryouts = response.data.tryouts || response.data;

            // Apply search filter on frontend
            if (filters.search) {
                filteredTryouts = filteredTryouts.filter(tryout =>
                    tryout.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                    tryout.description.toLowerCase().includes(filters.search.toLowerCase())
                );
            }

            setTryouts(filteredTryouts);
        } catch (error) {
            setError(error.response?.data?.message || 'Gagal memuat tryout');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchaseSuccess = (tryoutId, paymentId) => {
        // Update the specific tryout's access status
        setTryouts(prevTryouts =>
            prevTryouts.map(tryout =>
                tryout.id === tryoutId
                    ? { ...tryout, isAccessibleBy: true, access_status: 'active' }
                    : tryout
            )
        );
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
    };

    const handleRefresh = () => {
        fetchTryouts();
    };

    const renderTabContent = (filterType) => {
        const filteredTryouts = tryouts.filter(tryout => {
            switch (filterType) {
                case 'free':
                    return tryout.is_free;
                case 'paid':
                    return !tryout.is_free;
                case 'accessible':
                    return tryout.isAccessibleBy;
                case 'locked':
                    return !tryout.is_free && !tryout.isAccessibleBy;
                case 'tni':
                    return tryout.category?.toLowerCase() === 'tni';
                case 'polri':
                    return tryout.category?.toLowerCase() === 'polri';
                case 'kedinasan':
                    return tryout.category?.toLowerCase() === 'kedinasan';
                default:
                    return true;
            }
        });

        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
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
                    action={
                        <Button size="small" onClick={handleRefresh}>
                            Coba Lagi
                        </Button>
                    }
                />
            );
        }

        if (filteredTryouts.length === 0) {
            return (
                <Empty
                    description="Tidak ada tryout ditemukan"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            );
        }

        return (
            <Row gutter={[16, 16]}>
                {filteredTryouts.map(tryout => (
                    <Col xs={24} sm={12} md={8} lg={6} key={tryout.id}>
                        <TryoutCard
                            test={tryout}
                            onPurchaseSuccess={handlePurchaseSuccess}
                        />
                    </Col>
                ))}
            </Row>
        );
    };

    const tabItems = [
        {
            key: 'all',
            label: `Semua (${tryouts.length})`,
            children: renderTabContent('all')
        },
        {
            key: 'free',
            label: `Gratis (${tryouts.filter(t => t.is_free).length})`,
            children: renderTabContent('free')
        },
        {
            key: 'paid',
            label: `Premium (${tryouts.filter(t => !t.is_free).length})`,
            children: renderTabContent('paid')
        },
        {
            key: 'accessible',
            label: `Dapat Diakses (${tryouts.filter(t => t.isAccessibleBy).length})`,
            children: renderTabContent('accessible')
        },
        {
            key: 'tni',
            label: `TNI (${tryouts.filter(t => t.category?.toLowerCase() === 'tni').length})`,
            children: renderTabContent('tni')
        },
        {
            key: 'polri',
            label: `POLRI (${tryouts.filter(t => t.category?.toLowerCase() === 'polri').length})`,
            children: renderTabContent('polri')
        },
        {
            key: 'kedinasan',
            label: `Kedinasan (${tryouts.filter(t => t.category?.toLowerCase() === 'kedinasan').length})`,
            children: renderTabContent('kedinasan')
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2}>
                    <TrophyOutlined style={{ marginRight: 8 }} />
                    Tryout Online
                </Title>

                {/* Filters */}
                <Space size="middle" style={{ marginBottom: 16 }} wrap>
                    <Search
                        placeholder="Cari tryout..."
                        allowClear
                        style={{ width: 250 }}
                        onSearch={handleSearch}
                        prefix={<SearchOutlined />}
                    />

                    <Select
                        placeholder="Kategori"
                        style={{ width: 150 }}
                        value={filters.category}
                        onChange={(value) => handleFilterChange('category', value)}
                    >
                        <Option value="all">Semua Kategori</Option>
                        <Option value="TNI">TNI</Option>
                        <Option value="POLRI">POLRI</Option>
                        <Option value="KEDINASAN">Kedinasan</Option>
                    </Select>

                    <Select
                        placeholder="Tingkat Kesulitan"
                        style={{ width: 150 }}
                        value={filters.difficulty}
                        onChange={(value) => handleFilterChange('difficulty', value)}
                    >
                        <Option value="all">Semua Level</Option>
                        <Option value="easy">Mudah</Option>
                        <Option value="medium">Sedang</Option>
                        <Option value="hard">Sulit</Option>
                    </Select>

                    <Select
                        placeholder="Tipe Tryout"
                        style={{ width: 150 }}
                        value={filters.type}
                        onChange={(value) => handleFilterChange('type', value)}
                    >
                        <Option value="all">Semua Tipe</Option>
                        <Option value="practice">Latihan</Option>
                        <Option value="simulation">Simulasi</Option>
                        <Option value="mock_test">Mock Test</Option>
                    </Select>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            <Tabs
                defaultActiveKey="all"
                items={tabItems}
                size="large"
            />
        </div>
    );
};

export default TryoutList;
