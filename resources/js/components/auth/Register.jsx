import {useState} from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Steps,
    Row,
    Col,
    Checkbox,
    Progress,
    Alert,
    Space,
    Modal,
    DatePicker,
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    LockOutlined,
    EyeTwoTone,
    EyeInvisibleOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {ROUTES} from '../../constants/routes';

const {Title, Text, Paragraph} = Typography;
const {Step} = Steps;

const Register = () => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [termsModalVisible, setTermsModalVisible] = useState(false);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const [error, setError] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const navigate = useNavigate();

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
            <Title level={4} style={{textAlign: 'center', marginBottom: 24}}>
                <UserOutlined style={{marginRight: 8}}/>
                Informasi Dasar
            </Title>

            <Form.Item
                name="name"
                label="Nama Lengkap"
                rules={[
                    {required: true, message: 'Nama lengkap wajib diisi!'},
                    {min: 2, message: 'Nama minimal 2 karakter!'},
                ]}
            >
                <Input
                    prefix={<UserOutlined/>}
                    placeholder="Masukkan nama lengkap"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="email"
                label="Email"
                rules={[
                    {required: true, message: 'Email wajib diisi!'},
                    {type: 'email', message: 'Format email tidak valid!'},
                ]}
            >
                <Input
                    prefix={<MailOutlined/>}
                    placeholder="Masukkan email"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="phone"
                label="Nomor HP"
                rules={[
                    {required: true, message: 'Nomor HP wajib diisi!'},
                    {pattern: /^[0-9]{8,15}$/, message: 'Nomor HP harus 8-15 digit!'},
                ]}
            >
                <Input
                    prefix={<PhoneOutlined/>}
                    placeholder="Contoh: 08123456789"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="birth_date"
                label="Tanggal Lahir"
                rules={[
                    {required: true, message: 'Tanggal lahir wajib diisi!'},
                    {
                        validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            const age = new Date().getFullYear() - value.year();
                            if (age < 17) {
                                return Promise.reject(new Error('Umur minimal 17 tahun!'));
                            }
                            if (age > 35) {
                                return Promise.reject(new Error('Umur maksimal 35 tahun untuk seleksi kedinasan!'));
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
            >
                <DatePicker
                    style={{width: '100%'}}
                    placeholder="Pilih tanggal lahir"
                    size="large"
                    format="DD-MM-YYYY"
                    suffixIcon={<CalendarOutlined/>}
                    disabledDate={(current) => {
                        const minDate = new Date();
                        minDate.setFullYear(minDate.getFullYear() - 35);
                        const maxDate = new Date();
                        maxDate.setFullYear(maxDate.getFullYear() - 17);
                        return current && (current < minDate || current > maxDate);
                    }}
                />
            </Form.Item>

            <Alert
                message="Persyaratan Umur"
                description="Untuk seleksi TNI, POLRI, dan CPNS umumnya memiliki batas umur 17-35 tahun. Pastikan tanggal lahir Anda sesuai."
                type="info"
                showIcon
                style={{marginTop: 8}}
            />
        </div>
    );

    // Step 2: Password & Security
    const renderPasswordSecurity = () => (
        <div>
            <Title level={4} style={{textAlign: 'center', marginBottom: 24}}>
                <LockOutlined style={{marginRight: 8}}/>
                Keamanan Akun
            </Title>

            <Form.Item
                name="password"
                label="Password"
                rules={[
                    {required: true, message: 'Password wajib diisi!'},
                    {min: 8, message: 'Password minimal 8 karakter!'},
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined/>}
                    placeholder="Masukkan password"
                    size="large"
                    onChange={(e) => setPasswordStrength(calculatePasswordStrength(e.target.value))}
                    iconRender={(visible) => (visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
                />
            </Form.Item>

            {passwordStrength > 0 && (
                <div style={{marginBottom: 16}}>
                    <Progress
                        percent={passwordStrength}
                        strokeColor={getPasswordStrengthColor()}
                        showInfo={false}
                        size="small"
                    />
                    <Text style={{color: getPasswordStrengthColor(), fontSize: '12px'}}>
                        Kekuatan password: {getPasswordStrengthText()}
                    </Text>
                </div>
            )}

            <Form.Item
                name="password_confirmation"
                label="Konfirmasi Password"
                dependencies={['password']}
                rules={[
                    {required: true, message: 'Konfirmasi password wajib diisi!'},
                    ({getFieldValue}) => ({
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
                    prefix={<LockOutlined/>}
                    placeholder="Konfirmasi password"
                    size="large"
                />
            </Form.Item>

            <Alert
                message="Tips Keamanan"
                description={
                    <ul style={{marginBottom: 0, paddingLeft: 20}}>
                        <li>Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
                        <li>Minimal 8 karakter untuk keamanan optimal</li>
                        <li>Jangan gunakan informasi pribadi seperti nama atau tanggal lahir</li>
                    </ul>
                }
                type="info"
                showIcon
                style={{marginTop: 16}}
            />
        </div>
    );

    // Step 3: Confirmation (removed Target & Preferences step)
    const renderConfirmation = () => (
        <div>
            <Title level={4} style={{textAlign: 'center', marginBottom: 24}}>
                <CheckCircleOutlined style={{marginRight: 8}}/>
                Konfirmasi Data
            </Title>

            <Card style={{marginBottom: 24}}>
                <Title level={5}>Informasi Dasar</Title>
                <Row gutter={[16, 8]}>
                    <Col span={8}><Text strong>Nama:</Text></Col>
                    <Col span={16}>{formData.name}</Col>
                    <Col span={8}><Text strong>Email:</Text></Col>
                    <Col span={16}>{formData.email}</Col>
                    <Col span={8}><Text strong>Nomor HP:</Text></Col>
                    <Col span={16}>{formData.phone}</Col>
                    <Col span={8}><Text strong>Tanggal Lahir:</Text></Col>
                    <Col span={16}>
                        {formData.birth_date
                            ? (typeof formData.birth_date === 'string'
                                ? formData.birth_date
                                : formData.birth_date.format('DD-MM-YYYY'))
                            : '-'
                        }
                    </Col>
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
                        style={{padding: 0}}
                        onClick={() => setTermsModalVisible(true)}
                    >
                        Syarat & Ketentuan
                    </Button>{' '}
                    dan{' '}
                    <Button
                        type="link"
                        style={{padding: 0}}
                        onClick={() => setPrivacyModalVisible(true)}
                    >
                        Kebijakan Privasi
                    </Button>
                </Checkbox>
            </Form.Item>
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return renderBasicInfo();
            case 1:
                return renderPasswordSecurity();
            case 2:
                return renderConfirmation();
            default:
                return renderBasicInfo();
        }
    };

    // Check email uniqueness
    const checkEmailExists = async (email) => {
        try {
            const response = await axios.post('/api/check-email', {email});
            return response.data.exists; // Return the value directly
        } catch (error) {
            return false;
        }
    };

    // Check phone uniqueness
    const checkPhoneExists = async (phone) => {
        try {
            const response = await axios.post('/api/check-phone', {phone});
            return response.data.exists;
        } catch (error) {
            return false;
        }
    };

    const handleNext = async () => {
        try {
            const values = await form.validateFields();
            setFormData(prev => ({...prev, ...values}));

            if (currentStep === 0) {
                const emailExistsResult = await checkEmailExists(values.email);
                const phoneExistsResult = await checkPhoneExists(values.phone);

                if (emailExistsResult && phoneExistsResult) {
                    setError('Email dan nomor HP sudah terdaftar. Silakan gunakan email dan nomor HP lain.');
                    return;
                } else if (emailExistsResult) {
                    setError('Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang sudah ada.');
                    return;
                } else if (phoneExistsResult) {
                    setError('Nomor HP sudah terdaftar. Silakan gunakan nomor HP lain.');
                    return;
                }
            }

            setError('');
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
            const submitData = {...formData, ...values};

            if (submitData.birth_date) {
                submitData.birth_date = submitData.birth_date.format('YYYY-MM-DD');
            }

            const response = await axios.post(ROUTES.API.REGISTER, submitData);

            setWelcomeMessage(response.data.message);

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate(ROUTES.LOGIN);
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
            icon: <UserOutlined/>
        },
        {
            title: 'Keamanan',
            description: 'Password',
            icon: <LockOutlined/>
        },
        {
            title: 'Konfirmasi',
            description: 'Review data',
            icon: <CheckCircleOutlined/>
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
                <Card style={{textAlign: 'center', maxWidth: 500}}>
                    <CheckCircleOutlined
                        style={{fontSize: 64, color: '#52c41a', marginBottom: 16}}
                    />
                    <Title level={2} style={{color: '#52c41a'}}>
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
            <Row justify="center" style={{width: '100%'}}>
                <Col xs={24} sm={22} md={20} lg={16} xl={14}>
                    <Card
                        style={{
                            borderRadius: '15px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            border: 'none'
                        }}
                        styles={{body: {padding: '40px'}}}
                    >
                        {/* Header */}
                        <div style={{textAlign: 'center', marginBottom: '32px'}}>
                            <img
                                src="/logo-zona-lulus.png"
                                alt="Zona Lulus"
                                width="120"
                                style={{marginBottom: '16px'}}
                            />
                            <Title level={2} style={{color: '#1890ff', marginBottom: '8px'}}>
                                Daftar Zona Lulus
                            </Title>
                            <Text type="secondary">
                                Persiapkan diri untuk seleksi TNI/POLRI & Kedinasan
                            </Text>
                        </div>

                        {/* Progress Steps */}
                        <Steps current={currentStep} size="small" style={{marginBottom: 32}}>
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
                                style={{marginBottom: '24px'}}
                            />
                        )}

                        {/* Form */}
                        <Form
                            form={form}
                            layout="vertical"
                            size="large"
                            onFinish={currentStep === 2 ? handleSubmit : handleNext}
                        >
                            {renderStepContent()}

                            {/* Navigation Buttons */}
                            <div style={{marginTop: 32, textAlign: 'right'}}>
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
                                        style={{
                                            backgroundColor: '#2c3e50',
                                            borderColor: '#2c3e50'
                                        }}
                                    >
                                        {currentStep === 2 ? 'Daftar Sekarang' : 'Selanjutnya'}
                                    </Button>
                                </Space>
                            </div>
                        </Form>

                        {/* Footer */}
                        <div style={{textAlign: 'center', marginTop: '24px'}}>
                            <Text type="secondary">
                                Sudah punya akun?{' '}
                                <Link to={ROUTES.LOGIN} style={{color: '#1890ff'}}>
                                    Masuk di sini
                                </Link>
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Terms & Conditions Modal */}
            <Modal
                title="Syarat & Ketentuan"
                open={termsModalVisible}
                onCancel={() => setTermsModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setTermsModalVisible(false)}>
                        Tutup
                    </Button>
                ]}
                width={700}
            >
                <div style={{maxHeight: 500, overflowY: 'auto', padding: '0 16px'}}>
                    <Title level={5}>1. Penerimaan Syarat</Title>
                    <Paragraph>
                        Dengan mendaftar dan menggunakan layanan Zona Lulus ("Platform"), Anda menyetujui untuk terikat
                        dengan syarat dan ketentuan berikut ini. Jika Anda tidak menyetujui syarat dan ketentuan ini,
                        mohon untuk tidak menggunakan layanan kami.
                    </Paragraph>

                    <Title level={5}>2. Layanan yang Disediakan</Title>
                    <Paragraph>
                        Zona Lulus menyediakan platform pembelajaran online yang khusus dirancang untuk membantu
                        persiapan seleksi TNI, POLRI, dan instansi kedinasan lainnya. Layanan kami meliputi:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Materi pembelajaran dan modul pelatihan</li>
                        <li>Bank soal dan simulasi ujian</li>
                        <li>Tryout online dengan sistem penilaian</li>
                        <li>Analisis hasil dan rekomendasi belajar</li>
                        <li>Forum diskusi dan konsultasi</li>
                    </ul>

                    <Title level={5}>3. Akun Pengguna</Title>
                    <Paragraph>
                        Untuk menggunakan layanan kami, Anda harus:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Berusia minimal 17 tahun dan maksimal 35 tahun</li>
                        <li>Memberikan informasi yang akurat dan lengkap saat pendaftaran</li>
                        <li>Menjaga kerahasiaan password dan informasi akun</li>
                        <li>Segera melaporkan jika terjadi penggunaan tidak sah pada akun Anda</li>
                        <li>Bertanggung jawab atas semua aktivitas yang terjadi di akun Anda</li>
                    </ul>

                    <Title level={5}>4. Penggunaan Platform</Title>
                    <Paragraph>
                        Anda dilarang untuk:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Menyebarluaskan, menjual, atau mendistribusikan materi pembelajaran tanpa izin</li>
                        <li>Melakukan kecurangan dalam ujian atau tryout</li>
                        <li>Menggunakan bot, script, atau alat otomatis lainnya</li>
                        <li>Mengganggu atau merusak sistem platform</li>
                        <li>Berbagi akun dengan orang lain</li>
                        <li>Melakukan tindakan yang melanggar hukum atau norma</li>
                    </ul>

                    <Title level={5}>5. Pembayaran dan Langganan</Title>
                    <Paragraph>
                        Pembayaran dilakukan sesuai dengan paket yang dipilih. Ketentuan pembayaran:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Pembayaran harus dilakukan sebelum mengakses konten premium</li>
                        <li>Harga dapat berubah sewaktu-waktu dengan pemberitahuan sebelumnya</li>
                        <li>Refund dapat dilakukan dalam 7 hari setelah pembelian dengan syarat tertentu</li>
                        <li>Akses akan dihentikan jika pembayaran berlangganan terlambat</li>
                    </ul>

                    <Title level={5}>6. Hak Kekayaan Intelektual</Title>
                    <Paragraph>
                        Semua materi, konten, dan fitur di platform ini adalah milik Zona Lulus dan dilindungi
                        oleh hak cipta. Anda tidak diperkenankan untuk menyalin, memodifikasi, atau mendistribusikan
                        konten tanpa izin tertulis dari kami.
                    </Paragraph>

                    <Title level={5}>7. Batasan Tanggung Jawab</Title>
                    <Paragraph>
                        Zona Lulus tidak bertanggung jawab atas:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Kelulusan atau kegagalan dalam seleksi sesungguhnya</li>
                        <li>Gangguan teknis atau kerusakan perangkat</li>
                        <li>Kerugian langsung atau tidak langsung dari penggunaan platform</li>
                        <li>Keterlambatan atau kesalahan informasi dari pihak ketiga</li>
                    </ul>

                    <Title level={5}>8. Pemutusan Layanan</Title>
                    <Paragraph>
                        Kami berhak menghentikan atau menangguhkan akses Anda jika:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Melanggar syarat dan ketentuan ini</li>
                        <li>Melakukan tindakan yang merugikan platform atau pengguna lain</li>
                        <li>Tidak melakukan pembayaran sesuai ketentuan</li>
                        <li>Memberikan informasi palsu atau menyesatkan</li>
                    </ul>

                    <Title level={5}>9. Perubahan Syarat</Title>
                    <Paragraph>
                        Zona Lulus berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan
                        diberitahukan melalui platform dan berlaku efektif setelah dipublikasikan.
                    </Paragraph>

                    <Title level={5}>10. Hukum yang Berlaku</Title>
                    <Paragraph>
                        Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Setiap sengketa akan
                        diselesaikan melalui mediasi atau pengadilan yang berwenang di Indonesia.
                    </Paragraph>

                    <Text type="secondary" style={{fontSize: '12px'}}>
                        Terakhir diperbarui: Januari 2025
                    </Text>
                </div>
            </Modal>

            {/* Privacy Policy Modal */}
            <Modal
                title="Kebijakan Privasi"
                open={privacyModalVisible}
                onCancel={() => setPrivacyModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setPrivacyModalVisible(false)}>
                        Tutup
                    </Button>
                ]}
                width={700}
            >
                <div style={{maxHeight: 500, overflowY: 'auto', padding: '0 16px'}}>
                    <Title level={5}>1. Informasi yang Kami Kumpulkan</Title>
                    <Paragraph>
                        Zona Lulus mengumpulkan informasi berikut untuk memberikan layanan terbaik:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li><strong>Informasi Pribadi:</strong> Nama, email, nomor telepon, tanggal lahir</li>
                        <li><strong>Informasi Akademik:</strong> Riwayat pendidikan, hasil ujian, progress belajar</li>
                        <li><strong>Data Teknis:</strong> Alamat IP, jenis perangkat, browser, waktu akses</li>
                        <li><strong>Data Aktivitas:</strong> Halaman yang dikunjungi, waktu belajar, interaksi dengan konten</li>
                        <li><strong>Informasi Pembayaran:</strong> Data transaksi (tidak menyimpan data kartu kredit)</li>
                    </ul>

                    <Title level={5}>2. Cara Kami Menggunakan Informasi</Title>
                    <Paragraph>
                        Informasi yang dikumpulkan digunakan untuk:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Menyediakan dan meningkatkan layanan platform</li>
                        <li>Personalisasi pengalaman belajar</li>
                        <li>Memproses pembayaran dan transaksi</li>
                        <li>Mengirim notifikasi dan update penting</li>
                        <li>Analisis penggunaan untuk pengembangan fitur</li>
                        <li>Memberikan dukungan teknis dan customer service</li>
                        <li>Mencegah fraud dan menjaga keamanan platform</li>
                    </ul>

                    <Title level={5}>3. Berbagi Informasi dengan Pihak Ketiga</Title>
                    <Paragraph>
                        Kami tidak menjual atau menyewakan data pribadi Anda. Namun, kami dapat berbagi informasi dengan:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li><strong>Penyedia Layanan:</strong> Payment gateway, layanan email, cloud storage</li>
                        <li><strong>Mitra Pendidikan:</strong> Untuk program kerja sama tertentu (dengan persetujuan)</li>
                        <li><strong>Otoritas Hukum:</strong> Jika diwajibkan oleh hukum atau proses pengadilan</li>
                        <li><strong>Analitik:</strong> Data anonim untuk analisis statistik dan research</li>
                    </ul>

                    <Title level={5}>4. Keamanan Data</Title>
                    <Paragraph>
                        Kami menerapkan langkah-langkah keamanan untuk melindungi data Anda:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Enkripsi data saat transmisi dan penyimpanan</li>
                        <li>Sistem autentikasi berlapis</li>
                        <li>Monitoring keamanan 24/7</li>
                        <li>Backup data secara berkala</li>
                        <li>Akses terbatas hanya untuk staff yang berwenang</li>
                        <li>Update keamanan sistem secara rutin</li>
                    </ul>

                    <Title level={5}>5. Hak Anda atas Data Pribadi</Title>
                    <Paragraph>
                        Anda memiliki hak untuk:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Mengakses dan melihat data pribadi yang tersimpan</li>
                        <li>Memperbarui atau mengoreksi informasi yang tidak akurat</li>
                        <li>Menghapus akun dan data pribadi (dengan syarat tertentu)</li>
                        <li>Membatasi pemrosesan data untuk tujuan tertentu</li>
                        <li>Mengunduh data pribadi dalam format yang dapat dibaca</li>
                        <li>Menarik persetujuan penggunaan data (dapat membatasi layanan)</li>
                    </ul>

                    <Title level={5}>6. Cookies dan Teknologi Pelacakan</Title>
                    <Paragraph>
                        Kami menggunakan cookies untuk:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Menjaga sesi login Anda</li>
                        <li>Mengingat preferensi dan pengaturan</li>
                        <li>Analisis penggunaan website</li>
                        <li>Personalisasi konten dan iklan</li>
                        <li>Meningkatkan kinerja dan keamanan platform</li>
                    </ul>
                    <Paragraph>
                        Anda dapat mengatur penggunaan cookies melalui browser Anda.
                    </Paragraph>

                    <Title level={5}>7. Penyimpanan Data</Title>
                    <Paragraph>
                        Data pribadi Anda disimpan selama:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Akun aktif: Selama akun masih digunakan</li>
                        <li>Setelah penghapusan akun: 30 hari untuk backup dan recovery</li>
                        <li>Data transaksi: 5 tahun untuk keperluan audit dan pajak</li>
                        <li>Data anonim: Dapat disimpan untuk research dan analisis</li>
                    </ul>

                    <Title level={5}>8. Transfer Data Internasional</Title>
                    <Paragraph>
                        Beberapa data mungkin diproses di server luar Indonesia (cloud providers internasional).
                        Kami memastikan transfer ini sesuai dengan standar keamanan internasional dan regulasi
                        yang berlaku.
                    </Paragraph>

                    <Title level={5}>9. Privasi Anak</Title>
                    <Paragraph>
                        Platform ini ditujukan untuk pengguna berusia 17 tahun ke atas. Kami tidak secara
                        sengaja mengumpulkan data pribadi dari anak di bawah umur tanpa persetujuan orang tua.
                    </Paragraph>

                    <Title level={5}>10. Perubahan Kebijakan Privasi</Title>
                    <Paragraph>
                        Kebijakan privasi ini dapat berubah sewaktu-waktu. Perubahan signifikan akan diberitahukan
                        melalui email atau notifikasi di platform. Penggunaan platform setelah perubahan berarti
                        Anda menyetujui kebijakan yang baru.
                    </Paragraph>

                    <Title level={5}>11. Kontak</Title>
                    <Paragraph>
                        Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menggunakan hak
                        Anda atas data pribadi, hubungi kami di:
                    </Paragraph>
                    <ul style={{paddingLeft: 20}}>
                        <li>Email: privacy@zonalulus.com</li>
                        <li>Phone: 021-1234-5678</li>
                        <li>Address: Jakarta, Indonesia</li>
                    </ul>

                    <Text type="secondary" style={{fontSize: '12px'}}>
                        Terakhir diperbarui: Januari 2025
                    </Text>
                </div>
            </Modal>
        </div>
    );
};

export default Register;
