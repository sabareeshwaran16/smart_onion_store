import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.detail || err.message || 'Request failed'))
);

export const dashboardApi   = { get: ()       => api.get('/dashboard') };
export const sensorsApi     = { get: ()       => api.get('/sensors') };
export const predictionsApi = { get: ()       => api.get('/predictions'), predict: (d) => api.post('/predict', d) };
export const weatherApi     = { get: (loc)    => api.get('/weather', { params: { location: loc } }) };
export const historyApi     = { get: (params) => api.get('/history', { params }) };
export const alertsApi      = { get: ()       => api.get('/alerts'), resolve: (id) => api.patch(`/alerts/${id}/resolve`) };
export const analyticsApi   = { get: (range)  => api.get('/analytics', { params: { range } }) };
export const deviceApi      = { get: ()       => api.get('/device'), restart: () => api.post('/device/restart'), reconnect: () => api.post('/device/reconnect') };
export const settingsApi    = { get: ()       => api.get('/settings'), update: (d) => api.post('/settings', d) };
export const authApi        = { login: (d)    => api.post('/auth/login', d), register: (d) => api.post('/auth/register', d) };

export default api;
