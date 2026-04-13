import { Modal, Button, Spin, Empty, Tag, Rate } from 'antd';
import { useState, useEffect } from 'react';
import { driverService } from '../../../services/driverService';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';

const vehicleIcons = {
  MOTORCYCLE: TwoWheelerOutlinedIcon,
  CAR: DirectionsCarOutlinedIcon,
  TRUCK: LocalShippingOutlinedIcon
};

export const AssignDriverModal = ({ open, onClose, delivery, onAssign }) => {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open && delivery) {
      fetchAvailableDrivers();
    }
  }, [open, delivery]);

  const fetchAvailableDrivers = async () => {
    setLoading(true);
    try {
      const result = await driverService.getAvailableDriversForOrder(delivery.id);
      if (result) {
        setDrivers(result.available || []);
        setRecommended(result.recommended);
        // Auto-select recommended driver
        if (result.recommended) {
          setSelectedDriver(result.recommended.id);
        }
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDriver) return;

    setAssigning(true);
    const success = await onAssign(delivery.id, selectedDriver);
    setAssigning(false);

    if (success) {
      setSelectedDriver(null);
      onClose();
    }
  };

  const DriverItem = ({ driver, isRecommended }) => {
    const VehicleIcon = vehicleIcons[driver.vehicleType] || TwoWheelerOutlinedIcon;
    const isSelected = selectedDriver === driver.id;

    return (
      <div
        className={`border rounded-lg p-4 cursor-pointer transition-all ${isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
          }`}
        onClick={() => setSelectedDriver(driver.id)}
      >
        <div className='flex justify-between items-start mb-3'>
          <div className='flex gap-3 items-start'>
            <img
              src={driver.avatar}
              alt={driver.name}
              className='w-12 h-12 rounded-full object-cover'
            />
            <div>
              <div className='flex items-center gap-2'>
                <p className='font-semibold'>{driver.name}</p>
                {isRecommended && (
                  <Tag color='gold' icon={<StarOutlinedIcon sx={{ fontSize: 12 }} />}>
                    Gợi ý
                  </Tag>
                )}
              </div>
              <div className='flex items-center gap-1 text-sm text-gray-600 mt-1'>
                <VehicleIcon sx={{ fontSize: 16 }} />
                <span>{driver.vehiclePlate}</span>
              </div>
              <div className='flex items-center gap-2 mt-1'>
                <Rate disabled defaultValue={driver.rating} allowHalf className='text-xs' />
                <span className='text-xs text-gray-600'>({driver.rating})</span>
              </div>
            </div>
          </div>

          {isSelected && (
            <div className='bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center'>
              ✓
            </div>
          )}
        </div>

        {isRecommended && driver.reason && (
          <div className='bg-yellow-50 border border-yellow-200 rounded p-2 mb-3'>
            <p className='text-xs text-yellow-800'>
              <strong>Lý do gợi ý:</strong> {driver.reason}
            </p>
          </div>
        )}

        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div>
            <p className='text-gray-600'>Khoảng cách từ kho</p>
            <p className='font-semibold'>{driver.distanceFromWarehouse} km</p>
          </div>
          <div>
            <p className='text-gray-600'>Tỷ lệ thành công</p>
            <p className='font-semibold text-green-600'>{driver.successRate}%</p>
          </div>
          <div>
            <p className='text-gray-600'>Đơn hôm nay</p>
            <p className='font-semibold'>{driver.todayDeliveries} đơn</p>
          </div>
          <div>
            <p className='text-gray-600'>Tổng đơn</p>
            <p className='font-semibold'>{driver.totalDeliveries} đơn</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title={`Phân công tài xế - Đơn hàng ${delivery?.orderId}`}
      open={open}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="assign"
          type="primary"
          onClick={handleAssign}
          loading={assigning}
          disabled={!selectedDriver}
        >
          Phân công
        </Button>
      ]}
    >
      {loading ? (
        <div className='flex justify-center py-10'>
          <Spin size='large' />
        </div>
      ) : drivers.length === 0 ? (
        <Empty description="Không có tài xế khả dụng" />
      ) : (
        <div className='flex flex-col gap-4'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
            <p className='text-sm'>
              <strong>Địa chỉ giao hàng:</strong> {delivery?.customer.address}
            </p>
            <p className='text-sm mt-1'>
              <strong>Khoảng cách:</strong> {delivery?.distance} km
            </p>
          </div>

          {recommended && (
            <div>
              <h4 className='font-semibold mb-2 text-sm text-gray-700'>Tài xế được gợi ý</h4>
              <DriverItem driver={recommended} isRecommended />
            </div>
          )}

          {drivers.length > 1 && (
            <div>
              <h4 className='font-semibold mb-2 text-sm text-gray-700'>
                Tài xế khả dụng khác ({drivers.length - 1})
              </h4>
              <div className='flex flex-col gap-3 max-h-96 overflow-y-auto'>
                {drivers
                  .filter(d => d.id !== recommended?.id)
                  .map(driver => (
                    <DriverItem key={driver.id} driver={driver} />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
