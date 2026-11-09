import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

export const getHealth = () => api.get("/api/health");

export default api;
