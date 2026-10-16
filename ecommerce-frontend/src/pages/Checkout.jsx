import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowBack,
    ArrowForward,
    LockOutlined,
    ShoppingBagOutlined,
} from "@mui/icons-material";

import api from "../services/api";

const DELIVERY_FEE = 15;

const getAccessToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

const formatPrice = (value) => {
    const amount = Number(value || 0);

    return `$${amount.toFixed(2).replace(/\.00$/, "")}`;
};

/* =========================================================
   RESPONSIVE STYLES
========================================================= */

const checkoutResponsiveStyles = `
    * {
        box-sizing: border-box;
    }

    #checkout-page-root {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
    }

    #checkout-page-root .checkout-container {
        width: min(1120px, calc(100% - 48px));
        max-width: 1120px;
        margin: 0 auto;
    }

    #checkout-page-root .checkout-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.8fr);
        gap: 18px;
        align-items: start;
        width: 100%;
        min-width: 0;
    }

    #checkout-page-root .checkout-items-card,
    #checkout-page-root .checkout-summary-card {
        min-width: 0;
        max-width: 100%;
    }

    #checkout-page-root .checkout-item {
        min-width: 0;
        width: 100%;
    }

    /* =========================================
       TABLET + MOBILE
    ========================================= */

    @media (max-width: 768px) {
        #checkout-page-root {
            overflow-x: hidden;
        }

        #checkout-page-root .checkout-container {
            width: calc(100% - 32px) !important;
            max-width: none !important;
            margin: 0 auto !important;
        }

        #checkout-page-root .checkout-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
            margin-bottom: 22px !important;
        }

        #checkout-page-root .checkout-title {
            font-size: 30px !important;
            line-height: 1.05 !important;
            letter-spacing: -1px !important;
        }

        #checkout-page-root .checkout-secure-badge {
            align-self: flex-start !important;
        }

        /*
         IMPORTANT:
         Desktop 2-column layout becomes
         one column on mobile.
        */

        #checkout-page-root .checkout-layout {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 18px !important;
            width: 100% !important;
            min-width: 0 !important;
        }

        #checkout-page-root .checkout-items-card {
            order: 1 !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            padding: 18px !important;
            border-radius: 14px !important;
            box-sizing: border-box !important;
        }

        #checkout-page-root .checkout-summary-card {
            order: 2 !important;
            position: static !important;
            top: auto !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            padding: 18px !important;
            border-radius: 14px !important;
            box-sizing: border-box !important;
        }

        #checkout-page-root .checkout-item {
            display: flex !important;
            align-items: flex-start !important;
            width: 100% !important;
            min-width: 0 !important;
            gap: 12px !important;
        }

        #checkout-page-root .checkout-item-image {
            width: 82px !important;
            height: 96px !important;
            min-width: 82px !important;
            flex: 0 0 82px !important;
        }

        #checkout-page-root .checkout-item-details {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            overflow: hidden !important;
        }

        #checkout-page-root .checkout-item-price {
            min-width: 65px !important;
            flex: 0 0 auto !important;
        }

        #checkout-page-root .checkout-login-card {
            width: 100% !important;
            max-width: 520px !important;
            padding: 28px 22px !important;
            min-height: auto !important;
            margin: 24px auto 0 !important;
        }

        #checkout-page-root .checkout-empty-card {
            width: 100% !important;
            min-height: 320px !important;
            padding: 24px !important;
            box-sizing: border-box !important;
        }
    }

    /* =========================================
       SMALL MOBILE
    ========================================= */

    @media (max-width: 480px) {
        #checkout-page-root .checkout-container {
            width: calc(100% - 24px) !important;
        }

        #checkout-page-root .checkout-title {
            font-size: 26px !important;
        }

        #checkout-page-root .checkout-layout {
            gap: 14px !important;
        }

        #checkout-page-root .checkout-items-card,
        #checkout-page-root .checkout-summary-card {
            padding: 16px !important;
            border-radius: 14px !important;
        }

        #checkout-page-root .checkout-item {
            gap: 10px !important;
        }

        #checkout-page-root .checkout-item-image {
            width: 72px !important;
            height: 84px !important;
            min-width: 72px !important;
            flex: 0 0 72px !important;
        }

        #checkout-page-root .checkout-item-price {
            min-width: 58px !important;
        }

        #checkout-page-root .checkout-product-name {
            font-size: 13px !important;
        }

        #checkout-page-root .checkout-meta {
            font-size: 10px !important;
        }

        #checkout-page-root .checkout-price-label {
            font-size: 8px !important;
        }

        #checkout-page-root .checkout-item-total {
            font-size: 13px !important;
        }

        #checkout-page-root .checkout-card-header {
            margin-bottom: 18px !important;
        }

        #checkout-page-root .checkout-section-title {
            font-size: 18px !important;
        }

        #checkout-page-root .checkout-breadcrumb {
            margin-bottom: 24px !important;
        }
    }

    /* =========================================
       VERY SMALL MOBILE
    ========================================= */

    @media (max-width: 360px) {
        #checkout-page-root .checkout-container {
            width: calc(100% - 20px) !important;
        }

        #checkout-page-root .checkout-items-card,
        #checkout-page-root .checkout-summary-card {
            padding: 14px !important;
        }

        #checkout-page-root .checkout-item {
            gap: 8px !important;
        }

        #checkout-page-root .checkout-item-image {
            width: 64px !important;
            height: 76px !important;
            min-width: 64px !important;
            flex-basis: 64px !important;
        }

        #checkout-page-root .checkout-item-price {
            min-width: 52px !important;
        }
    }
`;

