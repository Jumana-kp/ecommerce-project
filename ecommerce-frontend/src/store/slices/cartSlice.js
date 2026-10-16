
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
    getCart,
    addToCart,
    updateCartItem,
    deleteCartItem,
} from "../../services/cartService";


const initialState = {
    items: [],
    totalItems: 0,
    totalPrice: "0.00",

    loading: false,
    error: null,
};


/*
=========================================================
FETCH CART
GET /api/cart/
=========================================================
*/

export const fetchCart = createAsyncThunk(
    "cart/fetchCart",

    async (_, { rejectWithValue }) => {
        try {
            const response = await getCart();

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Failed to load cart.",
                }
            );
        }
    }
);


/*
=========================================================
ADD PRODUCT TO CART
POST /api/cart/

Expected:
{
    product_variant: 10,
    selected_size: 4,
    quantity: 1
}
=========================================================
*/

export const addProductToCart = createAsyncThunk(
    "cart/addProductToCart",

    async (
        {
            productVariant,
            selectedSize,
            quantity = 1,
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await addToCart(
                productVariant,
                selectedSize,
                quantity
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Failed to add product to cart.",
                }
            );
        }
    }
);


/*
=========================================================
UPDATE CART ITEM
PATCH /api/cart/items/:id/

Expected:
{
    quantity: 2
}
=========================================================
*/

export const updateProductQuantity = createAsyncThunk(
    "cart/updateProductQuantity",

    async (
        {
            itemId,
            quantity,
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await updateCartItem(
                itemId,
                quantity
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Failed to update cart.",
                }
            );
        }
    }
);


/*
=========================================================
REMOVE CART ITEM
DELETE /api/cart/items/:id/delete/
=========================================================
*/

export const removeProductFromCart = createAsyncThunk(
    "cart/removeProductFromCart",

    async (
        itemId,
        { rejectWithValue }
    ) => {
        try {
            const response =
                await deleteCartItem(itemId);

            /*
            Backend may return the updated cart.
            If it doesn't, we return the item ID.
            */

            if (response?.data) {
                return {
                    type: "cart",
                    data: response.data,
                };
            }

            return {
                type: "item",
                data: itemId,
            };

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Failed to remove product.",
                }
            );
        }
    }
);


/*
=========================================================
SLICE
=========================================================
*/

const cartSlice = createSlice({
    name: "cart",

    initialState,

    reducers: {

        clearCartError: (state) => {
            state.error = null;
        },

        clearCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.totalPrice = "0.00";
            state.error = null;
        },
    },


    extraReducers: (builder) => {

        /*
        =================================================
        FETCH CART
        =================================================
        */

        builder.addCase(
            fetchCart.pending,
            (state) => {
                state.loading = true;
                state.error = null;
            }
        );

        builder.addCase(
            fetchCart.fulfilled,
            (state, action) => {

                state.loading = false;

                state.items =
                    action.payload.items || [];

                state.totalItems =
                    action.payload.total_items || 0;

                state.totalPrice =
                    String(
                        action.payload.total_price ?? "0.00"
                    );

                state.error = null;
            }
        );

        builder.addCase(
            fetchCart.rejected,
            (state, action) => {

                state.loading = false;

                state.error =
                    action.payload;
            }
        );


        /*
        =================================================
        ADD TO CART
        =================================================
        */

        builder.addCase(
            addProductToCart.pending,
            (state) => {

                state.loading = true;
                state.error = null;
            }
        );

        builder.addCase(
            addProductToCart.fulfilled,
            (state, action) => {

                state.loading = false;

                state.items =
                    action.payload.items || [];

                state.totalItems =
                    action.payload.total_items || 0;

                state.totalPrice =
                    String(
                        action.payload.total_price ?? "0.00"
                    );

                state.error = null;
            }
        );

        builder.addCase(
            addProductToCart.rejected,
            (state, action) => {

                state.loading = false;

                state.error =
                    action.payload;
            }
        );


        /*
        =================================================
        UPDATE QUANTITY
        =================================================
        */

        builder.addCase(
            updateProductQuantity.pending,
            (state) => {

                state.loading = true;
                state.error = null;
            }
        );

        builder.addCase(
            updateProductQuantity.fulfilled,
            (state, action) => {

                state.loading = false;

                state.items =
                    action.payload.items || [];

                state.totalItems =
                    action.payload.total_items || 0;

                state.totalPrice =
                    String(
                        action.payload.total_price ?? "0.00"
                    );

                state.error = null;
            }
        );

        builder.addCase(
            updateProductQuantity.rejected,
            (state, action) => {

                state.loading = false;

                state.error =
                    action.payload;
            }
        );


        /*
        =================================================
        REMOVE ITEM
        =================================================
        */

        builder.addCase(
            removeProductFromCart.pending,
            (state) => {

                state.loading = true;
                state.error = null;
            }
        );

        builder.addCase(
            removeProductFromCart.fulfilled,
            (state, action) => {

                state.loading = false;

                /*
                Backend returned complete cart
                */

                if (
                    action.payload?.type === "cart"
                ) {

                    const cart =
                        action.payload.data;

                    state.items =
                        cart.items || [];

                    state.totalItems =
                        cart.total_items || 0;

                    state.totalPrice =
                        String(
                            cart.total_price ?? "0.00"
                        );

                }

                /*
                Backend returned only item ID
                */

                else {

                    const itemId =
                        action.payload.data;

                    state.items =
                        state.items.filter(
                            (item) =>
                                item.id !== itemId
                        );

                    state.totalItems =
                        state.items.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                Number(
                                    item.quantity || 0
                                ),
                            0
                        );

                    state.totalPrice =
                        state.items
                            .reduce(
                                (
                                    total,
                                    item
                                ) =>
                                    total +
                                    Number(
                                        item.subtotal || 0
                                    ),
                                0
                            )
                            .toFixed(2);
                }

                state.error = null;
            }
        );

        builder.addCase(
            removeProductFromCart.rejected,
            (state, action) => {

                state.loading = false;

                state.error =
                    action.payload;
            }
        );
    },
});


export const {
    clearCartError,
    clearCart,
} = cartSlice.actions;


export default cartSlice.reducer;

