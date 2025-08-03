import React, { useState } from 'react';
import { Tabs, Button } from 'antd';
import { CurrencyDollarIcon, CreditCardIcon, ClockIcon } from '@heroicons/react/24/outline';
import CoinPurchase from './CoinPurchase';
import CoinBalance from './CoinBalance';

const { TabPane } = Tabs;

const CoinWallet = () => {
    const [activeTab, setActiveTab] = useState('balance');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                centered
                size="large"
                style={{ backgroundColor: 'white', margin: 0 }}
            >
                <TabPane
                    tab={
                        <span>
                            <CurrencyDollarIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                            Saldo & Riwayat
                        </span>
                    }
                    key="balance"
                >
                    <CoinBalance />
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <CreditCardIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                            Beli Koin
                        </span>
                    }
                    key="purchase"
                >
                    <CoinPurchase />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default CoinWallet;
