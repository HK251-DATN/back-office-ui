// src/services/userService.js
import axios from './axiosInstance';
import { API_URLS } from '../config/api';

// token param is only needed during login, before it's stored in localStorage.
// All other calls rely on the axiosInstance interceptor automatically.
export const getUserInfo = async (userId, token = null) => {
    const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

    const response = await axios.get(`${API_URLS.MAIN}/api/user`, config);
    return response;
};