import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Checkbox, Typography, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Register() {
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        setLoading(true);
        setError('');
        try {
            await register(values);
            // Redirect to dashboard after successful registration
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || 'Pendaftaran gagal');
        } finally {
            setLoading(false);
        }
    };

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
                <Col xs={24} sm={22} md={16} lg={12} xl={10}>
                    <Card
                        style={{
                            borderRadius: '15px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            border: 'none'
                        }}
                        styles={{ body: { padding: '40px' } }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <img
                                src="/logo-siap-seleksi.png"
                                alt="Siap Seleksi"
                                width="120"
                                style={{ marginBottom: '16px' }}
                            />
                            <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
                                Daftar Siap Seleksi
                            </Title>
                            <Text type="secondary">
                                Persiapkan diri untuk seleksi TNI/POLRI & Kedinasan
                            </Text>
                        </div>

                        {error && (
                            <Alert
                                message={error}
                                type="error"
                                closable
                                onClose={() => setError('')}
                                style={{ marginBottom: '24px' }}
                            />
                        )}

                        <Form
                            form={form}
                            onFinish={handleSubmit}
                            layout="vertical"
                            size="large"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="name"
                                        label="Nama Lengkap"
                                        rules={[{ required: true, message: 'Nama lengkap wajib diisi!' }]}
                                    >
                                        <Input
                                            prefix={<UserOutlined />}
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
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
                                            placeholder="Masukkan email"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="phone"
                                label="Nomor HP/WhatsApp"
                                rules={[
                                    { required: true, message: 'Nomor HP wajib diisi!' },
                                    { pattern: /^[0-9+\-\s]+$/, message: 'Nomor HP tidak valid!' }
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined />}
                                    placeholder="Masukkan nomor HP/WhatsApp"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="password"
                                        label="Password"
                                        rules={[
                                            { required: true, message: 'Password wajib diisi!' },
                                            { min: 6, message: 'Password minimal 6 karakter!' }
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Masukkan password"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="password_confirmation"
                                        label="Konfirmasi Password"
                                        dependencies={['password']}
                                        rules={[
                                            { required: true, message: 'Konfirmasi password wajib diisi!' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Password tidak cocok!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Konfirmasi password"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="terms"
                                valuePropName="checked"
                                rules={[
                                    {
                                        validator: (_, value) =>
                                            value ? Promise.resolve() : Promise.reject(new Error('Anda harus menyetujui syarat & ketentuan!')),
                                    },
                                ]}
                            >
                                <Checkbox>
                                    Saya menyetujui{' '}
                                    <a href="/terms" style={{ textDecoration: 'none' }}>
                                        Syarat & Ketentuan
                                    </a>
                                </Checkbox>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    size="large"
                                    style={{
                                        height: '48px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        backgroundColor: '#2c3e50',
                                        borderColor: '#2c3e50'
                                    }}
                                >
                                    DAFTAR SEKARANG
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Text type="secondary">
                                Sudah punya akun?{' '}
                                <Link
                                    to="/auth/login"
                                    style={{
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                        color: '#2c3e50'
                                    }}
                                >
                                    Masuk disini
                                </Link>
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
