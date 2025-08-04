import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Button,
    Typography,
    Space,
    Divider,
    message,
    Spin
} from 'antd';
import {
    DollarCircleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { ROUTES } from '../../constants/routes';

const { Title, Text } = Typography;

export default function TopUp() {
    const [coinPackages, setCoinPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [packagesLoading, setPackagesLoading] = useState(true);
    const navigate = useNavigate();

    // Load coin packages from API
    useEffect(() => {
        loadCoinPackages();
    }, []);

    const loadCoinPackages = async () => {
        try {
            setPackagesLoading(true);
            const response = await api.get(ROUTES.API.COINS_PACKAGES);
            setCoinPackages(response.data.data);
        } catch (error) {
            console.error('Error loading coin packages:', error);
            message.error('Gagal memuat paket koin');
        } finally {
            setPackagesLoading(false);
        }
    };

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
        // Navigate to payment page
        navigate(ROUTES.PAYMENT, {
            state: {
                amount: selectedPackage.price,
                description: `Pembelian ${selectedPackage.coins.toLocaleString()} koin`,
                packageId: selectedPackage.id
            }
        });
    };

    if (packagesLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>
                    <Text>Memuat paket koin...</Text>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                <DollarCircleOutlined style={{ color: '#faad14', marginRight: '12px' }} />
                Top Up Koin
            </Title>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card title="Pilih Paket Koin" style={{ marginBottom: '24px' }}>
                        <Row gutter={[16, 16]}>
                            {coinPackages.map((pkg) => {
                                const isSelected = selectedPackage?.id === pkg.id;

                                return (
                                    <Col xs={12} sm={8} md={6} key={pkg.id}>
                                        <Card
                                            hoverable
                                            size="small"
                                            className={isSelected ? 'selected-package' : ''}
                                            onClick={() => handlePackageSelect(pkg)}
                                            style={{
                                                border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                                position: 'relative',
                                                backgroundColor: isSelected ? '#f6ffed' : 'white',
                                                cursor: 'pointer',
                                                height: '150px',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                            bodyStyle={{
                                                padding: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100%',
                                                justifyContent: 'space-between'
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

                                            <div style={{
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100%'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <DollarCircleOutlined
                                                        style={{
                                                            fontSize: '32px',
                                                            color: '#faad14',
                                                            marginBottom: '8px'
                                                        }}
                                                    />
                                                    <div>
                                                        <Text strong style={{ fontSize: '18px' }}>
                                                            {pkg.coins.toLocaleString()} Koin
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
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: 'auto' }}>
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    <Text strong style={{ color: '#1890ff' }}>
                                                        {formatCurrency(pkg.price)}
                                                    </Text>
                                                </div>
                                            </div>

                                            {isSelected && (
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
                                );
                            })}
                        </Row>
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

            <style jsx>{`
                .selected-package {
                    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
                }
            `}</style>
        </div>
    );
}
