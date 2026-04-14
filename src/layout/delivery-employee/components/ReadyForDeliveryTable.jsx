import { useState, useEffect } from 'react';
import { Table, Button, message, Tag, Space, Modal } from 'antd';
import { TruckOutlined, ExclamationCircleOutlined, SyncOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { getReadyOrdersWithDeliveryInfo, startDelivery } from '../../../services/deliveryEmployeeService';
import { formatDateTime } from '../../../utils/dateFormat';
import OrderDetailModal from './OrderDetailModal';

const ReadyForDeliveryTable = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [startingOrder, setStartingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch ready orders with delivery info
  const fetchOrders = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const response = await getReadyOrdersWithDeliveryInfo();
      const responseType = response.data?.type;

      // Handle GOOD and SKIP_AS_GOOD responses
      if (responseType === 'GOOD' || responseType === 'SKIP_AS_GOOD') {
        setOrders(response.data.detail || []);
        if (showSuccessMessage) {
          message.success('Đã làm mới danh sách đơn hàng');
        }
      } else {
        // Only show error for actual API failures
        setOrders([]);
        message.error('Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      message.error('Có lỗi xảy ra khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle view details
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  // Handle start delivery
  const handleStartDelivery = (order) => {
    Modal.confirm({
      title: 'Xác nhận bắt đầu giao hàng',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn nhận giao đơn hàng #${order.order_id}?`,
      okText: 'Bắt đầu giao',
      cancelText: 'Hủy',
      onOk: async () => {
        setStartingOrder(order.order_id);
        try {
          const response = await startDelivery(order.order_id);
          if (response.data?.type === 'GOOD') {
            message.success('Đã nhận đơn hàng để giao');
            // Refresh the list
            fetchOrders();
          } else {
            message.error('Không thể bắt đầu giao hàng');
          }
        } catch (error) {
          console.error('Error starting delivery:', error);
          message.error('Có lỗi xảy ra khi bắt đầu giao hàng');
        } finally {
          setStartingOrder(null);
        }
      },
    });
  };

  // Format full address
  const formatAddress = (deliveryInfo) => {
    if (!deliveryInfo) return '-';
    const parts = [
      deliveryInfo.detail,
      deliveryInfo.commune,
      deliveryInfo.district,
      deliveryInfo.province
    ].filter(Boolean);
    return parts.join(', ');
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 120,
      render: (orderId) => (
        <span className="font-semibold text-blue-600">#{orderId}</span>
      ),
      fixed: 'left',
    },
    {
      title: 'Người nhận',
      key: 'receiver',
      width: 200,
      render: (_, record) => {
        const deliveryInfo = record.deliveryInfo;
        return deliveryInfo ? (
          <div>
            <div className="font-medium">{deliveryInfo.receiver_name}</div>
            <a
              href={`tel:${deliveryInfo.receiver_p_num}`}
              className="text-sm text-blue-600 flex items-center gap-1 hover:underline"
            >
              <PhoneOutlined />
              {deliveryInfo.receiver_p_num}
            </a>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      title: 'Địa chỉ giao hàng',
      key: 'address',
      width: 300,
      render: (_, record) => {
        const deliveryInfo = record.deliveryInfo;
        const fullAddress = formatAddress(deliveryInfo);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

        return deliveryInfo ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-start gap-1"
          >
            <EnvironmentOutlined className="mt-1" />
            <span className="line-clamp-2">{fullAddress}</span>
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      title: 'Giá trị đơn',
      key: 'total_price',
      width: 150,
      render: (_, record) => {
        const price = record.deliveryInfo?.total_price;
        return price ? (
          <div>
            <div className="font-semibold text-green-600">
              {price.toLocaleString('vi-VN')} đ
            </div>
            <Tag color="orange" className="mt-1">COD</Tag>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => (
        <Tag color="blue" className="text-sm">
          {status === 'READY_FOR_PICKUP' ? 'Sẵn sàng giao' : status}
        </Tag>
      ),
    },
    {
      title: 'Đóng gói lúc',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 170,
      render: (date) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => handleViewDetails(record)}
            size="large"
            className="min-h-12"
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            icon={<TruckOutlined />}
            onClick={() => handleStartDelivery(record)}
            loading={startingOrder === record.order_id}
            size="large"
            className="min-h-12"
          >
            Bắt đầu giao
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Stats Summary */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Space size="large" className="flex-wrap">
          <div>
            <div className="text-sm text-gray-600">Tổng đơn hàng</div>
            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Sẵn sàng giao</div>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'READY_FOR_PICKUP').length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Tổng giá trị COD</div>
            <div className="text-2xl font-bold text-orange-600">
              {orders
                .reduce((sum, o) => sum + (o.deliveryInfo?.total_price || 0), 0)
                .toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div>
            <Button
              icon={<SyncOutlined />}
              onClick={() => fetchOrders(true)}
              loading={loading}
              size="large"
            >
              Làm mới
            </Button>
          </div>
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="order_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
        }}
        locale={{
          emptyText: 'Không có đơn hàng nào sẵn sàng giao',
        }}
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          visible={modalVisible}
          order={selectedOrder}
          onClose={() => {
            setModalVisible(false);
            setSelectedOrder(null);
          }}
          onStartDelivery={(order) => {
            setModalVisible(false);
            handleStartDelivery(order);
          }}
        />
      )}
    </div>
  );
};

export default ReadyForDeliveryTable;
