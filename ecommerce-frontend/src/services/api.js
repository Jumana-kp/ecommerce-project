import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const skipAuth = config.skipAuth === true;

    if (!skipAuth) {
      const accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem("refresh_token") ||
        localStorage.getItem("refreshToken") ||
        localStorage.getItem("refresh");

      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/token/refresh/`,
          {
            refresh: refreshToken,
          },
        );
        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh;

        localStorage.setItem("access_token", newAccessToken);

        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");

        localStorage.removeItem("refresh_token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("refresh");

        localStorage.removeItem("user");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
