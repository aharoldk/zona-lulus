import React, { useState, useEffect } from 'react';
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
    Alert,
    Spin
} from 'antd';
import {
    DollarCircleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function TopUp() {
    const [coinPackages, setCoinPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [packagesLoading, setPackagesLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Load coin packages from API
    useEffect(() => {
        loadCoinPackages();
    }, []);

    const loadCoinPackages = async () => {
        try {
            setPackagesLoading(true);
            const response = await fetch('/api/coins/packages', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Loaded packages:', data.data); // Debug log
                setCoinPackages(data.data);
            } else {
                message.error('Gagal memuat paket koin');
            }
        } catch (error) {
            console.error('Error loading coin packages:', error);
            message.error('Terjadi kesalahan saat memuat paket koin');
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
        console.log('Selecting package:', pkg.id, pkg.name); // Debug log
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
            const response = await fetch('/api/coins/purchase', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    package_id: selectedPackage.id
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setShowConfirmModal(false);

                if (window.snap) {
                    window.snap.pay(data.data.snap_token, {
                        onSuccess: function(result) {
                            message.success('Pembayaran berhasil! Koin telah ditambahkan ke akun Anda.');
                            setSelectedPackage(null);
                            // Refresh user data to update coin balance
                            window.location.reload();
                        },
                        onPending: function(result) {
                            message.info('Pembayaran sedang diproses. Anda akan diberitahu jika pembayaran berhasil.');
                            setSelectedPackage(null);
                        },
                        onError: function(result) {
                            message.error('Pembayaran gagal. Silakan coba lagi.');
                        },
                        onClose: function() {
                            message.info('Anda menutup popup pembayaran sebelum menyelesaikan pembayaran');
                        }
                    });
                } else {
                    message.error('Sistem pembayaran tidak tersedia');
                }
            } else {
                message.error(data.message || 'Terjadi kesalahan saat memproses pembayaran');
            }
        } catch (error) {
            console.error('Error purchasing coins:', error);
            message.error('Terjadi kesalahan saat memproses pembayaran');
        } finally {
            setLoading(false);
        }
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
                                console.log(`Package ${pkg.id} selected:`, isSelected); // Debug log

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
