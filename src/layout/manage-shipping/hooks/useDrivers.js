import { useState, useEffect, useCallback } from 'react';
import { driverService } from '../../../services/driverService';
import { toast } from 'react-toastify';

export const useDrivers = (initialParams = {}) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [summary, setSummary] = useState({
    available: 0,
    busy: 0,
    offline: 0
  });
  const [filters, setFilters] = useState(initialParams);

  const fetchDrivers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const mergedParams = { ...filters, ...params };
      const response = await driverService.getDrivers(mergedParams);

      if (response.type === 'GOOD') {
        setDrivers(response.detail.data);
        setPagination(response.detail.pagination);
        setSummary(response.detail.summary);
      } else {
        toast.error('Lỗi khi tải danh sách tài xế');
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Lỗi khi tải danh sách tài xế');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const getAvailableDriversForOrder = useCallback(async (orderId) => {
    try {
      const response = await driverService.getAvailableDriversForOrder(orderId);

      if (response.type === 'GOOD') {
        return response.detail;
      } else {
        toast.error('Lỗi khi tải danh sách tài xế khả dụng');
        return null;
      }
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      toast.error('Lỗi khi tải danh sách tài xế khả dụng');
      return null;
    }
  }, []);

  const updateDriverStatus = useCallback(async (driverId, status) => {
    try {
      const response = await driverService.updateDriverStatus(driverId, status);

      if (response.type === 'GOOD') {
        toast.success('Cập nhật trạng thái tài xế thành công');
        await fetchDrivers();
        return true;
      } else {
        toast.error(response.detail.message || 'Lỗi khi cập nhật trạng thái');
        return false;
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast.error('Lỗi khi cập nhật trạng thái');
      return false;
    }
  }, [fetchDrivers]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return {
    drivers,
    loading,
    pagination,
    summary,
    filters,
    fetchDrivers,
    getAvailableDriversForOrder,
    updateDriverStatus,
    updateFilters
  };
};
