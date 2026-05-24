import axios from './axiosInstance';
import { API_URLS } from '../config/api';

const BASE = `${API_URLS.STORAGE}/api/product-batch`;
const SUB_BATCH_BASE = `${API_URLS.STORAGE}/api/product-sub-batch`;

export const getProductBatches = (params) => axios.get(BASE, { params });
export const deleteProductBatch = (batchId) => axios.delete(`${BASE}/${batchId}`);
export const getProductBatchById = (batchId) => axios.get(`${BASE}/${batchId}`);
export const updateProductBatch = (batchId, data) => axios.put(`${BASE}/${batchId}`, data);
export const createProductBatch = (data) => axios.post(BASE, data);

// Batch delivery acceptance
export const getBatchesByStatus = (status) => axios.get(`${BASE}/status/${status}`);
export const acceptBatchDelivery = (batchId, data) => axios.post(`${BASE}/${batchId}/accept-delivery`, data);
export const rejectBatchDelivery = (batchId, data) => axios.post(`${BASE}/${batchId}/reject-delivery`, data);

// Sub-batch operations
export const getSubBatchesByBatchId = (batchId, status) => {
    const params = status ? { status: Array.isArray(status) ? status : [status] } : {};
    return axios.get(`${SUB_BATCH_BASE}/by-batch/${batchId}`, { params, paramsSerializer: { indexes: null } });
};
export const acceptSubBatchDelivery = (subBatchId, data) => axios.post(`${SUB_BATCH_BASE}/${subBatchId}/accept-delivery`, data);
export const rejectSubBatchDelivery = (subBatchId, data) => axios.post(`${SUB_BATCH_BASE}/${subBatchId}/reject-delivery`, data);

// Product details
const PRODUCT_DETAIL_BASE = `${API_URLS.STORAGE}/api/product-detail`;
export const getProductDetails = (params) => axios.get(PRODUCT_DETAIL_BASE, { params });

// Available processed batches enriched with product-general info
export const getAvailableProducts = (params) => axios.get(`${API_URLS.STORAGE}/api/product-general/available`, { params });

// Process batch V2 endpoint
export const processBatchV2 = (data) => axios.post(`${PRODUCT_DETAIL_BASE}/process-batch-v2`, data);

// Proof image upload
export const uploadProofImages = (batchId, images) => {
    const formData = new FormData();
    images.forEach(file => formData.append('images', file));
    return axios.post(`${BASE}/${batchId}/proof-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
