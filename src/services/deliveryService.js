import { deliveryOrders } from '../mocks/deliveryOrders';

// Toggle this to switch between mock and real API
const USE_MOCK = true;

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
const mockApi = {
  async getDeliveryOrders(params = {}) {
    await delay(500);

    let filtered = [...deliveryOrders];

    // Apply filters
    if (params.status) {
      filtered = filtered.filter(order => order.status === params.status);
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.phone.includes(searchLower) ||
        order.customer.address.toLowerCase().includes(searchLower) ||
        (order.driver && order.driver.name.toLowerCase().includes(searchLower))
      );
    }

    if (params.driverId) {
      filtered = filtered.filter(order => order.driver?.id === params.driverId);
    }

    if (params.priority) {
      filtered = filtered.filter(order => order.priority === params.priority);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = filtered.slice(startIndex, endIndex);

    // Calculate summary
    const summary = {
      pending: deliveryOrders.filter(o => o.status === 'PENDING').length,
      delivering: deliveryOrders.filter(o => o.status === 'DELIVERING').length,
      delivered: deliveryOrders.filter(o => o.status === 'DELIVERED').length,
      failed: deliveryOrders.filter(o => o.status === 'FAILED').length,
      onTimeRate: 88.5
    };

    return {
      type: 'GOOD',
      detail: {
        data: paginatedData,
        pagination: {
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit)
        },
        summary
      }
    };
  },

  async getDeliveryOrderById(id) {
    await delay(300);
    const order = deliveryOrders.find(o => o.id === id);

    if (!order) {
      return {
        type: 'BAD',
        detail: { message: 'Không tìm thấy đơn hàng' }
      };
    }

    return {
      type: 'GOOD',
      detail: order
    };
  },

  async assignDriver(orderId, driverId) {
    await delay(500);
    const orderIndex = deliveryOrders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return {
        type: 'BAD',
        detail: { message: 'Không tìm thấy đơn hàng' }
      };
    }

    // In real implementation, fetch driver details
    const driver = {
      id: driverId,
      name: 'Tài xế mới',
      phone: '0900000000',
      vehicleType: 'MOTORCYCLE'
    };

    deliveryOrders[orderIndex].driver = driver;
    deliveryOrders[orderIndex].status = 'ASSIGNED';
    deliveryOrders[orderIndex].updatedAt = new Date().toISOString();
    deliveryOrders[orderIndex].statusHistory.push({
      status: 'ASSIGNED',
      timestamp: new Date().toISOString(),
      updatedBy: 'admin-001',
      notes: `Phân công cho tài xế ${driver.name}`
    });

    return {
      type: 'GOOD',
      detail: deliveryOrders[orderIndex]
    };
  },

  async updateOrderStatus(orderId, status, notes = '', failureReason = null) {
    await delay(500);
    const orderIndex = deliveryOrders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return {
        type: 'BAD',
        detail: { message: 'Không tìm thấy đơn hàng' }
      };
    }

    deliveryOrders[orderIndex].status = status;
    deliveryOrders[orderIndex].updatedAt = new Date().toISOString();

    if (failureReason) {
      deliveryOrders[orderIndex].failureReason = failureReason;
    }

    if (status === 'DELIVERED') {
      deliveryOrders[orderIndex].actualDeliveryTime = new Date().toISOString();
      deliveryOrders[orderIndex].paymentStatus = 'PAID';
    }

    deliveryOrders[orderIndex].statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      updatedBy: 'admin-001',
      notes: notes || `Cập nhật trạng thái: ${status}`
    });

    return {
      type: 'GOOD',
      detail: deliveryOrders[orderIndex]
    };
  },

  async cancelOrder(orderId, reason) {
    await delay(500);
    return this.updateOrderStatus(orderId, 'CANCELLED', reason);
  }
};

// Real API implementation (to be used when USE_MOCK = false)
// const realApi = {
//   async getDeliveryOrders(params = {}) {
//     const response = await axiosInstance.get(`${API_URLS.MAIN}/api/delivery-orders`, { params });
//     return response.data;
//   },
//   // ... other methods
// };

export const deliveryService = USE_MOCK ? mockApi : mockApi; // Change to realApi when ready
