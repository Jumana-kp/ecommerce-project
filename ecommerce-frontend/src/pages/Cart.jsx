import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    Container,
    IconButton,
    Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import api from "../services/api";


const GUEST_CART_KEY = "guest_cart";
const DELIVERY_FEE = 15;


/* ---------- PRICE ---------- */

const formatPrice = (value) => {
    const amount = Number(value || 0);

    return `$${amount.toFixed(2).replace(/\.00$/, "")}`;
};


/* ---------- AUTH ---------- */

const getAccessToken = () => {
    return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        null
    );
};


/* ---------- GUEST CART ---------- */

const getGuestCart = () => {
    try {
        const storedCart = localStorage.getItem(GUEST_CART_KEY);

        if (!storedCart) {
            return [];
        }

        const parsedCart = JSON.parse(storedCart);

        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
        return [];
    }
};


const saveGuestCart = (cart) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};


const calculateGuestCartTotals = (items) => {
    const totalItems = items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    const totalPrice = items.reduce(
        (total, item) => total + Number(item.subtotal || 0),
        0
    );

    return { totalItems, totalPrice };
};


/* ---------- STYLES ---------- */

const cardSx = {
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "20px",
    background: "#fff",
};

const summaryLabelSx = {
    color: "rgba(0,0,0,0.6)",
    fontSize: 16,
};

const summaryRowSx = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 2.5,
};


/* ---------- COMPONENT ---------- */

