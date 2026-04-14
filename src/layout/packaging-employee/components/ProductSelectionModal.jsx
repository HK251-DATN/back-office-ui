import { useState, useEffect } from 'react';
import { Modal, Table, Button, message, Tag, Alert, Space } from 'antd';
import { EnvironmentOutlined, InboxOutlined, CheckOutlined } from '@ant-design/icons';
import { getAvailableProducts, linkProductToOrderItem } from '../../../services/packagingEmployeeService';

const ProductSelectionModal = ({ visible, onClose, orderItem, onProductLinked }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [linking, setLinking] = useState(null);

  // Fetch available products
  const fetchProducts = async () => {
    if (!orderItem?.orderItemId) return;

    setLoading(true);
    try {
      const response = await getAvailableProducts(orderItem.orderItemId);
      if (response.data?.type === 'GOOD') {
        setProducts(response.data.detail || []);
      } else {
        message.error('Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Có lỗi xảy ra khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchProducts();
    }
  }, [visible, orderItem]);

  // Handle link product
  const handleLinkProduct = async (productDetailId) => {
    setLinking(productDetailId);
    try {
      const response = await linkProductToOrderItem(orderItem.orderItemId, productDetailId);
      if (response.data?.type === 'GOOD') {
        message.success('Đã liên kết sản phẩm thành công');
        // Call parent callback
        if (onProductLinked) {
          onProductLinked();
        }
      } else {
        message.error('Không thể liên kết sản phẩm');
      }
    } catch (error) {
      console.error('Error linking product:', error);
      message.error('Có lỗi xảy ra khi liên kết sản phẩm');
    } finally {
      setLinking(null);
    }
  };

  // Get storage tool type label
  const getToolTypeLabel = (toolType) => {
    const types = {
      1: 'Kệ',
      2: 'Tủ lạnh',
    };
    return types[toolType] || `Type ${toolType}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      STORED: 'success',
      RESERVED: 'warning',
      SOLD: 'default',
      EXPIRED: 'error',
    };
    return colors[status] || 'default';
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      STORED: 'Đã lưu kho',
      RESERVED: 'Đã đặt trước',
      SOLD: 'Đã bán',
      EXPIRED: 'Hết hạn',
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: 'ID Sản phẩm',
      dataIndex: 'prodDetailId',
      key: 'prodDetailId',
      width: 120,
      render: (id) => (
        <span className="font-semibold text-blue-600">#{id}</span>
      ),
      fixed: 'left',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Vị trí lưu trữ',
      key: 'location',
      width: 250,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <EnvironmentOutlined className="text-blue-500" />
            <span className="font-medium">Kho #{record.warehouseId}</span>
          </div>
          <div className="text-xs text-gray-500">
            {record.warehouseAddress}
          </div>
        </div>
      ),
    },
    {
      title: 'Công cụ lưu trữ',
      key: 'storageTool',
      width: 150,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <InboxOutlined className="text-green-500" />
            <span>{getToolTypeLabel(record.toolType)}</span>
          </div>
          <div className="text-xs text-gray-500">
            ID: {record.storageToolId}
          </div>
          {record.rackId && (
            <div className="text-xs text-gray-500">
              Rack ID: {record.rackId}
            </div>
          )}
          {record.fridgeId && (
            <div className="text-xs text-gray-500">
              Fridge ID: {record.fridgeId}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => handleLinkProduct(record.prodDetailId)}
          loading={linking === record.prodDetailId}
          disabled={record.status !== 'STORED' || linking !== null}
          size="large"
          className="min-h-12"
        >
          Chọn
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div>
          <div className="text-xl mb-2">Chọn sản phẩm để đóng gói</div>
          <div className="text-sm font-normal text-gray-600">
            Order Item ID: <strong>#{orderItem?.orderItemId}</strong> - {orderItem?.name}
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="close" size="large" onClick={onClose}>
          Hủy
        </Button>,
      ]}
    >
      {/* Info Alert */}
      <Alert
        message="Hướng dẫn"
        description={
          <div className="space-y-2">
            <p>• Chọn một sản phẩm có trạng thái "Đã lưu kho" để liên kết với order item này</p>
            <p>• Sau khi liên kết, tiến độ đóng gói sẽ tự động cập nhật</p>
            <p>• Lưu ý vị trí lưu trữ để lấy đúng sản phẩm</p>
          </div>
        }
        type="info"
        showIcon
        className="mb-4"
      />

      {/* Products Table */}
      <Table
        columns={columns}
        dataSource={products}
        rowKey="prodDetailId"
        loading={loading}
        scroll={{ x: 900 }}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} sản phẩm`,
        }}
        locale={{
          emptyText: 'Không có sản phẩm nào khả dụng',
        }}
        rowClassName={(record) => {
          if (record.status === 'STORED') return 'cursor-pointer hover:bg-blue-50';
          return 'opacity-60';
        }}
      />

      {/* Statistics */}
      {products.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <Space size="large">
            <div>
              <span className="text-gray-600">Tổng sản phẩm: </span>
              <span className="font-semibold">{products.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Có sẵn: </span>
              <span className="font-semibold text-green-600">
                {products.filter(p => p.status === 'STORED').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Không khả dụng: </span>
              <span className="font-semibold text-red-600">
                {products.filter(p => p.status !== 'STORED').length}
              </span>
            </div>
          </Space>
        </div>
      )}
    </Modal>
  );
};

export default ProductSelectionModal;
