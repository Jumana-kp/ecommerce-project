import {
    Box,
    Rating,
    Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
    const navigate = useNavigate();

    const discount =
        product.original_price && product.price
            ? Math.round(
                  ((Number(product.original_price) -
                      Number(product.price)) /
                      Number(product.original_price)) *
                      100
              )
            : Number(product.discount_percentage || 0);

    return (
        <Box
            onClick={() =>
                navigate(`/products/${product.id}`)
            }
            sx={{
                /*
                 * SAME CARD SIZE FOR:
                 * - New Arrivals
                 * - Top Selling
                 *
                 * Mobile:
                 * Two cards can fit in the row.
                 *
                 * Desktop:
                 * Parent grid controls the width.
                 */
                width: {
                    xs: "calc((100% - 16px) / 2)",
                    sm: "220px",
                    md: "100%",
                },

                minWidth: {
                    xs: "calc((100% - 16px) / 2)",
                    sm: "220px",
                    md: 0,
                },

                maxWidth: {
                    xs: "none",
                    sm: "220px",
                    md: "none",
                },

                flex: {
                    xs: "0 0 calc((100% - 16px) / 2)",
                    sm: "0 0 220px",
                    md: "1 1 0",
                },

                flexShrink: 0,

                cursor: "pointer",

                overflow: "hidden",
            }}
        >
            {/* =================================================
                PRODUCT IMAGE
            ================================================= */}

            <Box
                sx={{
                    width: "100%",

                    /*
                     * Same image ratio for every product.
                     * This prevents one card from looking
                     * taller/bigger than another.
                     */
                    aspectRatio: "1 / 1",

                    backgroundColor: "#f0eeef",

                    borderRadius: {
                        xs: "10px",
                        sm: "12px",
                    },

                    overflow: "hidden",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    mb: {
                        xs: 1.5,
                        sm: 2,
                    },
                }}
            >
                <Box
                    component="img"
                    src={
                        product.image ||
                        "https://placehold.co/600x600"
                    }
                    alt={product.name || "Product"}
                    sx={{
                        width: "100%",
                        height: "100%",

                        /*
                         * Keep the complete product visible.
                         */
                        objectFit: "contain",
                        objectPosition: "center",

                        /*
                         * White product-image backgrounds
                         * blend into the image container.
                         */
                        mixBlendMode: "multiply",

                        display: "block",

                        transition:
                            "transform 0.3s ease",

                        "&:hover": {
                            transform:
                                "scale(1.03)",
                        },
                    }}
                />
            </Box>

            {/* =================================================
                PRODUCT NAME
            ================================================= */}

            <Typography
                sx={{
                    fontSize: {
                        xs: "13px",
                        sm: "15px",
                        md: "16px",
                    },

                    fontWeight: 600,

                    mb: {
                        xs: 0.6,
                        sm: 0.8,
                    },

                    /*
                     * Prevent long names from making
                     * one card taller than another.
                     */
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",

                    lineHeight: 1.35,

                    minHeight: {
                        xs: "35px",
                        sm: "40px",
                    },
                }}
            >
                {product.name}
            </Typography>

            {/* =================================================
                RATING
            ================================================= */}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: {
                        xs: 0.5,
                        sm: 1,
                    },

                    mb: {
                        xs: 0.6,
                        sm: 0.8,
                    },

                    minHeight: "20px",
                }}
            >
                <Rating
                    value={
                        Number(product.rating) || 0
                    }
                    precision={0.5}
                    readOnly
                    size="small"
                    sx={{
                        fontSize: {
                            xs: "15px",
                            sm: "18px",
                        },
                    }}
                />

                <Typography
                    sx={{
                        fontSize: {
                            xs: "10px",
                            sm: "12px",
                        },

                        color: "#555",

                        whiteSpace: "nowrap",
                    }}
                >
                    {product.rating || "0"}/5
                </Typography>
            </Box>

            {/* =================================================
                PRICE
            ================================================= */}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",

                    gap: {
                        xs: 0.6,
                        sm: 1,
                    },

                    flexWrap: "wrap",

                    minHeight: {
                        xs: "30px",
                        sm: "34px",
                    },
                }}
            >
                {/* SALE PRICE */}

                <Typography
                    sx={{
                        fontSize: {
                            xs: "16px",
                            sm: "18px",
                            md: "20px",
                        },

                        fontWeight: 700,

                        whiteSpace: "nowrap",
                    }}
                >
                    $
                    {Number(
                        product.price || 0
                    ).toFixed(0)}
                </Typography>

                {/* ORIGINAL PRICE */}

                {product.original_price && (
                    <Typography
                        sx={{
                            fontSize: {
                                xs: "12px",
                                sm: "15px",
                                md: "18px",
                            },

                            color: "#999",

                            textDecoration:
                                "line-through",

                            whiteSpace: "nowrap",
                        }}
                    >
                        $
                        {Number(
                            product.original_price
                        ).toFixed(0)}
                    </Typography>
                )}

                {/* DISCOUNT */}

                {discount > 0 && (
                    <Box
                        sx={{
                            backgroundColor:
                                "#ffebeb",

                            color: "#ff3333",

                            borderRadius:
                                "999px",

                            px: {
                                xs: 0.8,
                                sm: 1.2,
                            },

                            py: {
                                xs: 0.25,
                                sm: 0.4,
                            },

                            fontSize: {
                                xs: "9px",
                                sm: "11px",
                            },

                            fontWeight: 600,

                            whiteSpace: "nowrap",
                        }}
                    >
                        -{discount}%
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default ProductCard;