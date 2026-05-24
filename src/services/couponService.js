import axios from './axiosInstance';
import { API_URLS } from '../config/api';

const BASE = `${API_URLS.ECOMMERCE}/api/coupon`;

export const getAdminCoupons = (params = {}) => {
    const query = new URLSearchParams();
    if (params.couponCode)   query.set('couponCode',   params.couponCode);
    if (params.discountType) query.set('discountType', params.discountType);
    if (params.publicYn)     query.set('publicYn',     params.publicYn);
    if (params.isActive != null) query.set('isActive', params.isActive);
    if (params.sortBy)       query.set('sortBy',       params.sortBy);
    if (params.sortDir)      query.set('sortDir',       params.sortDir);
    query.set('page', params.page ?? 1);
    query.set('size', params.size ?? 20);
    return axios.get(`${BASE}/admin?${query.toString()}`);
};

export const getCouponById = (id) => axios.get(`${BASE}/${id}`);

export const createCoupon = (data) => axios.post(BASE, data);

export const updateCoupon = (id, data) => axios.put(`${BASE}/${id}`, data);

export const deleteCoupon = (id) => axios.delete(`${BASE}/${id}`);
