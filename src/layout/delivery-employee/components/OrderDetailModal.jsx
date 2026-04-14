import { Modal, Descriptions, Tag, Button, List, Alert } from 'antd';
import { PhoneOutlined, EnvironmentOutlined, TruckOutlined } from '@ant-design/icons';
import { formatDateTime } from '../../../utils/dateFormat';

const OrderDetailModal = ({ visible, order, onClose, onStartDelivery }) => {
  if (!order) return null;

  const deliveryInfo = order.deliveryInfo;

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

  const fullAddress = formatAddress(deliveryInfo);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <Modal
      title={
        <div className="text-xl">
          Chi tiết đơn hàng #{order.order_id}
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" size="large" onClick={onClose}>
          Đóng
        </Button>,
        onStartDelivery && order.status === 'READY_FOR_PICKUP' && (
          <Button
            key="start"
            type="primary"
            size="large"
            icon={<TruckOutlined />}
            onClick={() => onStartDelivery(order)}
          >
            Bắt đầu giao hàng
          </Button>
        ),
      ]}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Delivery Status */}
        <Alert
          message={
            <div className="flex items-center justify-between">
              <span>Trạng thái:</span>
              <Tag color={order.status === 'SHIPPING' ? 'processing' : 'blue'} className="text-sm">
                {order.status === 'READY_FOR_PICKUP' && 'Sẵn sàng giao'}
                {order.status === 'SHIPPING' && 'Đang giao'}
                {order.status === 'DELIVERED' && 'Đã giao'}
              </Tag>
            </div>
          }
          type={order.status === 'SHIPPING' ? 'info' : 'success'}
        />

        {/* Customer Information */}
        {deliveryInfo && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <PhoneOutlined />
              Thông tin người nhận
            </h3>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tên người nhận">
                <span className="font-medium text-base">{deliveryInfo.receiver_name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <a
                  href={`tel:${deliveryInfo.receiver_p_num}`}
                  className="text-blue-600 font-semibold text-base hover:underline flex items-center gap-1"
                >
                  <PhoneOutlined />
                  {deliveryInfo.receiver_p_num}
                </a>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {/* Delivery Address */}
        {deliveryInfo && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <EnvironmentOutlined />
              Địa chỉ giao hàng
            </h3>
            <div className="space-y-2">
              <div className="text-base">
                <strong>Địa chỉ:</strong>
                <div className="mt-1 text-gray-700">{deliveryInfo.detail}</div>
              </div>
              <div className="text-sm text-gray-600">
                {deliveryInfo.commune && <div>Phường/Xã: {deliveryInfo.commune}</div>}
                {deliveryInfo.district && <div>Quận/Huyện: {deliveryInfo.district}</div>}
                {deliveryInfo.province && <div>Tỉnh/TP: {deliveryInfo.province}</div>}
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:underline font-medium"
              >
                <EnvironmentOutlined />
                Mở bản đồ Google Maps
              </a>
              {deliveryInfo.note && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <strong className="text-sm">Ghi chú:</strong>
                  <div className="text-sm mt-1">{deliveryInfo.note}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Information */}
        {deliveryInfo && (
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-lg mb-3">Thông tin thanh toán</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tổng giá trị đơn hàng:</span>
                <span className="text-2xl font-bold text-green-600">
                  {deliveryInfo.total_price?.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Phương thức:</span>
                <Tag color="orange" className="text-base px-3 py-1">
                  Thu tiền khi giao hàng (COD)
                </Tag>
              </div>
            </div>
          </div>
        )}

        {/* Order Information */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3">Thông tin đơn hàng</h3>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Mã đơn hàng">
              <span className="font-semibold">#{order.order_id}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {order.f_name} {order.l_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {order.email}
            </Descriptions.Item>
            <Descriptions.Item label="Tiến độ đóng gói">
              {order.packaging_progress || 0}%
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lúc">
              {formatDateTime(order.updated_at)}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Special Instructions */}
        {deliveryInfo?.note && (
          <Alert
            message="Lưu ý đặc biệt"
            description={deliveryInfo.note}
            type="warning"
            showIcon
          />
        )}
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
