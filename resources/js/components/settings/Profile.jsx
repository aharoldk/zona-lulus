import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Form,
    Input,
    Button,
    Avatar,
    Upload,
    Switch,
    Select,
    Divider,
    Space,
    message,
    Spin,
    Alert,
    DatePicker,
    Tabs,
    Progress,
    Badge,
    Modal,
    List,
    Tag,
    Statistic,
    Radio,
    Slider,
    Timeline,
    Tooltip,
    Image,
    Popconfirm
} from 'antd';
import {
    UserOutlined,
    UploadOutlined,
    SaveOutlined,
    LockOutlined,
    BellOutlined,
    SettingOutlined,
    EditOutlined,
    CameraOutlined,
    TrophyOutlined,
    BookOutlined,
    CalendarOutlined,
    SecurityScanOutlined,
    EyeOutlined,
    HistoryOutlined,
    GlobalOutlined,
    MobileOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    IdcardOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

export default function Profile() {
    const { user, setUser } = useAuth();
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [settingsForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [profileStats, setProfileStats] = useState({});
    const [activityHistory, setActivityHistory] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: true,
            sms: false,
            study_reminders: true,
            achievement_alerts: true,
            weekly_reports: true
        },
        privacy: {
            profile_visibility: 'public',
            show_progress: true,
            show_achievements: true,
            allow_messages: true
        },
        preferences: {
            language: 'id',
            timezone: 'Asia/Jakarta',
            theme: 'light',
            auto_save: true,
            sound_effects: true
        }
    });

    useEffect(() => {
        fetchProfileData();
        fetchProfileStats();
        fetchActivityHistory();
        fetchAchievements();
    }, []);

    const fetchProfileData = async () => {
        try {
            setProfileLoading(true);
            const response = await api.get('/profile');

            if (response.data.success) {
                const data = response.data.data;
                setProfileData(data);
                setAvatarUrl(data.avatar);

                // Populate form with existing data
                form.setFieldsValue({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    birthDate: data.birth_date ? dayjs(data.birth_date) : null,
                    address: data.address,
                    education: data.education,
                    target: data.target
                });
            } else {
                setError('Failed to load profile data');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to connect to server');
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchProfileStats = async () => {
        try {
            // Mock data - replace with actual API call
            setProfileStats({
                completionPercentage: 75,
                totalStudyHours: 245,
                coursesCompleted: 8,
                testsCompleted: 23,
                averageScore: 82.5,
                streak: 12,
                totalPoints: 1540,
                rank: 15
            });
        } catch (error) {
            console.error('Error fetching profile stats:', error);
        }
    };

    const fetchActivityHistory = async () => {
        try {
            // Mock data - replace with actual API call
            setActivityHistory([
                {
                    id: 1,
                    type: 'test_completed',
                    title: 'Completed Matematika Dasar Test',
                    description: 'Score: 85/100',
                    timestamp: dayjs().subtract(2, 'hours'),
                    icon: <BookOutlined />,
                    color: '#52c41a'
                },
                {
                    id: 2,
                    type: 'achievement',
                    title: 'Earned "Study Streak" Badge',
                    description: '7 days continuous learning',
                    timestamp: dayjs().subtract(1, 'day'),
                    icon: <TrophyOutlined />,
                    color: '#faad14'
                },
                {
                    id: 3,
                    type: 'course_started',
                    title: 'Started Bahasa Indonesia Course',
                    description: 'Progress: 25%',
                    timestamp: dayjs().subtract(3, 'days'),
                    icon: <BookOutlined />,
                    color: '#1890ff'
                }
            ]);
        } catch (error) {
            console.error('Error fetching activity history:', error);
        }
    };

    const fetchAchievements = async () => {
        try {
            // Mock data - replace with actual API call
            setAchievements([
                {
                    id: 1,
                    name: 'First Steps',
                    description: 'Complete your first test',
                    icon: '🎯',
                    earned: true,
                    earnedDate: '2025-06-15'
                },
                {
                    id: 2,
                    name: 'Study Streak',
                    description: 'Study for 7 consecutive days',
                    icon: '🔥',
                    earned: true,
                    earnedDate: '2025-06-28'
                },
                {
                    id: 3,
                    name: 'High Scorer',
                    description: 'Score above 90% in any test',
                    icon: '⭐',
                    earned: false,
                    progress: 85
                },
                {
                    id: 4,
                    name: 'Course Master',
                    description: 'Complete 10 courses',
                    icon: '📚',
                    earned: false,
                    progress: 80
                }
            ]);
        } catch (error) {
            console.error('Error fetching achievements:', error);
        }
    };

    const handleSave = async (values) => {
        setLoading(true);
        try {
            const formattedValues = {
                ...values,
                birth_date: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null
            };
            delete formattedValues.birthDate;

            const response = await api.put('/profile', formattedValues);

            if (response.data.success) {
                message.success('Profil berhasil diperbarui!');
                setUser(response.data.data);
                fetchProfileData();
            } else {
                message.error('Gagal memperbarui profil');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.data?.errors) {
                Object.keys(error.response.data.errors).forEach(field => {
                    form.setFields([{
                        name: field,
                        errors: error.response.data.errors[field]
                    }]);
                });
            } else {
                message.error('Gagal memperbarui profil');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (values) => {
        setLoading(true);
        try {
            const response = await api.put('/profile/password', {
                current_password: values.currentPassword,
                new_password: values.newPassword,
                new_password_confirmation: values.confirmPassword
            });

            if (response.data.success) {
                message.success('Password berhasil diubah!');
                passwordForm.resetFields();
            } else {
                message.error(response.data.message || 'Gagal mengubah password');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Gagal mengubah password');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsUpdate = async (category, key, value) => {
        try {
            const newSettings = {
                ...settings,
                [category]: {
                    ...settings[category],
                    [key]: value
                }
            };
            setSettings(newSettings);

            const response = await api.put('/profile/settings', {
                category,
                key,
                value
            });

            if (response.data.success) {
                message.success('Pengaturan berhasil diperbarui!');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            message.error('Gagal memperbarui pengaturan');
        }
    };

    const handleAvatarUpload = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.post('/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                message.success('Foto profil berhasil diperbarui!');
                setAvatarUrl(response.data.data.avatar_url);
            } else {
                message.error('Gagal mengupload foto');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            message.error('Gagal mengupload foto');
        }

        return false;
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await api.delete('/profile');
            if (response.data.success) {
                message.success('Akun berhasil dihapus');
                // Redirect to login or handle logout
            }
        } catch (error) {
            message.error('Gagal menghapus akun');
        }
    };

    // Profile completion calculation
    const calculateProfileCompletion = () => {
        if (!profileData) return 0;
        const fields = ['name', 'email', 'phone', 'birth_date', 'address', 'education', 'target'];
        const completed = fields.filter(field => profileData[field]).length;
        return Math.round((completed / fields.length) * 100);
    };

    const ProfileHeader = () => (
        <Card style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]} align="middle">
                <Col xs={24} sm={8} md={6} lg={4}>
                    <div style={{ textAlign: 'center' }}>
                        <Badge
                            count={
                                <Button
                                    type="primary"
                                    shape="circle"
                                    size="small"
                                    icon={<CameraOutlined />}
                                    onClick={() => document.getElementById('avatar-upload').click()}
                                />
                            }
                            offset={[-10, 10]}
                        >
                            <Avatar
                                size={100}
                                src={avatarUrl}
                                icon={<UserOutlined />}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setPreviewVisible(true)}
                            />
                        </Badge>
                        <Upload
                            id="avatar-upload"
                            showUploadList={false}
                            beforeUpload={handleAvatarUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                        >
                            <input type="file" style={{ display: 'none' }} />
                        </Upload>
                    </div>
                </Col>
                <Col xs={24} sm={16} md={18} lg={20}>
                    <div>
                        <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                            {profileData?.name || user?.name}
                            {profileData?.verified && (
                                <CheckCircleOutlined
                                    style={{ color: '#52c41a', marginLeft: 8, fontSize: '20px' }}
                                />
                            )}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: 12 }}>
                            {profileData?.email || user?.email}
                        </Text>
                        <Space wrap>
                            <Tag color="blue">{profileData?.target || 'Belum diset'}</Tag>
                            <Tag color="green">Aktif sejak {dayjs(profileData?.created_at).format('MMMM YYYY')}</Tag>
                            <Tag color="purple">Level {Math.floor((profileStats.totalPoints || 0) / 100) + 1}</Tag>
                        </Space>
                        <div style={{ marginTop: 16 }}>
                            <Text strong>Profile Completion: </Text>
                            <Progress
                                percent={calculateProfileCompletion()}
                                size="small"
                                style={{ width: '200px', display: 'inline-block', marginLeft: 8 }}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
        </Card>
    );

    const StatsCards = () => (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={6}>
                <Card size="small">
                    <Statistic
                        title="Study Hours"
                        value={profileStats.totalStudyHours}
                        prefix={<ClockCircleOutlined />}
                        suffix="hrs"
                    />
                </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
                <Card size="small">
                    <Statistic
                        title="Tests Completed"
                        value={profileStats.testsCompleted}
                        prefix={<BookOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
                <Card size="small">
                    <Statistic
                        title="Average Score"
                        value={profileStats.averageScore}
                        prefix={<TrophyOutlined />}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
                <Card size="small">
                    <Statistic
                        title="Current Streak"
                        value={profileStats.streak}
                        prefix={<StarOutlined />}
                        suffix="days"
                        valueStyle={{ color: '#faad14' }}
                    />
                </Card>
            </Col>
        </Row>
    );

    const PersonalInfoTab = () => (
        <Card title="Informasi Personal" extra={<EditOutlined />}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={profileData}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="name"
                            label="Nama Lengkap"
                            rules={[{ required: true, message: 'Nama lengkap wajib diisi' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Masukkan nama lengkap" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Email wajib diisi' },
                                { type: 'email', message: 'Format email tidak valid' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Masukkan email" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="phone"
                            label="Nomor Telepon"
                            rules={[{ required: true, message: 'Nomor telepon wajib diisi' }]}
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="Masukkan nomor telepon" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="birthDate"
                            label="Tanggal Lahir"
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="Pilih tanggal lahir"
                                format="DD/MM/YYYY"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item
                            name="address"
                            label="Alamat"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Masukkan alamat lengkap"
                                prefix={<HomeOutlined />}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="education"
                            label="Pendidikan Terakhir"
                        >
                            <Select placeholder="Pilih pendidikan terakhir">
                                <Option value="sma">SMA/SMK</Option>
                                <Option value="d3">Diploma 3</Option>
                                <Option value="s1">Sarjana (S1)</Option>
                                <Option value="s2">Magister (S2)</Option>
                                <Option value="s3">Doktor (S3)</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="target"
                            label="Target Ujian"
                        >
                            <Select placeholder="Pilih target ujian">
                                <Option value="tni">TNI</Option>
                                <Option value="polri">POLRI</Option>
                                <Option value="cpns">CPNS</Option>
                                <Option value="bumn">BUMN</Option>
                                <Option value="lainnya">Lainnya</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item
                            name="bio"
                            label="Bio"
                        >
                            <TextArea
                                rows={4}
                                placeholder="Ceritakan sedikit tentang diri Anda..."
                                maxLength={300}
                                showCount
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                        size="large"
                    >
                        Simpan Perubahan
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );

    const SecurityTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Ubah Password" extra={<LockOutlined />}>
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                >
                    <Form.Item
                        name="currentPassword"
                        label="Password Saat Ini"
                        rules={[{ required: true, message: 'Password saat ini wajib diisi' }]}
                    >
                        <Input.Password placeholder="Masukkan password saat ini" />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="Password Baru"
                        rules={[
                            { required: true, message: 'Password baru wajib diisi' },
                            { min: 6, message: 'Password minimal 6 karakter' }
                        ]}
                    >
                        <Input.Password placeholder="Masukkan password baru" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Konfirmasi Password Baru"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Konfirmasi password wajib diisi' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Password tidak cocok'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Konfirmasi password baru" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<SaveOutlined />}
                        >
                            Ubah Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Keamanan Akun" extra={<SecurityScanOutlined />}>
                <List>
                    <List.Item>
                        <List.Item.Meta
                            title="Two-Factor Authentication"
                            description="Tambahkan lapisan keamanan ekstra untuk akun Anda"
                        />
                        <Switch defaultChecked={false} />
                    </List.Item>
                    <List.Item>
                        <List.Item.Meta
                            title="Login Alerts"
                            description="Dapatkan notifikasi ketika ada login dari perangkat baru"
                        />
                        <Switch defaultChecked={true} />
                    </List.Item>
                    <List.Item>
                        <List.Item.Meta
                            title="Session Management"
                            description="Kelola sesi login aktif Anda"
                        />
                        <Button>Lihat Sesi</Button>
                    </List.Item>
                </List>
            </Card>

            <Card title="Zona Bahaya" type="inner">
                <Alert
                    message="Hapus Akun"
                    description="Tindakan ini akan menghapus akun Anda secara permanen dan tidak dapat dibatalkan."
                    type="warning"
                    showIcon
                    action={
                        <Popconfirm
                            title="Hapus akun?"
                            description="Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan."
                            onConfirm={handleDeleteAccount}
                            okText="Ya, Hapus"
                            cancelText="Batal"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger>Hapus Akun</Button>
                        </Popconfirm>
                    }
                />
            </Card>
        </Space>
    );

    const NotificationSettingsTab = () => (
        <Card title="Pengaturan Notifikasi" extra={<BellOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <Title level={4}>Email Notifications</Title>
                    <List>
                        <List.Item>
                            <List.Item.Meta
                                title="Study Reminders"
                                description="Pengingat untuk jadwal belajar"
                            />
                            <Switch
                                checked={settings.notifications.study_reminders}
                                onChange={(checked) => handleSettingsUpdate('notifications', 'study_reminders', checked)}
                            />
                        </List.Item>
                        <List.Item>
                            <List.Item.Meta
                                title="Achievement Alerts"
                                description="Notifikasi ketika mendapat prestasi baru"
                            />
                            <Switch
                                checked={settings.notifications.achievement_alerts}
                                onChange={(checked) => handleSettingsUpdate('notifications', 'achievement_alerts', checked)}
                            />
                        </List.Item>
                        <List.Item>
                            <List.Item.Meta
                                title="Weekly Reports"
                                description="Laporan kemajuan mingguan"
                            />
                            <Switch
                                checked={settings.notifications.weekly_reports}
                                onChange={(checked) => handleSettingsUpdate('notifications', 'weekly_reports', checked)}
                            />
                        </List.Item>
                    </List>
                </div>

                <Divider />

                <div>
                    <Title level={4}>Push Notifications</Title>
                    <List>
                        <List.Item>
                            <List.Item.Meta
                                title="Browser Notifications"
                                description="Notifikasi langsung di browser"
                            />
                            <Switch
                                checked={settings.notifications.push}
                                onChange={(checked) => handleSettingsUpdate('notifications', 'push', checked)}
                            />
                        </List.Item>
                        <List.Item>
                            <List.Item.Meta
                                title="SMS Notifications"
                                description="Notifikasi melalui SMS"
                            />
                            <Switch
                                checked={settings.notifications.sms}
                                onChange={(checked) => handleSettingsUpdate('notifications', 'sms', checked)}
                            />
                        </List.Item>
                    </List>
                </div>
            </Space>
        </Card>
    );

    const PreferencesTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Preferensi Umum" extra={<SettingOutlined />}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Bahasa</Text>
                            <Select
                                style={{ width: '100%' }}
                                value={settings.preferences.language}
                                onChange={(value) => handleSettingsUpdate('preferences', 'language', value)}
                            >
                                <Option value="id">Bahasa Indonesia</Option>
                                <Option value="en">English</Option>
                            </Select>
                        </Space>
                    </Col>
                    <Col xs={24} md={12}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Zona Waktu</Text>
                            <Select
                                style={{ width: '100%' }}
                                value={settings.preferences.timezone}
                                onChange={(value) => handleSettingsUpdate('preferences', 'timezone', value)}
                            >
                                <Option value="Asia/Jakarta">WIB (Jakarta)</Option>
                                <Option value="Asia/Makassar">WITA (Makassar)</Option>
                                <Option value="Asia/Jayapura">WIT (Jayapura)</Option>
                            </Select>
                        </Space>
                    </Col>
                    <Col xs={24} md={12}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Tema</Text>
                            <Radio.Group
                                value={settings.preferences.theme}
                                onChange={(e) => handleSettingsUpdate('preferences', 'theme', e.target.value)}
                            >
                                <Radio value="light">Terang</Radio>
                                <Radio value="dark">Gelap</Radio>
                                <Radio value="auto">Otomatis</Radio>
                            </Radio.Group>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Card title="Privacy Settings">
                <List>
                    <List.Item>
                        <List.Item.Meta
                            title="Profile Visibility"
                            description="Siapa yang dapat melihat profil Anda"
                        />
                        <Select
                            value={settings.privacy.profile_visibility}
                            onChange={(value) => handleSettingsUpdate('privacy', 'profile_visibility', value)}
                            style={{ width: 120 }}
                        >
                            <Option value="public">Public</Option>
                            <Option value="friends">Friends</Option>
                            <Option value="private">Private</Option>
                        </Select>
                    </List.Item>
                    <List.Item>
                        <List.Item.Meta
                            title="Show Progress"
                            description="Tampilkan progress belajar di profil"
                        />
                        <Switch
                            checked={settings.privacy.show_progress}
                            onChange={(checked) => handleSettingsUpdate('privacy', 'show_progress', checked)}
                        />
                    </List.Item>
                    <List.Item>
                        <List.Item.Meta
                            title="Show Achievements"
                            description="Tampilkan prestasi di profil"
                        />
                        <Switch
                            checked={settings.privacy.show_achievements}
                            onChange={(checked) => handleSettingsUpdate('privacy', 'show_achievements', checked)}
                        />
                    </List.Item>
                </List>
            </Card>
        </Space>
    );

    const ActivityTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Aktivitas Terbaru" extra={<HistoryOutlined />}>
                <Timeline>
                    {activityHistory.map((activity) => (
                        <Timeline.Item key={activity.id} color={activity.color}>
                            <div>
                                <Text strong>{activity.title}</Text>
                                <br />
                                <Text type="secondary">{activity.description}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {activity.timestamp.format('DD MMM YYYY, HH:mm')}
                                </Text>
                            </div>
                        </Timeline.Item>
                    ))}
                </Timeline>
            </Card>

            <Card title="Prestasi" extra={<TrophyOutlined />}>
                <Row gutter={[16, 16]}>
                    {achievements.map((achievement) => (
                        <Col xs={12} sm={8} md={6} key={achievement.id}>
                            <Card
                                size="small"
                                style={{
                                    textAlign: 'center',
                                    opacity: achievement.earned ? 1 : 0.5,
                                    border: achievement.earned ? '2px solid #52c41a' : '1px solid #d9d9d9'
                                }}
                            >
                                <div style={{ fontSize: '32px', marginBottom: 8 }}>
                                    {achievement.icon}
                                </div>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                    {achievement.name}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                    {achievement.description}
                                </Text>
                                {achievement.earned ? (
                                    <Tag color="green" style={{ marginTop: 8 }}>
                                        Earned {achievement.earnedDate}
                                    </Tag>
                                ) : (
                                    <Progress
                                        percent={achievement.progress}
                                        size="small"
                                        style={{ marginTop: 8 }}
                                    />
                                )}
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>
        </Space>
    );

    if (profileLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                action={
                    <Button size="small" onClick={fetchProfileData}>
                        Coba Lagi
                    </Button>
                }
            />
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2} style={{ marginBottom: 24 }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Profil Saya
            </Title>

            <ProfileHeader />
            <StatsCards />

            <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
                <TabPane
                    tab={
                        <span>
                            <IdcardOutlined />
                            Personal Info
                        </span>
                    }
                    key="profile"
                >
                    <PersonalInfoTab />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <SecurityScanOutlined />
                            Security
                        </span>
                    }
                    key="security"
                >
                    <SecurityTab />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <BellOutlined />
                            Notifications
                        </span>
                    }
                    key="notifications"
                >
                    <NotificationSettingsTab />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <SettingOutlined />
                            Preferences
                        </span>
                    }
                    key="preferences"
                >
                    <PreferencesTab />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <HistoryOutlined />
                            Activity
                        </span>
                    }
                    key="activity"
                >
                    <ActivityTab />
                </TabPane>
            </Tabs>

            {/* Avatar Preview Modal */}
            <Modal
                visible={previewVisible}
                title="Profile Picture"
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <Image
                    width="100%"
                    src={avatarUrl}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
            </Modal>
        </div>
    );
}
