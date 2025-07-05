import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Calendar, List, Button, Tag, Space, Badge, Timeline, Modal, Form, Input, TimePicker, Select, Spin, Alert, message } from 'antd';
import { ClockCircleOutlined, BellOutlined, VideoCameraOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import api from '../../utils/axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function StudySchedule() {
    const [selectedDate, setSelectedDate] = useState(moment());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [scheduleData, setScheduleData] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchScheduleData();
        fetchUpcomingExams();
        fetchTodaySchedule();
    }, [selectedDate]);

    const fetchScheduleData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/schedule', {
                params: {
                    date: selectedDate.format('YYYY-MM-DD')
                }
            });

            if (response.data.success) {
                setScheduleData(response.data.data);
            } else {
                setError('Failed to load schedule data');
            }
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const fetchUpcomingExams = async () => {
        try {
            const response = await api.get('/schedule/upcoming-exams');
            if (response.data.success) {
                setUpcomingExams(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching upcoming exams:', err);
        }
    };

    const fetchTodaySchedule = async () => {
        try {
            const response = await api.get('/schedule/today');
            if (response.data.success) {
                setTodaySchedule(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching today schedule:', err);
        }
    };

    const handleAddSchedule = async (values) => {
        try {
            const scheduleData = {
                ...values,
                date: selectedDate.format('YYYY-MM-DD'),
                time: values.time.format('HH:mm')
            };

            const response = await api.post('/schedule', scheduleData);

            if (response.data.success) {
                message.success('Jadwal berhasil ditambahkan!');
                setIsModalVisible(false);
                form.resetFields();
                fetchScheduleData();
                fetchTodaySchedule();
            } else {
                message.error('Gagal menambahkan jadwal');
            }
        } catch (err) {
            console.error('Error adding schedule:', err);
            message.error('Gagal menambahkan jadwal');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'study': return 'blue';
            case 'live': return 'green';
            case 'test': return 'orange';
            default: return 'default';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'study': return <ClockCircleOutlined />;
            case 'live': return <VideoCameraOutlined />;
            case 'test': return <CalendarOutlined />;
            default: return <ClockCircleOutlined />;
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Loading schedule...</div>
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
            />
        );
    }

    return (
        <div>
            <Title level={2}>Jadwal Belajar</Title>
            <Paragraph type="secondary">
                Kelola jadwal belajar dan pantau ujian yang akan datang
            </Paragraph>

            <Row gutter={[16, 16]}>
                {/* Calendar Section */}
                <Col xs={24} lg={16}>
                    <Card title="Kalender Jadwal" extra={
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                            Tambah Jadwal
                        </Button>
                    }>
                        <Calendar
                            value={selectedDate}
                            onSelect={setSelectedDate}
                            dateCellRender={(date) => {
                                const daySchedule = scheduleData.filter(item =>
                                    moment(item.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
                                );
                                return (
                                    <div>
                                        {daySchedule.slice(0, 2).map(item => (
                                            <div key={item.id} style={{ fontSize: '10px', marginBottom: '2px' }}>
                                                <Badge status={item.status === 'completed' ? 'success' : 'processing'} />
                                                <span>{item.title.substring(0, 15)}...</span>
                                            </div>
                                        ))}
                                        {daySchedule.length > 2 && (
                                            <div style={{ fontSize: '10px', color: '#999' }}>
                                                +{daySchedule.length - 2} lainnya
                                            </div>
                                        )}
                                    </div>
                                );
                            }}
                        />
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col xs={24} lg={8}>
                    {/* Today's Schedule */}
                    <Card title="Jadwal Hari Ini" style={{ marginBottom: '16px' }}>
                        {todaySchedule.length === 0 ? (
                            <Text type="secondary">Tidak ada jadwal hari ini</Text>
                        ) : (
                            <Timeline>
                                {todaySchedule.map(item => (
                                    <Timeline.Item
                                        key={item.id}
                                        dot={getTypeIcon(item.type)}
                                        color={getTypeColor(item.type)}
                                    >
                                        <div>
                                            <Text strong>{item.title}</Text>
                                            <br />
                                            <Text type="secondary">
                                                {item.time} ({item.duration} menit)
                                            </Text>
                                            <br />
                                            <Tag color={getTypeColor(item.type)}>{item.type}</Tag>
                                            {item.status === 'completed' && (
                                                <Tag color="success">Selesai</Tag>
                                            )}
                                        </div>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        )}
                    </Card>

                    {/* Upcoming Exams */}
                    <Card title="Ujian Mendatang">
                        <List
                            dataSource={upcomingExams}
                            renderItem={exam => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={exam.title}
                                        description={
                                            <Space direction="vertical" size="small">
                                                <Text>📅 {exam.date}</Text>
                                                <Text>📍 {exam.location}</Text>
                                                <Text>⏰ Daftar sampai: {exam.registrationDeadline}</Text>
                                                <Tag color={exam.status === 'open' ? 'green' : 'orange'}>
                                                    {exam.status === 'open' ? 'Pendaftaran Dibuka' : 'Segera Dibuka'}
                                                </Tag>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Selected Date Schedule */}
            <Card title={`Jadwal ${selectedDate.format('DD MMMM YYYY')}`} style={{ marginTop: '24px' }}>
                {scheduleData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Text type="secondary">Tidak ada jadwal pada tanggal ini</Text>
                    </div>
                ) : (
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
                        dataSource={scheduleData}
                        renderItem={item => (
                            <List.Item>
                                <Card
                                    size="small"
                                    title={
                                        <Space>
                                            {getTypeIcon(item.type)}
                                            <span>{item.title}</span>
                                        </Space>
                                    }
                                    extra={<Tag color={getTypeColor(item.type)}>{item.type}</Tag>}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <div>
                                            <ClockCircleOutlined /> {item.time}
                                        </div>
                                        <div>
                                            <Text type="secondary">{item.duration} menit</Text>
                                        </div>
                                        {item.status === 'completed' && (
                                            <Tag color="success">Selesai</Tag>
                                        )}
                                        {item.reminder && (
                                            <Tag color="orange">
                                                <BellOutlined /> Reminder
                                            </Tag>
                                        )}
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </Card>

            {/* Add Schedule Modal */}
            <Modal
                title="Tambah Jadwal Belajar"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddSchedule}
                >
                    <Form.Item
                        name="title"
                        label="Judul"
                        rules={[{ required: true, message: 'Judul harus diisi!' }]}
                    >
                        <Input placeholder="Masukkan judul jadwal" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Tipe"
                        rules={[{ required: true, message: 'Tipe harus dipilih!' }]}
                    >
                        <Select placeholder="Pilih tipe jadwal">
                            <Option value="study">Belajar</Option>
                            <Option value="live">Live Session</Option>
                            <Option value="test">Tes/Ujian</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="time"
                        label="Waktu"
                        rules={[{ required: true, message: 'Waktu harus diisi!' }]}
                    >
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="duration"
                        label="Durasi (menit)"
                        rules={[{ required: true, message: 'Durasi harus diisi!' }]}
                    >
                        <Input type="number" placeholder="60" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Simpan
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>
                                Batal
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
