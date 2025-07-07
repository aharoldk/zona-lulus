import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Progress,
    Statistic,
    List,
    Tag,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
} from 'antd';
import {
    BookOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    AimOutlined,
} from '@ant-design/icons';
import api from '../../utils/axios';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

export default function StudyTracker() {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, activityRes] = await Promise.all([
                api.get('/study/stats'),
                api.get('/study/recent-activity'),
            ]);
            setStats(statsRes.data.data);
            setRecentActivity(activityRes.data.data);
        } catch (error) {
            console.error("Error fetching study data:", error);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleAddSession = async (values) => {
        try {
            await api.post('/study/log-session', {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
            });
            fetchData(); // Refresh data
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error("Error logging session:", error);
        }
    };

    if (!stats) {
        return <Card>Loading...</Card>;
    }

    return (
        <div style={{ padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>Tracker Belajar</Title>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Waktu Belajar"
                            value={stats.total_study_hours}
                            precision={2}
                            prefix={<ClockCircleOutlined />}
                            suffix=" jam"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Materi Selesai"
                            value={stats.completed_materials}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Rata-rata Harian"
                            value={stats.daily_average_minutes}
                            precision={2}
                            prefix={<BookOutlined />}
                            suffix=" mnt"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Target Mingguan"
                            value={stats.weekly_progress}
                            prefix={<AimOutlined />}
                            suffix="%"
                        />
                        <Progress percent={stats.weekly_progress} showInfo={false} />
                    </Card>
                </Col>
            </Row>

            <Card
                title="Aktivitas Belajar Terakhir"
                extra={<Button icon={<PlusOutlined />} type="primary" onClick={showModal}>Tambah Sesi</Button>}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={recentActivity}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<BookOutlined />}
                                title={<Text strong>{item.material_name}</Text>}
                                description={`Durasi: ${item.duration_minutes} menit`}
                            />
                            <div>
                                <Tag color="blue">{item.category}</Tag>
                                <Text type="secondary">{moment(item.date).format('DD MMM YYYY')}</Text>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

            <Modal title="Tambah Sesi Belajar" open={isModalVisible} onCancel={handleCancel} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleAddSession}>
                    <Form.Item name="material_name" label="Nama Materi" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="duration_minutes" label="Durasi (menit)" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="date" label="Tanggal Belajar" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="category" label="Kategori" rules={[{ required: true }]}>
                        <Select>
                            <Option value="SKD">SKD</Option>
                            <Option value="TPA">TPA</Option>
                            <Option value="Psikologi">Psikologi</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Simpan</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

