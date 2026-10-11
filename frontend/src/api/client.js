import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://smart-onion-store.onrender.com';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.message);
    return Promise.reject(err);
  }
);

// Dashboard
export const getDashboard = (batchId) => api.get('/api/dashboard', { params: { batch_id: batchId } });

// Sensors
export const getLatestSensor = (deviceId = 'ESP32_001') =>
  api.get('/api/sensors/latest', { params: { device_id: deviceId } });
export const getSensorHistory = (results = 100, hours = null, deviceId = 'ESP32_001') =>
  api.get('/api/sensors/history', { params: { results, ...(hours ? { hours } : {}), device_id: deviceId } });

// Storage Batches
export const getBatches = (activeOnly = false) =>
  api.get('/api/storage/batches', { params: { active_only: activeOnly } });
export const createBatch = (data) => api.post('/api/storage/batches', data);
export const updateBatch = (batchId, data) => api.put(`/api/storage/batches/${batchId}`, data);
export const deleteBatch = (batchId) => api.delete(`/api/storage/batches/${batchId}`);

// Predictions
export const getLatestPrediction = (batchId) =>
  api.get('/api/predictions/latest', { params: { batch_id: batchId } });
export const runPrediction = (batchId) =>
  api.post('/api/predictions/predict', null, { params: { batch_id: batchId } });
export const getPredictionHistory = (batchId, limit = 50) =>
  api.get('/api/predictions/history', { params: { batch_id: batchId, limit } });
export const simulateRetrieval = (batchId, days) =>
  api.post('/api/predictions/retrieval-simulation', { batch_id: batchId, retrieval_after_days: Number(days) });


// Alerts
export const getAlerts = (resolved = false) =>
  api.get('/api/alerts', { params: { resolved } });
export const resolveAlert = (alertId) =>
  api.post(`/api/alerts/${alertId}/resolve`);

// Analytics
export const getAnalytics = (batchId, days = 30) =>
  api.get('/api/analytics', { params: { batch_id: batchId, days } });

// Devices
export const getDeviceStatus = () => api.get('/api/device/status');
export const controlFan = (deviceId, status, reason = 'manual') =>
  api.post('/api/device/fan', { device_id: deviceId, status, reason, triggered_by: 'manual' });
export const getFanHistory = (deviceId = 'ESP32_001') =>
  api.get('/api/device/fan/history', { params: { device_id: deviceId } });

// Weather
export const getWeather = () => api.get('/api/weather/current');

// Recommendations
export const getRecommendations = () => api.get('/api/recommendations');

// Settings
export const getSettings = () => api.get('/api/settings');
export const updateSettings = (data) => api.put('/api/settings', data);

// Demo
export const triggerDemo = () => api.post('/api/demo/trigger');

export default api;
