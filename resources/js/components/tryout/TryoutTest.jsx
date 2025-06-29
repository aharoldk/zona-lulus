import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Radio,
    Typography,
    Progress,
    Space,
    Alert,
    Modal,
    Row,
    Col,
    Tag,
    Divider,
    message,
    Spin
} from 'antd';
import {
    ClockCircleOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import api from '../../utils/axios';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

export default function TryoutTest({ tryoutData, onBack, onFinish }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(tryoutData?.duration * 60 || 7200);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch questions from database
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                console.log('TryoutTest received tryoutData:', tryoutData); // Debug log
                console.log('Tryout ID:', tryoutData?.id); // Debug log

                const response = await api.get(`/questions/${tryoutData?.id}`);

                if (response.data.success) {
                    setQuestions(response.data.data);
                } else {
                    setError('Failed to load questions');
                }
            } catch (err) {
                console.error('Error fetching questions:', err);
                setError('Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };

        if (tryoutData?.id) {
            fetchQuestions();
        } else {
            console.error('No tryout ID found. TryoutData:', tryoutData); // Debug log
            setError('Invalid tryout data - missing ID');
            setLoading(false);
        }
    }, [tryoutData?.id]);

    // Timer countdown
    useEffect(() => {
        if (questions.length === 0) return; // Don't start timer until questions are loaded

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [questions]);

    // Format time display
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle answer selection
    const handleAnswerChange = (value) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: value
        }));
    };

    // Navigate between questions
    const goToQuestion = (index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestion(index);
        }
    };

    // Handle time up
    const handleTimeUp = () => {
        message.warning('Waktu habis! Tryout akan otomatis diselesaikan.');
        handleSubmit();
    };

    // Handle submit tryout
    const handleSubmit = () => {
        setIsSubmitting(true);

        // Calculate score
        let correct = 0;
        questions.forEach((question, index) => {
            if (answers[index] === question.correct_answer) {
                correct++;
            }
        });

        const score = Math.round((correct / questions.length) * 100);

        setTimeout(() => {
            setIsSubmitting(false);
            onFinish({
                score,
                totalQuestions: questions.length,
                answeredQuestions: Object.keys(answers).length,
                correctAnswers: correct,
                timeUsed: (tryoutData?.duration * 60) - timeLeft,
                answers
            });
        }, 2000);
    };

    // Confirm submit
    const confirmSubmit = () => {
        const unansweredCount = questions.length - Object.keys(answers).length;

        confirm({
            title: 'Selesaikan Tryout',
            content: unansweredCount > 0
                ? `Anda masih memiliki ${unansweredCount} soal yang belum dijawab. Yakin ingin menyelesaikan tryout?`
                : 'Yakin ingin menyelesaikan tryout ini?',
            onOk: handleSubmit,
            okText: 'Ya, Selesaikan',
            cancelText: 'Batal'
        });
    };

    // Handle back confirmation
    const handleBack = () => {
        confirm({
            title: 'Keluar dari Tryout',
            content: 'Jika Anda keluar sekarang, progress akan hilang. Yakin ingin keluar?',
            onOk: onBack,
            okText: 'Ya, Keluar',
            cancelText: 'Lanjut Tryout'
        });
    };

    // Show loading spinner while fetching questions
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <Spin size="large" />
                <Text style={{ marginLeft: '16px' }}>Memuat soal...</Text>
            </div>
        );
    }

    // Show error if failed to load questions
    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
                <Button type="primary" onClick={onBack}>
                    Kembali
                </Button>
            </div>
        );
    }

    // Show message if no questions found
    if (questions.length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <Alert
                    message="Tidak Ada Soal"
                    description="Belum ada soal tersedia untuk tryout ini."
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
                <Button type="primary" onClick={onBack}>
                    Kembali
                </Button>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / questions.length) * 100;
    const isLastQuestion = currentQuestion === questions.length - 1;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <Card style={{ marginBottom: '16px' }}>
                <Row justify="space-between" align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Space>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBack}
                                type="text"
                            >
                                Kembali
                            </Button>
                            <Title level={4} style={{ margin: 0 }}>
                                {tryoutData?.title || 'Tryout TNI'}
                            </Title>
                        </Space>
                    </Col>
                    <Col xs={24} sm={12} md={8} style={{ textAlign: 'center' }}>
                        <Space direction="vertical" size="small">
                            <Text strong>Waktu Tersisa</Text>
                            <Tag
                                color={timeLeft < 600 ? 'red' : timeLeft < 1800 ? 'orange' : 'blue'}
                                style={{ fontSize: '16px', padding: '4px 12px' }}
                            >
                                <ClockCircleOutlined /> {formatTime(timeLeft)}
                            </Tag>
                        </Space>
                    </Col>
                    <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
                        <Space direction="vertical" size="small">
                            <Text>Progress: {answeredCount}/{questions.length}</Text>
                            <Progress
                                percent={progressPercent}
                                size="small"
                                style={{ width: '150px' }}
                            />
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={16}>
                {/* Question Panel */}
                <Col xs={24} lg={18}>
                    <Card
                        title={
                            <Space>
                                <Text strong>Soal {currentQuestion + 1}</Text>
                                <Tag color="blue">{currentQ?.category}</Tag>
                            </Space>
                        }
                        style={{ minHeight: '400px' }}
                    >
                        <div style={{ marginBottom: '24px' }}>
                            <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                                {currentQ?.question}
                            </Paragraph>
                        </div>

                        <Radio.Group
                            value={answers[currentQuestion]}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                {currentQ?.options?.map(option => (
                                    <Radio
                                        key={option.key}
                                        value={option.key}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            padding: '12px',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '8px',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        <div style={{ marginLeft: '8px' }}>
                                            <strong>{option.key}.</strong> {option.text}
                                        </div>
                                    </Radio>
                                ))}
                            </Space>
                        </Radio.Group>

                        <Divider />

                        {/* Navigation Buttons */}
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Button
                                    disabled={currentQuestion === 0}
                                    onClick={() => goToQuestion(currentQuestion - 1)}
                                    icon={<ArrowLeftOutlined />}
                                >
                                    Sebelumnya
                                </Button>
                            </Col>
                            <Col>
                                <Space>
                                    <Text>Soal {currentQuestion + 1} dari {questions.length}</Text>
                                </Space>
                            </Col>
                            <Col>
                                {isLastQuestion ? (
                                    <Button
                                        type="primary"
                                        onClick={confirmSubmit}
                                        loading={isSubmitting}
                                        size="large"
                                    >
                                        Selesaikan Tryout
                                    </Button>
                                ) : (
                                    <Button
                                        type="primary"
                                        onClick={() => goToQuestion(currentQuestion + 1)}
                                        icon={<ArrowRightOutlined />}
                                    >
                                        Selanjutnya
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Question Navigation Panel */}
                <Col xs={24} lg={6}>
                    <Card title="Navigasi Soal" size="small">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '8px',
                            marginBottom: '16px'
                        }}>
                            {questions.map((_, index) => {
                                const isAnswered = answers[index] !== undefined;
                                const isCurrent = index === currentQuestion;

                                let backgroundColor, borderColor, textColor;

                                if (isCurrent) {
                                    backgroundColor = '#1890ff';
                                    borderColor = '#1890ff';
                                    textColor = '#fff';
                                } else if (isAnswered) {
                                    backgroundColor = '#52c41a';
                                    borderColor = '#52c41a';
                                    textColor = '#fff';
                                } else {
                                    backgroundColor = '#f5f5f5';
                                    borderColor = '#d9d9d9';
                                    textColor = '#000';
                                }

                                return (
                                    <Button
                                        key={index}
                                        size="small"
                                        onClick={() => goToQuestion(index)}
                                        style={{
                                            backgroundColor,
                                            borderColor,
                                            color: textColor,
                                            fontWeight: isCurrent ? 'bold' : 'normal'
                                        }}
                                    >
                                        {index + 1}
                                    </Button>
                                );
                            })}
                        </div>

                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', backgroundColor: '#52c41a', borderRadius: '2px' }}></div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>Terjawab</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', backgroundColor: '#1890ff', borderRadius: '2px' }}></div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>Saat ini</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', backgroundColor: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: '2px' }}></div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>Belum dijawab</Text>
                            </div>
                        </Space>

                        <Divider />

                        <Button
                            type="primary"
                            danger
                            block
                            onClick={confirmSubmit}
                            loading={isSubmitting}
                        >
                            Selesaikan Tryout
                        </Button>
                    </Card>

                    {/* Quick Stats */}
                    <Card title="Statistik" size="small" style={{ marginTop: '16px' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary">Terjawab:</Text>
                                <Text strong>{answeredCount}/{questions.length}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary">Waktu tersisa:</Text>
                                <Text strong>{formatTime(timeLeft)}</Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
