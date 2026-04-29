import axios from './axiosInstance';
import { API_URLS } from '../config/api';

const BASE = `${API_URLS.STORAGE}/api/raw-product-demand`;

export const createRawProductDemand = (data) => axios.post(BASE, data);
export const getRawProductDemands = (params) => axios.get(BASE, { params });
export const getRawProductDemandById = (demandId) => axios.get(`${BASE}/${demandId}`);
export const getDemandsByCategory = (subSubcategoryId) => axios.get(`${BASE}/by-category/${subSubcategoryId}`);
export const updateRawProductDemand = (demandId, data) => axios.put(`${BASE}/${demandId}`, data);
export const deleteRawProductDemand = (demandId) => axios.delete(`${BASE}/${demandId}`);
