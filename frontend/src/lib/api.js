import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, timeout: 30000 });

export const endpoints = {
  overview: () => api.get("/overview/kpis").then((r) => r.data),
  seasonTrends: () => api.get("/overview/season-trends").then((r) => r.data),
  millsByDistrict: () => api.get("/overview/mills-by-district").then((r) => r.data),
  millTypeSplit: () => api.get("/overview/mill-type-split").then((r) => r.data),
  paymentStatusSplit: () => api.get("/overview/payment-status-split").then((r) => r.data),
  ecosystem: () => api.get("/overview/ecosystem").then((r) => r.data),

  mills: (params) => api.get("/mills", { params }).then((r) => r.data),
  millDetail: (id) => api.get(`/mills/${id}`).then((r) => r.data),
  millComparison: (limit = 15) => api.get("/mills/analytics/comparison", { params: { limit } }).then((r) => r.data),
  healthDist: () => api.get("/mills/analytics/health-distribution").then((r) => r.data),

  farmers: (params) => api.get("/farmers", { params }).then((r) => r.data),
  farmerDetail: (id) => api.get(`/farmers/${id}`).then((r) => r.data),
  farmerAutocomplete: (q) => api.get("/farmers/autocomplete", { params: { q } }).then((r) => r.data),
  segmentation: () => api.get("/farmers/analytics/segmentation").then((r) => r.data),

  districts: () => api.get("/districts").then((r) => r.data),
  districtAnalytics: () => api.get("/districts/analytics").then((r) => r.data),

  arrearSummary: () => api.get("/arrears/summary").then((r) => r.data),
  arrearWorst: (limit = 15) => api.get("/arrears/worst-mills", { params: { limit } }).then((r) => r.data),
  arrearTrend: () => api.get("/arrears/trend").then((r) => r.data),
  arrearByDistrict: () => api.get("/arrears/by-district").then((r) => r.data),

  distressSummary: () => api.get("/distress/summary").then((r) => r.data),
  distressByDistrict: () => api.get("/distress/by-district").then((r) => r.data),
  distressRadar: (districts) => api.get("/distress/radar", { params: { districts } }).then((r) => r.data),
};

export const fmt = {
  crore: (v) => `₹${(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 1 })} Cr`,
  lakh: (v) => `${(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 1 })} L`,
  num: (v) => (v || 0).toLocaleString("en-IN"),
  pct: (v) => `${(v || 0).toFixed(1)}%`,
  qtl: (v) => `${(v || 0).toLocaleString("en-IN")} qtl`,
};
