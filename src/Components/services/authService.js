
import api from './api';

export const login = async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
};

export const adminLogin = async (credentials) => {
    const response = await api.post('/auth/admin/login/', credentials);
    return response.data;
};

export const signup = async (userData) => {
    const response = await api.post('/auth/signup/', userData);
    return response.data;
};

export const googleAuth = async (token, phone) => {
    const response = await api.post('/auth/google/', { token, phone });
    return response.data;
};

export const updateUserProfile = async (userData) => {
    const response = await api.put('/auth/profile/update/', userData);
    return response.data;
};
