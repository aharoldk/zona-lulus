import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Row,
    Col,
    Avatar,
    Upload,
    message,
    Tabs,
    Alert,
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    LockOutlined,
    CameraOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import api from '../../utils/axios';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function Profile() {
    const [user, setUser] = useState(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [updateError, setUpdateError] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get('/profile');
            setUser(response.data.data);
            form.setFieldsValue(response.data.data);
        } catch (error) {
            message.error('Gagal memuat data pengguna');
        }
    };

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        setUpdateSuccess(false);
        setUpdateError('');
        try {
            const response = await api.put('/profile', values);
            setUser(response.data.data);
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

    const handleUploadAvatar = async (file) => {
        setAvatarLoading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.post('/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUser(prevUser => ({ ...prevUser, avatar: response.data.data.avatar_url }));
            message.success('Foto profil berhasil diperbarui!');
        } catch (error) {
            message.error('Gagal mengunggah avatar');
        } finally {
            setAvatarLoading(false);
        }
    };

    if (!user) {
        return <Card><LoadingOutlined /> Memuat profil...</Card>;
    }

    return (
        <div style={{ maxWidth: 900, margin: 'auto', padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>Pengaturan Akun</Title>

            <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Upload
                                name="avatar"
                                showUploadList={false}
                                beforeUpload={file => {
                                    handleUploadAvatar(file);
                                    return false; // Prevent default upload
                                }}
                            >
                                <Avatar size={128} src={user.avatar} icon={!user.avatar && <UserOutlined />}>
                                    {avatarLoading && <LoadingOutlined />}
                                </Avatar>
                                <Button icon={<CameraOutlined />} style={{ marginTop: 16 }}>
                                    Ubah Foto Profil
                                </Button>
                            </Upload>
                            <Title level={4} style={{ marginTop: 16 }}>{user.name}</Title>
                            <Text type="secondary">{user.email}</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={16}>
                    <Card>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Profil Saya" key="1">
                                <Title level={4}>Informasi Pribadi</Title>
                                {updateSuccess && <Alert message="Profil berhasil diperbarui!" type="success" showIcon style={{ marginBottom: 16 }} />}
                                {updateError && <Alert message={updateError} type="error" showIcon style={{ marginBottom: 16 }} />}
                                <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
                                    <Form.Item
                                        name="name"
                                        label="Nama Lengkap"
                                        rules={[{ required: true, message: 'Nama tidak boleh kosong' }]}
                                    >
                                        <Input prefix={<UserOutlined />} />
                                    </Form.Item>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[{ required: true, type: 'email', message: 'Email tidak valid' }]}
                                    >
                                        <Input prefix={<MailOutlined />} disabled />
                                    </Form.Item>
                                    <Form.Item
                                        name="phone"
                                        label="Nomor HP"
                                    >
                                        <Input prefix={<PhoneOutlined />} />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Simpan Perubahan
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>
                            <TabPane tab="Ubah Password" key="2">
                                <Title level={4}>Keamanan Akun</Title>
                                <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                                    <Form.Item
                                        name="current_password"
                                        label="Password Saat Ini"
                                        rules={[{ required: true, message: 'Password saat ini tidak boleh kosong' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>
                                    <Form.Item
                                        name="new_password"
                                        label="Password Baru"
                                        rules={[{ required: true, min: 8, message: 'Password baru minimal 8 karakter' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>
                                    <Form.Item
                                        name="new_password_confirmation"
                                        label="Konfirmasi Password Baru"
                                        dependencies={['new_password']}
                                        rules={[
                                            { required: true, message: 'Konfirmasi password baru tidak boleh kosong' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('new_password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Password baru tidak cocok'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Ubah Password
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
