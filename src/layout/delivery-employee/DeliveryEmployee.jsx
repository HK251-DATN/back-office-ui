import { useState } from 'react';
import { Tabs, Card } from 'antd';
import { TruckOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ReadyForDeliveryTable from './components/ReadyForDeliveryTable';
import MyDeliveryTasksTable from './components/MyDeliveryTasksTable';
import './DeliveryEmployee.css';

const DeliveryEmployee = () => {
  const [activeTab, setActiveTab] = useState('my-tasks');

  const tabItems = [
    {
      key: 'my-tasks',
      label: (
        <span className="flex items-center gap-2 text-base sm:text-lg">
          <CheckCircleOutlined />
          <span>Nhiệm vụ của tôi</span>
        </span>
      ),
      children: <MyDeliveryTasksTable />,
    },
    {
      key: 'ready-orders',
      label: (
        <span className="flex items-center gap-2 text-base sm:text-lg">
          <TruckOutlined />
          <span>Đơn hàng sẵn sàng</span>
        </span>
      ),
      children: <ReadyForDeliveryTable />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Giao hàng
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          Quản lý và thực hiện các nhiệm vụ giao hàng
        </p>
      </div>

      {/* Content */}
      <Card className="shadow-md">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          className="delivery-employee-tabs"
        />
      </Card>
    </div>
  );
};

export default DeliveryEmployee;
