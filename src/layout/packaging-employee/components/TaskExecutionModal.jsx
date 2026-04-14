import { useState, useEffect } from 'react';
import { Modal, Tabs, Spin, Alert, Descriptions, Tag, Progress, Button, message, List, Card } from 'antd';
import { ShoppingOutlined, CheckCircleOutlined, CloseCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { getOrderDetails, getPickList } from '../../../services/packagingEmployeeService';
import { formatDateTime } from '../../../utils/dateFormat';
import ProductSelectionModal from './ProductSelectionModal';

const TaskExecutionModal = ({ visible, onClose, task }) => {
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [pickList, setPickList] = useState([]);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [productModalVisible, setProductModalVisible] = useState(false);

  // Fetch order details and pick list
  const fetchData = async () => {
    if (!task?.order_id) return;

    setLoading(true);
    try {
      const [details, pickListResponse] = await Promise.all([
        getOrderDetails(task.order_id),
        getPickList(task.order_id)
      ]);

      setOrderDetails(details);

      if (pickListResponse.data?.type === 'GOOD') {
        setPickList(pickListResponse.data.detail || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Có lỗi xảy ra khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible, task]);

  // Handle product selection
  const handleSelectProduct = (orderItem) => {
    setSelectedOrderItem(orderItem);
    setProductModalVisible(true);
  };

  // Handle product linked successfully
  const handleProductLinked = () => {
    setProductModalVisible(false);
    setSelectedOrderItem(null);
    // Refresh data to update progress
    fetchData();
  };

  // Get status of order item
  const getOrderItemStatus = (item) => {
    if (item.productDetailId) {
      return { status: 'linked', color: 'success', text: 'Đã liên kết', icon: <CheckCircleOutlined /> };
    }
    return { status: 'pending', color: 'warning', text: 'Chưa liên kết', icon: <CloseCircleOutlined /> };
  };

  // Calculate overall progress
  const calculateProgress = () => {
    if (pickList.length === 0) return 0;
    const linked = pickList.filter(item => item.productDetailId).length;
    return Math.round((linked / pickList.length) * 100);
  };

  const tabItems = [
    {
      key: 'order-info',
      label: (
        <span className="flex items-center gap-2">
          <ShoppingOutlined />
          Thông tin đơn hàng
        </span>
      ),
      children: (
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : orderDetails ? (
            <>
              {/* Order Details from Back Office */}
              <Card title="Thông tin xử lý" className="mb-4">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Mã đơn hàng">
                    <span className="font-semibold">#{orderDetails.backOffice?.orderId}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={orderDetails.backOffice?.status === 'PACKING' ? 'processing' : 'blue'}>
                      {orderDetails.backOffice?.status === 'PACKING' ? 'Đang đóng gói' : orderDetails.backOffice?.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiến độ đóng gói">
                    <Progress percent={orderDetails.backOffice?.packagingProgress || 0} size="small" />
                  </Descriptions.Item>
                  <Descriptions.Item label="Người đóng gói">
                    ID: {orderDetails.backOffice?.packagedBy || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Order Details from Ecommerce */}
              <Card title="Thông tin đơn hàng" className="mb-4">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Khách hàng ID">
                    {orderDetails.ecommerce?.buyerId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ ID">
                    {orderDetails.ecommerce?.addressId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng giá trị">
                    <span className="font-semibold text-lg text-green-600">
                      {orderDetails.ecommerce?.totalPrice?.toLocaleString('vi-VN')} đ
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú">
                    {orderDetails.ecommerce?.note || <span className="text-gray-400">Không có ghi chú</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {formatDateTime(orderDetails.ecommerce?.createdAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cập nhật">
                    {formatDateTime(orderDetails.ecommerce?.updatedAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Order Items */}
              {orderDetails.ecommerce?.orderItems && orderDetails.ecommerce.orderItems.length > 0 && (
                <Card title="Sản phẩm trong đơn hàng">
                  <List
                    dataSource={orderDetails.ecommerce.orderItems}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={`Order Item #${item.orderItemId}`}
                          description={
                            <div className="space-y-1">
                              <div>Batch Detail ID: {item.batchDetailId}</div>
                              <div>Số lượng: <strong>{item.quantity}</strong></div>
                              <div>Đơn giá: {item.unitPriceAtPurchase?.toLocaleString('vi-VN')} đ</div>
                              <div>Tổng: <strong>{item.totalPrice?.toLocaleString('vi-VN')} đ</strong></div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </>
          ) : (
            <Alert message="Không có thông tin đơn hàng" type="info" />
          )}
        </div>
      ),
    },
    {
      key: 'pick-list',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Danh sách lấy hàng
        </span>
      ),
      children: (
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {/* Progress Summary */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Tiến độ tổng thể</span>
                  <span className="text-lg font-bold">{calculateProgress()}%</span>
                </div>
                <Progress percent={calculateProgress()} strokeColor="#1890ff" />
                <div className="mt-2 text-sm text-gray-600">
                  {pickList.filter(item => item.productDetailId).length} / {pickList.length} sản phẩm đã liên kết
                </div>
              </div>

              {/* Pick List Items */}
              {pickList.length > 0 ? (
                <List
                  dataSource={pickList}
                  renderItem={(item) => {
                    const itemStatus = getOrderItemStatus(item);
                    return (
                      <List.Item
                        actions={[
                          <Button
                            type={item.productDetailId ? 'default' : 'primary'}
                            icon={<LinkOutlined />}
                            onClick={() => handleSelectProduct(item)}
                            size="large"
                            disabled={!!item.productDetailId}
                          >
                            {item.productDetailId ? 'Đã liên kết' : 'Chọn sản phẩm'}
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-base">{item.name}</span>
                              <Tag color={itemStatus.color} icon={itemStatus.icon}>
                                {itemStatus.text}
                              </Tag>
                            </div>
                          }
                          description={
                            <div className="space-y-1 text-sm">
                              <div>Order Item ID: <strong>#{item.orderItemId}</strong></div>
                              <div>Batch Detail ID: {item.batchDetailId}</div>
                              <div>Batch ID: {item.batchId}</div>
                              <div>Đơn vị: <Tag>{item.unit}</Tag></div>
                              {item.productDetailId && (
                                <div className="text-green-600 font-medium">
                                  ✓ Product Detail ID: {item.productDetailId}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Alert message="Không có sản phẩm nào trong danh sách" type="info" />
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          <div className="text-xl">
            Đóng gói đơn hàng #{task?.order_id}
          </div>
        }
        open={visible}
        onCancel={onClose}
        width={900}
        footer={[
          <Button key="close" size="large" onClick={onClose}>
            Đóng
          </Button>,
        ]}
      >
        <Tabs items={tabItems} size="large" />
      </Modal>

      {/* Product Selection Modal */}
      {selectedOrderItem && (
        <ProductSelectionModal
          visible={productModalVisible}
          onClose={() => {
            setProductModalVisible(false);
            setSelectedOrderItem(null);
          }}
          orderItem={selectedOrderItem}
          onProductLinked={handleProductLinked}
        />
      )}
    </>
  );
};

export default TaskExecutionModal;
