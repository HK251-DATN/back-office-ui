import { useState, useEffect } from 'react';
import { Table, Button, message, Tag, Space, Modal, Input } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, SyncOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { getMyTasksWithDeliveryInfo, completeDelivery } from '../../../services/deliveryEmployeeService';
import { formatDateTime } from '../../../utils/dateFormat';
import OrderDetailModal from './OrderDetailModal';

const { TextArea } = Input;

const MyDeliveryTasksTable = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [completingOrder, setCompletingOrder] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState(null);

  // Fetch delivery tasks with delivery info
  const fetchTasks = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const response = await getMyTasksWithDeliveryInfo();
      const responseType = response.data?.type;

      // Handle GOOD and SKIP_AS_GOOD responses
      if (responseType === 'GOOD' || responseType === 'SKIP_AS_GOOD') {
        setTasks(response.data.detail || []);
        if (showSuccessMessage) {
          message.success('Đã làm mới danh sách nhiệm vụ');
        }
      } else {
        // Only show error for actual API failures
        setTasks([]);
        message.error('Không thể tải danh sách nhiệm vụ');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      message.error('Có lỗi xảy ra khi tải danh sách nhiệm vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle view details
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  // Handle complete delivery - open confirmation modal
  const handleCompleteDelivery = (order) => {
    setOrderToComplete(order);
    setDeliveryNotes('');
    setConfirmModalVisible(true);
  };

  // Confirm delivery completion
  const confirmCompleteDelivery = async () => {
    if (!orderToComplete) return;

    setCompletingOrder(orderToComplete.order_id);
    try {
      const response = await completeDelivery(orderToComplete.order_id, {
        delivery_notes: deliveryNotes || undefined
      });

      if (response.data?.type === 'GOOD') {
        message.success(`Đã hoàn thành giao hàng đơn #${orderToComplete.order_id}`);
        setConfirmModalVisible(false);
        setOrderToComplete(null);
        setDeliveryNotes('');
        // Refresh the list
        fetchTasks();
      } else {
        message.error('Không thể hoàn thành giao hàng');
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
      message.error('Có lỗi xảy ra khi hoàn thành giao hàng');
    } finally {
      setCompletingOrder(null);
    }
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
      width: 280,
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
      width: 130,
      render: (status) => (
        <Tag color="processing" className="text-sm">
          {status === 'SHIPPING' ? 'Đang giao' : status}
        </Tag>
      ),
    },
    {
      title: 'Bắt đầu lúc',
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
            icon={<CheckCircleOutlined />}
            onClick={() => handleCompleteDelivery(record)}
            loading={completingOrder === record.order_id}
            size="large"
            className="min-h-12"
          >
            Đã giao hàng
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Stats Summary */}
      <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <Space size="large" className="flex-wrap">
          <div>
            <div className="text-sm text-gray-600">Nhiệm vụ của tôi</div>
            <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Đang giao</div>
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.status === 'SHIPPING').length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Cần thu tiền</div>
            <div className="text-2xl font-bold text-orange-600">
              {tasks
                .reduce((sum, t) => sum + (t.deliveryInfo?.total_price || 0), 0)
                .toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div>
            <Button
              icon={<SyncOutlined />}
              onClick={() => fetchTasks(true)}
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
        dataSource={tasks}
        rowKey="order_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} nhiệm vụ`,
        }}
        locale={{
          emptyText: 'Bạn chưa có nhiệm vụ giao hàng nào',
        }}
      />

      {/* Order Detail Modal */}
      {selectedTask && (
        <OrderDetailModal
          visible={modalVisible}
          order={selectedTask}
          onClose={() => {
            setModalVisible(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Delivery Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-600" />
            <span>Xác nhận đã giao hàng</span>
          </div>
        }
        open={confirmModalVisible}
        onCancel={() => {
          setConfirmModalVisible(false);
          setOrderToComplete(null);
          setDeliveryNotes('');
        }}
        onOk={confirmCompleteDelivery}
        okText="Xác nhận giao hàng"
        cancelText="Hủy"
        confirmLoading={completingOrder !== null}
        okButtonProps={{ size: 'large' }}
        cancelButtonProps={{ size: 'large' }}
      >
        <div className="space-y-4">
          <p className="text-base">
            Bạn có chắc chắn đã giao hàng thành công cho đơn hàng{' '}
            <strong>#{orderToComplete?.order_id}</strong>?
          </p>

          {orderToComplete?.deliveryInfo && (
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm space-y-1">
                <div>
                  <strong>Người nhận:</strong> {orderToComplete.deliveryInfo.receiver_name}
                </div>
                <div>
                  <strong>Số tiền thu:</strong>{' '}
                  <span className="text-green-600 font-semibold">
                    {orderToComplete.deliveryInfo.total_price?.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Ghi chú giao hàng (không bắt buộc)
            </label>
            <TextArea
              rows={3}
              placeholder="VD: Giao hàng thành công, khách nhận trực tiếp"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyDeliveryTasksTable;
