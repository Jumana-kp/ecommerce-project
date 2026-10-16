import api from "./api";

export const registerUser = (userData) => {
    return api.post("/auth/register/", userData);
};

export const loginUser = (userData) => {
    return api.post("/auth/login/", userData);
};

export const refreshToken = (refresh) => {
    return api.post("/auth/token/refresh/", {
        refresh,
    });
};

export const logoutUser = (refresh) => {
    return api.post("/auth/logout/", {
        refresh,
    });
};