import React, { useState } from 'react';
import { Card, Row, Col, Typography, Calendar, List, Button, Tag, Space, Badge, Timeline, Modal, Form, Input, TimePicker, Select } from 'antd';
import { ClockCircleOutlined, BellOutlined, VideoCameraOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function StudySchedule() {
    const [selectedDate, setSelectedDate] = useState(moment());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const scheduleData = [
        {
            id: 1,
            title: 'Latihan Matematika',
            type: 'study',
            date: moment(),
            time: '09:00',
            duration: 60,
            status: 'upcoming',
            reminder: true
        },
        {
            id: 2,
            title: 'Live Session - Bahasa Indonesia',
            type: 'live',
            date: moment().add(1, 'day'),
            time: '14:00',
            duration: 90,
            status: 'upcoming',
            reminder: true
        },
        {
            id: 3,
            title: 'Tryout TNI - Paket Lengkap',
            type: 'test',
            date: moment().add(2, 'days'),
            time: '10:00',
            duration: 120,
            status: 'upcoming',
            reminder: false
        },
        {
            id: 4,
            title: 'Review Materi CPNS',
            type: 'study',
            date: moment().subtract(1, 'day'),
            time: '16:00',
            duration: 45,
            status: 'completed',
            reminder: false
        }
    ];

    const upcomingExams = [
        {
            id: 1,
            title: 'Tes Masuk TNI Akademi Militer',
            date: '15 Agustus 2024',
            location: 'Jakarta',
            registrationDeadline: '30 Juli 2024',
            status: 'open'
        },
        {
            id: 2,
            title: 'Tes CPNS Kementerian Pendidikan',
            date: '20 September 2024',
            location: 'Online',
            registrationDeadline: '15 Agustus 2024',
            status: 'open'
        },
        {
            id: 3,
            title: 'Tes Masuk POLRI',
            date: '10 Oktober 2024',
            location: 'Surabaya',
            registrationDeadline: '25 September 2024',
            status: 'soon'
        }
    ];

    const todaySchedule = scheduleData.filter(item =>
        item.date.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
    );

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'green';
            case 'soon': return 'orange';
            case 'closed': return 'red';
            default: return 'default';
        }
    };

    const handleAddSchedule = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            console.log('New schedule:', values);
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const dateCellRender = (value) => {
        const daySchedule = scheduleData.filter(item =>
            item.date.format('YYYY-MM-DD') === value.format('YYYY-MM-DD')
        );

        return (
            <div>
                {daySchedule.map(item => (
                    <Badge
                        key={item.id}
                        status={item.status === 'completed' ? 'success' : 'processing'}
                        text={
                            <Text style={{ fontSize: '10px' }}>
                                {item.time} {item.title.substring(0, 10)}...
                            </Text>
                        }
                    />
                ))}
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <Title level={2}>Jadwal Belajar</Title>
                    <Paragraph type="secondary">
                        Kelola jadwal belajar dan pantau kalender ujian
                    </Paragraph>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSchedule}>
                    Tambah Jadwal
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                {/* Today's Schedule */}
                <Col xs={24} lg={8}>
                    <Card title="Jadwal Hari Ini" extra={<Text type="secondary">{moment().format('DD MMMM YYYY')}</Text>}>
                        {todaySchedule.length > 0 ? (
                            <Timeline>
                                {todaySchedule.map(item => (
                                    <Timeline.Item
                                        key={item.id}
                                        dot={getTypeIcon(item.type)}
                                        color={getTypeColor(item.type)}
                                    >
                                        <div>
                                            <Text strong>{item.time}</Text>
                                            <br />
                                            <Text>{item.title}</Text>
                                            <br />
                                            <Space>
                                                <Tag color={getTypeColor(item.type)}>
                                                    {item.duration} menit
                                                </Tag>
                                                {item.reminder && <BellOutlined style={{ color: '#faad14' }} />}
                                            </Space>
                                        </div>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px' }}>
                                <Text type="secondary">Tidak ada jadwal hari ini</Text>
                            </div>
                        )}
                    </Card>

                    {/* Upcoming Exams */}
                    <Card title="Kalender Ujian" style={{ marginTop: '16px' }}>
                        <List
                            dataSource={upcomingExams}
                            renderItem={(exam) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={
                                            <div>
                                                <Text strong>{exam.title}</Text>
                                                <Tag color={getStatusColor(exam.status)} style={{ marginLeft: '8px' }}>
                                                    {exam.status === 'open' ? 'Pendaftaran Buka' : 'Segera Dibuka'}
                                                </Tag>
                                            </div>
                                        }
                                        description={
                                            <Space direction="vertical" size="small">
                                                <Text type="secondary">📅 {exam.date}</Text>
                                                <Text type="secondary">📍 {exam.location}</Text>
                                                <Text type="secondary">⏰ Batas daftar: {exam.registrationDeadline}</Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Calendar */}
                <Col xs={24} lg={16}>
                    <Card title="Kalender Jadwal">
                        <Calendar
                            value={selectedDate}
                            onSelect={setSelectedDate}
                            dateCellRender={dateCellRender}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Add Schedule Modal */}
            <Modal
                title="Tambah Jadwal Belajar"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Simpan"
                cancelText="Batal"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Judul"
                        rules={[{ required: true, message: 'Judul wajib diisi!' }]}
                    >
                        <Input placeholder="Masukkan judul jadwal" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Jenis"
                        rules={[{ required: true, message: 'Jenis wajib dipilih!' }]}
                    >
                        <Select placeholder="Pilih jenis aktivitas">
                            <Option value="study">Belajar</Option>
                            <Option value="live">Live Session</Option>
                            <Option value="test">Tes/Tryout</Option>
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="time"
                                label="Waktu"
                                rules={[{ required: true, message: 'Waktu wajib dipilih!' }]}
                            >
                                <TimePicker
                                    style={{ width: '100%' }}
                                    format="HH:mm"
                                    placeholder="Pilih waktu"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="duration"
                                label="Durasi (menit)"
                                rules={[{ required: true, message: 'Durasi wajib diisi!' }]}
                            >
                                <Input type="number" placeholder="60" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="reminder"
                        valuePropName="checked"
                    >
                        <input type="checkbox" /> Aktifkan pengingat
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
