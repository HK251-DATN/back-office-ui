// src/layout/manage-packaging/components/PackagingTaskDetailModal.jsx
import { Modal, Descriptions, Spin, Alert, Table, Tag, Steps, Divider } from 'antd';
import { useState, useEffect } from 'react';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  CarOutlined,
  SafetyOutlined,
  WarningOutlined,
  InboxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getPackagingTaskById } from '../../../services/packagingService';

const UNIT_LABELS = {
  KILOGRAM: 'kg',
  GRAM: 'g',
  LITER: 'L',
  MILLILITER: 'mL'
};

const ORDER_TYPE_CONFIG = {
  FRESH: { emoji: '🥬', label: 'Tươi sống', color: 'green' },
  FROZEN: { emoji: '❄️', label: 'Đông lạnh', color: 'cyan' },
  DRY: { emoji: '📦', label: 'Khô', color: 'default' }
};

const BOX_SIZE_LABELS = {
  SMALL: 'Nhỏ',
  MEDIUM: 'Vừa',
  LARGE: 'Lớn',
  EXTRA_LARGE: 'Rất lớn'
};

function PackagingTaskDetailModal({ taskId, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchTaskDetail = async () => {
      if (!open || !taskId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getPackagingTaskById(taskId);

        if (response.data.type === 'GOOD') {
          setData(response.data.detail);
        } else {
          setError(response.data.message || 'Không thể tải thông tin đơn hàng');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [open, taskId]);

  // Timeline steps based on status
  const getTimelineSteps = () => {
    if (!data) return [];

    const steps = [
      {
        title: 'Đơn hàng đã đặt',
        icon: <ShoppingOutlined />,
        status: 'finish',
        description: data.timeline.orderPlaced ? dayjs(data.timeline.orderPlaced).format('HH:mm - DD/MM/YYYY') : null
      },
      {
        title: 'Sẵn sàng đóng gói',
        icon: <InboxOutlined />,
        status: data.timeline.readyForPackaging ? 'finish' : 'wait',
        description: data.timeline.readyForPackaging ? dayjs(data.timeline.readyForPackaging).format('HH:mm - DD/MM/YYYY') : null
      },
      {
        title: 'Đang đóng gói',
        icon: <ClockCircleOutlined />,
        status: data.timeline.packagingStarted ? 'finish' : data.status === 'PACKAGING' ? 'process' : 'wait',
        description: data.timeline.packagingStarted ? dayjs(data.timeline.packagingStarted).format('HH:mm - DD/MM/YYYY') : null
      },
      {
        title: 'Hoàn thành đóng gói',
        icon: <CheckCircleOutlined />,
        status: data.timeline.packagingCompleted ? 'finish' : data.status === 'QUALITY_CHECK' ? 'process' : 'wait',
        description: data.timeline.packagingCompleted ? dayjs(data.timeline.packagingCompleted).format('HH:mm - DD/MM/YYYY') : null
      },
      {
        title: 'Kiểm tra chất lượng',
        icon: <SafetyOutlined />,
        status: data.timeline.qualityCheckPassed ? 'finish' : 'wait',
        description: data.timeline.qualityCheckPassed ? dayjs(data.timeline.qualityCheckPassed).format('HH:mm - DD/MM/YYYY') : null
      },
      {
        title: 'Sẵn sàng giao hàng',
        icon: <CarOutlined />,
        status: data.timeline.readyForDelivery ? 'finish' : 'wait',
        description: data.timeline.readyForDelivery ? dayjs(data.timeline.readyForDelivery).format('HH:mm - DD/MM/YYYY') : null
      }
    ];

    return steps;
  };

  // Items table columns
  const itemColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: '30%'
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: '15%',
      render: (_, record) => `${record.quantity} ${UNIT_LABELS[record.unit] || record.unit}`
    },
    {
      title: 'Vị trí kho',
      dataIndex: 'warehouseLocation',
      key: 'warehouseLocation',
      width: '25%'
    },
    {
      title: 'HSD',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: '15%',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Bảo quản',
      key: 'refrigeration',
      width: '15%',
      render: (_, record) => (
        record.requiresRefrigeration ? (
          <Tag color="cyan">❄️ Lạnh</Tag>
        ) : (
          <Tag>Thường</Tag>
        )
      )
    }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <InboxOutlined style={{ fontSize: '1.25rem' }} />
          <span>Chi tiết đơn hàng {data?.orderId}</span>
          {data && (
            <Tag color={ORDER_TYPE_CONFIG[data.orderType]?.color}>
              {ORDER_TYPE_CONFIG[data.orderType]?.emoji} {ORDER_TYPE_CONFIG[data.orderType]?.label}
            </Tag>
          )}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: '56.25rem' }}
      destroyOnClose
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: '3.75rem 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: '1rem', color: '#999' }}>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
        />
      )}

      {!loading && !error && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Special Instructions Alert */}
          {data.specialInstructions && (
            <Alert
              message="Lưu ý đặc biệt"
              description={data.specialInstructions}
              type="warning"
              showIcon
              icon={<WarningOutlined />}
            />
          )}

          {/* Order Information */}
          <div>
            <h3 style={{ marginBottom: '1rem' }}>
              <ShoppingOutlined style={{ marginRight: '0.5rem' }} />
              Thông tin đơn hàng
            </h3>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đơn hàng">
                <strong>{data.orderId}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Loại đơn">
                <Tag color={ORDER_TYPE_CONFIG[data.orderType]?.color}>
                  {ORDER_TYPE_CONFIG[data.orderType]?.emoji} {ORDER_TYPE_CONFIG[data.orderType]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {data.customer.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {data.customer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                {data.customer.email}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {data.customer.deliveryAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Deadline">
                <strong style={{ color: '#ff4d4f' }}>
                  {dayjs(data.deadline).format('HH:mm - DD/MM/YYYY')}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Độ ưu tiên">
                {data.priority === 'HIGH' && <Tag color="red">Cao</Tag>}
                {data.priority === 'MEDIUM' && <Tag color="orange">Trung bình</Tag>}
                {data.priority === 'LOW' && <Tag color="blue">Thấp</Tag>}
              </Descriptions.Item>
              {data.assignedEmployee && (
                <>
                  <Descriptions.Item label="Nhân viên đóng gói" span={2}>
                    {data.assignedEmployee.name}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>

          {/* Items List */}
          <div>
            <h3 style={{ marginBottom: '1rem' }}>
              <InboxOutlined style={{ marginRight: '0.5rem' }} />
              Danh sách sản phẩm ({data.items?.length || 0} món)
            </h3>
            <Table
              columns={itemColumns}
              dataSource={data.items}
              rowKey="productDetailId"
              pagination={false}
              size="small"
              bordered
            />
          </div>

          {/* Packaging Requirements */}
          <div>
            <h3 style={{ marginBottom: '1rem' }}>
              <InboxOutlined style={{ marginRight: '0.5rem' }} />
              Yêu cầu đóng gói
            </h3>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Kích thước thùng">
                {BOX_SIZE_LABELS[data.packagingRequirements?.boxSize] || data.packagingRequirements?.boxSize}
              </Descriptions.Item>
              <Descriptions.Item label="Ice pack">
                {data.packagingRequirements?.needsIcePack ? (
                  <span>
                    ✅ Cần ({data.packagingRequirements.icePackCount} pack)
                  </span>
                ) : (
                  <span>❌ Không cần</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Túi cách nhiệt">
                {data.packagingRequirements?.needsInsulation ? '✅ Cần' : '❌ Không cần'}
              </Descriptions.Item>
              <Descriptions.Item label="Hàng dễ vỡ">
                {data.packagingRequirements?.fragile ? (
                  <Tag color="red">⚠️ Cẩn thận</Tag>
                ) : (
                  <span>Không</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Timeline */}
          <div>
            <h3 style={{ marginBottom: '1rem' }}>
              <ClockCircleOutlined style={{ marginRight: '0.5rem' }} />
              Tiến trình đóng gói
            </h3>
            <Steps
              current={getTimelineSteps().findIndex(step => step.status === 'process')}
              items={getTimelineSteps()}
              direction="vertical"
              size="small"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

export default PackagingTaskDetailModal;
