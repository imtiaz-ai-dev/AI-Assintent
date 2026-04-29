import axios from "axios";

const api = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000" 
});

export const getStats = () => api.get("/logs/stats");
export const getStatus = () => api.get("/monitor/status");
export const startMonitor = () => api.post("/monitor/start");
export const stopMonitor = () => api.post("/monitor/stop");

export const getUsers = () => api.get("/users/");
export const createUser = (data) => api.post("/users/", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const toggleUser = (id) => api.patch(`/users/${id}/toggle`);

export const getActivityLogs = (limit = 100) => api.get(`/logs/activity?limit=${limit}`);
export const getSlotHistory = (limit = 100) => api.get(`/slots/history?limit=${limit}`);
export const getAvailableSlots = () => api.get("/slots/available");
export const refreshSlots = () => api.post("/monitor/start");
export const getNotifLogs = (limit = 100) => api.get(`/logs/notifications?limit=${limit}`);

export const getSettings = () => api.get("/settings/");
export const updateSetting = (key, value) => api.put(`/settings/${key}`, { value: String(value) });
