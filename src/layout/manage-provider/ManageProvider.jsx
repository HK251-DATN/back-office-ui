import { useState } from 'react';
import { Tabs } from 'antd';
import ProviderTable from './components/ProviderTable';

const ManageProvider = () => {
    const [activeTab, setActiveTab] = useState('PENDING');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const tabs = [
        {
            key: 'ALL',
            label: 'Tất cả',
            children: <ProviderTable status={null} refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        },
        {
            key: 'PENDING',
            label: 'Chờ duyệt',
            children: <ProviderTable status="PENDING" refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        },
        {
            key: 'APPROVED',
            label: 'Đã duyệt',
            children: <ProviderTable status="APPROVED" refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        },
        {
            key: 'REJECTED',
            label: 'Từ chối',
            children: <ProviderTable status="REJECTED" refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        },
        {
            key: 'SUSPENDED',
            label: 'Tạm ngưng',
            children: <ProviderTable status="SUSPENDED" refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        },
        {
            key: 'UNVERIFIED',
            label: 'Chưa xác thực',
            children: <ProviderTable status="UNVERIFIED" refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        }
    ];

    return (
        <div className="flex flex-col h-fit w-full p-5 gap-4 bg-gray-50">
            <div className="header-part flex flex-row justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Quản lý nhà cung cấp</h1>
                    <p className="text-gray-600">Xem và duyệt đăng ký nhà cung cấp</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabs}
                />
            </div>
        </div>
    );
};

export default ManageProvider;
