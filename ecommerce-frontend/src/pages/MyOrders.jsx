import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowBack,
    ArrowForward,
    ShoppingBagOutlined,
} from "@mui/icons-material";

import api from "../services/api";


const getAccessToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");


const formatPrice = (value) => {
    const amount = Number(value || 0);
    
    return `$${amount.toFixed(2).replace(/\.00$/, "")}`;
    
};


const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const statusLabel = (status) => {
    const labels = {
        pending: "Pending",
        confirmed: "Confirmed",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
    };

    return labels[status] || status || "Pending";
};


const getStatusStyle = (status) => {
    if (status === "delivered") {
        return {
            background: "#EAF8EF",
            color: "#218449",
        };
    }

    if (status === "cancelled") {
        return {
            background: "#FFF0F0",
            color: "#D83232",
        };
    }

    if (status === "shipped") {
        return {
            background: "#EDF3FF",
            color: "#3566C9",
        };
    }

    if (status === "confirmed") {
        return {
            background: "#F1EDFF",
            color: "#5B4DDE",
        };
    }

    return {
        background: "#F3F3F3",
        color: "#555555",
    };
};


const MyOrders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const loadOrders = useCallback(async () => {
        if (!getAccessToken()) {
            setLoading(false);
            setOrders([]);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get("/orders/");

            const data = response.data;

            setOrders(
                Array.isArray(data)
                    ? data
                    : data?.results || []
            );
        } catch (requestError) {
            setError(
                requestError?.response?.data?.error ||
                requestError?.response?.data?.detail ||
                "Unable to load your orders. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        loadOrders();
    }, [loadOrders]);


    if (!getAccessToken()) {
        return (
            <div style={styles.page}>
                <div style={styles.container}>

                    <div style={styles.breadcrumb}>
                        <button
                            type="button"
                            style={styles.breadcrumbButton}
                            onClick={() => navigate("/")}
                        >
                            Home
                        </button>

                        <span style={styles.breadcrumbArrow}>
                            /
                        </span>

                        <span>My Orders</span>
                    </div>


                    <div style={styles.emptyCard}>

                        <div style={styles.emptyIconCircle}>
                            <ShoppingBagOutlined />
                        </div>

                        <span style={styles.eyebrow}>
                            ACCOUNT
                        </span>

                        <h1 style={styles.emptyTitle}>
                            LOGIN TO VIEW YOUR ORDERS
                        </h1>

                        <p style={styles.emptyText}>
                            Sign in to view your purchases and
                            track your order history.
                        </p>

                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() =>
                                navigate(
                                    "/login?next=/orders"
                                )
                            }
                        >
                            Login

                            <ArrowForward fontSize="small" />
                        </button>

                    </div>

                </div>
            </div>
        );
    }


    return (
        <div style={styles.page}>

            <div style={styles.container}>

                {/* Breadcrumb */}

                <div style={styles.breadcrumb}>

                    <button
                        type="button"
                        style={styles.breadcrumbButton}
                        onClick={() => navigate("/")}
                    >
                        Home
                    </button>

                    <span style={styles.breadcrumbArrow}>
                        /
                    </span>

                    <span>My Orders</span>

                </div>


                {/* Page Header */}

                <div style={styles.headingRow}>

                    <div>

                        <span style={styles.eyebrow}>
                            ACCOUNT
                        </span>

                        <h1 style={styles.title}>
                            MY ORDERS
                        </h1>

                        <p style={styles.subtitle}>
                            View your purchases and order status.
                        </p>

                    </div>


                    <button
                        type="button"
                        style={styles.backButton}
                        onClick={() => navigate(-1)}
                    >
                        <ArrowBack fontSize="small" />
                        Back
                    </button>

                </div>


                {/* Loading */}

                {loading && (
                    <div style={styles.loadingCard}>
                        <div style={styles.loadingSpinner} />
                        <span>
                            Loading your orders...
                        </span>
                    </div>
                )}


                {/* Error */}

                {!loading && error && (
                    <div style={styles.emptyCard}>

                        <span style={styles.eyebrow}>
                            ERROR
                        </span>

                        <h2 style={styles.emptyTitle}>
                            SOMETHING WENT WRONG
                        </h2>

                        <p style={styles.emptyText}>
                            {error}
                        </p>

                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={loadOrders}
                        >
                            Try Again
                        </button>

                    </div>
                )}


                {/* No Orders */}

                {!loading &&
                    !error &&
                    orders.length === 0 && (
                        <div style={styles.emptyCard}>

                            <div style={styles.emptyIconCircle}>
                                <ShoppingBagOutlined />
                            </div>

                            <span style={styles.eyebrow}>
                                YOUR ACCOUNT
                            </span>

                            <h2 style={styles.emptyTitle}>
                                NO ORDERS YET
                            </h2>

                            <p style={styles.emptyText}>
                                Your purchases will appear here
                                after you place your first order.
                            </p>

                            <button
                                type="button"
                                style={styles.primaryButton}
                                onClick={() => navigate("/")}
                            >
                                Start Shopping
                                <ArrowForward fontSize="small" />
                            </button>

                        </div>
                    )}


                {/* Orders */}

                {!loading &&
                    !error &&
                    orders.length > 0 && (

                        <div style={styles.ordersList}>

                            {orders.map((order) => {

                                const items =
                                    order.items || [];

                                return (
                                    <article
                                        key={order.id}
                                        style={styles.orderCard}
                                    >

                                        {/* Order Header */}

                                        <div
                                            style={
                                                styles.orderHeader
                                            }
                                        >

                                            <div>

                                                <span
                                                    style={
                                                        styles.orderEyebrow
                                                    }
                                                >
                                                    ORDER
                                                </span>

                                                <h2
                                                    style={
                                                        styles.orderNumber
                                                    }
                                                >
                                                    #{order.id}
                                                </h2>

                                                <span
                                                    style={
                                                        styles.orderDate
                                                    }
                                                >
                                                    Placed on{" "}
                                                    {formatDate(
                                                        order.created_at
                                                    )}
                                                </span>

                                            </div>


                                            <span
                                                style={{
                                                    ...styles.status,
                                                    ...getStatusStyle(
                                                        order.status
                                                    ),
                                                }}
                                            >
                                                {statusLabel(
                                                    order.status
                                                )}
                                            </span>

                                        </div>


                                        {/* Order Content */}

                                        <div
                                            style={
                                                styles.orderContent
                                            }
                                        >

                                            <div
                                                style={
                                                    styles.productList
                                                }
                                            >

                                                {items
                                                    .slice(0, 3)
                                                    .map((item) => (
                                                        <div
                                                            key={item.id}
                                                            style={
                                                                styles.productRow
                                                            }
                                                        >

                                                            <div
                                                                style={
                                                                    styles.imageBox
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
                                                                            styles.productImage
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


                                                            <div
                                                                style={
                                                                    styles.productInfo
                                                                }
                                                            >

                                                                <strong
                                                                    style={
                                                                        styles.productName
                                                                    }
                                                                >
                                                                    {item.product_name ||
                                                                        "Product"}
                                                                </strong>

                                                                <span
                                                                    style={
                                                                        styles.productMeta
                                                                    }
                                                                >
                                                                    Color:{" "}
                                                                    {item.color ||
                                                                        "—"}
                                                                </span>

                                                                <span
                                                                    style={
                                                                        styles.productMeta
                                                                    }
                                                                >
                                                                    Size:{" "}
                                                                    {item.size ||
                                                                        "—"}
                                                                    {" · "}
                                                                    Qty:{" "}
                                                                    {item.quantity}
                                                                </span>

                                                            </div>

                                                        </div>
                                                    ))}


                                                {items.length > 3 && (
                                                    <span
                                                        style={
                                                            styles.moreItems
                                                        }
                                                    >
                                                        +
                                                        {" "}
                                                        {items.length - 3}
                                                        {" "}
                                                        more item
                                                        {items.length - 3 === 1
                                                            ? ""
                                                            : "s"}
                                                    </span>
                                                )}

                                            </div>


                                            {/* Total */}

                                            <div
                                                style={
                                                    styles.orderSummary
                                                }
                                            >

                                                <span
                                                    style={
                                                        styles.summaryLabel
                                                    }
                                                >
                                                    TOTAL
                                                </span>

                                                <strong
                                                    style={
                                                        styles.totalPrice
                                                    }
                                                >
                                                    {formatPrice(
                                                        order.total_amount
                                                    )}
                                                </strong>

                                                <span
                                                    style={
                                                        styles.itemCount
                                                    }
                                                >
                                                    {items.length}{" "}
                                                    {items.length === 1
                                                        ? "item"
                                                        : "items"}
                                                </span>

                                            </div>

                                        </div>


                                        {/* Footer */}

                                        <div
                                            style={
                                                styles.orderFooter
                                            }
                                        >

                                            <button
                                                type="button"
                                                style={
                                                    styles.viewButton
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        `/orders/${order.id}`
                                                    )
                                                }
                                            >
                                                View Order Details

                                                <ArrowForward
                                                    fontSize="small"
                                                />
                                            </button>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

            </div>

        </div>
    );
};


const styles = {

    page: {
        minHeight: "calc(100vh - 80px)",
        background: "#FAFAFA",
        color: "#111111",
        padding: "34px 0 80px",
        boxSizing: "border-box",
    },

    container: {
        width: "min(1120px, calc(100% - 48px))",
        margin: "0 auto",
    },

    breadcrumb: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        marginBottom: "34px",
        fontSize: "12px",
        color: "#777777",
    },

    breadcrumbButton: {
        border: 0,
        background: "transparent",
        padding: 0,
        color: "#777777",
        cursor: "pointer",
        fontSize: "12px",
    },

    breadcrumbArrow: {
        color: "#C0C0C0",
    },

    headingRow: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "30px",
    },

    eyebrow: {
        display: "block",
        marginBottom: "9px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "2px",
        color: "#777777",
    },

    title: {
        margin: 0,
        fontSize: "42px",
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: "-2px",
    },

    subtitle: {
        margin: "10px 0 0",
        color: "#777777",
        fontSize: "13px",
    },

    backButton: {
        height: "40px",
        padding: "0 16px",
        border: "1px solid #DDDDDD",
        borderRadius: "22px",
        background: "#FFFFFF",
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        cursor: "pointer",
        fontSize: "11px",
    },

    ordersList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },

    orderCard: {
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: "18px",
        overflow: "hidden",
    },

    orderHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
        padding: "20px 22px",
        borderBottom: "1px solid #EEEEEE",
    },

    orderEyebrow: {
        display: "block",
        marginBottom: "3px",
        fontSize: "9px",
        letterSpacing: "1.6px",
        color: "#999999",
        fontWeight: 700,
    },

    orderNumber: {
        margin: 0,
        fontSize: "20px",
        fontWeight: 900,
        letterSpacing: "-0.5px",
    },

    orderDate: {
        display: "block",
        marginTop: "5px",
        fontSize: "11px",
        color: "#888888",
    },

    status: {
        padding: "8px 13px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: 700,
    },

    orderContent: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "25px",
        padding: "20px 22px",
    },

    productList: {
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        flex: 1,
        minWidth: 0,
    },

    productRow: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        minWidth: 0,
    },

    imageBox: {
        width: "76px",
        height: "88px",
        flex: "0 0 76px",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#F5F5F5",
        border: "1px solid #EEEEEE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    productImage: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
        padding: "4px",
        boxSizing: "border-box",
        display: "block",
    },

    imageIcon: {
        color: "#AAAAAA",
    },

    productInfo: {
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },

    productName: {
        fontSize: "13px",
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    productMeta: {
        fontSize: "10px",
        color: "#888888",
    },

    moreItems: {
        marginTop: "2px",
        fontSize: "10px",
        color: "#777777",
    },

    orderSummary: {
        minWidth: "150px",
        paddingLeft: "25px",
        borderLeft: "1px solid #EEEEEE",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "5px",
    },

    summaryLabel: {
        fontSize: "9px",
        letterSpacing: "1.3px",
        color: "#999999",
        fontWeight: 700,
    },

    totalPrice: {
        fontSize: "22px",
        fontWeight: 900,
        letterSpacing: "-0.5px",
    },

    itemCount: {
        fontSize: "10px",
        color: "#888888",
    },

    orderFooter: {
        display: "flex",
        justifyContent: "flex-end",
        padding: "13px 22px",
        borderTop: "1px solid #EEEEEE",
    },

    viewButton: {
        border: 0,
        background: "transparent",
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: 700,
        color: "#111111",
    },

    emptyCard: {
        minHeight: "390px",
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: "18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "35px",
    },

    emptyIconCircle: {
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: "#F1F1F1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "18px",
    },

    emptyTitle: {
        margin: 0,
        fontSize: "23px",
        fontWeight: 900,
        letterSpacing: "-0.5px",
    },

    emptyText: {
        maxWidth: "420px",
        margin: "10px 0 22px",
        color: "#777777",
        fontSize: "12px",
        lineHeight: 1.7,
    },

    primaryButton: {
        minHeight: "45px",
        padding: "0 20px",
        border: 0,
        borderRadius: "24px",
        background: "#000000",
        color: "#FFFFFF",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 600,
    },

    loadingCard: {
        minHeight: "390px",
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: "18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        color: "#777777",
        fontSize: "13px",
    },

    loadingSpinner: {
        width: "24px",
        height: "24px",
        border: "3px solid #EEEEEE",
        borderTop: "3px solid #111111",
        borderRadius: "50%",
    },
};


export default MyOrders;