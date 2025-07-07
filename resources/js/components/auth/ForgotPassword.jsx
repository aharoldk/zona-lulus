import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Alert,
    Row,
    Col,
    Space,
    Result,
} from 'antd';
import {
    MailOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const ForgotPassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (values) => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/forgot-password', {
                email: values.email
            });

            setEmail(values.email);
            setEmailSent(true);
        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f1fe 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <Row justify="center" style={{ width: '100%' }}>
                    <Col xs={24} sm={20} md={16} lg={12} xl={10}>
                        <Card
                            style={{
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                border: 'none'
                            }}
                        >
                            <Result
                                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                title="Email Terkirim!"
                                subTitle={
                                    <div>
                                        <Paragraph>
                                            Kami telah mengirimkan link reset password ke email:
                                        </Paragraph>
                                        <Text strong style={{ color: '#1890ff' }}>{email}</Text>
                                        <Paragraph style={{ marginTop: 16 }}>
                                            Silakan periksa inbox email Anda dan ikuti instruksi untuk mereset password.
                                            Jika tidak menemukan email, periksa folder spam.
                                        </Paragraph>
                                    </div>
                                }
                                extra={[
                                    <Button type="primary" key="login">
                                        <Link to="/login">
                                            Kembali ke Login
                                        </Link>
                                    </Button>,
                                    <Button key="resend" onClick={() => setEmailSent(false)}>
                                        Kirim Ulang
                                    </Button>
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f1fe 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Row justify="center" style={{ width: '100%' }}>
                <Col xs={24} sm={20} md={16} lg={12} xl={10}>
                    <Card
                        style={{
                            borderRadius: '15px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            border: 'none'
                        }}
                        styles={{ body: { padding: '40px' } }}
                    >
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <img
                                src="/logo-zona-lulus.png"
                                alt="Zona Lulus"
                                width="80"
                                style={{ marginBottom: '16px' }}
                            />
                            <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
                                Lupa Password
                            </Title>
                            <Text type="secondary">
                                Masukkan email Anda untuk mendapatkan link reset password
                            </Text>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <Alert
                                message={error}
                                type="error"
                                closable
                                onClose={() => setError('')}
                                style={{ marginBottom: '24px' }}
                            />
                        )}

                        {/* Form */}
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            size="large"
                        >
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Email wajib diisi!' },
                                    { type: 'email', message: 'Format email tidak valid!' }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="Masukkan email Anda"
                                    style={{ height: '48px' }}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    style={{
                                        height: '52px',
                                        fontSize: '18px',
                                        fontWeight: '500',
                                        borderRadius: '8px'
                                    }}
                                >
                                    {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
                                </Button>
                            </Form.Item>
                        </Form>

                        {/* Instructions */}
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '16px',
                            borderRadius: '8px',
                            marginTop: '24px'
                        }}>
                            <Title level={5} style={{ color: '#1890ff', marginBottom: '12px' }}>
                                Instruksi:
                            </Title>
                            <Space direction="vertical" size="small">
                                <Text type="secondary">• Masukkan email yang terdaftar di akun Anda</Text>
                                <Text type="secondary">• Kami akan mengirimkan link reset password ke email tersebut</Text>
                                <Text type="secondary">• Klik link di email untuk membuat password baru</Text>
                                <Text type="secondary">• Link berlaku selama 60 menit</Text>
                            </Space>
                        </div>

                        {/* Back to Login */}
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Link to="/login" style={{ color: '#1890ff', textDecoration: 'none' }}>
                                <ArrowLeftOutlined style={{ marginRight: '8px' }} />
                                Kembali ke Login
                            </Link>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ForgotPassword;
