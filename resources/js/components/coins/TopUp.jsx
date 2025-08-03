import React, { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Button,
    Typography,
    Space,
    Divider,
    Radio,
    message,
    Modal,
    Alert
} from 'antd';
import {
    DollarCircleOutlined,
    CreditCardOutlined,
    WalletOutlined,
    BankOutlined,
    PhoneOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function TopUp() {
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Coin packages
    const coinPackages = [
        {
            id: 'package_1',
            coins: 100,
            price: 10000,
            bonus: 0,
            popular: false
        },
        {
            id: 'package_2',
            coins: 500,
            price: 45000,
            bonus: 50,
            popular: true
        },
        {
            id: 'package_3',
            coins: 1000,
            price: 85000,
            bonus: 150,
            popular: false
        },
        {
            id: 'package_4',
            coins: 2000,
            price: 160000,
            bonus: 400,
            popular: false
        },
        {
            id: 'package_5',
            coins: 5000,
            price: 375000,
            bonus: 1250,
            popular: false
        }
    ];

    // Payment methods
    const paymentMethods = [
        {
            id: 'credit_card',
            name: 'Kartu Kredit/Debit',
            icon: <CreditCardOutlined />,
            description: 'Visa, Mastercard, JCB'
        },
        {
            id: 'e_wallet',
            name: 'E-Wallet',
            icon: <WalletOutlined />,
            description: 'GoPay, OVO, DANA, LinkAja'
        },
        {
            id: 'bank_transfer',
            name: 'Transfer Bank',
            icon: <BankOutlined />,
            description: 'BCA, Mandiri, BNI, BRI'
        },
        {
            id: 'virtual_account',
            name: 'Virtual Account',
            icon: <PhoneOutlined />,
            description: 'Bayar di ATM atau Mobile Banking'
        }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handlePackageSelect = (pkg) => {
        setSelectedPackage(pkg);
    };

    const handlePurchase = () => {
        if (!selectedPackage) {
            message.warning('Silakan pilih paket koin terlebih dahulu');
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirmPurchase = async () => {
        setLoading(true);
        try {
            // Here you would integrate with your payment gateway
            // For now, we'll simulate a successful purchase
            await new Promise(resolve => setTimeout(resolve, 2000));

            setShowConfirmModal(false);
            message.success('Pembelian koin berhasil! Koin telah ditambahkan ke akun Anda.');
            setSelectedPackage(null);
        } catch (error) {
            message.error('Terjadi kesalahan saat memproses pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const selectedMethodInfo = paymentMethods.find(method => method.id === selectedPaymentMethod);

    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                <DollarCircleOutlined style={{ color: '#faad14', marginRight: '12px' }} />
                Top Up Koin
            </Title>

            <Row gutter={[24, 24]}>
                {/* Coin Packages */}
                <Col xs={24} lg={16}>
                    <Card title="Pilih Paket Koin" style={{ marginBottom: '24px' }}>
                        <Row gutter={[16, 16]}>
                            {coinPackages.map((pkg) => (
                                <Col xs={12} sm={8} md={6} key={pkg.id}>
                                    <Card
                                        hoverable
                                        size="small"
                                        className={selectedPackage?.id === pkg.id ? 'selected-package' : ''}
                                        onClick={() => handlePackageSelect(pkg)}
                                        style={{
                                            border: selectedPackage?.id === pkg.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                            position: 'relative'
                                        }}
                                    >
                                        {pkg.popular && (
                                            <div style={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                background: '#ff4d4f',
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                POPULER
                                            </div>
                                        )}

                                        <div style={{ textAlign: 'center' }}>
                                            <DollarCircleOutlined
                                                style={{
                                                    fontSize: '32px',
                                                    color: '#faad14',
                                                    marginBottom: '8px'
                                                }}
                                            />
                                            <div>
                                                <Text strong style={{ fontSize: '18px' }}>
                                                    {pkg.coins.toLocaleString()}
                                                </Text>
                                                {pkg.bonus > 0 && (
                                                    <Text style={{
                                                        color: '#52c41a',
                                                        fontSize: '12px',
                                                        display: 'block'
                                                    }}>
                                                        +{pkg.bonus} Bonus
                                                    </Text>
                                                )}
                                                <Text>Koin</Text>
                                            </div>
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Text strong style={{ color: '#1890ff' }}>
                                                {formatCurrency(pkg.price)}
                                            </Text>
                                        </div>

                                        {selectedPackage?.id === pkg.id && (
                                            <CheckCircleOutlined
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    color: '#1890ff',
                                                    fontSize: '16px'
                                                }}
                                            />
                                        )}
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>

                    {/* Payment Methods */}
                    <Card title="Metode Pembayaran">
                        <Radio.Group
                            value={selectedPaymentMethod}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {paymentMethods.map((method) => (
                                    <Radio value={method.id} key={method.id} style={{ width: '100%' }}>
                                        <Card size="small" style={{ width: '100%', marginLeft: '8px' }}>
                                            <Space>
                                                {method.icon}
                                                <div>
                                                    <Text strong>{method.name}</Text>
                                                    <br />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {method.description}
                                                    </Text>
                                                </div>
                                            </Space>
                                        </Card>
                                    </Radio>
                                ))}
                            </Space>
                        </Radio.Group>
                    </Card>
                </Col>

                {/* Order Summary */}
                <Col xs={24} lg={8}>
                    <Card title="Ringkasan Pesanan" style={{ position: 'sticky', top: '24px' }}>
                        {selectedPackage ? (
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                    <DollarCircleOutlined
                                        style={{
                                            fontSize: '48px',
                                            color: '#faad14',
                                            marginBottom: '8px'
                                        }}
                                    />
                                    <br />
                                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                        {selectedPackage.coins.toLocaleString()}
                                    </Text>
                                    {selectedPackage.bonus > 0 && (
                                        <Text style={{
                                            color: '#52c41a',
                                            fontSize: '16px',
                                            display: 'block'
                                        }}>
                                            +{selectedPackage.bonus} Bonus
                                        </Text>
                                    )}
                                    <Text style={{ fontSize: '16px' }}>Koin</Text>
                                </div>

                                <Divider />

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text>Harga:</Text>
                                    <Text strong>{formatCurrency(selectedPackage.price)}</Text>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text>Metode Pembayaran:</Text>
                                    <Text>{selectedMethodInfo?.name}</Text>
                                </div>

                                <Divider />

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong>Total:</Text>
                                    <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                                        {formatCurrency(selectedPackage.price)}
                                    </Text>
                                </div>

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    onClick={handlePurchase}
                                    style={{ marginTop: '16px' }}
                                >
                                    Beli Sekarang
                                </Button>
                            </Space>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <Text type="secondary">
                                    Pilih paket koin untuk melihat ringkasan pesanan
                                </Text>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Confirmation Modal */}
            <Modal
                title="Konfirmasi Pembelian"
                open={showConfirmModal}
                onOk={handleConfirmPurchase}
                onCancel={() => setShowConfirmModal(false)}
                confirmLoading={loading}
                okText="Konfirmasi Pembayaran"
                cancelText="Batal"
            >
                {selectedPackage && (
                    <div>
                        <Alert
                            message="Perhatian"
                            description="Pastikan data pembelian sudah benar sebelum melanjutkan ke pembayaran."
                            type="warning"
                            style={{ marginBottom: '16px' }}
                        />

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Paket:</Text>
                                <Text strong>
                                    {selectedPackage.coins.toLocaleString()} Koin
                                    {selectedPackage.bonus > 0 && ` (+${selectedPackage.bonus} Bonus)`}
                                </Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Metode Pembayaran:</Text>
                                <Text strong>{selectedMethodInfo?.name}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Total Pembayaran:</Text>
                                <Text strong style={{ color: '#1890ff' }}>
                                    {formatCurrency(selectedPackage.price)}
                                </Text>
                            </div>
                        </Space>
                    </div>
                )}
            </Modal>

            <style jsx>{`
                .selected-package {
                    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
                }
            `}</style>
        </div>
    );
}
