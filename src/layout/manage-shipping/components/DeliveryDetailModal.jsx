import { Modal, Descriptions, Tag, Timeline, Button, Select, Input } from 'antd';
import { useState } from 'react';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';

const { TextArea } = Input;

const statusOptions = [
  { value: 'PENDING', label: 'Chờ lấy hàng' },
  { value: 'ASSIGNED', label: 'Đã phân tài xế' },
  { value: 'PICKED_UP', label: 'Đã lấy hàng' },
  { value: 'DELIVERING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'FAILED', label: 'Giao thất bại' },
  { value: 'CANCELLED', label: 'Đã hủy' }
];

const statusColorMap = {
  PENDING: 'warning',
  ASSIGNED: 'processing',
  PICKED_UP: 'cyan',
  DELIVERING: 'blue',
  DELIVERED: 'success',
  FAILED: 'error',
  CANCELLED: 'default'
};

export const DeliveryDetailModal = ({ open, onClose, delivery, onUpdateStatus }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');

  if (!delivery) return null;

  const formatTime = (isoString) => {
    if (!isoString) return 'Chưa có';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;

    setUpdatingStatus(true);
    const success = await onUpdateStatus(delivery.id, newStatus, statusNotes);
    setUpdatingStatus(false);

    if (success) {
      setNewStatus(null);
      setStatusNotes('');
      onClose();
    }
  };

  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`);
  };

  return (
    <Modal
      title={`Chi tiết đơn hàng ${delivery.orderId}`}
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
    >
      <div className='flex flex-col gap-6'>
        {/* Status and Priority */}
        <div className='flex gap-3'>
          <Tag color={statusColorMap[delivery.status]} className='px-3 py-1'>
            {statusOptions.find(s => s.value === delivery.status)?.label}
          </Tag>
          {delivery.priority === 'URGENT' && (
            <Tag color="red" className='px-3 py-1'>Ưu tiên cao</Tag>
          )}
          <Tag color={delivery.paymentStatus === 'PAID' ? 'success' : 'warning'} className='px-3 py-1'>
            {delivery.paymentMethod === 'COD' ? 'COD' : 'Đã thanh toán'}
          </Tag>
        </div>

        {/* Customer Information */}
        <div>
          <h3 className='font-semibold mb-3 text-base'>Thông tin khách hàng</h3>
          <Descriptions bordered size='small' column={2}>
            <Descriptions.Item label="Tên khách hàng" span={2}>
              {delivery.customer.name}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <div className='flex items-center gap-2'>
                {delivery.customer.phone}
                <Button
                  size='small'
                  icon={<PhoneOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => handleCall(delivery.customer.phone)}
                />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
              {delivery.customer.address}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Driver Information */}
        {delivery.driver && (
          <div>
            <h3 className='font-semibold mb-3 text-base'>Thông tin tài xế</h3>
            <Descriptions bordered size='small' column={2}>
              <Descriptions.Item label="Tên tài xế">
                {delivery.driver.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <div className='flex items-center gap-2'>
                  {delivery.driver.phone}
                  <Button
                    size='small'
                    icon={<PhoneOutlinedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => handleCall(delivery.driver.phone)}
                  />
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Phương tiện">
                {delivery.driver.vehicleType === 'MOTORCYCLE' ? 'Xe máy' :
                  delivery.driver.vehicleType === 'CAR' ? 'Ô tô' : 'Xe tải'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {/* Order Items */}
        <div>
          <h3 className='font-semibold mb-3 text-base'>Sản phẩm trong đơn</h3>
          <div className='border rounded-lg overflow-hidden'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='text-left p-3 border-b'>Sản phẩm</th>
                  <th className='text-right p-3 border-b'>Số lượng</th>
                  <th className='text-right p-3 border-b'>Đơn giá</th>
                  <th className='text-right p-3 border-b'>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {delivery.items.map((item, index) => (
                  <tr key={index} className='border-b last:border-b-0'>
                    <td className='p-3'>{item.productName}</td>
                    <td className='p-3 text-right'>{item.quantity}</td>
                    <td className='p-3 text-right'>{formatCurrency(item.unitPrice)}</td>
                    <td className='p-3 text-right font-semibold'>{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
                <tr className='bg-gray-50 font-semibold'>
                  <td colSpan={3} className='p-3 text-right'>Tổng tiền hàng:</td>
                  <td className='p-3 text-right'>{formatCurrency(delivery.totalAmount)}</td>
                </tr>
                <tr className='bg-gray-50'>
                  <td colSpan={3} className='p-3 text-right'>Phí vận chuyển:</td>
                  <td className='p-3 text-right'>{formatCurrency(delivery.shippingFee)}</td>
                </tr>
                <tr className='bg-blue-50 font-bold text-lg'>
                  <td colSpan={3} className='p-3 text-right'>Tổng cộng:</td>
                  <td className='p-3 text-right text-blue-700'>
                    {formatCurrency(delivery.totalAmount + delivery.shippingFee)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Delivery Information */}
        <div>
          <h3 className='font-semibold mb-3 text-base'>Thông tin giao hàng</h3>
          <Descriptions bordered size='small' column={2}>
            <Descriptions.Item label="Khoảng cách">
              {delivery.distance} km
            </Descriptions.Item>
            <Descriptions.Item label="Kho xuất">
              {delivery.warehouse.name}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian tạo đơn">
              {formatTime(delivery.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Dự kiến giao">
              {formatTime(delivery.estimatedDeliveryTime)}
            </Descriptions.Item>
            {delivery.actualDeliveryTime && (
              <Descriptions.Item label="Thời gian giao thực tế" span={2}>
                {formatTime(delivery.actualDeliveryTime)}
              </Descriptions.Item>
            )}
            {delivery.notes && (
              <Descriptions.Item label="Ghi chú" span={2}>
                <span className='text-orange-600'>{delivery.notes}</span>
              </Descriptions.Item>
            )}
            {delivery.failureReason && (
              <Descriptions.Item label="Lý do thất bại" span={2}>
                <span className='text-red-600'>{delivery.failureReason}</span>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        {/* Status History Timeline */}
        <div>
          <h3 className='font-semibold mb-3 text-base'>Lịch sử trạng thái</h3>
          <Timeline
            items={delivery.statusHistory.map(history => ({
              color: statusColorMap[history.status],
              children: (
                <div>
                  <div className='font-semibold'>
                    {statusOptions.find(s => s.value === history.status)?.label}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {formatTime(history.timestamp)}
                  </div>
                  {history.notes && (
                    <div className='text-sm text-gray-700 mt-1'>{history.notes}</div>
                  )}
                </div>
              )
            }))}
          />
        </div>

        {/* Update Status Section */}
        {delivery.status !== 'DELIVERED' && delivery.status !== 'CANCELLED' && (
          <div className='border-t pt-4'>
            <h3 className='font-semibold mb-3 text-base'>Cập nhật trạng thái</h3>
            <div className='flex flex-col gap-3'>
              <Select
                placeholder="Chọn trạng thái mới"
                value={newStatus}
                onChange={setNewStatus}
                options={statusOptions}
                className='w-full'
              />
              <TextArea
                placeholder="Ghi chú (tùy chọn)"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
              />
              <Button
                type='primary'
                onClick={handleUpdateStatus}
                loading={updatingStatus}
                disabled={!newStatus}
              >
                Cập nhật trạng thái
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
