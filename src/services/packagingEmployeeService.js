import axios from './axiosInstance';
import { API_URLS } from '../config/api';

// Base URLs
const BACK_OFFICE_BASE = API_URLS.MAIN;
const ECOMMERCE_BASE = API_URLS.ECOMMERCE;
const STORAGE_BASE = API_URLS.STORAGE;

/**
 * Get all orders with CONFIRMED status (available to be packaged)
 * @param {string} status - Order status (default: CONFIRMED)
 * @returns {Promise}
 */
export const getAvailableOrders = (status = 'CONFIRMED') => {
  return axios.get(`${BACK_OFFICE_BASE}/api/order/admin`, {
    params: { status }
  });
};

/**
 * Get order summary for available orders
 * @param {string} status - Order status (default: CONFIRMED)
 * @returns {Promise}
 */
export const getOrdersSummary = (status = 'CONFIRMED') => {
  return axios.get(`${ECOMMERCE_BASE}/api/orders/admin/order-summary`, {
    params: { status }
  });
};

/**
 * Start packaging an order (changes status from CONFIRMED to PACKAGING)
 * @param {number|string} orderId - Order ID
 * @returns {Promise}
 */
export const startPackagingOrder = (orderId) => {
  return axios.put(`${BACK_OFFICE_BASE}/api/order/${orderId}/package`);
};

/**
 * Get employee's current packaging tasks
 * @returns {Promise}
 */
export const getMyPackagingTasks = () => {
  return axios.get(`${BACK_OFFICE_BASE}/api/order/emp/packaging-tasks`);
};

/**
 * Get order detail from ecommerce service
 * @param {number|string} orderId - Order ID
 * @returns {Promise}
 */
export const getOrderDetailEcommerce = (orderId) => {
  return axios.get(`${ECOMMERCE_BASE}/api/orders/admin/${orderId}`);
};

/**
 * Get order detail from back-office service
 * @param {number|string} orderId - Order ID
 * @returns {Promise}
 */
export const getOrderDetailBackOffice = (orderId) => {
  return axios.get(`${BACK_OFFICE_BASE}/api/order/${orderId}`);
};

/**
 * Get combined order details (both ecommerce and back-office)
 * @param {number|string} orderId - Order ID
 * @returns {Promise<Object>}
 */
export const getOrderDetails = async (orderId) => {
  try {
    const [ecommerceResponse, backOfficeResponse] = await Promise.all([
      getOrderDetailEcommerce(orderId),
      getOrderDetailBackOffice(orderId)
    ]);

    return {
      ecommerce: ecommerceResponse.data?.detail,
      backOffice: backOfficeResponse.data?.detail
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get pick list for an order (list of items to be packaged)
 * @param {number|string} orderId - Order ID
 * @returns {Promise}
 */
export const getPickList = (orderId) => {
  return axios.get(`${STORAGE_BASE}/api/pick-list/${orderId}`);
};

/**
 * Get available product details for an order item
 * @param {number|string} orderItemId - Order Item ID
 * @returns {Promise}
 */
export const getAvailableProducts = (orderItemId) => {
  return axios.get(`${STORAGE_BASE}/api/pick-list/product-detail-list/${orderItemId}`);
};

/**
 * Link a product detail to an order item
 * @param {number|string} orderItemId - Order Item ID
 * @param {number|string} productDetailId - Product Detail ID
 * @returns {Promise}
 */
export const linkProductToOrderItem = (orderItemId, productDetailId) => {
  return axios.put(`${STORAGE_BASE}/api/pick-list/${orderItemId}/link/${productDetailId}`);
};
