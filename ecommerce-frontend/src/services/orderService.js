import api from "./api";

export const checkout = () => {
    return api.post("/orders/checkout/");
};

export const getOrders = () => {
    return api.get("/orders/");
};

export const getOrder = (id) => {
    return api.get(`/orders/${id}/`);
};