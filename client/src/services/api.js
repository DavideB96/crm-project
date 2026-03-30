import axios from 'axios';

const api = axios.create({
  baseURL: 'https://crm-project-api.onrender.com/api',
});

// Intercettore: aggiunge il token a ogni richiesta
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;