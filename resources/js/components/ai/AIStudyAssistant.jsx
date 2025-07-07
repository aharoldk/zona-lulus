import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Input,
    Button,
    Typography,
    Space,
    Avatar,
    List,
    Tag,
    Spin,
    Alert,
    Divider,
    Row,
    Col,
    Progress,
    Tooltip,
    Badge,
    Modal,
    Tabs,
    Select,
    Rate,
    message
} from 'antd';
import {
    RobotOutlined,
    SendOutlined,
    BulbOutlined,
    BookOutlined,
    QuestionCircleOutlined,
    ClockCircleOutlined,
    SmileOutlined,
    MessageOutlined,
    AimOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

export default function AIStudyAssistant() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeTab, setActiveTab] = useState('chat');
    const [recommendations, setRecommendations] = useState([]);
    const [studyPlan, setStudyPlan] = useState(null);
    const [userPreferences, setUserPreferences] = useState({
        studyStyle: 'visual',
        difficulty: 'intermediate',
        timeAvailable: 60,
        subjects: ['matematika', 'bahasa-indonesia']
    });
    const messagesEndRef = useRef(null);

    useEffect(() => {
        initializeAssistant();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const initializeAssistant = () => {
        const welcomeMessage = {
            id: Date.now(),
            type: 'ai',
            content: "Halo! 👋 Saya adalah AI Study Assistant Anda. Saya siap membantu Anda belajar lebih efektif, memberikan rekomendasi personal, dan menjawab pertanyaan tentang materi belajar. Bagaimana saya bisa membantu Anda hari ini?",
            timestamp: new Date().toISOString(),
            suggestions: [
                "Buatkan jadwal belajar untuk saya",
                "Bagaimana cara meningkatkan skor matematika?",
                "Apa strategi terbaik untuk tryout TNI?",
                "Rekomendasikan materi yang harus saya pelajari"
            ]
        };
        setMessages([welcomeMessage]);
        generateRecommendations();
        generateStudyPlan();
    };

    const generateRecommendations = () => {
        const mockRecommendations = [
            {
                id: 1,
                type: 'study',
                priority: 'high',
                title: 'Fokus pada Matematika Dasar',
                description: 'Berdasarkan hasil tes terakhir, Anda perlu memperkuat pemahaman pada operasi aljabar dan geometri.',
                action: 'Pelajari 3 topik dalam 2 hari ke depan',
                estimatedTime: '2 jam',
                difficulty: 'medium',
                icon: <BookOutlined />
            },
            {
                id: 2,
                type: 'practice',
                priority: 'medium',
                title: 'Latihan Soal Bahasa Indonesia',
                description: 'Tingkatkan kemampuan pemahaman bacaan dan tata bahasa dengan latihan rutin.',
                action: '20 soal per hari',
                estimatedTime: '45 menit',
                difficulty: 'easy',
                icon: <QuestionCircleOutlined />
            },
            {
                id: 3,
                type: 'review',
                priority: 'low',
                title: 'Review Materi Sebelumnya',
                description: 'Ulangi materi yang sudah dipelajari minggu lalu untuk memperkuat ingatan.',
                action: 'Review 2 topik per hari',
                estimatedTime: '30 menit',
                difficulty: 'easy',
                icon: <ClockCircleOutlined />
            }
        ];
        setRecommendations(mockRecommendations);
    };

    const generateStudyPlan = () => {
        const mockStudyPlan = {
            title: 'Rencana Belajar 7 Hari',
            totalHours: 14,
            subjects: [
                { name: 'Matematika', hours: 6, progress: 40 },
                { name: 'Bahasa Indonesia', hours: 4, progress: 60 },
                { name: 'Pengetahuan Umum', hours: 3, progress: 20 },
                { name: 'Bahasa Inggris', hours: 1, progress: 80 }
            ],
            dailyTasks: [
                { day: 'Senin', tasks: ['Aljabar Linear', 'Tata Bahasa'], duration: '2 jam' },
                { day: 'Selasa', tasks: ['Geometri', 'Pemahaman Bacaan'], duration: '2 jam' },
                { day: 'Rabu', tasks: ['Statistika', 'Kosakata'], duration: '2 jam' },
                { day: 'Kamis', tasks: ['Trigonometri', 'Essay Writing'], duration: '2 jam' },
                { day: 'Jumat', tasks: ['Review Matematika'], duration: '2 jam' },
                { day: 'Sabtu', tasks: ['Tryout Practice'], duration: '2 jam' },
                { day: 'Minggu', tasks: ['Review & Evaluasi'], duration: '2 jam' }
            ]
        };
        setStudyPlan(mockStudyPlan);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = generateAIResponse(inputMessage);
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const generateAIResponse = (userInput) => {
        const responses = {
            jadwal: {
                content: "Berdasarkan profil belajar Anda, saya merekomendasikan jadwal berikut:\n\n📅 **Jadwal Harian (2 jam/hari)**\n• 07:00-08:00: Matematika (fokus tinggi di pagi hari)\n• 19:00-20:00: Bahasa Indonesia (review di malam hari)\n\n📝 **Tips:**\n- Istirahat 10 menit setiap 45 menit belajar\n- Gunakan teknik Pomodoro untuk fokus maksimal\n- Review materi sebelum tidur untuk meningkatkan retensi",
                suggestions: ["Bagaimana cara konsisten dengan jadwal?", "Buat jadwal untuk hari libur", "Tips mengatasi rasa malas belajar"]
            },
            matematika: {
                content: "Untuk meningkatkan skor matematika, fokus pada:\n\n🎯 **Prioritas Utama:**\n1. **Aljabar Dasar** - Foundation yang kuat\n2. **Geometri** - Banyak muncul di soal\n3. **Statistika** - Relatif mudah untuk boost skor\n\n📈 **Strategi:**\n- Kerjakan 10 soal per hari dengan tingkat kesulitan bertahap\n- Analisis kesalahan dan buat catatan\n- Gunakan visualisasi untuk geometri\n\n⏰ **Target:** Tingkatkan 10 poin dalam 2 minggu",
                suggestions: ["Rumus matematika yang harus dihafal", "Cara cepat mengerjakan soal geometri", "Strategi mengatasi soal sulit"]
            },
            tni: {
                content: "Strategi sukses Tryout TNI:\n\n⚡ **Time Management:**\n- Alokasi waktu: TIU (40%), TKP (30%), TKA (30%)\n- Kerjakan soal mudah dulu, skip yang sulit\n- Sisakan 10 menit untuk review\n\n🧠 **Teknik Menjawab:**\n- TIU: Latihan logika dan matematika rutin\n- TKP: Pahami nilai-nilai Pancasila dan kepemimpinan\n- TKA: Fokus pada materi sesuai formasi\n\n📊 **Target Skor:** Minimal 450 untuk lolos seleksi",
                suggestions: ["Materi TKP yang sering keluar", "Strategi menghadapi tes psikologi", "Tips menjaga stamina saat ujian"]
            },
            default: {
                content: "Saya memahami pertanyaan Anda. Sebagai AI Study Assistant, saya dapat membantu dengan:\n\n📚 **Materi Belajar:** Penjelasan konsep, rumus, dan strategi\n📅 **Jadwal Belajar:** Perencanaan dan optimasi waktu\n🎯 **Target & Goal:** Penetapan dan tracking progress\n💡 **Tips & Motivasi:** Dukungan untuk konsistensi belajar\n\nApa yang spesifik ingin Anda tanyakan?",
                suggestions: ["Penjelasan materi matematika", "Strategi mengerjakan soal", "Tips motivasi belajar", "Analisis hasil tryout"]
            }
        };

        const lowerInput = userInput.toLowerCase();
        let response;

        if (lowerInput.includes('jadwal') || lowerInput.includes('schedule')) {
            response = responses.jadwal;
        } else if (lowerInput.includes('matematika') || lowerInput.includes('math')) {
            response = responses.matematika;
        } else if (lowerInput.includes('tni') || lowerInput.includes('tryout')) {
            response = responses.tni;
        } else {
            response = responses.default;
        }

        return {
            id: Date.now(),
            type: 'ai',
            content: response.content,
            timestamp: new Date().toISOString(),
            suggestions: response.suggestions
        };
    };

    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
    };

    const MessageBubble = ({ message }) => (
        <div style={{
            display: 'flex',
            justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 16
        }}>
            {message.type === 'ai' && (
                <Avatar
                    icon={<RobotOutlined />}
                    style={{ backgroundColor: '#1890ff', marginRight: 8 }}
                />
            )}
            <div style={{ maxWidth: '70%' }}>
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: message.type === 'user' ? '#1890ff' : '#f5f5f5',
                    color: message.type === 'user' ? 'white' : 'black'
                }}>
                    <Paragraph style={{
                        margin: 0,
                        color: message.type === 'user' ? 'white' : 'inherit',
                        whiteSpace: 'pre-line'
                    }}>
                        {message.content}
                    </Paragraph>
                </div>

                {message.suggestions && (
                    <div style={{ marginTop: 8 }}>
                        <Space wrap>
                            {message.suggestions.map((suggestion, index) => (
                                <Button
                                    key={index}
                                    size="small"
                                    type="dashed"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    style={{ fontSize: '12px' }}
                                >
                                    {suggestion}
                                </Button>
                            ))}
                        </Space>
                    </div>
                )}

                <Text type="secondary" style={{ fontSize: '10px', marginTop: 4, display: 'block' }}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </div>
            {message.type === 'user' && (
                <Avatar
                    icon={<SmileOutlined />}
                    style={{ backgroundColor: '#52c41a', marginLeft: 8 }}
                />
            )}
        </div>
    );

    const RecommendationCard = ({ rec }) => (
        <Card size="small" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Avatar icon={rec.icon} style={{
                    backgroundColor: rec.priority === 'high' ? '#ff4d4f' :
                                   rec.priority === 'medium' ? '#faad14' : '#52c41a'
                }} />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Title level={5} style={{ margin: 0 }}>
                            {rec.title}
                        </Title>
                        <Tag color={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'orange' : 'green'}>
                            {rec.priority}
                        </Tag>
                    </div>
                    <Paragraph style={{ margin: '8px 0', color: '#666' }}>
                        {rec.description}
                    </Paragraph>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                            <Text strong style={{ color: '#1890ff' }}>{rec.action}</Text>
                            <Text type="secondary">• {rec.estimatedTime}</Text>
                        </Space>
                        <Button type="primary" size="small">
                            Mulai
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                <RobotOutlined style={{ marginRight: 8 }} />
                AI Study Assistant
            </Title>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane
                    tab={
                        <span>
                            <MessageOutlined />
                            Chat Assistant
                        </span>
                    }
                    key="chat"
                >
                    <Card style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}
                            {isTyping && (
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                                    <Avatar
                                        icon={<RobotOutlined />}
                                        style={{ backgroundColor: '#1890ff', marginRight: 8 }}
                                    />
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        backgroundColor: '#f5f5f5'
                                    }}>
                                        <Spin size="small" />
                                        <Text style={{ marginLeft: 8 }}>AI sedang mengetik...</Text>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onPressEnter={handleSendMessage}
                                    placeholder="Tanyakan apapun tentang belajar..."
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim()}
                                >
                                    Send
                                </Button>
                            </Space.Compact>
                        </div>
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <BulbOutlined />
                            Recommendations
                        </span>
                    }
                    key="recommendations"
                >
                    <div>
                        <Alert
                            message="Rekomendasi Personal"
                            description="Berdasarkan analisis performa dan pola belajar Anda"
                            type="info"
                            style={{ marginBottom: 16 }}
                            showIcon
                        />

                        {recommendations.map((rec) => (
                            <RecommendationCard key={rec.id} rec={rec} />
                        ))}
                    </div>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <AimOutlined />
                            Study Plan
                        </span>
                    }
                    key="studyplan"
                >
                    {studyPlan && (
                        <div>
                            <Card title={studyPlan.title} style={{ marginBottom: 16 }}>
                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <Text strong>Progress Overview:</Text>
                                        {studyPlan.subjects.map((subject, index) => (
                                            <div key={index} style={{ marginTop: 8 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Text>{subject.name}</Text>
                                                    <Text>{subject.hours} jam</Text>
                                                </div>
                                                <Progress percent={subject.progress} size="small" />
                                            </div>
                                        ))}
                                    </Col>
                                </Row>
                            </Card>

                            <Card title="Jadwal Harian">
                                <List
                                    dataSource={studyPlan.dailyTasks}
                                    renderItem={(task) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={task.day}
                                                description={
                                                    <div>
                                                        <Text>{task.tasks.join(', ')}</Text>
                                                        <br />
                                                        <Text type="secondary">{task.duration}</Text>
                                                    </div>
                                                }
                                            />
                                            <Button size="small">Mulai</Button>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </div>
                    )}
                </TabPane>
            </Tabs>
        </div>
    );
}
