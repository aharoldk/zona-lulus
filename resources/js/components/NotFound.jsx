import React from 'react';
import { Result, Button, Typography, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Paragraph } = Typography;

export default function NotFound() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f1fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                textAlign: 'center'
            }}>
                <Result
                    status="404"
                    title={
                        <span style={{
                            fontSize: '48px',
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #1890ff, #722ed1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            404
                        </span>
                    }
                    subTitle={
                        <div>
                            <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: '16px' }}>
                                Oops! Halaman yang Anda cari tidak ditemukan.
                            </Paragraph>
                            <Paragraph style={{ fontSize: '14px', color: '#999', marginBottom: '32px' }}>
                                Halaman mungkin telah dipindahkan, dihapus, atau Anda salah mengetik URL.
                                Jangan khawatir, mari kita arahkan Anda kembali ke jalur yang benar!
                            </Paragraph>
                        </div>
                    }
                    extra={
                        <Space size="middle" wrap>
                            <Button
                                type="default"
                                icon={<ArrowLeftOutlined />}
                                size="large"
                                onClick={handleGoBack}
                                style={{
                                    height: '44px',
                                    paddingLeft: '24px',
                                    paddingRight: '24px',
                                    borderRadius: '8px'
                                }}
                            >
                                Kembali
                            </Button>
                            <Button
                                type="primary"
                                icon={<HomeOutlined />}
                                size="large"
                                onClick={handleGoHome}
                                style={{
                                    height: '44px',
                                    paddingLeft: '24px',
                                    paddingRight: '24px',
                                    borderRadius: '8px',
                                    backgroundColor: '#2c3e50',
                                    borderColor: '#2c3e50',
                                    boxShadow: '0 4px 12px rgba(44, 62, 80, 0.3)'
                                }}
                            >
                                {user ? 'Ke Dashboard' : 'Ke Beranda'}
                            </Button>
                        </Space>
                    }
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        padding: '40px 20px'
                    }}
                />

                {/* Additional helpful links */}
                <div style={{
                    marginTop: '32px',
                    padding: '24px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Paragraph style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#2c3e50',
                        marginBottom: '16px'
                    }}>
                        Mungkin Anda mencari:
                    </Paragraph>
                    <Space size="large" wrap>
                        {!user ? (
                            <>
                                <Link
                                    to="/auth/login"
                                    style={{
                                        color: '#1890ff',
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}
                                >
                                    🔐 Login
                                </Link>
                                <Link
                                    to="/auth/register"
                                    style={{
                                        color: '#1890ff',
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}
                                >
                                    📝 Daftar
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/dashboard"
                                    style={{
                                        color: '#1890ff',
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}
                                >
                                    📊 Dashboard
                                </Link>
                                <span style={{
                                    color: '#1890ff',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    opacity: 0.6
                                }}>
                                    📚 Kursus (Coming Soon)
                                </span>
                                <span style={{
                                    color: '#1890ff',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    opacity: 0.6
                                }}>
                                    📝 Tes (Coming Soon)
                                </span>
                            </>
                        )}
                    </Space>
                </div>

                {/* Siap Seleksi branding */}
                <div style={{
                    marginTop: '24px',
                    opacity: 0.8
                }}>
                    <img
                        src="/logo-siap-seleksi.png"
                        alt="Siap Seleksi"
                        width="60"
                        style={{
                            marginBottom: '8px',
                            opacity: 0.7
                        }}
                    />
                    <Paragraph style={{
                        fontSize: '12px',
                        color: '#999',
                        margin: 0
                    }}>
                        Siap Seleksi - Persiapkan diri untuk seleksi TNI/POLRI & Kedinasan
                    </Paragraph>
                </div>
            </div>
        </div>
    );
}