export default function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState({
        id: null,
        items: [],
        total_items: 0,
        total_price: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /* LOAD CART */

    const loadCart = useCallback(async () => {
        setLoading(true);
        setError("");

        const accessToken = getAccessToken();

        if (!accessToken) {
            const guestItems = getGuestCart();
            const { totalItems, totalPrice } =
                calculateGuestCartTotals(guestItems);

            setCart({
                id: null,
                items: guestItems,
                total_items: totalItems,
                total_price: totalPrice,
            });

            setLoading(false);
            return;
        }

        try {
            const response = await api.get("/cart/");

            setCart(
                response.data || {
                    id: null,
                    items: [],
                    total_items: 0,
                    total_price: 0,
                }
            );
        } catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");

                const guestItems = getGuestCart();
                const { totalItems, totalPrice } =
                    calculateGuestCartTotals(guestItems);

                setCart({
                    id: null,
                    items: guestItems,
                    total_items: totalItems,
                    total_price: totalPrice,
                });

                setLoading(false);
                return;
            }

            setError(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                "Unable to load cart."
            );
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        loadCart();
    }, [loadCart]);


    /* UPDATE GUEST QUANTITY */

    const updateGuestQuantity = (productVariantId, sizeId, newQuantity) => {
        if (newQuantity < 1) {
            return;
        }

        const guestCart = getGuestCart();

        const updatedCart = guestCart.map((item) => {
            const sameVariant =
                Number(item.product_variant_id) === Number(productVariantId);

            const sameSize =
                Number(item.selected_size_id) === Number(sizeId);

            if (sameVariant && sameSize) {
                const price = Number(item.product_price || 0);

                return {
                    ...item,
                    quantity: newQuantity,
                    subtotal: price * newQuantity,
                };
            }

            return item;
        });

        saveGuestCart(updatedCart);

        const { totalItems, totalPrice } =
            calculateGuestCartTotals(updatedCart);

        setCart({
            id: null,
            items: updatedCart,
            total_items: totalItems,
            total_price: totalPrice,
        });
    };


    /* UPDATE LOGGED-IN QUANTITY */

    const updateLoggedInQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            return;
        }

        try {
            setError("");

            await api.patch(`/cart/items/${itemId}/`, {
                quantity: newQuantity,
            });

            await loadCart();
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.response?.data?.quantity?.[0] ||
                "Unable to update quantity."
            );
        }
    };


    const increaseQuantity = (item) => {
        const newQuantity = Number(item.quantity) + 1;

        if (getAccessToken()) {
            updateLoggedInQuantity(item.id, newQuantity);
            return;
        }

        updateGuestQuantity(
            item.product_variant_id,
            item.selected_size_id,
            newQuantity
        );
    };


    const decreaseQuantity = (item) => {
        const newQuantity = Number(item.quantity) - 1;

        if (newQuantity < 1) {
            return;
        }

        if (getAccessToken()) {
            updateLoggedInQuantity(item.id, newQuantity);
            return;
        }

        updateGuestQuantity(
            item.product_variant_id,
            item.selected_size_id,
            newQuantity
        );
    };


    /* DELETE */

    const deleteGuestItem = (productVariantId, sizeId) => {
        const guestCart = getGuestCart();

        const updatedCart = guestCart.filter((item) => {
            const sameVariant =
                Number(item.product_variant_id) === Number(productVariantId);

            const sameSize =
                Number(item.selected_size_id) === Number(sizeId);

            return !(sameVariant && sameSize);
        });

        saveGuestCart(updatedCart);

        const { totalItems, totalPrice } =
            calculateGuestCartTotals(updatedCart);

        setCart({
            id: null,
            items: updatedCart,
            total_items: totalItems,
            total_price: totalPrice,
        });
    };


    const deleteLoggedInItem = async (itemId) => {
        try {
            setError("");

            await api.delete(`/cart/items/${itemId}/delete/`);

            await loadCart();
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                "Unable to remove item."
            );
        }
    };


    const handleDelete = (item) => {
        if (getAccessToken()) {
            deleteLoggedInItem(item.id);
            return;
        }

        deleteGuestItem(item.product_variant_id, item.selected_size_id);
    };


    /* CHECKOUT */

    const handleCheckout = () => {
        if (!cart.items.length) {
            return;
        }

        if (!getAccessToken()) {
            navigate("/login?next=/checkout");
            return;
        }

        navigate("/checkout");
    };


    /* LOADING */

    if (loading) {
        return (
            <Container sx={{ py: 8 }}>
                <Typography>Loading cart...</Typography>
            </Container>
        );
    }


    const subtotal = Number(cart.total_price || 0);
    const deliveryFee = cart.items.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + deliveryFee;


    /* RENDER */

    return (
        <Container
            maxWidth={false}
            sx={{
                maxWidth: 1240,
                px: { xs: 2, md: 4 },
                pt: { xs: 2, md: 3 },
                pb: { xs: 6, md: 10 },
            }}
        >
            {/* Breadcrumb */}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    borderTop: "1px solid rgba(0,0,0,0.1)",
                    pt: 2.5,
                    mb: 2,
                    fontSize: 14,
                }}
            >
                <Box
                    component="button"
                    type="button"
                    onClick={() => navigate("/")}
                    sx={{
                        border: 0,
                        background: "transparent",
                        p: 0,
                        cursor: "pointer",
                        color: "rgba(0,0,0,0.6)",
                        fontSize: 14,
                    }}
                >
                    Home
                </Box>

                <NavigateNextIcon
                    sx={{ fontSize: 18, color: "rgba(0,0,0,0.6)" }}
                />

                <Box component="span">Cart</Box>
            </Box>


            <Typography
                sx={{
                    fontSize: { xs: 32, md: 40 },
                    fontWeight: 900,
                    lineHeight: 1,
                    textTransform: "uppercase",
                    mb: { xs: 2.5, md: 3.5 },
                }}
            >
                Your Cart
            </Typography>


            {error && (
                <Typography color="error" mb={3}>
                    {error}
                </Typography>
            )}


            {cart.items.length === 0 ? (
                <Box sx={{ ...cardSx, p: 6, textAlign: "center" }}>
                    <Typography variant="h6" mb={3}>
                        Your cart is empty.
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => navigate("/products")}
                        sx={{
                            background: "#000",
                            borderRadius: "62px",
                            textTransform: "none",
                            px: 4,
                            "&:hover": { background: "#222" },
                        }}
                    >
                        Continue Shopping
                    </Button>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "minmax(0, 1.55fr) minmax(0, 1fr)",
                        },
                        gap: { xs: 2, md: 2.5 },
                        alignItems: "start",
                    }}
                >
                    {/* CART ITEMS */}

                    <Box
                        sx={{
                            ...cardSx,
                            px: { xs: 2, md: 3 },
                            py: { xs: 0.5, md: 1 },
                        }}
                    >
                        {cart.items.map((item, index) => (
                            <Box
                                key={item.id}
                                sx={{
                                    display: "flex",
                                    gap: { xs: 1.5, md: 2 },
                                    py: { xs: 2, md: 2.5 },
                                    borderBottom:
                                        index < cart.items.length - 1
                                            ? "1px solid rgba(0,0,0,0.1)"
                                            : "none",
                                }}
                            >
                                {/* IMAGE */}

                                <Box
                                    sx={{
                                        width: { xs: 99, md: 124 },
                                        height: { xs: 99, md: 124 },
                                        flexShrink: 0,
                                        borderRadius: "9px",
                                        background: "#F0EEED",
                                        overflow: "hidden",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={item.product_image}
                                        alt={item.product_name}
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                </Box>


                                {/* INFO + PRICE + QUANTITY */}

                                <Box
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            gap: 1,
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: { xs: 16, md: 20 },
                                                    lineHeight: 1.2,
                                                    mb: 0.5,
                                                }}
                                            >
                                                {item.product_name}
                                            </Typography>

                                            <Typography
                                                sx={{ fontSize: { xs: 12, md: 14 } }}
                                            >
                                                Size:{" "}
                                                <Box
                                                    component="span"
                                                    sx={{ color: "rgba(0,0,0,0.6)" }}
                                                >
                                                    {item.size}
                                                </Box>
                                            </Typography>

                                            <Typography
                                                sx={{ fontSize: { xs: 12, md: 14 } }}
                                            >
                                                Color:{" "}
                                                <Box
                                                    component="span"
                                                    sx={{ color: "rgba(0,0,0,0.6)" }}
                                                >
                                                    {item.color}
                                                </Box>
                                            </Typography>
                                        </Box>

                                        <IconButton
                                            onClick={() => handleDelete(item)}
                                            size="small"
                                            sx={{ color: "#FF3333", p: 0.25 }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>


                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mt: 1,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: { xs: 20, md: 24 },
                                            }}
                                        >
                                            {formatPrice(item.product_price)}
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                background: "#F0F0F0",
                                                borderRadius: "62px",
                                                px: 0.5,
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={() => decreaseQuantity(item)}
                                                disabled={Number(item.quantity) <= 1}
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>

                                            <Typography
                                                sx={{
                                                    minWidth: 28,
                                                    textAlign: "center",
                                                    fontSize: 14,
                                                }}
                                            >
                                                {item.quantity}
                                            </Typography>

                                            <IconButton
                                                size="small"
                                                onClick={() => increaseQuantity(item)}
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>


                    {/* ORDER SUMMARY */}

                    <Box sx={{ ...cardSx, p: { xs: 2.5, md: 3 } }}>
                        <Typography
                            sx={{ fontWeight: 700, fontSize: 24, mb: 3 }}
                        >
                            Order Summary
                        </Typography>

                        <Box sx={summaryRowSx}>
                            <Typography sx={summaryLabelSx}>Subtotal</Typography>
                            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                                {formatPrice(subtotal)}
                            </Typography>
                        </Box>

                        <Box sx={summaryRowSx}>
                            <Typography sx={summaryLabelSx}>Discount</Typography>
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 18,
                                    color: "#FF3333",
                                }}
                            >
                                {formatPrice(0)}
                            </Typography>
                        </Box>

                        <Box sx={summaryRowSx}>
                            <Typography sx={summaryLabelSx}>Delivery Fee</Typography>
                            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                                {formatPrice(deliveryFee)}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                borderTop: "1px solid rgba(0,0,0,0.1)",
                                pt: 2.5,
                                mb: 3,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Typography sx={{ fontSize: 20 }}>Total</Typography>
                            <Typography sx={{ fontWeight: 700, fontSize: 24 }}>
                                {formatPrice(total)}
                            </Typography>
                        </Box>


                        {/* Promo code (UI only) */}

                        <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
                            <Box
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    background: "#F0F0F0",
                                    borderRadius: "62px",
                                    px: 2,
                                    height: 48,
                                }}
                            >
                                <LocalOfferOutlinedIcon
                                    sx={{ fontSize: 20, color: "rgba(0,0,0,0.4)" }}
                                />

                                <Box
                                    component="input"
                                    placeholder="Add promo code"
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        border: 0,
                                        outline: "none",
                                        background: "transparent",
                                        fontSize: 14,
                                    }}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                sx={{
                                    background: "#000",
                                    borderRadius: "62px",
                                    textTransform: "none",
                                    px: 4,
                                    height: 48,
                                    boxShadow: "none",
                                    "&:hover": { background: "#222" },
                                }}
                            >
                                Apply
                            </Button>
                        </Box>


                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleCheckout}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                background: "#000",
                                borderRadius: "62px",
                                textTransform: "none",
                                height: 56,
                                fontSize: 16,
                                boxShadow: "none",
                                "&:hover": { background: "#222" },
                            }}
                        >
                            Go to Checkout
                        </Button>
                    </Box>
                </Box>
            )}
        </Container>
    );
}