import api from "./api";

export const getCart = () => {
    return api.get("/cart/");
};

export const addToCart = (
    productVariant,
    selectedSize,
    quantity = 1
) => {
    return api.post("/cart/", {
        product_variant: productVariant,
        selected_size: selectedSize,
        quantity,
    });
};

export const updateCartItem = (
    itemId,
    quantity
) => {
    return api.patch(
        `/cart/items/${itemId}/`,
        {
            quantity,
        }
    );
};

export const deleteCartItem = (
    itemId
) => {
    return api.delete(
        `/cart/items/${itemId}/delete/`
    );
};

export const mergeGuestCart = (
    items
) => {
    return api.post(
        "/cart/merge/",
        {
            items,
        }
    );
};