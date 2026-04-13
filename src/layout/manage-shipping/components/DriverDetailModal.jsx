import { Modal, Descriptions, Tag, Button, Tabs, Table, Statistic, Row, Col, Rate } from 'antd';
import { useState, useEffect } from 'react';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { deliveryService } from '../../../services/deliveryService';
import { toast } from 'react-toastify';

const vehicleIcons = {
  MOTORCYCLE: TwoWheelerOutlinedIcon,
  CAR: DirectionsCarOutlinedIcon,
  TRUCK: LocalShippingOutlinedIcon
};

const vehicleLabels = {
  MOTORCYCLE: 'Xe máy',
  CAR: 'Ô tô',
  TRUCK: 'Xe tải'
};

const statusConfig = {
  AVAILABLE: { color: 'success', label: 'Rảnh' },
  BUSY: { color: 'processing', label: 'Đang bận' },
  OFFLINE: { color: 'default', label: 'Offline' }
};

const shiftLabels = {
  MORNING: 'Ca sáng',
  AFTERNOON: 'Ca chiều',
  EVENING: 'Ca tối',
  FULL_DAY: 'Ca cả ngày'
};

export const DriverDetailModal = ({ open, onClose, driver }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentDeliveryDetail, setCurrentDeliveryDetail] = useState(null);
  const [loadingCurrentDelivery, setLoadingCurrentDelivery] = useState(false);

  useEffect(() => {
    if (open && driver) {
      if (activeTab === 'history') {
        fetchDeliveryHistory();
      }
      if (activeTab === 'current' && driver.currentDelivery) {
        fetchCurrentDelivery();
      }
    }
  }, [open, driver, activeTab]);

  const fetchDeliveryHistory = async () => {
    setLoadingHistory(true);
    try {
      // Mock delivery history for this driver
      const response = await deliveryService.getDeliveryOrders({
        driverId: driver.id,
        limit: 50
      });

      if (response.type === 'GOOD') {
        setDeliveryHistory(response.detail.data);
      }
    } catch (error) {
      console.error('Error fetching delivery history:', error);
      toast.error('Lỗi khi tải lịch sử giao hàng');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchCurrentDelivery = async () => {
    if (!driver.currentDelivery) return;

    setLoadingCurrentDelivery(true);
    try {
      // In real app, fetch by delivery order ID
      // For now, we'll find it in the mock data
      const response = await deliveryService.getDeliveryOrders({
        search: driver.currentDelivery.orderId
      });

      if (response.type === 'GOOD' && response.detail.data.length > 0) {
        setCurrentDeliveryDetail(response.detail.data[0]);
      }
    } catch (error) {
      console.error('Error fetching current delivery:', error);
    } finally {
      setLoadingCurrentDelivery(false);
    }
  };

  if (!driver) return null;

  const VehicleIcon = vehicleIcons[driver.vehicleType] || TwoWheelerOutlinedIcon;
  const statusInfo = statusConfig[driver.status] || statusConfig.OFFLINE;

  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleEmail = (email) => {
    window.open(`mailto:${email}`);
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Chưa có';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const historyColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (text) => <span className='font-semibold'>{text}</span>
    },
    {
      title: 'Khách hàng',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 150
    },
    {
      title: 'Địa chỉ',
      dataIndex: ['customer', 'address'],
      key: 'address',
      ellipsis: true
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => {
        const statusMap = {
          DELIVERED: { color: 'success', label: 'Đã giao' },
          FAILED: { color: 'error', label: 'Thất bại' },
          DELIVERING: { color: 'processing', label: 'Đang giao' },
          PICKED_UP: { color: 'cyan', label: 'Đã lấy hàng' }
        };
        const config = statusMap[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: 'Phí ship',
      dataIndex: 'shippingFee',
      key: 'shippingFee',
      width: 110,
      render: (fee) => formatCurrency(fee)
    },
    {
      title: 'Thời gian',
      dataIndex: 'actualDeliveryTime',
      key: 'time',
      width: 160,
      render: (time, record) => formatTime(time || record.createdAt)
    }
  ];

  const InfoTab = () => (
    <div className='flex flex-col gap-6'>
      {/* Driver Avatar and Basic Info */}
      <div className='flex gap-6 items-start'>
        <img
          src={driver.avatar}
          alt={driver.name}
          className='w-32 h-32 rounded-lg object-cover border-2 border-gray-200'
        />
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-2'>
            <h2 className='text-2xl font-bold'>{driver.name}</h2>
            <Tag color={statusInfo.color} className='px-3 py-1'>
              {statusInfo.label}
            </Tag>
          </div>
          <div className='flex items-center gap-2 mb-2'>
            <Rate disabled defaultValue={driver.rating} allowHalf />
            <span className='text-lg font-semibold'>{driver.rating}</span>
            <span className='text-gray-600'>({driver.totalDeliveries} đơn)</span>
          </div>
          <div className='flex gap-4 mt-3'>
            <Button
              icon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => handleCall(driver.phone)}
            >
              {driver.phone}
            </Button>
            <Button
              icon={<EmailOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => handleEmail(driver.email)}
            >
              Email
            </Button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h3 className='font-semibold mb-3 text-base'>Thông tin cá nhân</h3>
        <Descriptions bordered size='small' column={2}>
          <Descriptions.Item label="Họ và tên" span={2}>
            {driver.name}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {driver.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {driver.email}
          </Descriptions.Item>
          <Descriptions.Item label="Ca làm việc">
            {shiftLabels[driver.shift]}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">
            {new Date(driver.createdAt).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Vehicle Information */}
      <div>
        <h3 className='font-semibold mb-3 text-base'>Thông tin phương tiện</h3>
        <Descriptions bordered size='small' column={2}>
          <Descriptions.Item label="Loại xe">
            <div className='flex items-center gap-2'>
              <VehicleIcon sx={{ fontSize: 20 }} />
              <span>{vehicleLabels[driver.vehicleType]}</span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Biển số xe">
            {driver.vehiclePlate}
          </Descriptions.Item>
          <Descriptions.Item label="Vị trí hiện tại" span={2}>
            Cách kho {driver.distanceFromWarehouse} km
          </Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );

  const StatisticsTab = () => (
    <div className='flex flex-col gap-6'>
      {/* Key Metrics */}
      <Row gutter={16}>
        <Col span={6}>
          <div className='border rounded-lg p-4 text-center bg-blue-50'>
            <Statistic
              title="Tổng đơn giao"
              value={driver.totalDeliveries}
              valueStyle={{ color: '#1890ff', fontSize: '28px' }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className='border rounded-lg p-4 text-center bg-green-50'>
            <Statistic
              title="Tỷ lệ thành công"
              value={driver.successRate}
              suffix="%"
              valueStyle={{ color: '#52c41a', fontSize: '28px' }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className='border rounded-lg p-4 text-center bg-yellow-50'>
            <Statistic
              title="Đơn hôm nay"
              value={driver.todayDeliveries}
              valueStyle={{ color: '#faad14', fontSize: '28px' }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className='border rounded-lg p-4 text-center bg-purple-50'>
            <Statistic
              title="Đơn tháng này"
              value={driver.monthDeliveries}
              valueStyle={{ color: '#722ed1', fontSize: '28px' }}
            />
          </div>
        </Col>
      </Row>

      {/* Additional Stats */}
      <div>
        <h3 className='font-semibold mb-3 text-base'>Thống kê chi tiết</h3>
        <Descriptions bordered size='small' column={2}>
          <Descriptions.Item label="Đánh giá trung bình">
            <div className='flex items-center gap-2'>
              <Rate disabled defaultValue={driver.rating} allowHalf />
              <span className='font-semibold'>{driver.rating}/5.0</span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng đơn giao thành công">
            {Math.round(driver.totalDeliveries * driver.successRate / 100)} đơn
          </Descriptions.Item>
          <Descriptions.Item label="Tổng đơn thất bại">
            {driver.totalDeliveries - Math.round(driver.totalDeliveries * driver.successRate / 100)} đơn
          </Descriptions.Item>
          <Descriptions.Item label="Tỷ lệ đúng hạn">
            {(driver.successRate - 2).toFixed(1)}%
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian giao TB">
            ~45 phút
          </Descriptions.Item>
          <Descriptions.Item label="Khoảng cách TB/đơn">
            ~4.2 km
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Performance Chart Placeholder */}
      <div className='border rounded-lg p-6 bg-gray-50'>
        <h4 className='font-semibold mb-4'>Hiệu suất theo tháng</h4>
        <div className='text-center text-gray-500 py-8'>
          Biểu đồ hiệu suất sẽ được hiển thị ở đây (Phase 3)
        </div>
      </div>
    </div>
  );

  const CurrentDeliveryTab = () => {
    if (!driver.currentDelivery) {
      return (
        <div className='text-center py-10 text-gray-500'>
          Tài xế hiện không có đơn hàng nào
        </div>
      );
    }

    if (loadingCurrentDelivery) {
      return <div className='text-center py-10'>Đang tải...</div>;
    }

    if (!currentDeliveryDetail) {
      return (
        <div className='border rounded-lg p-6 bg-yellow-50'>
          <p className='font-semibold text-lg mb-2'>
            Đang giao: {driver.currentDelivery.orderId}
          </p>
          <p className='text-gray-600'>
            Dự kiến hoàn thành: {formatTime(driver.currentDelivery.estimatedCompletion)}
          </p>
        </div>
      );
    }

    return (
      <div className='flex flex-col gap-4'>
        <div className='border rounded-lg p-6 bg-blue-50'>
          <div className='flex justify-between items-start mb-4'>
            <div>
              <p className='font-semibold text-xl mb-1'>
                {currentDeliveryDetail.orderId}
              </p>
              <Tag color='processing' className='px-3 py-1'>Đang giao hàng</Tag>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Dự kiến hoàn thành</p>
              <p className='font-semibold'>
                {formatTime(currentDeliveryDetail.estimatedDeliveryTime)}
              </p>
            </div>
          </div>
        </div>

        <Descriptions bordered size='small' column={2}>
          <Descriptions.Item label="Khách hàng" span={2}>
            {currentDeliveryDetail.customer.name}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {currentDeliveryDetail.customer.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
            {currentDeliveryDetail.customer.address}
          </Descriptions.Item>
          <Descriptions.Item label="Khoảng cách">
            {currentDeliveryDetail.distance} km
          </Descriptions.Item>
          <Descriptions.Item label="Phí ship">
            {formatCurrency(currentDeliveryDetail.shippingFee)}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng giá trị đơn" span={2}>
            {formatCurrency(currentDeliveryDetail.totalAmount + currentDeliveryDetail.shippingFee)}
          </Descriptions.Item>
        </Descriptions>

        {currentDeliveryDetail.notes && (
          <div className='border rounded-lg p-4 bg-orange-50'>
            <p className='font-semibold mb-1'>Ghi chú:</p>
            <p className='text-orange-700'>{currentDeliveryDetail.notes}</p>
          </div>
        )}
      </div>
    );
  };

  const HistoryTab = () => (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <p className='text-gray-600'>
          Hiển thị {deliveryHistory.length} đơn hàng gần nhất
        </p>
      </div>

      <Table
        columns={historyColumns}
        dataSource={deliveryHistory}
        rowKey="id"
        loading={loadingHistory}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} đơn`
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );

  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin',
      children: <InfoTab />
    },
    {
      key: 'statistics',
      label: 'Thống kê',
      children: <StatisticsTab />
    },
    {
      key: 'current',
      label: driver.currentDelivery ? `Đơn hiện tại (${driver.currentDelivery.orderId})` : 'Đơn hiện tại',
      children: <CurrentDeliveryTab />
    },
    {
      key: 'history',
      label: 'Lịch sử giao hàng',
      children: <HistoryTab />
    }
  ];

  return (
    <Modal
      title={
        <div className='flex items-center gap-3'>
          <VehicleIcon sx={{ fontSize: 24 }} />
          <span>Chi tiết tài xế</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </Modal>
  );
};
