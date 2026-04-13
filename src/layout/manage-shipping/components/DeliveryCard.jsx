import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { Button, Divider, Tag } from 'antd';

const statusConfig = {
  PENDING: {
    color: 'warning',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
    tagColor: 'warning',
    label: 'Chờ lấy hàng',
    icon: Inventory2OutlinedIcon
  },
  ASSIGNED: {
    color: 'processing',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    tagColor: 'blue',
    label: 'Đã phân tài xế',
    icon: LocalShippingOutlinedIcon
  },
  PICKED_UP: {
    color: 'processing',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    tagColor: 'cyan',
    label: 'Đã lấy hàng',
    icon: LocalShippingOutlinedIcon
  },
  DELIVERING: {
    color: 'primary',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    tagColor: 'blue',
    label: 'Đang giao',
    icon: LocalShippingOutlinedIcon
  },
  DELIVERED: {
    color: 'success',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    tagColor: 'success',
    label: 'Đã giao',
    icon: CheckCircleOutlineOutlinedIcon
  },
  FAILED: {
    color: 'error',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    tagColor: 'error',
    label: 'Giao thất bại',
    icon: CancelOutlinedIcon
  },
  CANCELLED: {
    color: 'default',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    tagColor: 'default',
    label: 'Đã hủy',
    icon: CancelOutlinedIcon
  }
};

export const DeliveryCard = ({ delivery, onViewDetail, onAssignDriver }) => {
  const config = statusConfig[delivery.status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  const formatTime = (isoString) => {
    if (!isoString) return '';
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

  return (
    <div className="flex flex-col gap-5 h-fit w-full border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      {/* TOP ROW */}
      <div className='flex flex-row justify-between'>
        {/* COL 1 */}
        <div className="flex flex-row gap-5">
          <div className={`flex items-center justify-center p-4 h-fit w-fit rounded-xl ${config.bgClass}`}>
            <StatusIcon color={config.color} />
          </div>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-3'>
              <p className='text-xl font-semibold'>{delivery.orderId}</p>
              {delivery.priority === 'URGENT' && (
                <Tag color="red">Ưu tiên cao</Tag>
              )}
            </div>
            <p className='font-medium'>{delivery.customer.name}</p>
            <p className='text-gray-600'>{delivery.customer.phone}</p>
            <p className='address text-gray-600 text-sm'>
              <span className='font-medium'>Địa chỉ:</span> {delivery.customer.address}
            </p>
            {delivery.driver && (
              <p className='text-sm'>
                <span className='font-medium'>Tài xế:</span> {delivery.driver.name}
              </p>
            )}
            {delivery.notes && (
              <p className='text-sm text-orange-600'>
                <span className='font-medium'>Ghi chú:</span> {delivery.notes}
              </p>
            )}
          </div>
        </div>

        {/* COL 2 */}
        <div className='flex flex-col gap-2 items-end'>
          <Tag color={config.tagColor} className='text-sm px-3 py-1'>
            {config.label}
          </Tag>
          <p className='text-sm text-gray-500'>
            {delivery.status === 'DELIVERED'
              ? formatTime(delivery.actualDeliveryTime)
              : formatTime(delivery.createdAt)
            }
          </p>
        </div>
      </div>

      <Divider style={{ margin: 0, color: 'rgba(0,0,0,0.5)' }} />

      {/* BOTTOM ROW */}
      <div className='flex flex-row justify-between items-end'>
        {/* COL 1 */}
        <div className='flex flex-row gap-8'>
          <div className='flex flex-col gap-1'>
            <p className='text-gray-600 text-sm'>Tổng tiền hàng</p>
            <p className='font-semibold'>{formatCurrency(delivery.totalAmount)}</p>
          </div>

          <div className='flex flex-col gap-1'>
            <p className='text-gray-600 text-sm'>Phí ship</p>
            <p className='font-semibold'>{formatCurrency(delivery.shippingFee)}</p>
          </div>

          <div className='flex flex-col gap-1'>
            <p className='text-gray-600 text-sm'>Khoảng cách</p>
            <p className='font-semibold'>{delivery.distance} km</p>
          </div>

          <div className='flex flex-col gap-1'>
            <p className='text-gray-600 text-sm'>Thanh toán</p>
            <Tag color={delivery.paymentStatus === 'PAID' ? 'success' : 'warning'}>
              {delivery.paymentMethod === 'COD' ? 'COD' : 'Đã thanh toán'}
            </Tag>
          </div>
        </div>

        {/* COL 2 */}
        <div className='flex items-end justify-end gap-3'>
          {delivery.status === 'PENDING' && (
            <Button
              size='large'
              onClick={() => onAssignDriver(delivery)}
            >
              Phân công tài xế
            </Button>
          )}
          <Button
            type='primary'
            size='large'
            onClick={() => onViewDetail(delivery)}
          >
            Chi tiết
          </Button>
        </div>
      </div>
    </div>
  );
};
