import api from "./api";

export const getProducts = (params = {}) => {
    return api.get("/products/", {
        params,
        skipAuth: true,
    });
};

export const getProduct = (id) => {
    return api.get(`/products/${id}/`, {
        skipAuth: true,
    });
};

export const getCategories = () => {
    return api.get("/products/categories/", {
        skipAuth: true,
    });
};

export const getProductTypes = () => {
    return api.get("/products/types/", {
        skipAuth: true,
    });
};