import axios from './axiosInstance';
import { API_URLS } from '../config/api';

const BASE = `${API_URLS.MAIN}/api/categories`;

export const getCategories = () => axios.get(BASE);
export const getCategoryById = (categoryId) => axios.get(`${BASE}/${categoryId}`);
export const getSubcategories = (parentId) => axios.get(`${BASE}/${parentId}/subcategories`);
export const createCategory = (data) => axios.post(BASE, data);
export const updateCategory = (categoryId, data) => axios.put(`${BASE}/${categoryId}`, data);
export const deleteCategory = (categoryId) => axios.delete(`${BASE}/${categoryId}`);

export const getSubSubcategories = () => axios.get(`${BASE}/sub-subcategories`);
export const createSubSubcategory = (data) => axios.post(`${BASE}/sub-subcategories`, data);
export const updateSubSubcategory = (id, data) => axios.put(`${BASE}/sub-subcategories/${id}`, data);
export const deleteSubSubcategory = (id) => axios.delete(`${BASE}/sub-subcategories/${id}`);
