import axios from './axiosInstance';
import { API_URLS } from '../config/api';

const BASE = `${API_URLS.ECOMMERCE}/api/sale-events`;
const SALE_PRODUCTS_BASE = `${API_URLS.ECOMMERCE}/api/sale-products`;
const BATCH_BASE = `${API_URLS.ECOMMERCE}/api/batch-details`;

// Sale Events
export const getSaleEvents = (page = 1, size = 20) =>
    axios.get(`${BASE}?page=${page}&size=${size}`);

export const searchSaleEvents = (params) => {
    const query = new URLSearchParams();
    if (params.searchString !== undefined) query.append('searchString', params.searchString);
    if (params.activeYn) query.append('activeYn', params.activeYn);
    if (params.enableYn) query.append('enableYn', params.enableYn);
    if (params.beginDate) query.append('beginDate', params.beginDate);
    if (params.endDate) query.append('endDate', params.endDate);
    query.append('page', params.page || 1);
    query.append('size', params.size || 20);
    return axios.get(`${BASE}/search?${query.toString()}`);
};

export const getSaleEventById = (id) => axios.get(`${BASE}/${id}`);

export const createSaleEvent = (data) => axios.post(BASE, data);

export const updateSaleEvent = (id, data) => axios.put(`${BASE}/${id}`, data);

export const deleteSaleEvent = (id) => axios.delete(`${BASE}/${id}`);

export const enableSaleEvent = (id) => axios.put(`${BASE}/${id}/enable`);

export const cancelSaleEvent = (id) => axios.put(`${BASE}/${id}/cancel`);

export const uploadBanner = (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axios.post(`${BASE}/${id}/banner`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Sale Products
export const addProductToEvent = (data) => axios.post(SALE_PRODUCTS_BASE, data);

export const getSaleProduct = (saleEventId, batchId) =>
    axios.get(`${SALE_PRODUCTS_BASE}/${saleEventId}/${batchId}`);

export const updateSaleProduct = (saleEventId, batchId, data) =>
    axios.put(`${SALE_PRODUCTS_BASE}/${saleEventId}/${batchId}`, data);

export const removeSaleProduct = (saleEventId, batchId) =>
    axios.delete(`${SALE_PRODUCTS_BASE}/${saleEventId}/${batchId}`);

// Batch details for product picker
export const getAvailableBatchDetails = (searchString = '', page = 1, size = 20) =>
    axios.get(`${BATCH_BASE}/available-for-sale-event?searchString=${encodeURIComponent(searchString)}&page=${page}&size=${size}`);
