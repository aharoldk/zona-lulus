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
            padding: '16px'
        }}>
            <Row justify="center" style={{ width: '100%', maxWidth: '400px' }}>
                <Col xs={24} sm={24} md={24}>
                    <Card
                        style={{
                            borderRadius: '15px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            border: 'none',
                            width: '100%'
                        }}
                        styles={{ body: { padding: window.innerWidth < 768 ? '24px' : '40px' } }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <img
                                src="/logo-zona-lulus.png"
                                alt="Zona Lulus"
                                width={window.innerWidth < 768 ? "80" : "120"}
                                style={{ marginBottom: '16px' }}
                            />
                            <Title level={window.innerWidth < 768 ? 3 : 2} style={{ color: '#1890ff', marginBottom: '8px' }}>
                                Zona Lulus
                            </Title>
                            <Text type="secondary" style={{ fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>
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
                            size={window.innerWidth < 768 ? "middle" : "large"}
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
                                    style={{ height: window.innerWidth < 768 ? '44px' : '48px' }}
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
                                    style={{ height: window.innerWidth < 768 ? '44px' : '48px' }}
                                />
                            </Form.Item>

                            <Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Checkbox>Ingat saya</Checkbox>
                                    <Link to="/auth/forgot-password" style={{ fontSize: window.innerWidth < 768 ? '13px' : '14px' }}>
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
                                    style={{
                                        height: window.innerWidth < 768 ? '48px' : '52px',
                                        fontSize: window.innerWidth < 768 ? '16px' : '18px',
                                        fontWeight: '500',
                                        borderRadius: '8px'
                                    }}
                                >
                                    {loading ? 'Memproses...' : 'Masuk'}
                                </Button>
                            </Form.Item>

                            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                <Text type="secondary" style={{ fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>
                                    Belum punya akun?{' '}
                                    <Link to="/auth/register" style={{ fontWeight: '500' }}>
                                        Daftar sekarang
                                    </Link>
                                </Text>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
