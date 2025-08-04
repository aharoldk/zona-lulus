import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Row, Col, Statistic, Spin } from 'antd';
import {
    CurrencyDollarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import moment from 'moment';
import api from '../../utils/axios';

const { Title } = Typography;

const CoinBalance = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);

    useEffect(() => {
        fetchBalanceAndTransactions();
    }, []);

    const fetchBalanceAndTransactions = async () => {
        try {
            const response = await api.get('/coins/balance');
            setBalance(response.data.coins);
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'purchase':
                return <ArrowUpIcon style={{ width: '16px', height: '16px', color: '#52c41a' }} />;
            case 'spend':
                return <ArrowDownIcon style={{ width: '16px', height: '16px', color: '#f5222d' }} />;
            case 'refund':
                return <ArrowPathIcon style={{ width: '16px', height: '16px', color: '#1890ff' }} />;
            default:
                return null;
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case 'purchase':
                return 'green';
            case 'spend':
                return 'red';
            case 'refund':
                return 'blue';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Tanggal',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Tipe',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getTransactionIcon(type)}
                    <Tag color={getTransactionColor(type)}>
                        {type === 'purchase' ? 'Pembelian' :
                         type === 'spend' ? 'Pengeluaran' : 'Refund'}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Jumlah',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount, record) => (
                <span style={{
                    color: record.type === 'spend' ? '#f5222d' : '#52c41a',
                    fontWeight: 'bold'
                }}>
                    {record.type === 'spend' ? '' : '+'}{amount} Koin
                </span>
            ),
        },
        {
            title: 'Deskripsi',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Saldo Setelah',
            dataIndex: 'balance_after',
            key: 'balance_after',
            render: (balance) => (
                <span style={{ fontWeight: 'bold', color: '#faad14' }}>
                    {balance} Koin
                </span>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Saldo Koin"
                            value={balance}
                            prefix={<CurrencyDollarIcon style={{ width: '24px', height: '24px', color: '#faad14' }} />}
                            valueStyle={{ color: '#faad14', fontSize: '32px' }}
                            suffix="Koin"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Total Pembelian"
                            value={transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0)}
                            valueStyle={{ color: '#52c41a' }}
                            suffix="Koin"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Total Pengeluaran"
                            value={Math.abs(transactions.filter(t => t.type === 'spend').reduce((sum, t) => sum + t.amount, 0))}
                            valueStyle={{ color: '#f5222d' }}
                            suffix="Koin"
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Title level={4} style={{ marginBottom: '16px' }}>
                    Riwayat Transaksi
                </Title>
                <Table
                    columns={columns}
                    dataSource={transactions}
                    rowKey="id"
                    loading={tableLoading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default CoinBalance;
