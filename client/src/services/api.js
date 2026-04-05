import axios from 'axios';

const api = axios.create({
  baseURL: 'https://crm-project-api.onrender.com/api',
});

// Intercettore richieste: aggiunge il token a ogni richiesta
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercettore risposte: gestisce token scaduto/invalido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;