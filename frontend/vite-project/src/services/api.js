
import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./tokenStore";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    const isAuthEndpoint = [
      "/users/login",
      "/users/register",
      "/users/refresh",
      "/users/logout",
    ].some((path) => url.includes(path));

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/users/refresh`, {}, {
            withCredentials: true,
          })
          .then((response) => {
            const token = response.data.accessToken;
            setAccessToken(token);
            return token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      window.dispatchEvent(new Event("auth:expired"));
      return Promise.reject(refreshError);
    }
  }
);

export default api;
