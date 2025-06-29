import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Checkbox, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Login() {
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the intended destination from location state or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (values) => {
        setLoading(true);
        setError('');
        try {
            await login(values);
            // Redirect to the intended destination
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Login gagal');
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
                <Col xs={24} sm={20} md={12} lg={8} xl={6}>
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
                                Siap Seleksi
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
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Email wajib diisi!' },
                                    { type: 'email', message: 'Format email tidak valid!' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Masukkan email Anda"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[{ required: true, message: 'Password wajib diisi!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Masukkan password Anda"
                                />
                            </Form.Item>

                            <Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Form.Item name="remember" valuePropName="checked" noStyle>
                                        <Checkbox>Ingat saya</Checkbox>
                                    </Form.Item>
                                    <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                                        Lupa password?
                                    </Link>
                                </div>
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
                                    MASUK
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Text type="secondary">
                                Belum punya akun?{' '}
                                <Link
                                    to="/auth/register"
                                    style={{
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                        color: '#2c3e50'
                                    }}
                                >
                                    Daftar sekarang
                                </Link>
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
