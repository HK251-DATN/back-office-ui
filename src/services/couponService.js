import axios from './axiosInstance';
import { API_URLS } from '../config/api';

const BASE = `${API_URLS.ECOMMERCE}/api/coupon`;

export const getCoupons = (page = 0, size = 20) =>
    axios.get(`${BASE}?page=${page}&size=${size}`);

export const getCouponById = (id) => axios.get(`${BASE}/${id}`);

export const createCoupon = (data) => axios.post(BASE, data);

export const updateCoupon = (id, data) => axios.put(`${BASE}/${id}`, data);

export const deleteCoupon = (id) => axios.delete(`${BASE}/${id}`);
