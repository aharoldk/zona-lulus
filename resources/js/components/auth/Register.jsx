import { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Steps,
    Row,
    Col,
    Select,
    Radio,
    Checkbox,
    Progress,
    Alert,
    Space,
    Modal,
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    LockOutlined,
    EyeTwoTone,
    EyeInvisibleOutlined,
    AimOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

const Register = () => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [termsModalVisible, setTermsModalVisible] = useState(false);
    const [error, setError] = useState('');
    const [emailExists, setEmailExists] = useState(false);
    const [phoneExists, setPhoneExists] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const navigate = useNavigate();

    // Password strength calculator
    const calculatePasswordStrength = (password) => {
        if (!password) return 0;

        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 10;

        return Math.min(strength, 100);
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return '#ff4d4f';
        if (passwordStrength < 50) return '#faad14';
        if (passwordStrength < 75) return '#1890ff';
        return '#52c41a';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength < 25) return 'Lemah';
        if (passwordStrength < 50) return 'Sedang';
        if (passwordStrength < 75) return 'Kuat';
        return 'Sangat Kuat';
    };

    // Step 1: Basic Information
    const renderBasicInfo = () => (
        <div>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Informasi Dasar
            </Title>

            <Form.Item
                name="name"
                label="Nama Lengkap"
                rules={[
                    { required: true, message: 'Nama lengkap wajib diisi!' },
                    { min: 2, message: 'Nama minimal 2 karakter!' },
                ]}
            >
                <Input
                    prefix={<UserOutlined />}
                    placeholder="Masukkan nama lengkap"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: 'Email wajib diisi!' },
                    { type: 'email', message: 'Format email tidak valid!' },
                ]}
            >
                <Input
                    prefix={<MailOutlined />}
                    placeholder="Masukkan email"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="phone"
                label="Nomor HP"
                rules={[
                    { required: true, message: 'Nomor HP wajib diisi!' },
                    { pattern: /^[0-9]{10,13}$/, message: 'Nomor HP harus 10-13 digit!' },
                ]}
            >
                <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Contoh: 08123456789"
                    size="large"
                />
            </Form.Item>
        </div>
    );

    // Step 2: Password & Security
    const renderPasswordSecurity = () => (
        <div>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
                <LockOutlined style={{ marginRight: 8 }} />
                Keamanan Akun
            </Title>

            <Form.Item
                name="password"
                label="Password"
                rules={[
                    { required: true, message: 'Password wajib diisi!' },
                    { min: 8, message: 'Password minimal 8 karakter!' },
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Masukkan password"
                    size="large"
                    onChange={(e) => setPasswordStrength(calculatePasswordStrength(e.target.value))}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
            </Form.Item>

            {passwordStrength > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Progress
                        percent={passwordStrength}
                        strokeColor={getPasswordStrengthColor()}
                        showInfo={false}
                        size="small"
                    />
                    <Text style={{ color: getPasswordStrengthColor(), fontSize: '12px' }}>
                        Kekuatan password: {getPasswordStrengthText()}
                    </Text>
                </div>
            )}

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
                    size="large"
                />
            </Form.Item>

            <Alert
                message="Tips Keamanan"
                description={
                    <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                        <li>Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
                        <li>Minimal 8 karakter untuk keamanan optimal</li>
                        <li>Jangan gunakan informasi pribadi seperti nama atau tanggal lahir</li>
                    </ul>
                }
                type="info"
                showIcon
                style={{ marginTop: 16 }}
            />
        </div>
    );

    // Step 3: Target & Preferences
    const renderTargetPreferences = () => (
        <div>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
                <AimOutlined style={{ marginRight: 8 }} />
                Target & Preferensi Belajar
            </Title>

            <Form.Item
                name="target"
                label="Target Ujian"
                rules={[{ required: true, message: 'Pilih target ujian!' }]}
            >
                <Radio.Group size="large">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Radio value="tni">
                            <div>
                                <Text strong>TNI (Tentara Nasional Indonesia)</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Persiapan seleksi masuk TNI AD, AL, AU
                                </Text>
                            </div>
                        </Radio>
                        <Radio value="polri">
                            <div>
                                <Text strong>POLRI (Kepolisian Republik Indonesia)</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Persiapan seleksi masuk Polri semua tingkatan
                                </Text>
                            </div>
                        </Radio>
                        <Radio value="cpns">
                            <div>
                                <Text strong>CPNS (Calon Pegawai Negeri Sipil)</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Persiapan tes SKD dan SKB CPNS
                                </Text>
                            </div>
                        </Radio>
                        <Radio value="bumn">
                            <div>
                                <Text strong>BUMN</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Persiapan seleksi BUMN dan perusahaan negara
                                </Text>
                            </div>
                        </Radio>
                        <Radio value="lainnya">
                            <div>
                                <Text strong>Lainnya</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Seleksi kedinasan dan instansi lainnya
                                </Text>
                            </div>
                        </Radio>
                    </Space>
                </Radio.Group>
            </Form.Item>

            <Form.Item
                name="education"
                label="Pendidikan Terakhir"
                rules={[{ required: true, message: 'Pilih pendidikan terakhir!' }]}
            >
                <Select placeholder="Pilih pendidikan terakhir" size="large">
                    <Option value="sma">SMA/SMK/MA Sederajat</Option>
                    <Option value="d3">Diploma 3 (D3)</Option>
                    <Option value="s1">Sarjana (S1)</Option>
                    <Option value="s2">Magister (S2)</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="experience_level"
                label="Pengalaman Mengikuti Tes"
                rules={[{ required: true, message: 'Pilih pengalaman Anda!' }]}
            >
                <Radio.Group size="large">
                    <Radio value="beginner">Pemula (belum pernah ikut tes)</Radio>
                    <Radio value="intermediate">Sudah pernah 1-2 kali</Radio>
                    <Radio value="experienced">Berpengalaman (>3 kali)</Radio>
                </Radio.Group>
            </Form.Item>

            <Form.Item
                name="study_time"
                label="Waktu Belajar yang Tersedia"
            >
                <Select placeholder="Berapa jam per hari?" size="large">
                    <Option value="1">1-2 jam per hari</Option>
                    <Option value="3">3-4 jam per hari</Option>
                    <Option value="5">5-6 jam per hari</Option>
                    <Option value="7">Lebih dari 6 jam per hari</Option>
                </Select>
            </Form.Item>
        </div>
    );

    // Step 4: Confirmation
    const renderConfirmation = () => (
        <div>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                Konfirmasi Data
            </Title>

            <Card style={{ marginBottom: 24 }}>
                <Title level={5}>Informasi Dasar</Title>
                <Row gutter={[16, 8]}>
                    <Col span={8}><Text strong>Nama:</Text></Col>
                    <Col span={16}>{formData.name}</Col>
                    <Col span={8}><Text strong>Email:</Text></Col>
                    <Col span={16}>{formData.email}</Col>
                    <Col span={8}><Text strong>HP:</Text></Col>
                    <Col span={16}>{formData.phone}</Col>
                    <Col span={8}><Text strong>Target:</Text></Col>
                    <Col span={16}>{formData.target?.toUpperCase()}</Col>
                </Row>
            </Card>

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
                    <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={() => setTermsModalVisible(true)}
                    >
                        Syarat & Ketentuan
                    </Button>{' '}
                    dan{' '}
                    <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={() => setTermsModalVisible(true)}
                    >
                        Kebijakan Privasi
                    </Button>
                </Checkbox>
            </Form.Item>

            <Form.Item
                name="newsletter"
                valuePropName="checked"
                initialValue={true}
            >
                <Checkbox>
                    Saya ingin menerima informasi terbaru dan tips belajar via email
                </Checkbox>
            </Form.Item>

            <Alert
                message="Hampir Selesai!"
                description="Setelah mendaftar, Anda akan menerima email verifikasi. Silakan cek inbox atau folder spam Anda."
                type="success"
                showIcon
                style={{ marginTop: 16 }}
            />
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return renderBasicInfo();
            case 1:
                return renderPasswordSecurity();
            case 2:
                return renderTargetPreferences();
            case 3:
                return renderConfirmation();
            default:
                return renderBasicInfo();
        }
    };

    // Check email uniqueness
    const checkEmailExists = async (email) => {
        try {
            const response = await axios.post('/api/check-email', { email });
            setEmailExists(response.data.exists);
        } catch (error) {
            console.error('Error checking email:', error);
        }
    };

    // Check phone uniqueness
    const checkPhoneExists = async (phone) => {
        try {
            const response = await axios.post('/api/check-phone', { phone });
            setPhoneExists(response.data.exists);
        } catch (error) {
            console.error('Error checking phone:', error);
        }
    };

    const handleNext = async () => {
        try {
            const values = await form.validateFields();
            setFormData(prev => ({ ...prev, ...values }));

            // Check email and phone uniqueness on step 0
            if (currentStep === 0) {
                await checkEmailExists(values.email);
                await checkPhoneExists(values.phone);

                if (emailExists || phoneExists) {
                    return;
                }
            }

            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        setError('');

        try {
            const submitData = { ...formData, ...values };
            delete submitData.password_confirmation;

            const response = await axios.post('/api/register', submitData);

            setWelcomeMessage(response.data.message);

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                setError(errorMessages.join('. '));
            } else {
                setError(error.response?.data?.message || 'Terjadi kesalahan saat mendaftar');
            }
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Informasi Dasar',
            description: 'Data pribadi',
            icon: <UserOutlined />
        },
        {
            title: 'Keamanan',
            description: 'Password',
            icon: <LockOutlined />
        },
        {
            title: 'Preferensi',
            description: 'Target ujian',
            icon: <AimOutlined />
        },
        {
            title: 'Konfirmasi',
            description: 'Review data',
            icon: <CheckCircleOutlined />
        }
    ];

    if (welcomeMessage) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f1fe 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <Card style={{ textAlign: 'center', maxWidth: 500 }}>
                    <CheckCircleOutlined
                        style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }}
                    />
                    <Title level={2} style={{ color: '#52c41a' }}>
                        Pendaftaran Berhasil!
                    </Title>
                    <Paragraph>
                        {welcomeMessage}
                    </Paragraph>
                    <Paragraph type="secondary">
                        Anda akan dialihkan ke dashboard dalam beberapa detik...
                    </Paragraph>
                </Card>
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
                <Col xs={24} sm={22} md={20} lg={16} xl={14}>
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
                                width="120"
                                style={{ marginBottom: '16px' }}
                            />
                            <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
                                Daftar Zona Lulus
                            </Title>
                            <Text type="secondary">
                                Persiapkan diri untuk seleksi TNI/POLRI & Kedinasan
                            </Text>
                        </div>

                        {/* Progress Steps */}
                        <Steps current={currentStep} size="small" style={{ marginBottom: 32 }}>
                            {steps.map((step, index) => (
                                <Step
                                    key={index}
                                    title={step.title}
                                    description={step.description}
                                    icon={step.icon}
                                />
                            ))}
                        </Steps>

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
                            size="large"
                            onFinish={currentStep === 3 ? handleSubmit : handleNext}
                        >
                            {renderStepContent()}

                            {/* Navigation Buttons */}
                            <div style={{ marginTop: 32, textAlign: 'right' }}>
                                <Space>
                                    {currentStep > 0 && (
                                        <Button onClick={handlePrev} disabled={loading}>
                                            Sebelumnya
                                        </Button>
                                    )}

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        disabled={emailExists || phoneExists}
                                        style={{
                                            backgroundColor: '#2c3e50',
                                            borderColor: '#2c3e50'
                                        }}
                                    >
                                        {currentStep === 3 ? 'DAFTAR SEKARANG' : 'Selanjutnya'}
                                    </Button>
                                </Space>
                            </div>
                        </Form>

                        {/* Footer */}
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Text type="secondary">
                                Sudah punya akun?{' '}
                                <Link to="/login" style={{ color: '#1890ff' }}>
                                    Masuk di sini
                                </Link>
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Terms Modal */}
            <Modal
                title="Syarat & Ketentuan"
                open={termsModalVisible}
                onCancel={() => setTermsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setTermsModalVisible(false)}>
                        Tutup
                    </Button>
                ]}
                width={600}
            >
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <Title level={5}>1. Penerimaan Syarat</Title>
                    <Text>
                        Dengan mendaftar dan menggunakan layanan Zona Lulus, Anda menyetujui untuk terikat dengan syarat dan ketentuan berikut.
                    </Text>

                    <Title level={5} style={{ marginTop: 16 }}>2. Penggunaan Layanan</Title>
                    <Text>
                        Layanan ini ditujukan untuk membantu persiapan seleksi TNI, POLRI, dan kedinasan. Pengguna bertanggung jawab untuk menggunakan platform dengan bijak.
                    </Text>

                    <Title level={5} style={{ marginTop: 16 }}>3. Keamanan Akun</Title>
                    <Text>
                        Pengguna bertanggung jawab menjaga kerahasiaan akun dan password. Segera laporkan jika terjadi penggunaan tidak sah.
                    </Text>

                    <Title level={5} style={{ marginTop: 16 }}>4. Pembayaran</Title>
                    <Text>
                        Pembayaran dilakukan sesuai dengan paket yang dipilih. Refund dapat dilakukan sesuai kebijakan yang berlaku.
                    </Text>

                    <Title level={5} style={{ marginTop: 16 }}>5. Konten</Title>
                    <Text>
                        Semua materi pembelajaran adalah milik Zona Lulus dan tidak boleh disebarluaskan tanpa izin.
                    </Text>
                </div>
            </Modal>
        </div>
    );
};

export default Register;
