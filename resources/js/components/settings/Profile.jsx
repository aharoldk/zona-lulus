import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Row,
    Col,
    Avatar,
    message,
    Tabs,
    Alert,
    Switch,
    DatePicker,
    Divider,
    Space,
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    LockOutlined,
    LoadingOutlined,
    SettingOutlined,
    BellOutlined,
    SafetyOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    EditOutlined,
} from '@ant-design/icons';
import api from '../../utils/axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function Profile() {
    const { user: authUser, updateUser } = useAuth();
    const [user, setUser] = useState(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [settingsForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [activeTab, setActiveTab] = useState('1');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get('/profile');
            const userData = response.data.data;
            setUser(userData);

            // Set form values with proper date formatting
            const formData = {
                ...userData,
                birth_date: userData.birth_date ? dayjs(userData.birth_date) : null,
            };
            form.setFieldsValue(formData);

            // Set settings form values
            if (userData.settings) {
                settingsForm.setFieldsValue(userData.settings);
            }
        } catch (error) {
            message.error('Gagal memuat data pengguna');
        }
    };

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        setUpdateSuccess(false);
        setUpdateError('');
        try {
            // Format birth_date for submission
            const submitData = {
                ...values,
                birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
            };

            const response = await api.put('/profile', submitData);
            const updatedUser = response.data.data;

            // Update local state
            setUser(updatedUser);

            // Update auth context user data
            if (updateUser) {
                updateUser(updatedUser);
            }

            message.success('Profil berhasil diperbarui!');
            setUpdateSuccess(true);
        } catch (error) {
            setUpdateError(error.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil');
            message.error(error.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values) => {
        setLoading(true);
        try {
            const response = await api.put('/profile/password', {
                current_password: values.current_password,
                new_password: values.new_password,
                new_password_confirmation: values.new_password_confirmation
            });
            message.success(response.data.message);
            passwordForm.resetFields();
        } catch (error) {
            message.error(error.response?.data?.message || 'Terjadi kesalahan saat mengubah password');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (values) => {
        setLoading(true);
        try {
            await api.put('/profile/settings', { settings: values });
            setUser(prevUser => ({ ...prevUser, settings: values }));
            message.success('Pengaturan berhasil diperbarui!');
        } catch (error) {
            message.error('Gagal memperbarui pengaturan');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return date ? dayjs(date).format('DD MMMM YYYY') : '-';
    };

    if (!user) {
        return (
            <Card style={{ textAlign: 'center', minHeight: 200 }}>
                <LoadingOutlined style={{ fontSize: 24 }} />
                <div style={{ marginTop: 16 }}>Memuat profil...</div>
            </Card>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: 'auto', padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>
                <SettingOutlined /> Pengaturan Akun
            </Title>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card>
                        <Tabs activeKey={activeTab} onChange={setActiveTab}>
                            <TabPane tab={<span><UserOutlined /> Informasi Pribadi</span>} key="1">
                                <Title level={4}>Data Pribadi</Title>
                                {updateSuccess && (
                                    <Alert
                                        message="Profil berhasil diperbarui!"
                                        type="success"
                                        showIcon
                                        style={{ marginBottom: 16 }}
                                        closable
                                    />
                                )}
                                {updateError && (
                                    <Alert
                                        message={updateError}
                                        type="error"
                                        showIcon
                                        style={{ marginBottom: 16 }}
                                        closable
                                    />
                                )}

                                <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="name"
                                                label="Nama Lengkap"
                                                rules={[{ required: true, message: 'Nama tidak boleh kosong' }]}
                                            >
                                                <Input prefix={<UserOutlined />} placeholder="Masukkan nama lengkap" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="email"
                                                label="Email"
                                                rules={[{ required: true, type: 'email', message: 'Email tidak valid' }]}
                                            >
                                                <Input
                                                    prefix={<MailOutlined />}
                                                    disabled
                                                    placeholder="Email tidak dapat diubah"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="phone"
                                                label="Nomor HP"
                                                rules={[
                                                    { pattern: /^[0-9+\-\s()]+$/, message: 'Format nomor HP tidak valid' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<PhoneOutlined />}
                                                    placeholder="Masukkan nomor HP"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="birth_date"
                                                label="Tanggal Lahir"
                                            >
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    placeholder="Pilih tanggal lahir"
                                                    format="DD/MM/YYYY"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                                            <EditOutlined /> Simpan Perubahan
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>

                            <TabPane tab={<span><LockOutlined /> Keamanan</span>} key="2">
                                <Title level={4}>Ubah Password</Title>
                                <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                                    <Form.Item
                                        name="current_password"
                                        label="Password Saat Ini"
                                        rules={[{ required: true, message: 'Password saat ini wajib diisi' }]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Masukkan password saat ini"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="new_password"
                                        label="Password Baru"
                                        rules={[
                                            { required: true, message: 'Password baru wajib diisi' },
                                            { min: 8, message: 'Password minimal 8 karakter' }
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Masukkan password baru"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="new_password_confirmation"
                                        label="Konfirmasi Password Baru"
                                        dependencies={['new_password']}
                                        rules={[
                                            { required: true, message: 'Konfirmasi password wajib diisi' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('new_password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Password tidak cocok!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Konfirmasi password baru"
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                                            <SafetyOutlined /> Ubah Password
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>

                            {/*<TabPane tab={<span><BellOutlined />Notifikasi</span>} key="3">*/}
                            {/*    <Title level={4}>Pengaturan Notifikasi</Title>*/}
                            {/*    <Form form={settingsForm} layout="vertical" onFinish={handleUpdateSettings}>*/}
                            {/*        <Form.Item*/}
                            {/*            name="email_notifications"*/}
                            {/*            label="Notifikasi Email"*/}
                            {/*            valuePropName="checked"*/}
                            {/*        >*/}
                            {/*            <Switch />*/}
                            {/*        </Form.Item>*/}

                            {/*        <Form.Item*/}
                            {/*            name="course_updates"*/}
                            {/*            label="Update Kursus"*/}
                            {/*            valuePropName="checked"*/}
                            {/*        >*/}
                            {/*            <Switch />*/}
                            {/*        </Form.Item>*/}

                            {/*        <Form.Item*/}
                            {/*            name="payment_notifications"*/}
                            {/*            label="Notifikasi Pembayaran"*/}
                            {/*            valuePropName="checked"*/}
                            {/*        >*/}
                            {/*            <Switch />*/}
                            {/*        </Form.Item>*/}

                            {/*        <Form.Item*/}
                            {/*            name="marketing_emails"*/}
                            {/*            label="Email Marketing"*/}
                            {/*            valuePropName="checked"*/}
                            {/*        >*/}
                            {/*            <Switch />*/}
                            {/*        </Form.Item>*/}

                            {/*        <Form.Item>*/}
                            {/*            <Button type="primary" htmlType="submit" loading={loading} size="large">*/}
                            {/*                <SettingOutlined /> Simpan Pengaturan*/}
                            {/*            </Button>*/}
                            {/*        </Form.Item>*/}
                            {/*    </Form>*/}
                            {/*</TabPane>*/}
                        </Tabs>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
