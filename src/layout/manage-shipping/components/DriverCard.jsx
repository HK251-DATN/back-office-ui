import { Tag, Rate } from 'antd';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

const vehicleIcons = {
  MOTORCYCLE: TwoWheelerOutlinedIcon,
  CAR: DirectionsCarOutlinedIcon,
  TRUCK: LocalShippingOutlinedIcon
};

const statusConfig = {
  AVAILABLE: { color: 'success', label: 'Rảnh' },
  BUSY: { color: 'processing', label: 'Bận' },
  OFFLINE: { color: 'default', label: 'Offline' }
};

export const DriverCard = ({ driver, onClick }) => {
  const VehicleIcon = vehicleIcons[driver.vehicleType] || TwoWheelerOutlinedIcon;
  const statusInfo = statusConfig[driver.status] || statusConfig.OFFLINE;

  return (
    <div
      className="flex flex-col border border-gray-200 p-4 gap-3 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(driver)}
    >
      <div className="flex flex-row justify-between items-start">
        <div className="flex flex-row gap-3 items-center">
          {/* Avatar */}
          <div>
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>

          <div className='flex flex-col gap-1'>
            {/* Thông tin nhân viên */}
            <p className='font-semibold'>{driver.name}</p>
            {/* Phương tiện */}
            <div className='flex items-center gap-1 text-sm text-gray-600'>
              <VehicleIcon sx={{ fontSize: 16 }} />
              <span>{driver.vehiclePlate}</span>
            </div>
            {/* Rating */}
            <div className='flex items-center gap-2'>
              <Rate disabled defaultValue={driver.rating} allowHalf className='text-xs' />
              <span className='text-xs text-gray-600'>({driver.rating})</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <Tag color={statusInfo.color} className='px-2 py-1'>
          {statusInfo.label}
        </Tag>
      </div>

      {/* Current delivery info */}
      {driver.currentDelivery ? (
        <div className="h-fit w-full px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className='text-sm text-blue-700'>
            Đang giao: <span className='font-semibold'>{driver.currentDelivery.orderId}</span>
          </p>
        </div>
      ) : (
        <div className="h-fit w-full px-3 py-2 bg-gray-50 rounded-lg">
          <div className='flex justify-between text-xs text-gray-600'>
            <span>Hôm nay: <strong>{driver.todayDeliveries}</strong> đơn</span>
            <span>Tháng này: <strong>{driver.monthDeliveries}</strong> đơn</span>
          </div>
        </div>
      )}
    </div>
  );
};
