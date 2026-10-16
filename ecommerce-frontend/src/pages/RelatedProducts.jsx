import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Rating,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import api from "../services/api";


export default function RelatedProducts({
    product,
}) {

    const navigate = useNavigate();

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    // =================================================
    // GET CATEGORY ID
    // =================================================

    const getCategoryId = () => {

        if (!product) {
            return null;
        }

        if (
            typeof product.category ===
            "object" &&
            product.category !== null
        ) {
            return product.category.id;
        }

        return product.category;
    };


    // =================================================
    // LOAD RELATED PRODUCTS
    // =================================================

    useEffect(() => {

        const loadRelatedProducts = async () => {

            if (!product) {
                return;
            }

            try {

                setLoading(true);

                const categoryId =
                    getCategoryId();

                let url =
                    "/products/?page=1";

                if (categoryId) {

                    url +=
                        `&category=${categoryId}`;

                }

                const response =
                    await api.get(
                        url,
                        {
                            skipAuth: true,
                        }
                    );

                const results =
                    response.data.results ||
                    response.data ||
                    [];

                const currentProductId =
                    Number(product.id);


                // Remove current product
                const related =
                    results
                        .filter(
                            (item) =>
                                Number(item.id) !==
                                currentProductId
                        )
                        .slice(0, 4);


                setProducts(related);

            } catch (error) {

                console.error(
                    "Failed to load related products:",
                    error
                );

                setProducts([]);

            } finally {

                setLoading(false);

            }
        };


        loadRelatedProducts();

    }, [product]);


    // =================================================
    // IMAGE
    // =================================================

    const getImage = (item) => {

        if (item.image) {
            return item.image;
        }

        if (
            item.images &&
            item.images.length > 0
        ) {
            return item.images[0].image;
        }

        if (
            item.variants &&
            item.variants.length > 0
        ) {

            const variant =
                item.variants[0];

            if (
                variant.images &&
                variant.images.length > 0
            ) {
                return variant.images[0].image;
            }
        }

        return null;
    };


    // =================================================
    // PRICE
    // =================================================

    const getPrice = (item) => {

        if (
            item.price !== undefined &&
            item.price !== null
        ) {
            return Number(item.price);
        }

        if (
            item.variants &&
            item.variants.length > 0
        ) {

            return Number(
                item.variants[0].effective_price ||
                item.variants[0].price ||
                0
            );
        }

        return 0;
    };


    // =================================================
    // CLICK
    // =================================================

    const handleProductClick = (item) => {

        navigate(
            `/products/${item.id}`
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    if (
        loading ||
        products.length === 0
    ) {
        return null;
    }


    return (
        <Box
            sx={{
                mt: 8,
                px: {
                    xs: 2,
                    md: 4,
                },
                mb: 8,
            }}
        >

            {/* ================================================= */}
            {/* TITLE */}
            {/* ================================================= */}

            <Typography
                sx={{
                    textAlign: "center",
                    fontSize: {
                        xs: 28,
                        md: 34,
                    },
                    fontWeight: 900,
                    letterSpacing: "-1px",
                    mb: 4,
                }}
            >
                YOU MIGHT ALSO LIKE
            </Typography>


            {/* ================================================= */}
            {/* PRODUCTS */}
            {/* ================================================= */}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr 1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(4, 1fr)",
                    },
                    gap: {
                        xs: 1.5,
                        md: 2,
                    },
                }}
            >

                {products.map((item) => {

                    const image =
                        getImage(item);

                    const price =
                        getPrice(item);

                    return (

                        <Card
                            key={item.id}
                            onClick={() =>
                                handleProductClick(
                                    item
                                )
                            }
                            sx={{
                                cursor: "pointer",
                                boxShadow: "none",
                                backgroundColor:
                                    "transparent",
                            }}
                        >

                            {/* IMAGE */}

                            <Box
                                sx={{
                                    height: {
                                        xs: 190,
                                        sm: 230,
                                        md: 270,
                                    },
                                    backgroundColor:
                                        "#f4f4f4",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                }}
                            >

                                {image && (

                                    <CardMedia
                                        component="img"
                                        image={image}
                                        alt={
                                            item.name
                                        }
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit:
                                                "contain",
                                        }}
                                    />

                                )}

                            </Box>


                            {/* DETAILS */}

                            <CardContent
                                sx={{
                                    px: 0,
                                    pt: 1.5,
                                }}
                            >

                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        whiteSpace:
                                            "nowrap",
                                        overflow:
                                            "hidden",
                                        textOverflow:
                                            "ellipsis",
                                    }}
                                >
                                    {item.name}
                                </Typography>


                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        gap: 0.5,
                                        mt: 0.5,
                                    }}
                                >

                                    <Rating
                                        value={Number(
                                            item.rating ||
                                            0
                                        )}
                                        precision={0.5}
                                        readOnly
                                        size="small"
                                    />

                                    {item.rating && (

                                        <Typography
                                            sx={{
                                                fontSize: 11,
                                                color: "#888",
                                            }}
                                        >
                                            {Number(
                                                item.rating
                                            ).toFixed(1)}
                                        </Typography>

                                    )}

                                </Box>


                                <Typography
                                    sx={{
                                        mt: 0.5,
                                        fontWeight: 700,
                                        fontSize: 15,
                                    }}
                                >
                                    AED{" "}
                                    {price.toFixed(
                                        2
                                    )}
                                </Typography>

                            </CardContent>

                        </Card>

                    );

                })}

            </Box>

        </Box>
    );
}