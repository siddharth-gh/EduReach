import axios from "axios";

const getBaseURL = () => {
  const PROD_URL = "http://34.204.170.9:5000/api";
  let url = PROD_URL;
  if (!url.endsWith("/api") && !url.endsWith("/api/")) {
    url = url.endsWith("/") ? `${url}api` : `${url}/api`;
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

const API = axios.create({
  baseURL: getBaseURL(),
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || "").toLowerCase();

    if (
      status === 401 &&
      (message.includes("invalid token signature") ||
        message.includes("token failed") ||
        message.includes("jwt"))
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
