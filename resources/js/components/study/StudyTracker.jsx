import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Button,
    Typography,
    Progress,
    Space,
    Row,
    Col,
    Statistic,
    Modal,
    Input,
    Select,
    Tag,
    Alert,
    List,
    Avatar,
    Badge,
    Tooltip,
    message,
    Divider,
    Radio
} from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    StopOutlined,
    ClockCircleOutlined,
    TargetOutlined,
    FireOutlined,
    BookOutlined,
    TrophyOutlined,
    SettingOutlined,
    SoundOutlined,
    NotificationOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function StudyTracker() {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [time, setTime] = useState(0);
    const [currentSession, setCurrentSession] = useState(null);
    const [studySessions, setStudySessions] = useState([]);
    const [sessionModalVisible, setSessionModalVisible] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
    const [sessionNotes, setSessionNotes] = useState('');
    const [subject, setSubject] = useState('');
    const [goal, setGoal] = useState(25); // Pomodoro default
    const [breakTime, setBreakTime] = useState(5);
    const [sessionType, setSessionType] = useState('focus');
    const [notifications, setNotifications] = useState(true);
    const [streak, setStreak] = useState(7);
    const [todayTotal, setTodayTotal] = useState(0);
    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (isActive && !isPaused) {
            intervalRef.current = setInterval(() => {
                setTime(time => time + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, isPaused]);

    useEffect(() => {
        // Check if goal is reached
        if (time >= goal * 60 && isActive) {
            handleSessionComplete();
        }
    }, [time, goal, isActive]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (!subject) {
            message.warning('Please select a subject first');
            setSessionModalVisible(true);
            return;
        }

        setIsActive(true);
        setIsPaused(false);

        if (!currentSession) {
            const newSession = {
                id: Date.now(),
                subject,
                startTime: new Date().toISOString(),
                type: sessionType,
                goal: goal * 60
            };
            setCurrentSession(newSession);
        }
    };

    const handlePause = () => {
        setIsPaused(!isPaused);
    };

    const handleStop = () => {
        if (currentSession && time > 0) {
            const completedSession = {
                ...currentSession,
                endTime: new Date().toISOString(),
                duration: time,
                notes: sessionNotes,
                completed: time >= goal * 60
            };

            setStudySessions(prev => [completedSession, ...prev.slice(0, 9)]);
            setTodayTotal(prev => prev + time);

            if (completedSession.completed) {
                message.success(`🎉 Great job! You completed a ${goal}-minute ${sessionType} session!`);
                playNotificationSound();
            }
        }

        setIsActive(false);
        setIsPaused(false);
        setTime(0);
        setCurrentSession(null);
        setSessionNotes('');
    };

    const handleSessionComplete = () => {
        setIsActive(false);
        playNotificationSound();

        if (sessionType === 'focus') {
            Modal.success({
                title: '🎉 Focus Session Complete!',
                content: (
                    <div>
                        <p>Great work! You've completed a {goal}-minute focus session.</p>
                        <p>Ready for a {breakTime}-minute break?</p>
                    </div>
                ),
                onOk: () => startBreakSession()
            });
        } else {
            Modal.info({
                title: '☕ Break Complete!',
                content: 'Break time is over. Ready to get back to studying?',
                onOk: () => setSessionType('focus')
            });
        }
    };

    const startBreakSession = () => {
        setSessionType('break');
        setGoal(breakTime);
        setTime(0);
        handleStart();
    };

    const playNotificationSound = () => {
        if (notifications && audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
    };

    const getProgressColor = () => {
        const progress = (time / (goal * 60)) * 100;
        if (sessionType === 'break') return '#52c41a';
        if (progress >= 90) return '#52c41a';
        if (progress >= 50) return '#faad14';
        return '#1890ff';
    };

    const SessionSetupModal = () => (
        <Modal
            title="Start New Study Session"
            visible={sessionModalVisible}
            onOk={() => {
                if (subject) {
                    setSessionModalVisible(false);
                    handleStart();
                } else {
                    message.warning('Please select a subject');
                }
            }}
            onCancel={() => setSessionModalVisible(false)}
            okText="Start Session"
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                    <Text strong>Subject:</Text>
                    <Select
                        style={{ width: '100%', marginTop: 8 }}
                        placeholder="Select subject to study"
                        value={subject}
                        onChange={setSubject}
                    >
                        <Option value="matematika">Matematika</Option>
                        <Option value="bahasa-indonesia">Bahasa Indonesia</Option>
                        <Option value="bahasa-inggris">Bahasa Inggris</Option>
                        <Option value="pengetahuan-umum">Pengetahuan Umum</Option>
                        <Option value="tes-psikologi">Tes Psikologi</Option>
                        <Option value="wawasan-kebangsaan">Wawasan Kebangsaan</Option>
                    </Select>
                </div>

                <div>
                    <Text strong>Session Type:</Text>
                    <Radio.Group
                        value={sessionType}
                        onChange={(e) => setSessionType(e.target.value)}
                        style={{ marginTop: 8, width: '100%' }}
                    >
                        <Radio.Button value="focus">Focus Session</Radio.Button>
                        <Radio.Button value="review">Review Session</Radio.Button>
                        <Radio.Button value="practice">Practice Test</Radio.Button>
                    </Radio.Group>
                </div>

                <div>
                    <Text strong>Duration (minutes):</Text>
                    <Select
                        style={{ width: '100%', marginTop: 8 }}
                        value={goal}
                        onChange={setGoal}
                    >
                        <Option value={15}>15 minutes</Option>
                        <Option value={25}>25 minutes (Pomodoro)</Option>
                        <Option value={45}>45 minutes</Option>
                        <Option value={60}>1 hour</Option>
                        <Option value={90}>1.5 hours</Option>
                    </Select>
                </div>
            </Space>
        </Modal>
    );

    const SettingsModal = () => (
        <Modal
            title="Study Tracker Settings"
            visible={settingsModalVisible}
            onOk={() => setSettingsModalVisible(false)}
            onCancel={() => setSettingsModalVisible(false)}
            okText="Save Settings"
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                    <Text strong>Default Focus Duration:</Text>
                    <Select
                        style={{ width: '100%', marginTop: 8 }}
                        value={goal}
                        onChange={setGoal}
                    >
                        <Option value={15}>15 minutes</Option>
                        <Option value={25}>25 minutes</Option>
                        <Option value={45}>45 minutes</Option>
                        <Option value={60}>60 minutes</Option>
                    </Select>
                </div>

                <div>
                    <Text strong>Break Duration:</Text>
                    <Select
                        style={{ width: '100%', marginTop: 8 }}
                        value={breakTime}
                        onChange={setBreakTime}
                    >
                        <Option value={5}>5 minutes</Option>
                        <Option value={10}>10 minutes</Option>
                        <Option value={15}>15 minutes</Option>
                    </Select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>Sound Notifications:</Text>
                    <Button
                        type={notifications ? 'primary' : 'default'}
                        icon={<SoundOutlined />}
                        onClick={() => setNotifications(!notifications)}
                    >
                        {notifications ? 'ON' : 'OFF'}
                    </Button>
                </div>
            </Space>
        </Modal>
    );

    const SessionCard = ({ session }) => (
        <Card size="small" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Text strong>{session.subject}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatTime(session.duration)} • {session.type}
                    </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <Tag color={session.completed ? 'green' : 'orange'}>
                        {session.completed ? 'Completed' : 'Stopped'}
                    </Tag>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        {new Date(session.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                </div>
            </div>
        </Card>
    );

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Hidden audio element for notifications */}
            <audio ref={audioRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBjOL0/O8fyMFKIzO8diJOQcbY7zr5J9OEQxNo+DTrmAd" type="audio/wav" />
            </audio>

            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Study Tracker
            </Title>

            {/* Current Session Display */}
            <Card style={{ marginBottom: 24, textAlign: 'center' }}>
                <div style={{ marginBottom: 16 }}>
                    {currentSession && (
                        <div style={{ marginBottom: 16 }}>
                            <Tag color={sessionType === 'break' ? 'green' : 'blue'} style={{ fontSize: '14px', padding: '4px 12px' }}>
                                {sessionType === 'break' ? '☕ Break Time' : `📚 ${subject || 'Study Session'}`}
                            </Tag>
                        </div>
                    )}

                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: getProgressColor(), marginBottom: 16 }}>
                        {formatTime(time)}
                    </div>

                    <Progress
                        percent={(time / (goal * 60)) * 100}
                        strokeColor={getProgressColor()}
                        trailColor="#f0f0f0"
                        strokeWidth={8}
                        showInfo={false}
                    />

                    <Text type="secondary" style={{ fontSize: '14px', marginTop: 8, display: 'block' }}>
                        Goal: {goal} minutes ({formatTime(goal * 60)})
                    </Text>
                </div>

                <Space size="large">
                    {!isActive ? (
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlayCircleOutlined />}
                            onClick={() => setSessionModalVisible(true)}
                        >
                            Start Session
                        </Button>
                    ) : (
                        <>
                            <Button
                                size="large"
                                icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                                onClick={handlePause}
                            >
                                {isPaused ? 'Resume' : 'Pause'}
                            </Button>
                            <Button
                                size="large"
                                danger
                                icon={<StopOutlined />}
                                onClick={handleStop}
                            >
                                Stop
                            </Button>
                        </>
                    )}

                    <Button
                        size="large"
                        icon={<SettingOutlined />}
                        onClick={() => setSettingsModalVisible(true)}
                    >
                        Settings
                    </Button>
                </Space>

                {isActive && (
                    <div style={{ marginTop: 16 }}>
                        <TextArea
                            placeholder="Add notes about your study session..."
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                            rows={2}
                            style={{ maxWidth: '400px' }}
                        />
                    </div>
                )}
            </Card>

            {/* Stats and Recent Sessions */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Today's Progress" size="small">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Study Time"
                                    value={formatTime(todayTotal)}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Streak"
                                    value={streak}
                                    suffix="days"
                                    prefix={<FireOutlined />}
                                />
                            </Col>
                        </Row>

                        <Divider />

                        <div>
                            <Text strong>Daily Goal Progress:</Text>
                            <Progress
                                percent={(todayTotal / (4 * 60 * 60)) * 100} // 4 hours daily goal
                                strokeColor="#52c41a"
                                style={{ marginTop: 8 }}
                            />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {formatTime(todayTotal)} / 4:00:00 hours
                            </Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card
                        title="Recent Sessions"
                        size="small"
                        extra={
                            <Badge count={studySessions.length} style={{ backgroundColor: '#52c41a' }} />
                        }
                    >
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {studySessions.length > 0 ? (
                                studySessions.map((session) => (
                                    <SessionCard key={session.id} session={session} />
                                ))
                            ) : (
                                <Text type="secondary">No recent sessions</Text>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Motivational Tips */}
            {!isActive && (
                <Alert
                    message="💡 Study Tips"
                    description="Use the Pomodoro Technique: 25 minutes of focused study followed by a 5-minute break. This helps maintain concentration and prevents burnout."
                    type="info"
                    style={{ marginTop: 16 }}
                    showIcon
                />
            )}

            <SessionSetupModal />
            <SettingsModal />
        </div>
    );
}
