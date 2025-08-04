import React, { useState, useEffect } from 'react';
import {
    Steps,
    Card,
    Row,
    Col,
    Button,
    Typography,
    Space,
    message,
    Spin,
    Alert,
    Tag,
    Radio,
    Result
} from 'antd';
import {
    CreditCardOutlined,
    BankOutlined,
    MobileOutlined,
    QrcodeOutlined,
    ShopOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/axios';
import { ROUTES } from '../../constants/routes';

const { Title, Text } = Typography;
const { Step } = Steps;

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { amount, description, testId, packageData } = location.state || {};

    const [currentStep, setCurrentStep] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        if (!amount || !description) {
            message.error('Data pembayaran tidak lengkap');
            navigate(ROUTES.COINS_TOPUP);
            return;
        }
        loadPaymentMethods();
    }, [amount, description, navigate]);

    const loadPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await api.get(`${ROUTES.API.DUITKU_METHODS}?amount=${amount}`);

            if (response.data.status === 'success') {
                setPaymentMethods(response.data.data);
            } else {
                message.error('Gagal memuat metode pembayaran');
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
            message.error('Gagal memuat metode pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
    };

    const createPayment = async () => {
        if (!selectedMethod) {
            message.warning('Silakan pilih metode pembayaran');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post(ROUTES.API.DUITKU_CREATE, {
                test_id: testId,
                amount: amount,
                payment_method: selectedMethod.paymentMethod,
                description: description
            });

            if (response.data.success) {
                setPaymentData(response.data.data);
                setCurrentStep(1);

                // Start payment status polling
                startStatusPolling(response.data.data.order_id);

                // Handle different payment types
                if (response.data.data.payment_url) {
                    // Redirect to payment page for online payments
                    window.open(response.data.data.payment_url, '_blank');
                    message.info('Silakan selesaikan pembayaran di tab yang baru terbuka');
                } else {
                    message.success('Pembayaran berhasil dibuat');
                }
            } else {
                message.error(response.data.message || 'Gagal membuat pembayaran');
            }
        } catch (error) {
            console.error('Create payment error:', error);
            const errorMessage = error.response?.data?.message || 'Gagal membuat pembayaran';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const startStatusPolling = (orderId) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await api.post(ROUTES.API.DUITKU_INQUIRY, {
                    order_id: orderId
                });

                if (response.data.success) {
                    const payment = response.data.data;
                    setPaymentStatus(payment);

                    if (payment.status === 'completed') {
                        clearInterval(pollInterval);
                        setCurrentStep(2);
                        message.success('Pembayaran berhasil!');
                    } else if (payment.status === 'failed') {
                        clearInterval(pollInterval);
                        message.error('Pembayaran gagal');
                    }
                }
            } catch (error) {
                console.error('Status polling error:', error);
            }
        }, 5000); // Poll every 5 seconds

        // Clear interval after 30 minutes
        setTimeout(() => {
            clearInterval(pollInterval);
        }, 30 * 60 * 1000);
    };

    const getPaymentMethodIcon = (method) => {
        const methodCode = method.paymentMethod;

        if (methodCode.includes('CC')) return <CreditCardOutlined />;
        if (methodCode.includes('VA') || methodCode.includes('BT')) return <BankOutlined />;
        if (methodCode.includes('OV') || methodCode.includes('DANA') || methodCode.includes('GOPAY')) return <MobileOutlined />;
        if (methodCode.includes('QR')) return <QrcodeOutlined />;
        if (methodCode.includes('RETAIL')) return <ShopOutlined />;

        return <CreditCardOutlined />;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleBackToTopUp = () => {
        navigate(ROUTES.COINS_TOPUP);
    };

    const renderPaymentMethods = () => (
        <Card>
            <div style={{ marginBottom: 24 }}>
                <Title level={4}>Pilih Metode Pembayaran</Title>
                <Text type="secondary">Total pembayaran: {formatCurrency(amount)}</Text>

                {packageData && (
                    <Alert
                        message={`Paket: ${packageData.coins?.toLocaleString()} koin ${packageData.bonus > 0 ? `(+${packageData.bonus} bonus)` : ''}`}
                        type="info"
                        style={{ marginTop: 16 }}
                    />
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text>Memuat metode pembayaran...</Text>
                    </div>
                </div>
            ) : (
                <div>
                    <Radio.Group
                        value={selectedMethod?.paymentMethod}
                        onChange={(e) => {
                            const method = paymentMethods.find(m => m.paymentMethod === e.target.value);
                            handleMethodSelect(method);
                        }}
                        style={{ width: '100%' }}
                    >
                        <Row gutter={[16, 16]}>
                            {paymentMethods.map((method) => (
                                <Col xs={24} sm={12} lg={8} key={method.paymentMethod}>
                                    <Card
                                        hoverable
                                        size="small"
                                        style={{
                                            border: selectedMethod?.paymentMethod === method.paymentMethod
                                                ? '2px solid #1890ff' : '1px solid #d9d9d9'
                                        }}
                                    >
                                        <Radio value={method.paymentMethod} style={{ width: '100%' }}>
                                            <Space>
                                                {getPaymentMethodIcon(method)}
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>
                                                        {method.paymentName}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        Fee: {formatCurrency(method.totalFee)}
                                                    </div>
                                                </div>
                                            </Space>
                                        </Radio>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Radio.Group>

                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBackToTopUp}
                        >
                            Kembali
                        </Button>
                        <Button
                            type="primary"
                            onClick={createPayment}
                            loading={loading}
                            disabled={!selectedMethod}
                        >
                            Lanjutkan Pembayaran
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );

    const renderPaymentInstructions = () => (
        <Card>
            <Title level={4}>Instruksi Pembayaran</Title>

            {paymentData?.va_number && (
                <Alert
                    message="Virtual Account"
                    description={
                        <div>
                            <p>Silakan transfer ke nomor Virtual Account berikut:</p>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#1890ff',
                                textAlign: 'center',
                                padding: '16px',
                                background: '#f0f8ff',
                                borderRadius: '8px',
                                margin: '16px 0'
                            }}>
                                {paymentData.va_number}
                            </div>
                            <p>Nominal: {formatCurrency(paymentData.amount)}</p>
                        </div>
                    }
                    type="info"
                    style={{ marginBottom: 16 }}
                />
            )}

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Text strong>Order ID:</Text>
                        <br />
                        <Text copyable>{paymentData?.order_id}</Text>
                    </Col>
                    <Col span={12}>
                        <Text strong>Jumlah:</Text>
                        <br />
                        <Text>{formatCurrency(paymentData?.amount)}</Text>
                    </Col>
                </Row>
            </Card>

            <div style={{ marginBottom: 16 }}>
                <Text strong>Status Pembayaran:</Text>
                <br />
                <Tag
                    icon={<ClockCircleOutlined />}
                    color="processing"
                    style={{ marginTop: 8 }}
                >
                    Menunggu Pembayaran
                </Tag>
            </div>

            <Alert
                message="Penting!"
                description="Halaman ini akan otomatis terupdate ketika pembayaran berhasil. Jangan tutup halaman ini."
                type="warning"
                style={{ marginBottom: 24 }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBackToTopUp}
                >
                    Kembali ke Top Up
                </Button>
                <Button
                    type="primary"
                    onClick={() => startStatusPolling(paymentData?.order_id)}
                >
                    Cek Status Pembayaran
                </Button>
            </div>
        </Card>
    );

    const renderPaymentSuccess = () => (
        <Result
            status="success"
            title="Pembayaran Berhasil!"
            subTitle={`Order ID: ${paymentStatus?.order_id}`}
            extra={[
                <Card key="details" style={{ textAlign: 'left', marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Text strong>Jumlah:</Text>
                            <br />
                            <Text>{formatCurrency(paymentStatus?.amount)}</Text>
                        </Col>
                        <Col span={12}>
                            <Text strong>Tanggal:</Text>
                            <br />
                            <Text>{new Date(paymentStatus?.paid_at).toLocaleDateString('id-ID')}</Text>
                        </Col>
                    </Row>
                </Card>,
                <Button
                    key="back"
                    type="primary"
                    onClick={handleBackToTopUp}
                >
                    Kembali ke Top Up
                </Button>
            ]}
        />
    );

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2} style={{ marginBottom: '24px' }}>
                <CreditCardOutlined style={{ color: '#1890ff', marginRight: '12px' }} />
                Pembayaran
            </Title>

            <Steps current={currentStep} style={{ marginBottom: 24 }}>
                <Step title="Pilih Metode" icon={<CreditCardOutlined />} />
                <Step title="Pembayaran" icon={<ClockCircleOutlined />} />
                <Step title="Selesai" icon={<CheckCircleOutlined />} />
            </Steps>

            {currentStep === 0 && renderPaymentMethods()}
            {currentStep === 1 && renderPaymentInstructions()}
            {currentStep === 2 && renderPaymentSuccess()}
        </div>
    );
};

export default PaymentPage;
