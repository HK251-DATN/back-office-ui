import { useState, useEffect, useCallback } from 'react';
import { deliveryService } from '../../../services/deliveryService';
import { toast } from 'react-toastify';

export const useDeliveries = (initialParams = {}) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [summary, setSummary] = useState({
    pending: 0,
    delivering: 0,
    delivered: 0,
    failed: 0,
    onTimeRate: 0
  });
  const [filters, setFilters] = useState(initialParams);

  const fetchDeliveries = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const mergedParams = { ...filters, ...params };
      const response = await deliveryService.getDeliveryOrders(mergedParams);

      if (response.type === 'GOOD') {
        setDeliveries(response.detail.data);
        setPagination(response.detail.pagination);
        setSummary(response.detail.summary);
      } else {
        toast.error('Lỗi khi tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const assignDriver = useCallback(async (orderId, driverId) => {
    try {
      const response = await deliveryService.assignDriver(orderId, driverId);

      if (response.type === 'GOOD') {
        toast.success('Phân công tài xế thành công');
        // Refresh the list
        await fetchDeliveries();
        return true;
      } else {
        toast.error(response.detail.message || 'Lỗi khi phân công tài xế');
        return false;
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Lỗi khi phân công tài xế');
      return false;
    }
  }, [fetchDeliveries]);

  const updateStatus = useCallback(async (orderId, status, notes = '', failureReason = null) => {
    try {
      const response = await deliveryService.updateOrderStatus(orderId, status, notes, failureReason);

      if (response.type === 'GOOD') {
        toast.success('Cập nhật trạng thái thành công');
        // Refresh the list
        await fetchDeliveries();
        return true;
      } else {
        toast.error(response.detail.message || 'Lỗi khi cập nhật trạng thái');
        return false;
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Lỗi khi cập nhật trạng thái');
      return false;
    }
  }, [fetchDeliveries]);

  const cancelOrder = useCallback(async (orderId, reason) => {
    try {
      const response = await deliveryService.cancelOrder(orderId, reason);

      if (response.type === 'GOOD') {
        toast.success('Hủy đơn hàng thành công');
        // Refresh the list
        await fetchDeliveries();
        return true;
      } else {
        toast.error(response.detail.message || 'Lỗi khi hủy đơn hàng');
        return false;
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      toast.error('Lỗi khi hủy đơn hàng');
      return false;
    }
  }, [fetchDeliveries]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const changePage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return {
    deliveries,
    loading,
    pagination,
    summary,
    filters,
    fetchDeliveries,
    assignDriver,
    updateStatus,
    cancelOrder,
    updateFilters,
    changePage
  };
};
