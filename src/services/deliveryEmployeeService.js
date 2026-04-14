import axios from './axiosInstance';
import { API_URLS } from '../config/api';

// Base URLs
const BACK_OFFICE_BASE = API_URLS.MAIN;
const ECOMMERCE_BASE = API_URLS.ECOMMERCE;

/**
 * Get orders ready for delivery (READY_FOR_PICKUP status)
 * @returns {Promise}
 */
export const getReadyForDeliveryOrders = async () => {
  try {
    const response = await axios.get(`${BACK_OFFICE_BASE}/api/order/admin`, {
      params: { status: 'READY_FOR_PICKUP' }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get delivery information for a specific order
 * @param {number|string} orderId - Order ID
 * @returns {Promise}
 */
export const getOrderDeliveryInfo = (orderId) => {
  return axios.get(`${ECOMMERCE_BASE}/api/orders/admin/delivery/${orderId}`);
};

/**
 * Get orders with delivery information combined
 * Fetches READY_FOR_PICKUP orders and enriches each with delivery info
 * @returns {Promise<Array>}
 */
export const getReadyOrdersWithDeliveryInfo = async () => {
  try {
    // Step 1: Get all ready orders
    const ordersResponse = await getReadyForDeliveryOrders();

    const responseType = ordersResponse.data?.type;

    // Handle both GOOD and SKIP_AS_GOOD
    if (responseType !== 'GOOD' && responseType !== 'SKIP_AS_GOOD') {
      return { data: ordersResponse.data };
    }

    const orders = ordersResponse.data.detail || [];

    // Step 2: Fetch delivery info for each order
    const ordersWithDeliveryInfo = await Promise.all(
      orders.map(async (order) => {
        try {
          const deliveryResponse = await getOrderDeliveryInfo(order.order_id);
          if (deliveryResponse.data?.type === 'GOOD') {
            return {
              ...order,
              deliveryInfo: deliveryResponse.data.detail
            };
          }
          return {
            ...order,
            deliveryInfo: null
          };
        } catch (error) {
          console.error(`Failed to fetch delivery info for order ${order.order_id}:`, error);
          return {
            ...order,
            deliveryInfo: null
          };
        }
      })
    );

    return {
      data: {
        type: 'GOOD',
        detail: ordersWithDeliveryInfo,
        message: ordersResponse.data.message,
        timestamp: ordersResponse.data.timestamp
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Start delivery task (accept order for delivery)
 * @param {number|string} orderId - Order ID
 * @returns {Promise}
 */
export const startDelivery = (orderId) => {
  return axios.put(`${BACK_OFFICE_BASE}/api/order/${orderId}/ship`);
};

/**
 * Get employee's current delivery tasks
 * @returns {Promise}
 */
export const getMyDeliveryTasks = async () => {
  try {
    const response = await axios.get(`${BACK_OFFICE_BASE}/api/order/emp/delivering-tasks`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get delivery tasks with delivery information combined
 * @returns {Promise<Array>}
 */
export const getMyTasksWithDeliveryInfo = async () => {
  try {
    // Step 1: Get all delivery tasks
    const tasksResponse = await getMyDeliveryTasks();

    const responseType = tasksResponse.data?.type;

    // Handle both GOOD and SKIP_AS_GOOD
    if (responseType !== 'GOOD' && responseType !== 'SKIP_AS_GOOD') {
      return { data: tasksResponse.data };
    }

    const tasks = tasksResponse.data.detail || [];

    // Step 2: Fetch delivery info for each task
    const tasksWithDeliveryInfo = await Promise.all(
      tasks.map(async (task) => {
        try {
          const deliveryResponse = await getOrderDeliveryInfo(task.order_id);
          if (deliveryResponse.data?.type === 'GOOD') {
            return {
              ...task,
              deliveryInfo: deliveryResponse.data.detail
            };
          }
          return {
            ...task,
            deliveryInfo: null
          };
        } catch (error) {
          console.error(`Failed to fetch delivery info for task ${task.order_id}:`, error);
          return {
            ...task,
            deliveryInfo: null
          };
        }
      })
    );

    return {
      data: {
        type: 'GOOD',
        detail: tasksWithDeliveryInfo,
        message: tasksResponse.data.message,
        timestamp: tasksResponse.data.timestamp
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Complete delivery (mark order as delivered)
 * @param {number|string} orderId - Order ID
 * @param {Object} data - Optional delivery completion data (notes, photo, etc.)
 * @returns {Promise}
 */
export const completeDelivery = (orderId, data = {}) => {
  return axios.put(`${BACK_OFFICE_BASE}/api/order/${orderId}/deliver`, data);
};

/**
 * Get combined order details for delivery
 * @param {number|string} orderId - Order ID
 * @returns {Promise<Object>}
 */
export const getOrderDetails = async (orderId) => {
  try {
    const [ecommerceResponse, backOfficeResponse, deliveryInfoResponse] = await Promise.all([
      axios.get(`${ECOMMERCE_BASE}/api/orders/admin/${orderId}`),
      axios.get(`${BACK_OFFICE_BASE}/api/order/${orderId}`),
      getOrderDeliveryInfo(orderId)
    ]);

    return {
      ecommerce: ecommerceResponse.data?.detail,
      backOffice: backOfficeResponse.data?.detail,
      deliveryInfo: deliveryInfoResponse.data?.detail
    };
  } catch (error) {
    throw error;
  }
};
