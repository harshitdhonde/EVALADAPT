import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
    timeout: 120000
});

export const getHealth = () => api.get("/api/health");
export const getOverview = () => api.get("/api/overview");
export const getInterventions = () => api.get("/api/interventions");
export const getEvaluation = () => api.get("/api/evaluation");
export const getImpactEquity = () => api.get("/api/impact-equity");
export const getSpatial = () => api.get("/api/spatial");
export const getDiagnosis = () => api.get("/api/diagnosis");
export const getDecision = () => api.get("/api/decision");

export const uploadDataset = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/api/data/upload", formData);
};

export default api;
