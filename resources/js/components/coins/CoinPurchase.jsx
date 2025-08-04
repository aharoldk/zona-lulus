import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, Badge, Modal, Form, Select, message, Spin } from 'antd';
import {
    CurrencyDollarIcon,
    StarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CoinPurchase = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchPackages();
        fetchUserBalance();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await api.get('/coins/packages');
            setPackages(response.data.packages);
        } catch (error) {
            message.error('Gagal memuat paket koin');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserBalance = async () => {
        try {
            const response = await api.get('/coins/balance');
            setUserBalance(response.data.coins);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const handlePurchase = (packageData) => {
        setSelectedPackage(packageData);
        setShowPaymentModal(true);
    };

    const processPurchase = async (values) => {
        setPurchasing(true);
        try {
            const response = await api.post('/coins/purchase', {
                package: selectedPackage.id,
                payment_method: values.payment_method
            });

            if (response.data.success) {
                message.success(`Berhasil membeli ${response.data.coins_added} koin!`);
                setUserBalance(response.data.new_balance);
                setShowPaymentModal(false);
                form.resetFields();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Gagal melakukan pembelian');
        } finally {
            setPurchasing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Title level={2}>
                    <CurrencyDollarIcon style={{ width: '32px', height: '32px', marginRight: '8px', color: '#faad14' }} />
                    Beli Koin
                </Title>
                <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                    Saldo Koin Anda: <Text strong style={{ color: '#faad14', fontSize: '18px' }}>{userBalance} Koin</Text>
                </Paragraph>
                <Paragraph>
                    Gunakan koin untuk mengakses tryout premium dan fitur eksklusif lainnya
                </Paragraph>
            </div>

            {/* Coin Packages */}
            <Row gutter={[16, 16]}>
                {packages.map((pkg) => (
                    <Col xs={24} sm={12} lg={6} key={pkg.id}>
                        <Card
                            hoverable
                            style={{
                                height: '100%',
                                border: pkg.popular ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                position: 'relative'
                            }}
                            bodyStyle={{ padding: '24px', textAlign: 'center' }}
                        >
                            {pkg.popular && (
                                <Badge.Ribbon text="TERPOPULER" color="blue">
                                    <div />
                                </Badge.Ribbon>
                            )}

                            <div style={{ marginBottom: '16px' }}>
                                <CurrencyDollarIcon style={{ width: '48px', height: '48px', color: '#faad14' }} />
                            </div>

                            <Title level={4} style={{ marginBottom: '8px' }}>
                                {pkg.name}
                            </Title>

                            <div style={{ marginBottom: '16px' }}>
                                <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>
                                    {pkg.coins}
                                </Text>
                                <Text style={{ marginLeft: '4px' }}>Koin</Text>
                                {pkg.bonus > 0 && (
                                    <div>
                                        <Text style={{ color: '#52c41a', fontSize: '14px' }}>
                                            +{pkg.bonus} Bonus!
                                        </Text>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                    {formatCurrency(pkg.price)}
                                </Text>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {formatCurrency(pkg.price / pkg.coins)} per koin
                                </div>
                            </div>

                            <Button
                                type={pkg.popular ? 'primary' : 'default'}
                                size="large"
                                block
                                onClick={() => handlePurchase(pkg)}
                                style={{
                                    height: '48px',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Beli Sekarang
                            </Button>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Benefits Section */}
            <Card style={{ marginTop: '32px' }}>
                <Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>
                    Keuntungan Membeli Koin
                </Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <div style={{ textAlign: 'center' }}>
                            <CheckCircleIcon style={{ width: '48px', height: '48px', color: '#52c41a', marginBottom: '16px' }} />
                            <Title level={5}>Akses Tryout Premium</Title>
                            <Text>Akses ke semua tryout premium dengan pembahasan lengkap</Text>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div style={{ textAlign: 'center' }}>
                            <StarIcon style={{ width: '48px', height: '48px', color: '#faad14', marginBottom: '16px' }} />
                            <Title level={5}>Fitur Eksklusif</Title>
                            <Text>Dapatkan akses ke fitur analisis mendalam dan rekomendasi personal</Text>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div style={{ textAlign: 'center' }}>
                            <CurrencyDollarIcon style={{ width: '48px', height: '48px', color: '#1890ff', marginBottom: '16px' }} />
                            <Title level={5}>Hemat Lebih Banyak</Title>
                            <Text>Paket besar memberikan nilai lebih dengan bonus koin tambahan</Text>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Payment Modal */}
            <Modal
                title="Konfirmasi Pembelian"
                open={showPaymentModal}
                onCancel={() => setShowPaymentModal(false)}
                footer={null}
                width={500}
            >
                {selectedPackage && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={processPurchase}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <Title level={4}>{selectedPackage.name}</Title>
                            <Text style={{ fontSize: '24px', color: '#faad14', fontWeight: 'bold' }}>
                                {selectedPackage.coins} Koin
                            </Text>
                            {selectedPackage.bonus > 0 && (
                                <div>
                                    <Text style={{ color: '#52c41a' }}>
                                        +{selectedPackage.bonus} Bonus Koin
                                    </Text>
                                </div>
                            )}
                            <div style={{ marginTop: '8px' }}>
                                <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                    {formatCurrency(selectedPackage.price)}
                                </Text>
                            </div>
                        </div>

                        <Form.Item
                            name="payment_method"
                            label="Metode Pembayaran"
                            rules={[{ required: true, message: 'Pilih metode pembayaran' }]}
                        >
                            <Select placeholder="Pilih metode pembayaran" size="large">
                                <Option value="credit_card">Kartu Kredit</Option>
                                <Option value="bank_transfer">Transfer Bank</Option>
                                <Option value="e_wallet">E-Wallet</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={purchasing}
                                size="large"
                                block
                                style={{ height: '48px', fontSize: '16px' }}
                            >
                                {purchasing ? 'Memproses...' : 'Bayar Sekarang'}
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default CoinPurchase;
