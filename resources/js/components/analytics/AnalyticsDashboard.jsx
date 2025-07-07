import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Typography,
    Select,
    DatePicker,
    Spin,
    Empty,
    Statistic,
    Progress,
    Tag,
} from 'antd';
import {
    UserOutlined,
    BookOutlined,
    CheckCircleOutlined,
    FieldTimeOutlined,
    LineChartOutlined,
    AimOutlined,
} from '@ant-design/icons';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../utils/axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState({
        date_range: [null, null],
        target: 'all',
    });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/analytics', { params: filters });
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
        }
        setLoading(false);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'block', marginTop: 50 }} />;
    }

    if (!data) {
        return <Empty description="Tidak ada data untuk ditampilkan" />;
    }

    const { kpi, performance_over_time, tryout_comparison, category_performance } = data;

    const performanceChartData = {
        labels: performance_over_time.map(d => d.date),
        datasets: [
            {
                type: 'line',
                label: 'Waktu Belajar (jam)',
                data: performance_over_time.map(d => d.study_time),
                borderColor: '#82ca9d',
                backgroundColor: '#82ca9d',
                yAxisID: 'y1',
            },
            {
                type: 'bar',
                label: 'Rata-rata Skor',
                data: performance_over_time.map(d => d.score),
                backgroundColor: '#8884d8',
                yAxisID: 'y',
            },
        ],
    };

    const tryoutComparisonData = {
        labels: tryout_comparison.map(t => t.name),
        datasets: [
            {
                label: 'Skor Anda',
                data: tryout_comparison.map(t => t.user_score),
                backgroundColor: '#8884d8',
            },
            {
                label: 'Rata-rata',
                data: tryout_comparison.map(t => t.average_score),
                backgroundColor: '#82ca9d',
            },
        ],
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>Dashboard Analitik</Title>

            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col>
                    <RangePicker onChange={(dates) => handleFilterChange('date_range', dates)} />
                </Col>
                <Col>
                    <Select
                        defaultValue="all"
                        style={{ width: 200 }}
                        onChange={(value) => handleFilterChange('target', value)}
                    >
                        <Option value="all">Semua Target</Option>
                        <Option value="tni">TNI</Option>
                        <Option value="polri">POLRI</Option>
                        <Option value="cpns">CPNS</Option>
                        <Option value="bumn">BUMN</Option>
                    </Select>
                </Col>
            </Row>

            {/* KPIs */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Pengguna"
                            value={kpi.total_users}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Tryout Dikerjakan"
                            value={kpi.total_tryouts_completed}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Rata-rata Waktu Belajar (jam)"
                            value={kpi.avg_study_time}
                            precision={2}
                            prefix={<FieldTimeOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tingkat Kelulusan Tryout"
                            value={kpi.tryout_pass_rate}
                            precision={2}
                            suffix="%"
                            prefix={<AimOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Performa dari Waktu ke Waktu">
                        <Line data={performanceChartData} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Perbandingan Skor Tryout">
                        <Bar data={tryoutComparisonData} />
                    </Card>
                </Col>
                <Col xs={24}>
                    <Card title="Performa per Kategori">
                        <Row gutter={[16, 16]}>
                            {category_performance.map(cat => (
                                <Col xs={24} sm={12} md={8} key={cat.name}>
                                    <Text strong>{cat.name}</Text>
                                    <Progress percent={cat.score} />
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