function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");

    const authenticated = Boolean(getAccessToken());

    /* =========================================================
       LOAD CART
    ========================================================= */

    const loadCart = useCallback(async () => {
        if (!getAccessToken()) {
            setLoading(false);
            setCart(null);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get("/cart/");

            setCart(
                response.data || {
                    items: [],
                    total_items: 0,
                    total_price: 0,
                }
            );
        } catch (requestError) {
            setError(
                requestError?.response?.data?.error ||
                    requestError?.response?.data?.detail ||
                    "Unable to load your cart."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    /* =========================================================
       PLACE ORDER
    ========================================================= */

    const handlePlaceOrder = async () => {
        if (placingOrder) {
            return;
        }

        try {
            setPlacingOrder(true);
            setError("");

            await api.post("/orders/checkout/");

            navigate("/orders", {
                state: {
                    orderPlaced: true,
                },
            });
        } catch (requestError) {
            setError(
                requestError?.response?.data?.error ||
                    requestError?.response?.data?.detail ||
                    "Unable to place the order. Please try again."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    /* =========================================================
       NOT LOGGED IN
    ========================================================= */

    if (!authenticated) {
        return (
            <div
                id="checkout-page-root"
                style={styles.page}
            >
                <style>{checkoutResponsiveStyles}</style>

                <div
                    className="checkout-container"
                    style={styles.container}
                >
                    <div
                        className="checkout-breadcrumb"
                        style={styles.breadcrumb}
                    >
                        <button
                            type="button"
                            style={styles.breadcrumbButton}
                            onClick={() => navigate("/")}
                        >
                            Home
                        </button>

                        <span>/</span>

                        <span>Checkout</span>
                    </div>

                    <div
                        className="checkout-login-card"
                        style={styles.loginCard}
                    >
                        <div style={styles.lockCircle}>
                            <LockOutlined />
                        </div>

                        <span style={styles.eyebrow}>
                            SECURE CHECKOUT
                        </span>

                        <h1 style={styles.loginTitle}>
                            LOGIN TO CHECKOUT
                        </h1>

                        <p style={styles.loginText}>
                            Please login to continue with your order.
                        </p>

                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() =>
                                navigate("/login?next=/checkout")
                            }
                        >
                            Login
                            <ArrowForward fontSize="small" />
                        </button>

                        <button
                            type="button"
                            style={styles.backLink}
                            onClick={() => navigate("/cart")}
                        >
                            <ArrowBack fontSize="small" />
                            Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div
                id="checkout-page-root"
                style={styles.page}
            >
                <style>{checkoutResponsiveStyles}</style>

                <div style={styles.loading}>
                    <div style={styles.spinner} />
                    <p>Loading checkout...</p>
                </div>
            </div>
        );
    }

    /* =========================================================
       TOTALS
    ========================================================= */

    const items = cart?.items || [];

    const subtotal = Number(
        cart?.total_price || 0
    );

    const deliveryFee =
        items.length > 0
            ? DELIVERY_FEE
            : 0;

    const total =
        subtotal + deliveryFee;

    /* =========================================================
       MAIN CHECKOUT
    ========================================================= */

    return (
        <div
            id="checkout-page-root"
            style={styles.page}
        >
            <style>{checkoutResponsiveStyles}</style>

            <div
                className="checkout-container"
                style={styles.container}
            >
                {/* =========================================
                    BREADCRUMB
                ========================================= */}

                <div
                    className="checkout-breadcrumb"
                    style={styles.breadcrumb}
                >
                    <button
                        type="button"
                        style={styles.breadcrumbButton}
                        onClick={() => navigate("/")}
                    >
                        Home
                    </button>

                    <span>/</span>

                    <button
                        type="button"
                        style={styles.breadcrumbButton}
                        onClick={() => navigate("/cart")}
                    >
                        Cart
                    </button>

                    <span>/</span>

                    <span>Checkout</span>
                </div>

                {/* =========================================
                    HEADER
                ========================================= */}

                <div
                    className="checkout-header"
                    style={styles.header}
                >
                    <div>
                        <span style={styles.eyebrow}>
                            FINAL STEP
                        </span>

                        <h1
                            className="checkout-title"
                            style={styles.title}
                        >
                            CHECKOUT
                        </h1>

                        <p style={styles.subtitle}>
                            Review your order before placing it.
                        </p>
                    </div>

                    <div
                        className="checkout-secure-badge"
                        style={styles.secureBadge}
                    >
                        <LockOutlined fontSize="small" />
                        Secure Checkout
                    </div>
                </div>

                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (
                    <div style={styles.errorBox}>
                        {error}
                    </div>
                )}

                {/* =========================================
                    EMPTY CART
                ========================================= */}

                {items.length === 0 ? (
                    <div
                        className="checkout-empty-card"
                        style={styles.emptyCard}
                    >
                        <div style={styles.emptyIcon}>
                            <ShoppingBagOutlined />
                        </div>

                        <h2 style={styles.emptyTitle}>
                            YOUR CART IS EMPTY
                        </h2>

                        <p style={styles.emptyText}>
                            Add products to your cart before
                            continuing to checkout.
                        </p>

                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() => navigate("/")}
                        >
                            Continue Shopping
                            <ArrowForward fontSize="small" />
                        </button>
                    </div>
                ) : (
                    /* =========================================
                       CHECKOUT LAYOUT
                    ========================================= */

                    <div
                        className="checkout-layout"
                        style={styles.layout}
                    >
                        {/* =====================================
                            ORDER ITEMS
                        ===================================== */}

                        <div
                            className="checkout-items-card"
                            style={styles.itemsCard}
                        >
                            <div
                                className="checkout-card-header"
                                style={styles.cardHeader}
                            >
                                <div>
                                    <span style={styles.cardEyebrow}>
                                        YOUR CART
                                    </span>

                                    <h2
                                        className="checkout-section-title"
                                        style={styles.sectionTitle}
                                    >
                                        Order Items
                                    </h2>
                                </div>

                                <span style={styles.itemCount}>
                                    {cart?.total_items ||
                                        items.length}{" "}
                                    {Number(
                                        cart?.total_items ||
                                            items.length
                                    ) === 1
                                        ? "item"
                                        : "items"}
                                </span>
                            </div>

                            {items.map(
                                (item, index) => (
                                    <React.Fragment
                                        key={
                                            item.id ||
                                            index
                                        }
                                    >
                                        <div
                                            className="checkout-item"
                                            style={styles.item}
                                        >
                                            {/* PRODUCT IMAGE */}

                                            <div
                                                className="checkout-item-image"
                                                style={
                                                    styles.imageContainer
                                                }
                                            >
                                                {item.product_image ? (
                                                    <img
                                                        src={
                                                            item.product_image
                                                        }
                                                        alt={
                                                            item.product_name ||
                                                            "Product"
                                                        }
                                                        style={
                                                            styles.image
                                                        }
                                                    />
                                                ) : (
                                                    <ShoppingBagOutlined
                                                        style={
                                                            styles.imageIcon
                                                        }
                                                    />
                                                )}
                                            </div>

                                            {/* PRODUCT DETAILS */}

                                            <div
                                                className="checkout-item-details"
                                                style={
                                                    styles.itemDetails
                                                }
                                            >
                                                <h3
                                                    className="checkout-product-name"
                                                    style={
                                                        styles.productName
                                                    }
                                                >
                                                    {item.product_name ||
                                                        "Product"}
                                                </h3>

                                                <p
                                                    className="checkout-meta"
                                                    style={
                                                        styles.meta
                                                    }
                                                >
                                                    Color:{" "}
                                                    <strong>
                                                        {item.color ||
                                                            "—"}
                                                    </strong>
                                                </p>

                                                <p
                                                    className="checkout-meta"
                                                    style={
                                                        styles.meta
                                                    }
                                                >
                                                    Size:{" "}
                                                    <strong>
                                                        {item.size ||
                                                            "—"}
                                                    </strong>
                                                </p>

                                                <p
                                                    className="checkout-meta"
                                                    style={
                                                        styles.meta
                                                    }
                                                >
                                                    Quantity:{" "}
                                                    <strong>
                                                        {
                                                            item.quantity
                                                        }
                                                    </strong>
                                                </p>
                                            </div>

                                            {/* ITEM TOTAL */}

                                            <div
                                                className="checkout-item-price"
                                                style={
                                                    styles.itemPriceContainer
                                                }
                                            >
                                                <span
                                                    className="checkout-price-label"
                                                    style={
                                                        styles.itemPriceLabel
                                                    }
                                                >
                                                    Total
                                                </span>

                                                <strong
                                                    className="checkout-item-total"
                                                    style={
                                                        styles.itemPrice
                                                    }
                                                >
                                                    {formatPrice(
                                                        item.subtotal
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        {index <
                                            items.length -
                                                1 && (
                                            <div
                                                style={
                                                    styles.divider
                                                }
                                            />
                                        )}
                                    </React.Fragment>
                                )
                            )}

                            {/* EDIT CART */}

                            <button
                                type="button"
                                style={
                                    styles.editCartButton
                                }
                                onClick={() =>
                                    navigate("/cart")
                                }
                            >
                                <ArrowBack fontSize="small" />
                                Edit Cart
                            </button>
                        </div>

                        {/* =====================================
                            ORDER SUMMARY
                        ===================================== */}

                        <div
                            className="checkout-summary-card"
                            style={styles.summaryCard}
                        >
                            <span style={styles.cardEyebrow}>
                                ORDER SUMMARY
                            </span>

                            <h2
                                className="checkout-section-title"
                                style={styles.sectionTitle}
                            >
                                Summary
                            </h2>

                            <div style={styles.summary}>
                                <div
                                    style={
                                        styles.summaryRow
                                    }
                                >
                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {formatPrice(
                                            subtotal
                                        )}
                                    </strong>
                                </div>

                                <div
                                    style={
                                        styles.summaryRow
                                    }
                                >
                                    <span>
                                        Delivery
                                    </span>

                                    <strong>
                                        {formatPrice(
                                            deliveryFee
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div style={styles.divider} />

                            <div
                                style={
                                    styles.totalRow
                                }
                            >
                                <span>
                                    Total
                                </span>

                                <strong>
                                    {formatPrice(
                                        total
                                    )}
                                </strong>
                            </div>

                            {/* PLACE ORDER */}

                            <button
                                type="button"
                                style={{
                                    ...styles.placeOrderButton,
                                    opacity:
                                        placingOrder
                                            ? 0.6
                                            : 1,
                                    cursor:
                                        placingOrder
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                                onClick={
                                    handlePlaceOrder
                                }
                                disabled={
                                    placingOrder
                                }
                            >
                                {placingOrder
                                    ? "Placing Order..."
                                    : "Place Order"}

                                {!placingOrder && (
                                    <ArrowForward fontSize="small" />
                                )}
                            </button>

                            <div
                                style={
                                    styles.secureText
                                }
                            >
                                <LockOutlined fontSize="small" />
                                Secure order processing
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
    page: {
        minHeight: "calc(100vh - 80px)",
        background: "#fafafa",
        padding: "35px 0 80px",
        color: "#111",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
    },

    container: {
        width: "min(1120px, calc(100% - 48px))",
        maxWidth: "1120px",
        margin: "0 auto",
    },

    breadcrumb: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "9px",
        marginBottom: "32px",
        color: "#888",
        fontSize: "12px",
    },

    breadcrumbButton: {
        border: 0,
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        color: "#777",
        fontSize: "12px",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "20px",
        marginBottom: "28px",
    },

    eyebrow: {
        display: "block",
        marginBottom: "8px",
        color: "#888",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "2px",
    },

    title: {
        margin: 0,
        fontSize: "40px",
        lineHeight: 1.05,
        fontWeight: 900,
        letterSpacing: "-2px",
    },

    subtitle: {
        margin: "9px 0 0",
        color: "#777",
        fontSize: "13px",
    },

    secureBadge: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "9px 13px",
        border: "1px solid #e2e2e2",
        borderRadius: "20px",
        background: "#fff",
        color: "#555",
        fontSize: "11px",
        whiteSpace: "nowrap",
    },

    errorBox: {
        marginBottom: "18px",
        padding: "13px 15px",
        border: "1px solid #efcccc",
        borderRadius: "10px",
        background: "#fff6f6",
        color: "#c0392b",
        fontSize: "12px",
    },

    layout: {
        display: "grid",
        gridTemplateColumns:
            "minmax(0, 1.6fr) minmax(300px, 0.8fr)",
        gap: "18px",
        alignItems: "start",
        width: "100%",
        minWidth: 0,
    },

    itemsCard: {
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "18px",
        padding: "23px",
        minWidth: 0,
        maxWidth: "100%",
    },

    summaryCard: {
        position: "sticky",
        top: "20px",
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "18px",
        padding: "23px",
        minWidth: 0,
        maxWidth: "100%",
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        marginBottom: "22px",
    },

    cardEyebrow: {
        display: "block",
        marginBottom: "5px",
        color: "#999",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.5px",
    },

    sectionTitle: {
        margin: 0,
        fontSize: "19px",
        lineHeight: 1.2,
        fontWeight: 800,
    },

    itemCount: {
        padding: "7px 11px",
        borderRadius: "20px",
        background: "#f4f4f4",
        color: "#555",
        fontSize: "10px",
        whiteSpace: "nowrap",
        flexShrink: 0,
    },

    item: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        minWidth: 0,
    },

    imageContainer: {
        width: "92px",
        height: "105px",
        flex: "0 0 92px",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#f3f3f3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    },

    imageIcon: {
        color: "#aaa",
    },

    itemDetails: {
        flex: "1 1 auto",
        minWidth: 0,
        overflow: "hidden",
    },

    productName: {
        margin: "0 0 9px",
        fontSize: "14px",
        fontWeight: 700,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },

    meta: {
        margin: "4px 0",
        color: "#888",
        fontSize: "11px",
        lineHeight: 1.4,
    },

    itemPriceContainer: {
        textAlign: "right",
        minWidth: "85px",
        flex: "0 0 auto",
    },

    itemPriceLabel: {
        display: "block",
        marginBottom: "4px",
        color: "#999",
        fontSize: "9px",
    },

    itemPrice: {
        fontSize: "14px",
        whiteSpace: "nowrap",
    },

    divider: {
        height: "1px",
        background: "#eeeeee",
        margin: "20px 0",
        width: "100%",
    },

    editCartButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        marginTop: "3px",
        padding: 0,
        border: 0,
        background: "transparent",
        color: "#555",
        cursor: "pointer",
        fontSize: "11px",
    },

    summary: {
        marginTop: "23px",
    },

    summaryRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        marginBottom: "14px",
        color: "#777",
        fontSize: "12px",
    },

    totalRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        marginBottom: "22px",
        fontSize: "15px",
        fontWeight: 700,
    },

    placeOrderButton: {
        width: "100%",
        height: "48px",
        border: 0,
        borderRadius: "25px",
        background: "#000",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        fontSize: "12px",
        fontWeight: 700,
    },

    secureText: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        marginTop: "14px",
        color: "#999",
        fontSize: "10px",
        textAlign: "center",
    },

    loginCard: {
        width: "100%",
        maxWidth: "520px",
        minHeight: "390px",
        margin: "50px auto 0",
        padding: "40px",
        boxSizing: "border-box",
        border: "1px solid #e5e5e5",
        borderRadius: "20px",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    },

    lockCircle: {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "#f2f2f2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "18px",
    },

    loginTitle: {
        margin: 0,
        fontSize: "27px",
        fontWeight: 900,
    },

    loginText: {
        margin: "12px 0 24px",
        color: "#777",
        fontSize: "13px",
    },

    primaryButton: {
        minHeight: "46px",
        padding: "0 22px",
        border: 0,
        borderRadius: "24px",
        background: "#000",
        color: "#fff",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        fontSize: "12px",
        fontWeight: 600,
    },

    backLink: {
        marginTop: "18px",
        border: 0,
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        color: "#555",
        fontSize: "11px",
    },

    emptyCard: {
        minHeight: "380px",
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
    },

    emptyIcon: {
        width: "62px",
        height: "62px",
        borderRadius: "50%",
        background: "#f2f2f2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "18px",
    },

    emptyTitle: {
        margin: 0,
        fontSize: "22px",
        fontWeight: 900,
    },

    emptyText: {
        margin: "10px 0 22px",
        color: "#777",
        fontSize: "12px",
    },

    loading: {
        minHeight: "500px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#777",
        fontSize: "13px",
    },

    spinner: {
        width: "24px",
        height: "24px",
        border: "3px solid #eee",
        borderTop: "3px solid #111",
        borderRadius: "50%",
        marginBottom: "12px",
    },
};

export default Checkout;