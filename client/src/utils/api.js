import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://carsence-6.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cars API
export const carsAPI = {
  getAll: (params = {}) => api.get("/cars", { params }),
  getById: (id) => api.get(`/cars/${id}`),
  getSegments: () => api.get("/cars/segments"),
  compare: (ids) => api.get("/cars/compare", { params: { ids: ids.join(",") } }),
  addReview: (id, reviewData) => api.post(`/cars/${id}/reviews`, reviewData),
};

// Shortlist API
export const shortlistAPI = {
  get: (sessionId) => api.get(`/shortlist/${sessionId}`),
  add: (sessionId, carId) => api.post("/shortlist", { sessionId, carId }),
  remove: (sessionId, carId) => api.delete(`/shortlist/${sessionId}/${carId}`),
  clear: (sessionId) => api.delete(`/shortlist/${sessionId}`),
};

// Advisor API
export const advisorAPI = {
  chat: (message, history) => api.post("/advisor/chat", { message, history }),
  compareAnalysis: (ids) => api.post("/advisor/compare-analysis", { ids }),
};

export default api;
