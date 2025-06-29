import React, { useState } from 'react';
import { Card, Row, Col, Typography, Form, Input, Button, Avatar, Upload, Switch, Select, Divider, Space, message } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, LockOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function Profile() {
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const handleSave = async (values) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('Profil berhasil diperbarui!');
        } catch (error) {
            message.error('Gagal memperbarui profil');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (values) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('Password berhasil diubah!');
        } catch (error) {
            message.error('Gagal mengubah password');
        } finally {
            setLoading(false);
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
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Ukuran file maksimal 2MB!');
            }
            return isJpgOrPng && isLt2M;
        },
    };

    const renderProfileForm = () => (
        <Card title="Informasi Profil" extra={<SettingOutlined />}>
            <Row gutter={24}>
                <Col xs={24} md={6}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Upload {...uploadProps}>
                            <Avatar size={120} icon={<UserOutlined />} />
                        </Upload>
                        <Button type="link" icon={<UploadOutlined />} style={{ marginTop: '8px' }}>
                            Ubah Foto
                        </Button>
                    </div>
                </Col>
                <Col xs={24} md={18}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                        initialValues={{
                            name: user?.name,
                            email: user?.email,
                            phone: user?.phone,
                            birthDate: '',
                            address: '',
                            education: '',
                            target: ''
                        }}
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
                                    rules={[{ required: true, message: 'Nomor HP wajib diisi!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="birthDate"
                                    label="Tanggal Lahir"
                                >
                                    <Input type="date" />
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
            <Form layout="vertical" onFinish={handlePasswordChange}>
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
                        <Switch />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Text strong>Login Alert</Text>
                            <br />
                            <Text type="secondary">Notifikasi email saat login dari perangkat baru</Text>
                        </div>
                        <Switch defaultChecked />
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
                            <Switch defaultChecked />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>Reminder Belajar</Text>
                                <br />
                                <Text type="secondary">Pengingat jadwal belajar harian</Text>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>Hasil Tryout</Text>
                                <br />
                                <Text type="secondary">Notifikasi hasil dan analisis tryout</Text>
                            </div>
                            <Switch defaultChecked />
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
                            <Switch defaultChecked />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>Pencapaian</Text>
                                <br />
                                <Text type="secondary">Notifikasi badge dan pencapaian baru</Text>
                            </div>
                            <Switch />
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
