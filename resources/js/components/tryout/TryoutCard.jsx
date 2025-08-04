import React, { useState } from 'react';
import { Card, Button, Tag, Badge, Typography, Space, Modal, message, Tooltip } from 'antd';
import {
    LockOutlined,
    CreditCardOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    TrophyOutlined,
    UserOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { ROUTES, getRoute } from '../../constants/routes';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const TryoutCard = ({ test, onPurchaseSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const navigate = useNavigate();

    const getStatusColor = (status) => {
        switch (status) {
            case 'free': return 'green';
            case 'active': return 'blue';
            case 'expired': return 'orange';
            case 'not_purchased': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'free': return 'Gratis';
            case 'active': return 'Aktif';
            case 'expired': return 'Expired';
            case 'not_purchased': return 'Belum Dibeli';
            default: return status;
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'green';
            case 'medium': return 'orange';
            case 'hard': return 'red';
            default: return 'blue';
        }
    };

    const handlePurchase = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/api/tests/${test.id}/purchase`);
            const { snap_token, payment_id } = response.data;

            // Load Midtrans Snap
            window.snap.pay(snap_token, {
                onSuccess: function(result) {
                    message.success('Pembayaran berhasil! Akses tryout telah diaktifkan.');
                    setShowPaymentModal(false);
                    if (onPurchaseSuccess) {
                        onPurchaseSuccess(test.id, payment_id);
                    }
                },
                onPending: function(result) {
                    message.info('Pembayaran sedang diproses. Silakan tunggu konfirmasi.');
                    setShowPaymentModal(false);
                },
                onError: function(result) {
                    message.error('Pembayaran gagal. Silakan coba lagi.');
                },
                onClose: function() {
                    message.warning('Pembayaran dibatalkan.');
                }
            });
        } catch (error) {
            message.error(error.response?.data?.message || 'Gagal memproses pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}j ${mins}m`;
        }
        return `${mins} menit`;
    };

    const handleStartTryout = (test) => {
        navigate(ROUTES.TRYOUT_START, { state: { tryoutData: test } });
    };

    const renderActionButton = (test) => {
        if (test.isAccessibleBy) {
            return (
                <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleStartTryout(test)}
                    block
                >
                    Mulai Tryout
                </Button>
            );
        }

        return (
            <Button
                type="primary"
                icon={<CreditCardOutlined />}
                onClick={() => setShowPaymentModal(true)}
                block
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
                Beli Sekarang - {formatPrice(test.price)}
            </Button>
        );
    };

    const isRegistrationOpen = () => {
        if (!test.registration_deadline) return true;
        return dayjs().isBefore(dayjs(test.registration_deadline));
    };

    return (
        <>
            <Card
                hoverable
                style={{
                    marginBottom: 16,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                bodyStyle={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}
                cover={
                    <div style={{
                        height: 200,
                        background: `linear-gradient(135deg, #1890ff 0%, #0050b3 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        color: 'white'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <TrophyOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                            <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                                {test.category || 'Tryout'}
                            </div>
                        </div>

                        {!test.isAccessibleBy && !test.is_free && (
                            <LockOutlined style={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                fontSize: 24,
                                opacity: 0.8
                            }} />
                        )}

                        <div style={{
                            position: 'absolute',
                            top: 12,
                            right: 12
                        }}>
                            <Tag color={getStatusColor(test.access_status)}>
                                {getStatusText(test.access_status)}
                            </Tag>
                        </div>

                        {!test.is_free && (
                            <div style={{
                                position: 'absolute',
                                bottom: 12,
                                right: 12
                            }}>
                                <Badge.Ribbon text="Premium" color="gold" />
                            </div>
                        )}
                    </div>
                }
                actions={[renderActionButton(test)]}
            >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Meta
                        title={
                            <div style={{ marginBottom: 8 }}>
                                <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                                    {test.title}
                                </Title>
                                {!test.is_free && (
                                    <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                                        {formatPrice(test.price)}
                                    </Text>
                                )}
                            </div>
                        }
                        description={
                            <div style={{ flex: 1 }}>
                                <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
                                    {test.description}
                                </Paragraph>

                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Space size="small" wrap>
                                        {test.difficulty && (
                                            <Tag color={getDifficultyColor(test.difficulty)}>
                                                {test.difficulty}
                                            </Tag>
                                        )}
                                        {test.time_limit && (
                                            <Tag icon={<ClockCircleOutlined />} color="blue">
                                                {formatDuration(test.time_limit)}
                                            </Tag>
                                        )}
                                        {test.questions_count && (
                                            <Tag icon={<QuestionCircleOutlined />} color="purple">
                                                {test.questions_count} soal
                                            </Tag>
                                        )}
                                    </Space>

                                    {test.attempts_allowed > 0 && (
                                        <Tag color="orange">
                                            Maksimal {test.attempts_allowed} percobaan
                                        </Tag>
                                    )}

                                    {test.participants_count > 0 && (
                                        <Tag icon={<UserOutlined />} color="blue">
                                            {test.participants_count} peserta
                                        </Tag>
                                    )}

                                    {test.exam_date && (
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                Jadwal: {dayjs(test.exam_date).format('DD MMM YYYY HH:mm')}
                                            </Text>
                                        </div>
                                    )}

                                    {test.registration_deadline && !isRegistrationOpen() && (
                                        <Tag color="red">Pendaftaran Ditutup</Tag>
                                    )}
                                </Space>
                            </div>
                        }
                    />
                </div>
            </Card>

            <Modal
                title="Konfirmasi Pembelian Tryout"
                open={showPaymentModal}
                onCancel={() => setShowPaymentModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowPaymentModal(false)}>
                        Batal
                    </Button>,
                    <Button
                        key="purchase"
                        type="primary"
                        loading={loading}
                        onClick={handlePurchase}
                        disabled={!isRegistrationOpen()}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        Bayar {formatPrice(test.price)}
                    </Button>
                ]}
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <TrophyOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                    <Title level={4}>{test.title}</Title>
                    <Paragraph>
                        Anda akan membeli akses ke tryout ini dengan harga:
                    </Paragraph>
                    <Title level={2} style={{ color: '#52c41a' }}>
                        {formatPrice(test.price)}
                    </Title>

                    <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
                        {test.time_limit && (
                            <Text type="secondary">
                                ⏱️ Durasi: {formatDuration(test.time_limit)}
                            </Text>
                        )}
                        {test.questions_count && (
                            <Text type="secondary">
                                📝 {test.questions_count} soal
                            </Text>
                        )}
                        {test.attempts_allowed > 0 && (
                            <Text type="secondary">
                                🔄 Maksimal {test.attempts_allowed} percobaan
                            </Text>
                        )}
                        {test.exam_date && (
                            <Text type="secondary">
                                📅 Jadwal: {dayjs(test.exam_date).format('DD MMM YYYY HH:mm')}
                            </Text>
                        )}
                    </Space>

                    {!isRegistrationOpen() && (
                        <div style={{ marginTop: 16 }}>
                            <Tag color="red">
                                Pendaftaran ditutup pada {dayjs(test.registration_deadline).format('DD MMM YYYY')}
                            </Tag>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default TryoutCard;
