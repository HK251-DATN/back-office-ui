import axios from './axiosInstance';
import { API_URLS } from '../config/api';

const BASE_URL = `${API_URLS.MAIN}/api/provider`;

// List providers with filters
export const getProviders = (params) => {
    return axios.get(BASE_URL, { params });
};

// Get provider by ID
export const getProviderById = (providerId) => {
    return axios.get(`${BASE_URL}/${providerId}`);
};

// Get provider certificates
export const getProviderCertificates = (providerId) => {
    return axios.get(`${BASE_URL}/${providerId}/certificates`);
};

// Get provider videos
export const getProviderVideos = (providerId) => {
    return axios.get(`${BASE_URL}/${providerId}/videos`);
};

// Review certificate
export const reviewCertificate = (certificateId, data) => {
    return axios.put(`${BASE_URL}/certificates/${certificateId}/review`, data);
};

// Review video
export const reviewVideo = (videoId, data) => {
    return axios.put(`${BASE_URL}/videos/${videoId}/review`, data);
};

// Update provider verification status
export const updateProvider = (providerId, data) => {
    return axios.put(`${BASE_URL}/${providerId}`, data);
};
