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
                <TargetOutlined style={{ marginRight: 8 }} />
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
import { useState, useEffect } from 'react';
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
    Divider,
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
                return renderSecurity();
            case 2:
                return renderTargetPreferences();
            case 3:
                return renderConfirmation();
            default:
                return renderBasicInfo();
        }
    };

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
    EyeTwoTone
} from '@ant-design/icons';
                        {/* Login Link */}
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
                                    to="/login"

export default function Register() {
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [emailExists, setEmailExists] = useState(false);
    const [phoneExists, setPhoneExists] = useState(false);
    const [termsModalVisible, setTermsModalVisible] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const { register } = useAuth();

            {/* Terms Modal */}
            <Modal
                title="Syarat & Ketentuan"
                visible={termsModalVisible}
                onCancel={() => setTermsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setTermsModalVisible(false)}>
                        Tutup
                    </Button>
                ]}
                width={600}
            >
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <Title level={4}>Syarat & Ketentuan Penggunaan</Title>
                    <Paragraph>
                        Dengan mendaftar di platform ini, Anda menyetujui untuk:
                    </Paragraph>
                    <ul>
                        <li>Memberikan informasi yang akurat dan terkini</li>
                        <li>Menjaga kerahasiaan akun dan password Anda</li>
                        <li>Menggunakan platform ini untuk tujuan belajar yang sah</li>
                        <li>Menghormati hak cipta dan kekayaan intelektual</li>
                        <li>Tidak menyebarkan konten yang melanggar hukum</li>
                    </ul>

                    <Title level={4}>Kebijakan Privasi</Title>
                    <Paragraph>
                        Kami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda sesuai dengan peraturan yang berlaku.
                    </Paragraph>
                </div>
            </Modal>
    const navigate = useNavigate();

    // Check email availability
    const checkEmailAvailability = async (email) => {
        if (!email || !email.includes('@')) return;

        try {
            // Simulate API call - replace with actual endpoint
            const response = await fetch(`/api/check-email?email=${email}`);
            const data = await response.json();
            setEmailExists(data.exists);
        } catch (error) {
            console.error('Error checking email:', error);
        }
    };

    // Check phone availability
    const checkPhoneAvailability = async (phone) => {
        if (!phone || phone.length < 10) return;

        try {
            // Simulate API call - replace with actual endpoint
            const response = await fetch(`/api/check-phone?phone=${phone}`);
            const data = await response.json();
            setPhoneExists(data.exists);
        } catch (error) {
            console.error('Error checking phone:', error);
        }
    };

    // Calculate password strength
    const calculatePasswordStrength = (password) => {
        if (!password) return 0;

        let strength = 0;
        const checks = [
            /.{8,}/, // At least 8 characters
            /[a-z]/, // Lowercase letter
            /[A-Z]/, // Uppercase letter
            /[0-9]/, // Number
            /[^A-Za-z0-9]/ // Special character
        ];

        checks.forEach(check => {
            if (check.test(password)) strength += 20;
        });

        return strength;
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 40) return '#ff4d4f';
        if (passwordStrength < 80) return '#faad14';
        return '#52c41a';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength < 40) return 'Lemah';
        if (passwordStrength < 60) return 'Sedang';
        if (passwordStrength < 80) return 'Kuat';
        return 'Sangat Kuat';
    };

    const steps = [
        {
            title: 'Informasi Dasar',
            description: 'Data diri dan kontak',
            icon: <UserOutlined />,
        },
        {
            title: 'Keamanan Akun',
            description: 'Password dan verifikasi',
            icon: <SafetyOutlined />,
        },
        {
            title: 'Target & Preferensi',
            description: 'Tujuan belajar Anda',
            icon: <TargetOutlined />,
        },
        {
            title: 'Konfirmasi',
            description: 'Review dan selesaikan',
            icon: <CheckCircleOutlined />,
        }
    ];

    const handleNext = async () => {
        try {
            const values = await form.validateFields();
            setFormData({ ...formData, ...values });
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const finalData = { ...formData, ...form.getFieldsValue() };
            await register(finalData);

            // Show success message and redirect
            setWelcomeMessage(`Selamat datang, ${finalData.name}! Akun Anda berhasil dibuat.`);
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 2000);
        } catch (err) {
            setError(err.message || 'Pendaftaran gagal');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Basic Information
    const renderBasicInfo = () => (
        <div>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Informasi Dasar
            </Title>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="name"
                        label="Nama Lengkap"
                        rules={[
                            { required: true, message: 'Nama lengkap wajib diisi!' },
                            { min: 3, message: 'Nama minimal 3 karakter!' },
                            { pattern: /^[a-zA-Z\s]+$/, message: 'Nama hanya boleh mengandung huruf!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Masukkan nama lengkap"
                            size="large"
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="birth_date"
                        label="Tanggal Lahir"
                        rules={[
                            { required: true, message: 'Tanggal lahir wajib diisi!' },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    const age = dayjs().diff(value, 'year');
                                    if (age < 16) {
                                        return Promise.reject('Usia minimal 16 tahun!');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="Pilih tanggal lahir"
                            size="large"
                            format="DD/MM/YYYY"
                            disabledDate={(current) => current && current > dayjs().subtract(16, 'year')}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: 'Email wajib diisi!' },
                    { type: 'email', message: 'Format email tidak valid!' }
                ]}
                validateStatus={emailExists ? 'error' : ''}
                help={emailExists ? 'Email sudah terdaftar' : ''}
            >
                <Input
                    prefix={<MailOutlined />}
                    placeholder="Masukkan email"
                    size="large"
                    onChange={(e) => {
                        const email = e.target.value;
                        if (email) {
                            checkEmailAvailability(email);
                        }
                    }}
                />
            </Form.Item>

            <Form.Item
                name="phone"
                label="Nomor HP/WhatsApp"
                rules={[
                    { required: true, message: 'Nomor HP wajib diisi!' },
                    { pattern: /^[0-9]{10,15}$/, message: 'Nomor HP harus 10-15 digit!' }
                ]}
                validateStatus={phoneExists ? 'error' : ''}
                help={phoneExists ? 'Nomor HP sudah terdaftar' : 'Pastikan nomor aktif untuk verifikasi'}
            >
                <Input
                    prefix={<PhoneOutlined />}
                    placeholder="08xxxxxxxxxx"
                    size="large"
                    onChange={(e) => {
                        const phone = e.target.value;
                        if (phone) {
                            checkPhoneAvailability(phone);
                        }
                    }}
                />
            </Form.Item>

            <Form.Item
                name="address"
                label="Alamat"
                rules={[
                    { required: true, message: 'Alamat wajib diisi!' },
                    { min: 10, message: 'Alamat minimal 10 karakter!' }
                ]}
            >
                <Input.TextArea
                    rows={3}
                    placeholder="Masukkan alamat lengkap"
                    prefix={<HomeOutlined />}
                />
            </Form.Item>
        </div>
    );

    // Step 2: Security
    const renderSecurity = () => (
        <div>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
                <SafetyOutlined style={{ marginRight: 8 }} />
                Keamanan Akun
            </Title>

            <Form.Item
                name="password"
                label="Password"
                rules={[
                    { required: true, message: 'Password wajib diisi!' },
                    { min: 8, message: 'Password minimal 8 karakter!' },
                    {
                        validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            const strength = calculatePasswordStrength(value);
                            setPasswordStrength(strength);
                            if (strength < 60) {
                                return Promise.reject('Password terlalu lemah!');
                            }
                            return Promise.resolve();
                        }
                    }
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Masukkan password"
                    size="large"

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
