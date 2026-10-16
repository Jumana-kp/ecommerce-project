import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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


const formatDate = (dateString) => {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
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
    switch (status) {
        case "confirmed":
            return {
                backgroundColor: "#F1EDFF",
                color: "#5B4DDE",
            };

        case "shipped":
            return {
                backgroundColor: "#EDF3FF",
                color: "#3566C9",
            };

        case "delivered":
            return {
                backgroundColor: "#EAF8EF",
                color: "#218449",
            };

        case "cancelled":
            return {
                backgroundColor: "#FFF0F0",
                color: "#D83232",
            };

        case "pending":
        default:
            return {
                backgroundColor: "#F3F3F3",
                color: "#555555",
            };
    }
};


function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const loadOrder = useCallback(async () => {
        if (!getAccessToken()) {
            navigate("/login?next=/orders", {
                replace: true,
            });

            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/orders/${id}/`
            );

            setOrder(response.data);

        } catch (requestError) {

            if (
                requestError?.response?.status === 401 ||
                requestError?.response?.status === 403
            ) {
                navigate("/login?next=/orders", {
                    replace: true,
                });

                return;
            }

            if (
                requestError?.response?.status === 404
            ) {
                setError("Order not found.");
            } else {
                setError(
                    "Unable to load order details. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    }, [id, navigate]);


    useEffect(() => {
        loadOrder();
    }, [loadOrder]);


    if (loading) {
        return (
            <div style={styles.centerState}>
                <div style={styles.loadingSpinner} />

                <p style={styles.stateText}>
                    Loading order details...
                </p>
            </div>
        );
    }


    if (error) {
        return (
            <div style={styles.centerState}>

                <div style={styles.errorCard}>

                    <div style={styles.errorIconCircle}>
                        <ShoppingBagOutlined
                            style={styles.errorIcon}
                        />
                    </div>

                    <span style={styles.errorEyebrow}>
                        ORDER
                    </span>

                    <h2 style={styles.errorTitle}>
                        {error}
                    </h2>

                    <button
                        type="button"
                        style={styles.primaryButton}
                        onClick={() =>
                            navigate("/orders")
                        }
                    >
                        Back to My Orders
                    </button>

                </div>

            </div>
        );
    }


    if (!order) {
        return null;
    }


    const items = order.items || [];


    const subtotal = items.reduce(
        (total, item) =>
            total + Number(item.subtotal || 0),
        0
    );


    const totalAmount = Number(
        order.total_amount || 0
    );


    const deliveryFee = Math.max(
        totalAmount - subtotal,
        0
    );


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

                    <span style={styles.separator}>
                        /
                    </span>

                    <button
                        type="button"
                        style={styles.breadcrumbButton}
                        onClick={() =>
                            navigate("/orders")
                        }
                    >
                        My Orders
                    </button>

                    <span style={styles.separator}>
                        /
                    </span>

                    <span
                        style={
                            styles.currentBreadcrumb
                        }
                    >
                        Order #{order.id}
                    </span>

                </div>


                {/* Header */}

                <div style={styles.header}>

                    <div>

                        <button
                            type="button"
                            style={styles.backButton}
                            onClick={() =>
                                navigate("/orders")
                            }
                        >
                            <ArrowBack fontSize="small" />
                            Back to My Orders
                        </button>

                        <p style={styles.eyebrow}>
                            ORDER DETAILS
                        </p>

                        <h1 style={styles.title}>
                            Order #{order.id}
                        </h1>

                        <p style={styles.date}>
                            Placed on{" "}
                            {formatDate(
                                order.created_at
                            )}
                        </p>

                    </div>


                    <span
                        style={{
                            ...styles.statusBadge,
                            ...getStatusStyle(
                                order.status
                            ),
                        }}
                    >
                        {statusLabel(order.status)}
                    </span>

                </div>


                {/* Main Content */}

                <div style={styles.contentGrid}>

                    {/* Items */}

                    <section style={styles.itemsCard}>

                        <div style={styles.cardHeader}>

                            <div>

                                <span
                                    style={
                                        styles.cardEyebrow
                                    }
                                >
                                    PURCHASE
                                </span>

                                <h2
                                    style={
                                        styles.cardTitle
                                    }
                                >
                                    Order Items
                                </h2>

                                <p
                                    style={
                                        styles.cardSubtitle
                                    }
                                >
                                    {items.length}{" "}
                                    {items.length === 1
                                        ? "item"
                                        : "items"}{" "}
                                    in this order
                                </p>

                            </div>

                        </div>


                        {items.length === 0 ? (

                            <div
                                style={
                                    styles.emptyItems
                                }
                            >

                                <ShoppingBagOutlined
                                    style={
                                        styles.emptyIcon
                                    }
                                />

                                <p>
                                    No items found
                                    for this order.
                                </p>

                            </div>

                        ) : (

                            <div>

                                {items.map((item) => (

                                    <div
                                        key={item.id}
                                        style={
                                            styles.item
                                        }
                                    >

                                        {/* Product Image */}

                                        <div
                                            style={
                                                styles.imageWrapper
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

                                                <div
                                                    style={
                                                        styles.imagePlaceholder
                                                    }
                                                >
                                                    <ShoppingBagOutlined />
                                                </div>

                                            )}

                                        </div>


                                        {/* Product Info */}

                                        <div
                                            style={
                                                styles.itemInfo
                                            }
                                        >

                                            <span
                                                style={
                                                    styles.itemLabel
                                                }
                                            >
                                                PRODUCT
                                            </span>

                                            <h3
                                                style={
                                                    styles.productName
                                                }
                                            >
                                                {item.product_name ||
                                                    "Product"}
                                            </h3>


                                            <div
                                                style={
                                                    styles.variantInfo
                                                }
                                            >

                                                <div
                                                    style={
                                                        styles.variantItem
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            styles.variantLabel
                                                        }
                                                    >
                                                        Color
                                                    </span>

                                                    <strong>
                                                        {item.color ||
                                                            "—"}
                                                    </strong>
                                                </div>


                                                <div
                                                    style={
                                                        styles.variantItem
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            styles.variantLabel
                                                        }
                                                    >
                                                        Size
                                                    </span>

                                                    <strong>
                                                        {item.size ||
                                                            "—"}
                                                    </strong>
                                                </div>


                                                <div
                                                    style={
                                                        styles.variantItem
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            styles.variantLabel
                                                        }
                                                    >
                                                        Quantity
                                                    </span>

                                                    <strong>
                                                        {item.quantity}
                                                    </strong>
                                                </div>

                                            </div>


                                            <p
                                                style={
                                                    styles.unitPrice
                                                }
                                            >
                                                {formatPrice(
                                                    item.unit_price
                                                )}{" "}
                                                each
                                            </p>

                                        </div>


                                        {/* Item Price */}

                                        <div
                                            style={
                                                styles.itemPriceBlock
                                            }
                                        >

                                            <span
                                                style={
                                                    styles.itemPriceLabel
                                                }
                                            >
                                                SUBTOTAL
                                            </span>

                                            <strong
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

                                ))}

                            </div>
                        )}

                    </section>


                    {/* Summary */}

                    <aside style={styles.summaryCard}>

                        <span
                            style={
                                styles.cardEyebrow
                            }
                        >
                            SUMMARY
                        </span>

                        <h2
                            style={
                                styles.cardTitle
                            }
                        >
                            Order Summary
                        </h2>


                        <div
                            style={
                                styles.summaryRows
                            }
                        >

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


                        <div
                            style={
                                styles.summaryDivider
                            }
                        />


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
                                    totalAmount
                                )}
                            </strong>

                        </div>


                        <div
                            style={
                                styles.orderStatusBox
                            }
                        >

                            <span
                                style={
                                    styles.orderStatusLabel
                                }
                            >
                                ORDER STATUS
                            </span>

                            <div
                                style={
                                    styles.orderStatusValue
                                }
                            >

                                <span
                                    style={{
                                        ...styles.statusDot,
                                        backgroundColor:
                                            getStatusStyle(
                                                order.status
                                            ).color,
                                    }}
                                />

                                {statusLabel(
                                    order.status
                                )}

                            </div>

                        </div>


                        <div
                            style={
                                styles.paymentInfo
                            }
                        >

                            <span
                                style={
                                    styles.paymentTitle
                                }
                            >
                                PAYMENT
                            </span>

                            <p
                                style={
                                    styles.paymentText
                                }
                            >
                                Payment details are
                                not collected in this
                                demo checkout.
                            </p>

                        </div>


                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() =>
                                navigate("/orders")
                            }
                        >
                            Back to My Orders

                            <ArrowForward
                                fontSize="small"
                            />
                        </button>

                    </aside>

                </div>

            </div>

        </div>
    );
}


const styles = {

    page: {
        minHeight: "100vh",
        backgroundColor: "#FAFAFA",
        padding: "34px 0 70px",
        color: "#111111",
    },

    container: {
        width: "min(1180px, calc(100% - 48px))",
        margin: "0 auto",
    },

    breadcrumb: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "9px",
        marginBottom: "30px",
        fontSize: "12px",
    },

    breadcrumbButton: {
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        color: "#777777",
        fontSize: "12px",
    },

    separator: {
        color: "#C4C4C4",
    },

    currentBreadcrumb: {
        color: "#999999",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "25px",
        marginBottom: "30px",
    },

    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        color: "#111111",
        fontSize: "12px",
        fontWeight: 600,
        marginBottom: "20px",
    },

    eyebrow: {
        margin: "0 0 8px",
        color: "#777777",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "2px",
    },

    title: {
        margin: 0,
        color: "#111111",
        fontSize: "40px",
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: "-1.5px",
    },

    date: {
        margin: "9px 0 0",
        color: "#888888",
        fontSize: "12px",
    },

    statusBadge: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "9px 16px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: 700,
    },

    contentGrid: {
        display: "grid",
        gridTemplateColumns:
            "minmax(0, 1fr) 330px",
        gap: "22px",
        alignItems: "start",
    },

    itemsCard: {
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E8E8",
        borderRadius: "18px",
        padding: "26px",
    },

    summaryCard: {
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E8E8",
        borderRadius: "18px",
        padding: "26px",
        position: "sticky",
        top: "24px",
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
    },

    cardEyebrow: {
        display: "block",
        marginBottom: "7px",
        color: "#999999",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.6px",
    },

    cardTitle: {
        margin: 0,
        color: "#111111",
        fontSize: "20px",
        fontWeight: 800,
        letterSpacing: "-0.4px",
    },

    cardSubtitle: {
        margin: "6px 0 0",
        color: "#888888",
        fontSize: "11px",
    },

    item: {
        display: "flex",
        alignItems: "center",
        gap: "18px",
        padding: "20px 0",
        borderBottom: "1px solid #EEEEEE",
    },

    imageWrapper: {
        width: "120px",
        height: "140px",
        flexShrink: 0,
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#F5F5F5",
        border: "1px solid #EEEEEE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    productImage: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
        padding: "6px",
        boxSizing: "border-box",
        display: "block",
    },

    imagePlaceholder: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#AAAAAA",
    },

    itemInfo: {
        flex: 1,
        minWidth: 0,
    },

    itemLabel: {
        display: "block",
        marginBottom: "5px",
        color: "#AAAAAA",
        fontSize: "8px",
        fontWeight: 700,
        letterSpacing: "1.5px",
    },

    productName: {
        margin: "0 0 15px",
        color: "#111111",
        fontSize: "16px",
        fontWeight: 700,
    },

    variantInfo: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
    },

    variantItem: {
        minWidth: "70px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        color: "#222222",
        fontSize: "11px",
    },

    variantLabel: {
        color: "#999999",
        fontSize: "9px",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
    },

    unitPrice: {
        margin: "15px 0 0",
        color: "#888888",
        fontSize: "11px",
    },

    itemPriceBlock: {
        minWidth: "95px",
        textAlign: "right",
        alignSelf: "center",
    },

    itemPriceLabel: {
        display: "block",
        marginBottom: "5px",
        color: "#999999",
        fontSize: "8px",
        letterSpacing: "1px",
        fontWeight: 700,
    },

    itemPrice: {
        color: "#111111",
        fontSize: "16px",
        fontWeight: 800,
    },

    summaryRows: {
        marginTop: "28px",
    },

    summaryRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        marginBottom: "15px",
        color: "#777777",
        fontSize: "13px",
    },

    summaryDivider: {
        height: "1px",
        backgroundColor: "#EEEEEE",
        margin: "20px 0",
    },

    totalRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#111111",
        fontSize: "18px",
        fontWeight: 800,
    },

    orderStatusBox: {
        marginTop: "25px",
        padding: "15px",
        borderRadius: "11px",
        backgroundColor: "#F7F7F8",
    },

    orderStatusLabel: {
        display: "block",
        marginBottom: "8px",
        color: "#999999",
        fontSize: "8px",
        letterSpacing: "1.3px",
        fontWeight: 700,
    },

    orderStatusValue: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#333333",
        fontSize: "12px",
        fontWeight: 700,
    },

    statusDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
    },

    paymentInfo: {
        marginTop: "12px",
        padding: "15px",
        borderRadius: "11px",
        backgroundColor: "#FAFAFA",
        border: "1px solid #EEEEEE",
    },

    paymentTitle: {
        display: "block",
        marginBottom: "6px",
        color: "#777777",
        fontSize: "9px",
        letterSpacing: "1.2px",
        fontWeight: 700,
    },

    paymentText: {
        margin: 0,
        color: "#888888",
        fontSize: "10px",
        lineHeight: 1.6,
    },

    primaryButton: {
        width: "100%",
        marginTop: "22px",
        minHeight: "45px",
        padding: "0 18px",
        border: "none",
        borderRadius: "24px",
        backgroundColor: "#111111",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: 600,
    },

    emptyItems: {
        padding: "55px 20px",
        textAlign: "center",
        color: "#888888",
    },

    emptyIcon: {
        fontSize: "42px",
        color: "#AAAAAA",
    },

    centerState: {
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        padding: "40px",
        backgroundColor: "#FAFAFA",
    },

    stateText: {
        margin: 0,
        color: "#777777",
        fontSize: "13px",
    },

    loadingSpinner: {
        width: "25px",
        height: "25px",
        border: "3px solid #EEEEEE",
        borderTop: "3px solid #111111",
        borderRadius: "50%",
    },

    errorCard: {
        width: "100%",
        maxWidth: "420px",
        textAlign: "center",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E8E8",
        borderRadius: "18px",
        padding: "40px",
    },

    errorIconCircle: {
        width: "60px",
        height: "60px",
        margin: "0 auto 18px",
        borderRadius: "50%",
        backgroundColor: "#F3F3F3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    errorIcon: {
        color: "#888888",
    },

    errorEyebrow: {
        display: "block",
        marginBottom: "7px",
        color: "#999999",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.5px",
    },

    errorTitle: {
        margin: 0,
        color: "#222222",
        fontSize: "20px",
    },
};


export default OrderDetails;