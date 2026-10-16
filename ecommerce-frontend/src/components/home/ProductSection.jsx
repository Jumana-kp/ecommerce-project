import { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import ProductCard from "./ProductCard";

function ProductSection({
    title,
    showViewAll = false,
    showDivider = false,
    ordering = "-created_at",
}) {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get(
                    `/products/?ordering=${ordering}`
                );

                setProducts(response.data.results || response.data);
            } catch (error) {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [ordering]);

    return (
        <Box
            sx={{
                backgroundColor: "#fff",
                pt: { xs: 5, md: 9 },
                pb: showDivider ? 0 : { xs: 5, md: 9 },
            }}
        >
            <Container
                maxWidth={false}
                sx={{
                    maxWidth: "1240px",
                    mx: "auto",
                    px: { xs: 2, sm: 3, md: 4 },
                }}
            >
                <Typography
                    component="h2"
                    sx={{
                        textAlign: "center",
                        fontSize: {
                            xs: "32px",
                            sm: "40px",
                            md: "48px",
                        },
                        fontWeight: 900,
                        letterSpacing: { xs: "-1px", md: "-2px" },
                        mb: { xs: 3, md: 5 },
                    }}
                >
                    {title}
                </Typography>

                {loading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 6,
                        }}
                    >
                        <CircularProgress sx={{ color: "#000" }} />
                    </Box>
                ) : products.length === 0 ? (
                    <Typography
                        sx={{
                            textAlign: "center",
                            color: "#777",
                            py: 5,
                        }}
                    >
                        No products available.
                    </Typography>
                ) : (
                    /* phone/tablet: swipeable row, next card peeks in
                       desktop: 4 equal columns (like Figma) */
                    <Box
                        sx={{
                            display: { xs: "flex", md: "grid" },
                            gridTemplateColumns: { md: "repeat(4, 1fr)" },
                            gap: { xs: 1.5, sm: 2.5, md: 3 },
                            overflowX: { xs: "auto", md: "visible" },
                            scrollSnapType: { xs: "x proximity", md: "none" },
                            pb: { xs: 1.5, md: 0 },

                            "&::-webkit-scrollbar": {
                                display: "none",
                            },
                            scrollbarWidth: "none",
                        }}
                    >
                        {products.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </Box>
                )}

                {showViewAll && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: { xs: 2.5, md: 4 },
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => navigate("/products")}
                            sx={{
                                borderColor: "#ddd",
                                color: "#000",
                                borderRadius: "999px",
                                textTransform: "none",
                                width: { xs: "100%", sm: "auto" },
                                px: 6,
                                py: 1.3,
                                fontSize: "14px",
                                "&:hover": {
                                    borderColor: "#000",
                                    backgroundColor: "#fff",
                                },
                            }}
                        >
                            View All
                        </Button>
                    </Box>
                )}

                {/* thin divider between sections (Figma) */}

                {showDivider && (
                    <Box
                        sx={{
                            mt: { xs: 5, md: 9 },
                            borderBottom: "1px solid #f0f0f0",
                        }}
                    />
                )}
            </Container>
        </Box>
    );
}

export default ProductSection;
