import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Form, Input, Button, Avatar, Upload, Switch, Select, Divider, Space, message, Spin, Alert, DatePicker } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, LockOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function Profile() {
    const { user, setUser } = useAuth();
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfileData();
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
                    birthDate: data.birth_date ? moment(data.birth_date) : null,
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
                setUser(response.data.data); // Update user context
                fetchProfileData(); // Refresh profile data
            } else {
                message.error('Gagal memperbarui profil');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.data?.errors) {
                // Handle validation errors
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
                return false; // Prevent default upload behavior
            } else {
                message.error('Gagal mengupload foto');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            message.error('Gagal mengupload foto');
        }

        return false; // Prevent default upload behavior
    };

    const handleSettingChange = async (settingKey, value) => {
        try {
            const response = await api.put('/profile/settings', {
                [settingKey]: value
            });

            if (response.data.success) {
                message.success('Pengaturan berhasil diperbarui!');
                // Update local profile data
                setProfileData(prev => ({
                    ...prev,
                    settings: {
                        ...prev.settings,
                        [settingKey]: value
                    }
                }));
            } else {
                message.error('Gagal memperbarui pengaturan');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            message.error('Gagal memperbarui pengaturan');
        }
    };

    const uploadProps = {
        name: 'avatar',
        listType: 'picture-card',
        className: 'avatar-uploader',
        showUploadList: false,
        beforeUpload: (file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('Hanya file JPG/PNG yang diizinkan!');
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Ukuran file maksimal 2MB!');
                return false;
            }
            return handleAvatarUpload(file);
        },
    };

    if (profileLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Loading profile...</div>
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
                style={{ margin: '20px 0' }}
                action={
                    <Button size="small" onClick={fetchProfileData}>
                        Retry
                    </Button>
                }
            />
        );
    }

    const renderProfileForm = () => (
        <Card title="Informasi Profil" extra={<SettingOutlined />}>
            <Row gutter={24}>
                <Col xs={24} md={6}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Upload {...uploadProps}>
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                src={avatarUrl}
                            />
                        </Upload>
                        <Button type="link" icon={<UploadOutlined />} style={{ marginTop: '8px' }}>
                            Ubah Foto
                        </Button>
                        {profileData?.created_at && (
                            <div style={{ marginTop: '16px' }}>
                                <Text type="secondary">Bergabung sejak</Text>
                                <br />
                                <Text strong>{profileData.created_at}</Text>
                            </div>
                        )}
                    </div>
                </Col>
                <Col xs={24} md={18}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                    >
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="name"
                                    label="Nama Lengkap"
                                    rules={[{ required: true, message: 'Nama wajib diisi!' }]}
                                >
                                    <Input />
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
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="phone"
                                    label="Nomor HP"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="birthDate"
                                    label="Tanggal Lahir"
                                >
                                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="address"
                            label="Alamat"
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="education"
                                    label="Pendidikan Terakhir"
                                >
                                    <Select placeholder="Pilih pendidikan">
                                        <Option value="sma">SMA/SMK</Option>
                                        <Option value="d3">Diploma III</Option>
                                        <Option value="s1">Sarjana (S1)</Option>
                                        <Option value="s2">Magister (S2)</Option>
                                        <Option value="s3">Doktor (S3)</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="target"
                                    label="Target Seleksi"
                                >
                                    <Select placeholder="Pilih target">
                                        <Option value="tni">TNI</Option>
                                        <Option value="polri">POLRI</Option>
                                        <Option value="cpns">CPNS</Option>
                                        <Option value="bumn">BUMN</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                                Simpan Perubahan
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Card>
    );

    const renderSecurityForm = () => (
        <Card title="Keamanan Akun" extra={<LockOutlined />}>
            <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
            >
                <Form.Item
                    name="currentPassword"
                    label="Password Saat Ini"
                    rules={[{ required: true, message: 'Password saat ini wajib diisi!' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="Password Baru"
                    rules={[
                        { required: true, message: 'Password baru wajib diisi!' },
                        { min: 6, message: 'Password minimal 6 karakter!' }
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Konfirmasi Password Baru"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: 'Konfirmasi password wajib diisi!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Password tidak cocok!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Ubah Password
                    </Button>
                </Form.Item>
            </Form>

            <Divider />

            <div>
                <Title level={5}>Keamanan Tambahan</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Text strong>Autentikasi Dua Faktor</Text>
                            <br />
                            <Text type="secondary">Tingkatkan keamanan akun dengan 2FA</Text>
                        </div>
                        <Switch
                            checked={profileData?.settings?.two_factor_enabled}
                            onChange={(checked) => handleSettingChange('two_factor_enabled', checked)}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Text strong>Login Alert</Text>
                            <br />
                            <Text type="secondary">Notifikasi email saat login dari perangkat baru</Text>
                        </div>
                        <Switch
                            checked={profileData?.settings?.login_alerts}
                            onChange={(checked) => handleSettingChange('login_alerts', checked)}
                        />
                    </div>
                </Space>
            </div>
        </Card>
    );

    const renderNotificationSettings = () => (
        <Card title="Pengaturan Notifikasi" extra={<BellOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <Title level={5}>Notifikasi Email</Title>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>Update Kursus</Text>
                                <br />
                                <Text type="secondary">Notifikasi tentang kursus baru dan update</Text>
                            </div>
                            <Switch
                                checked={profileData?.settings?.email_notifications?.course_updates}
                                onChange={(checked) => handleSettingChange('email_course_updates', checked)}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>Reminder Belajar</Text>
                                <br />
                                <Text type="secondary">Pengingat jadwal belajar harian</Text>
                            </div>
                            <Switch
                                checked={profileData?.settings?.email_notifications?.study_reminders}
                                onChange={(checked) => handleSettingChange('email_study_reminders', checked)}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>Hasil Tryout</Text>
                                <br />
                                <Text type="secondary">Notifikasi hasil dan analisis tryout</Text>
                            </div>
                            <Switch
                                checked={profileData?.settings?.email_notifications?.tryout_results}
                                onChange={(checked) => handleSettingChange('email_tryout_results', checked)}
                            />
                        </div>
                    </Space>
                </div>

                <Divider />

                <div>
                    <Title level={5}>Notifikasi Push</Title>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>Deadline Tugas</Text>
                                <br />
                                <Text type="secondary">Pengingat deadline tugas dan tryout</Text>
                            </div>
                            <Switch
                                checked={profileData?.settings?.push_notifications?.deadline_reminders}
                                onChange={(checked) => handleSettingChange('push_deadline_reminders', checked)}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>Pencapaian</Text>
                                <br />
                                <Text type="secondary">Notifikasi badge dan pencapaian baru</Text>
                            </div>
                            <Switch
                                checked={profileData?.settings?.push_notifications?.achievements}
                                onChange={(checked) => handleSettingChange('push_achievements', checked)}
                            />
                        </div>
                    </Space>
                </div>
            </Space>
        </Card>
    );

    return (
        <div>
            <Title level={2}>Pengaturan Profil</Title>
            <Paragraph type="secondary">
                Kelola informasi profil, keamanan, dan preferensi Anda
            </Paragraph>

            <Row gutter={[16, 24]}>
                <Col xs={24}>
                    {renderProfileForm()}
                </Col>
                <Col xs={24} md={12}>
                    {renderSecurityForm()}
                </Col>
                <Col xs={24} md={12}>
                    {renderNotificationSettings()}
                </Col>
            </Row>
        </div>
    );
}
