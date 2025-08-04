import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Card,
    Button,
    Typography,
    Row,
    Col,
    Statistic,
    Progress,
    List,
    Tag,
    Space,
    Divider,
    Alert
} from 'antd';
import {
    TrophyOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    HomeOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import api from '../../utils/axios';

const { Title, Text, Paragraph } = Typography;

export default function TryoutResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get data from navigation state
    const resultData = location.state?.resultData;
    console.log('resultData:', resultData); // Debug log to check data
    const tryoutData = resultData?.tryoutData;

    // Safely destructure with default values to prevent undefined errors
    const {
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        time_taken: timeUsed,
        answers = [],
        wrong_answers: wrongAnswers
    } = resultData || {};

    // Calculate derived values
    const answeredQuestions = totalQuestions - (wrongAnswers || 0);
    const unansweredQuestions = totalQuestions - answeredQuestions;

    // Redirect if no result data
    useEffect(() => {
        if (!resultData) {
            console.log('No resultData found, redirecting to /tryouts');
            navigate('/tryouts');
        }
    }, [resultData, navigate]);

    // Fetch questions to calculate category breakdown
    useEffect(() => {
        const fetchQuestionsForAnalysis = async () => {
            try {
                setLoading(true);
                const response = await api.get('/questions/1');

                if (response.data.success) {
                    const questionsData = response.data.data;
                    setQuestions(questionsData);
                    calculateCategoryBreakdown(questionsData, answers);
                }
            } catch (err) {
                console.error('Error fetching questions for analysis:', err);
            } finally {
                setLoading(false);
            }
        };

        if (answers && Object.keys(answers).length > 0) {
            fetchQuestionsForAnalysis();
        } else {
            setLoading(false);
        }
    }, [answers]);

    // Calculate category breakdown based on actual results
    const calculateCategoryBreakdown = (questionsData, userAnswers) => {
        const categoryStats = {};

        // Initialize category stats
        questionsData.forEach((question, index) => {
            const category = question.category;
            if (!categoryStats[category]) {
                categoryStats[category] = {
                    category,
                    total: 0,
                    correct: 0,
                    answered: 0
                };
            }
            categoryStats[category].total++;

            // Check if question was answered
            if (userAnswers[index] !== undefined) {
                categoryStats[category].answered++;

                // Check if answer is correct
                if (userAnswers[index] === question.correct_answer) {
                    categoryStats[category].correct++;
                }
            }
        });

        // Convert to array and calculate percentages
        const breakdown = Object.values(categoryStats).map(cat => ({
            ...cat,
            percentage: cat.answered > 0 ? Math.round((cat.correct / cat.answered) * 100) : 0,
            accuracyRate: cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0
        })).sort((a, b) => b.total - a.total); // Sort by total questions (most questions first)

        setCategoryBreakdown(breakdown);
    };

    // Format time used
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return hours > 0
            ? `${hours}j ${minutes}m ${secs}s`
            : `${minutes}m ${secs}s`;
    };

    // Get performance level
    const getPerformanceLevel = (score) => {
        if (score >= 90) return { level: 'Luar Biasa', color: 'gold', icon: '🏆' };
        if (score >= 80) return { level: 'Sangat Baik', color: 'green', icon: '🎯' };
        if (score >= 70) return { level: 'Baik', color: 'blue', icon: '👍' };
        if (score >= 60) return { level: 'Cukup', color: 'orange', icon: '📈' };
        return { level: 'Perlu Ditingkatkan', color: 'red', icon: '💪' };
    };

    // Get performance message
    const getPerformanceMessage = (score) => {
        if (score >= 80) return "Selamat! Anda telah mencapai skor yang sangat baik!";
        if (score >= 70) return "Bagus! Anda telah mencapai skor yang baik!";
        if (score >= 60) return "Cukup baik, terus tingkatkan lagi!";
        return "Jangan menyerah, terus berlatih untuk hasil yang lebih baik!";
    };

    // Get recommendations based on category performance
    const getRecommendations = () => {
        if (categoryBreakdown.length === 0) return [];

        const weakCategories = categoryBreakdown
            .filter(cat => cat.percentage < 70)
            .sort((a, b) => a.percentage - b.percentage);

        return weakCategories.map(cat => ({
            category: cat.category,
            percentage: cat.percentage,
            recommendation: getRecommendationText(cat.category, cat.percentage)
        }));
    };

    const getRecommendationText = (category, percentage) => {
        const baseText = {
            'Matematika': 'Perbanyak latihan soal hitung-hitungan, aljabar, dan geometri',
            'Bahasa Indonesia': 'Tingkatkan pemahaman tata bahasa, sinonim, antonim, dan kata baku',
            'Sejarah': 'Pelajari kembali sejarah Indonesia, terutama masa kemerdekaan dan pahlawan nasional',
            'Pengetahuan Umum': 'Perbanyak membaca berita terkini dan pengetahuan umum tentang Indonesia dan dunia'
        };

        return baseText[category] || 'Perbanyak latihan soal dan pemahaman materi';
    };

    const performance = getPerformanceLevel(score);
    const recommendations = getRecommendations();

    // Action handlers
    const handleRetake = () => {
        navigate('/tryouts');
    };

    const handleBackToList = () => {
        navigate('/tryouts');
    };

    const handleViewDiscussion = () => {
        // TODO: Navigate to discussion page
        console.log('View discussion for tryout:', tryoutData?.id);
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header with Score */}
            <Card style={{ marginBottom: '24px', textAlign: 'center' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={2} style={{ color: performance.color, margin: 0 }}>
                            {performance.icon} Tryout Selesai!
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            {tryoutData?.title || 'Tryout TNI'}
                        </Text>
                    </div>

                    <div>
                        <div style={{ fontSize: '64px', fontWeight: 'bold', color: performance.color }}>
                            {score}
                        </div>
                        <Text type="secondary" style={{ fontSize: '18px' }}>
                            Skor Anda
                        </Text>
                    </div>

                    <Tag color={performance.color} style={{ fontSize: '16px', padding: '8px 16px' }}>
                        {performance.level}
                    </Tag>

                    <Alert
                        message={getPerformanceMessage(score)}
                        type={score >= 70 ? 'success' : score >= 60 ? 'warning' : 'info'}
                        showIcon
                        style={{ marginTop: '16px' }}
                    />
                </Space>
            </Card>

            <Row gutter={[16, 16]}>
                {/* Statistics */}
                <Col xs={24} lg={12}>
                    <Card title="Statistik Detail" style={{ height: '100%' }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={12} sm={12}>
                                <Statistic
                                    title="Jawaban Benar"
                                    value={correctAnswers}
                                    suffix={`/ ${totalQuestions}`}
                                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                            <Col xs={12} sm={12}>
                                <Statistic
                                    title="Jawaban Salah"
                                    value={wrongAnswers}
                                    prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Col>
                            <Col xs={12} sm={12}>
                                <Statistic
                                    title="Tidak Dijawab"
                                    value={unansweredQuestions}
                                    prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Col>
                            <Col xs={12} sm={12}>
                                <Statistic
                                    title="Waktu Digunakan"
                                    value={formatTime(timeUsed)}
                                    prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                                />
                            </Col>
                        </Row>

                        <Divider />

                        <div>
                            <Text strong style={{ marginBottom: '8px', display: 'block' }}>
                                Progress Pengerjaan
                            </Text>
                            <Progress
                                percent={(answeredQuestions / totalQuestions) * 100}
                                strokeColor={{
                                    '0%': '#108ee9',
                                    '100%': '#87d068',
                                }}
                                format={() => `${answeredQuestions}/${totalQuestions}`}
                            />
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            <Text strong style={{ marginBottom: '8px', display: 'block' }}>
                                Akurasi Jawaban
                            </Text>
                            <Progress
                                percent={answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0}
                                strokeColor={{
                                    '0%': '#ff4d4f',
                                    '50%': '#faad14',
                                    '100%': '#52c41a',
                                }}
                                format={(percent) => `${Math.round(percent || 0)}%`}
                            />
                        </div>
                    </Card>
                </Col>

                {/* Category Breakdown */}
                <Col xs={24} lg={12}>
                    <Card title="Analisis per Kategori" style={{ height: '100%' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Text>Menganalisis hasil...</Text>
                            </div>
                        ) : categoryBreakdown.length > 0 ? (
                            <List
                                dataSource={categoryBreakdown}
                                renderItem={(item) => (
                                    <List.Item>
                                        <div style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <Text strong>{item.category}</Text>
                                                <Text>{item.correct}/{item.total}</Text>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Dijawab: {item.answered}/{item.total}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Akurasi: {item.percentage}%
                                                </Text>
                                            </div>
                                            <Progress
                                                percent={item.percentage}
                                                size="small"
                                                strokeColor={
                                                    item.percentage >= 80 ? '#52c41a' :
                                                    item.percentage >= 60 ? '#faad14' : '#ff4d4f'
                                                }
                                            />
                                        </div>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Text type="secondary">Tidak ada data untuk dianalisis</Text>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <Card title="Rekomendasi Belajar" style={{ marginTop: '24px' }}>
                    <Alert
                        message="Area yang Perlu Diperbaiki"
                        description={
                            <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                                {recommendations.map((rec, index) => (
                                    <li key={index}>
                                        <strong>{rec.category}</strong> ({rec.percentage}% benar): {rec.recommendation}
                                    </li>
                                ))}
                            </ul>
                        }
                        type="warning"
                        showIcon
                        style={{ marginBottom: '16px' }}
                    />

                    <Paragraph>
                        <Text strong>Saran umum untuk meningkatkan performa:</Text>
                    </Paragraph>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>Fokus pada kategori dengan skor rendah terlebih dahulu</li>
                        <li>Latihan soal secara rutin untuk meningkatkan kecepatan dan akurasi</li>
                        <li>Manajemen waktu yang lebih baik saat mengerjakan soal</li>
                        <li>Ulangi tryout ini setelah mempelajari materi yang masih lemah</li>
                    </ul>
                </Card>
            )}

            {/* Action Buttons */}
            <Card style={{ marginTop: '24px' }}>
                <Row gutter={[16, 16]} justify="center">
                    <Col xs={24} sm={12} md={6}>
                        <Button
                            type="primary"
                            icon={<FileTextOutlined />}
                            block
                            size="large"
                            onClick={handleViewDiscussion}
                        >
                            Lihat Pembahasan
                        </Button>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Button
                            icon={<ReloadOutlined />}
                            block
                            size="large"
                            onClick={handleRetake}
                        >
                            Ulangi Tryout
                        </Button>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Button
                            icon={<TrophyOutlined />}
                            block
                            size="large"
                        >
                            Lihat Ranking
                        </Button>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Button
                            icon={<HomeOutlined />}
                            block
                            size="large"
                            onClick={handleBackToList}
                        >
                            Kembali ke Daftar
                        </Button>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
