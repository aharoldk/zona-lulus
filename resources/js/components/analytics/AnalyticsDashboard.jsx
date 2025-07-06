import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Statistic,
    Progress,
    Table,
    Tag,
    Space,
    Button,
    Select,
    DatePicker,
    Spin,
    Empty,
    Tooltip,
    Badge,
    Avatar,
    List,
    Divider
} from 'antd';
import {
    TrophyOutlined,
    ClockCircleOutlined,
    BookOutlined,
    FileTextOutlined,
    TrendingUpOutlined,
    CalendarOutlined,
    StarOutlined,
    TargetOutlined,
    FireOutlined,
    LineChartOutlined,
    PieChartOutlined,
    BarChartOutlined,
    RiseOutlined,
    FallOutlined
} from '@ant-design/icons';
import api from '../../utils/axios';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState('30d');
    const [analyticsData, setAnalyticsData] = useState({});

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeFrame]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            // Simulate API call - replace with actual endpoint
            const mockData = generateMockAnalyticsData();
            setAnalyticsData(mockData);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateMockAnalyticsData = () => {
        return {
            overview: {
                totalStudyTime: 145,
                testsCompleted: 23,
                averageScore: 82.5,
                currentStreak: 12,
                improvement: 15.2
            },
            performance: {
                weeklyProgress: [
                    { week: 'Week 1', score: 65, time: 8, change: 8.5 },
                    { week: 'Week 2', score: 72, time: 12, change: 10.8 },
                    { week: 'Week 3', score: 78, time: 15, change: 8.3 },
                    { week: 'Week 4', score: 82, time: 18, change: 5.1 }
                ],
                subjectScores: [
                    { subject: 'Matematika', score: 85, improvement: 12, tests: 8 },
                    { subject: 'Bahasa Indonesia', score: 78, improvement: -3, tests: 6 },
                    { subject: 'Pengetahuan Umum', score: 82, improvement: 8, tests: 5 },
                    { subject: 'Bahasa Inggris', score: 76, improvement: 5, tests: 4 }
                ]
            },
            goals: [
                {
                    id: 1,
                    title: 'Skor Matematika > 90',
                    current: 85,
                    target: 90,
                    progress: 94,
                    deadline: '2025-07-15'
                },
                {
                    id: 2,
                    title: 'Belajar 20 jam/minggu',
                    current: 18,
                    target: 20,
                    progress: 90,
                    deadline: '2025-07-10'
                }
            ],
            achievements: [
                {
                    title: 'First Perfect Score',
                    description: 'Achieved 100% on Matematika Dasar',
                    date: '2025-07-01',
                    icon: '🏆',
                    type: 'gold'
                },
                {
                    title: 'Study Streak',
                    description: '7 days continuous learning',
                    date: '2025-06-28',
                    icon: '🔥',
                    type: 'silver'
                }
            ],
            recommendations: [
                {
                    type: 'study',
                    title: 'Focus on Bahasa Indonesia',
                    description: 'Your score decreased by 3%. Try additional practice.',
                    priority: 'high'
                },
                {
                    type: 'schedule',
                    title: 'Increase study time',
                    description: 'Add 2 more hours to reach your weekly goal.',
                    priority: 'medium'
                }
            ]
        };
    };

    const StatCard = ({ title, value, suffix, prefix, change, color = '#1890ff' }) => (
        <Card size="small">
            <Statistic
                title={title}
                value={value}
                suffix={suffix}
                prefix={prefix}
                valueStyle={{ color }}
            />
            {change && (
                <div style={{ marginTop: 8 }}>
                    <Text type={change > 0 ? 'success' : 'danger'} style={{ fontSize: '12px' }}>
                        {change > 0 ? <RiseOutlined /> : <FallOutlined />}
                        {Math.abs(change)}% from last period
                    </Text>
                </div>
            )}
        </Card>
    );

    // Simple progress chart using CSS
    const SimpleChart = ({ data, type = 'line' }) => {
        const maxValue = Math.max(...data.map(d => d.score));

        return (
            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '120px' }}>
                    {data.map((item, index) => (
                        <div key={index} style={{ flex: 1, textAlign: 'center' }}>
                            <div
                                style={{
                                    backgroundColor: '#1890ff',
                                    height: `${(item.score / maxValue) * 100}px`,
                                    borderRadius: '4px 4px 0 0',
                                    marginBottom: '8px',
                                    opacity: 0.8,
                                    transition: 'all 0.3s ease'
                                }}
                            />
                            <Text style={{ fontSize: '10px' }}>{item.week}</Text>
                            <br />
                            <Text strong style={{ fontSize: '12px' }}>{item.score}%</Text>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const SubjectPerformanceTable = () => {
        const columns = [
            {
                title: 'Subject',
                dataIndex: 'subject',
                key: 'subject',
                render: (text) => <Text strong>{text}</Text>
            },
            {
                title: 'Score',
                dataIndex: 'score',
                key: 'score',
                render: (score) => (
                    <div>
                        <Text strong>{score}%</Text>
                        <Progress
                            percent={score}
                            size="small"
                            showInfo={false}
                            strokeColor={score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f'}
                        />
                    </div>
                )
            },
            {
                title: 'Change',
                dataIndex: 'improvement',
                key: 'improvement',
                render: (change) => (
                    <Tag color={change > 0 ? 'green' : change < 0 ? 'red' : 'default'}>
                        {change > 0 ? '+' : ''}{change}%
                    </Tag>
                )
            },
            {
                title: 'Tests',
                dataIndex: 'tests',
                key: 'tests'
            }
        ];

        return (
            <Table
                dataSource={analyticsData.performance?.subjectScores}
                columns={columns}
                pagination={false}
                size="small"
            />
        );
    };

    const GoalCard = ({ goal }) => (
        <Card size="small" style={{ marginBottom: 16 }}>
            <div>
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                    {goal.title}
                </Title>
                <Progress
                    percent={goal.progress}
                    strokeColor={goal.progress >= 90 ? '#52c41a' : '#1890ff'}
                    size="small"
                />
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">
                        {goal.current} / {goal.target}
                    </Text>
                    <Text type="secondary">
                        Due: {goal.deadline}
                    </Text>
                </div>
            </div>
        </Card>
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Title level={2} style={{ margin: 0 }}>
                    <LineChartOutlined style={{ marginRight: 8 }} />
                    Analytics Dashboard
                </Title>
                <Select
                    value={timeFrame}
                    onChange={setTimeFrame}
                    style={{ width: 120 }}
                >
                    <Option value="7d">7 Days</Option>
                    <Option value="30d">30 Days</Option>
                    <Option value="90d">90 Days</Option>
                </Select>
            </div>

            {/* Overview Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={12} md={6}>
                    <StatCard
                        title="Total Study Time"
                        value={analyticsData.overview?.totalStudyTime}
                        suffix="hours"
                        prefix={<ClockCircleOutlined />}
                        change={8.5}
                        color="#1890ff"
                    />
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <StatCard
                        title="Tests Completed"
                        value={analyticsData.overview?.testsCompleted}
                        prefix={<FileTextOutlined />}
                        change={12.3}
                        color="#52c41a"
                    />
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <StatCard
                        title="Average Score"
                        value={analyticsData.overview?.averageScore}
                        suffix="%"
                        prefix={<TrophyOutlined />}
                        change={5.2}
                        color="#faad14"
                    />
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <StatCard
                        title="Current Streak"
                        value={analyticsData.overview?.currentStreak}
                        suffix="days"
                        prefix={<FireOutlined />}
                        change={15.2}
                        color="#722ed1"
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Performance Trends */}
                <Col xs={24} lg={12}>
                    <Card title={<><TrendingUpOutlined /> Weekly Performance</> } size="small">
                        <SimpleChart data={analyticsData.performance?.weeklyProgress || []} />
                    </Card>
                </Col>

                {/* Subject Performance */}
                <Col xs={24} lg={12}>
                    <Card title={<><BarChartOutlined /> Subject Performance</> } size="small">
                        <SubjectPerformanceTable />
                    </Card>
                </Col>

                {/* Goals & Progress */}
                <Col xs={24} lg={12}>
                    <Card title={<><TargetOutlined /> Goals & Progress</> } size="small">
                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                            {analyticsData.goals?.map(goal => (
                                <GoalCard key={goal.id} goal={goal} />
                            ))}
                        </div>
                    </Card>
                </Col>

                {/* AI Recommendations */}
                <Col xs={24} lg={12}>
                    <Card title={<><StarOutlined /> AI Recommendations</> } size="small">
                        <List
                            dataSource={analyticsData.recommendations}
                            renderItem={(rec, index) => (
                                <List.Item key={index}>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                icon={rec.type === 'study' ? <BookOutlined /> : <CalendarOutlined />}
                                                style={{
                                                    backgroundColor: rec.priority === 'high' ? '#ff4d4f' : '#1890ff'
                                                }}
                                            />
                                        }
                                        title={
                                            <div>
                                                {rec.title}
                                                <Tag
                                                    color={rec.priority === 'high' ? 'red' : 'blue'}
                                                    size="small"
                                                    style={{ marginLeft: 8 }}
                                                >
                                                    {rec.priority}
                                                </Tag>
                                            </div>
                                        }
                                        description={rec.description}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
