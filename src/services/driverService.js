import { drivers } from '../mocks/drivers';

// Toggle this to switch between mock and real API
const USE_MOCK = true;

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
const mockApi = {
  async getDrivers(params = {}) {
    await delay(400);

    let filtered = [...drivers];

    // Apply filters
    if (params.status) {
      filtered = filtered.filter(driver => driver.status === params.status);
    }

    if (params.vehicleType) {
      filtered = filtered.filter(driver => driver.vehicleType === params.vehicleType);
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = filtered.slice(startIndex, endIndex);

    // Calculate summary
    const summary = {
      available: drivers.filter(d => d.status === 'AVAILABLE').length,
      busy: drivers.filter(d => d.status === 'BUSY').length,
      offline: drivers.filter(d => d.status === 'OFFLINE').length
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

  async getDriverById(id) {
    await delay(300);
    const driver = drivers.find(d => d.id === id);

    if (!driver) {
      return {
        type: 'BAD',
        detail: { message: 'Không tìm thấy tài xế' }
      };
    }

    return {
      type: 'GOOD',
      detail: driver
    };
  },

  async getAvailableDriversForOrder(orderId) {
    await delay(400);

    const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');

    // Sort by distance from warehouse
    const sorted = [...availableDrivers].sort((a, b) =>
      a.distanceFromWarehouse - b.distanceFromWarehouse
    );

    // Recommend the closest driver with good rating
    const recommended = sorted.find(d => d.rating >= 4.5) || sorted[0];

    return {
      type: 'GOOD',
      detail: {
        recommended: recommended ? {
          ...recommended,
          reason: 'Gần kho nhất, đánh giá cao'
        } : null,
        available: sorted
      }
    };
  },

  async updateDriverStatus(id, status) {
    await delay(300);
    const driverIndex = drivers.findIndex(d => d.id === id);

    if (driverIndex === -1) {
      return {
        type: 'BAD',
        detail: { message: 'Không tìm thấy tài xế' }
      };
    }

    drivers[driverIndex].status = status;

    if (status === 'OFFLINE' || status === 'AVAILABLE') {
      drivers[driverIndex].currentDelivery = null;
    }

    return {
      type: 'GOOD',
      detail: drivers[driverIndex]
    };
  },

  async updateDriverLocation(id, location) {
    await delay(200);
    const driverIndex = drivers.findIndex(d => d.id === id);

    if (driverIndex === -1) {
      return {
        type: 'BAD',
        detail: { message: 'Không tìm thấy tài xế' }
      };
    }

    drivers[driverIndex].currentLocation = location;

    return {
      type: 'GOOD',
      detail: drivers[driverIndex]
    };
  }
};

// Real API implementation (to be used when USE_MOCK = false)
// const realApi = {
//   async getDrivers(params = {}) {
//     const response = await axiosInstance.get(`${API_URLS.MAIN}/api/drivers`, { params });
//     return response.data;
//   },
//   // ... other methods
// };

export const driverService = USE_MOCK ? mockApi : mockApi; // Change to realApi when ready
