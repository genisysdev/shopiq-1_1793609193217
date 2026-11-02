import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:5000/api', headers: { 'Content-Type': 'application/json' } });
API.interceptors.request.use(config => {
  const info = localStorage.getItem('userInfo');
  if (info) { const { token } = JSON.parse(info); if (token) config.headers.Authorization = `Bearer ${token}`; }
  return config;
});
API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) { localStorage.removeItem('userInfo'); window.location.href = '/login'; }
  return Promise.reject(err);
});
export default API;
