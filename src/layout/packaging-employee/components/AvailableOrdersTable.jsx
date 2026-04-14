import { useState, useEffect } from 'react';
import { Table, Button, message, Tag, Space, Modal } from 'antd';
import { DropboxOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { getAvailableOrders, getOrdersSummary, startPackagingOrder } from '../../../services/packagingEmployeeService';
import { formatDateTime } from '../../../utils/dateFormat';

const AvailableOrdersTable = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersSummary, setOrdersSummary] = useState({});
  const [startingOrder, setStartingOrder] = useState(null);

  // Fetch available orders
  const fetchOrders = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const [ordersResponse, summaryResponse] = await Promise.all([
        getAvailableOrders('CONFIRMED'),
        getOrdersSummary('CONFIRMED')
      ]);

      const responseType = ordersResponse.data?.type;

      // Handle GOOD and SKIP_AS_GOOD responses
      if (responseType === 'GOOD' || responseType === 'SKIP_AS_GOOD') {
        const ordersData = ordersResponse.data.detail || [];
        setOrders(ordersData);

        // Create summary map for quick lookup
        const summaryType = summaryResponse.data?.type;
        if (summaryType === 'GOOD' || summaryType === 'SKIP_AS_GOOD') {
          const summaryMap = {};
          (summaryResponse.data.detail || []).forEach(item => {
            summaryMap[item.order_id] = item;
          });
          setOrdersSummary(summaryMap);
        } else {
          setOrdersSummary({});
        }

        if (showSuccessMessage) {
          message.success('Đã làm mới danh sách đơn hàng');
        }
      } else {
        // Only show error for actual API failures
        setOrders([]);
        setOrdersSummary({});
        message.error('Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setOrdersSummary({});
      message.error('Có lỗi xảy ra khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle start packaging
  const handleStartPackaging = (orderId) => {
    Modal.confirm({
      title: 'Xác nhận bắt đầu đóng gói',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn bắt đầu đóng gói đơn hàng #${orderId}?`,
      okText: 'Bắt đầu',
      cancelText: 'Hủy',
      onOk: async () => {
        setStartingOrder(orderId);
        try {
          const response = await startPackagingOrder(orderId);
          if (response.data?.type === 'GOOD') {
            message.success('Đã bắt đầu đóng gói đơn hàng');
            // Refresh the list
            fetchOrders();
          } else {
            message.error('Không thể bắt đầu đóng gói đơn hàng');
          }
        } catch (error) {
          console.error('Error starting packaging:', error);
          message.error('Có lỗi xảy ra khi bắt đầu đóng gói');
        } finally {
          setStartingOrder(null);
        }
      },
    });
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
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.f_name} {record.l_name}
          </div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Số lượng SP',
      key: 'quantity',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const summary = ordersSummary[record.order_id];
        return summary ? (
          <div>
            <div className="font-semibold text-lg">{summary.total_quantity}</div>
            <div className="text-xs text-gray-500">{summary.num_of_item} loại</div>
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
      width: 120,
      render: (status) => (
        <Tag color="blue" className="text-sm">
          {status === 'CONFIRMED' ? 'Đã xác nhận' : status}
        </Tag>
      ),
    },
    {
      title: 'Cập nhật lúc',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 170,
      render: (date) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<DropboxOutlined />}
          onClick={() => handleStartPackaging(record.order_id)}
          loading={startingOrder === record.order_id}
          size="large"
          className="min-h-12"
        >
          Bắt đầu
        </Button>
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
            <div className="text-sm text-gray-600">Chờ đóng gói</div>
            <div className="text-2xl font-bold text-orange-600">
              {orders.filter(o => o.status === 'CONFIRMED').length}
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
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
        }}
        locale={{
          emptyText: 'Không có đơn hàng nào sẵn sàng đóng gói',
        }}
      />
    </div>
  );
};

export default AvailableOrdersTable;
