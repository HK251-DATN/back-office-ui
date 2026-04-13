import axios from './axiosInstance';
import { API_URLS } from '../config/api';

const BASE = `${API_URLS.STORAGE}/api/product-batch`;

export const getProductBatches = (params) => axios.get(BASE, { params });
export const deleteProductBatch = (batchId) => axios.delete(`${BASE}/${batchId}`);
export const getProductBatchById = (batchId) => axios.get(`${BASE}/${batchId}`);
export const updateProductBatch = (batchId, data) => axios.put(`${BASE}/${batchId}`, data);
export const createProductBatch = (data) => axios.post(BASE, data);
