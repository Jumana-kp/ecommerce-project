import { Box, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import casualImage from "../../assets/images/ca-1.PNG";
import formalImage from "../../assets/images/ca-2.PNG";
import partyImage from "../../assets/images/ca-3.PNG";
import gymImage from "../../assets/images/ca-4.PNG";

const dressStyles = [
    {
        title: "Casual",
        image: casualImage,
        categoryId: 1,
    },
    {
        title: "Formal",
        image: formalImage,
        categoryId: 2,
    },
    {
        title: "Party",
        image: partyImage,
        categoryId: 3,
    },
    {
        title: "Gym",
        image: gymImage,
        categoryId: 4,
    },
];

function DressStyleSection() {
    const navigate = useNavigate();

    const handleStyleClick = (categoryId) => {
        navigate(`/products?category=${categoryId}`);
    };

    return (
        <Box
            sx={{
                backgroundColor: "#fff",
                py: { xs: 5, md: 8 },
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
                <Box
                    sx={{
                        backgroundColor: "#f0f0f0",
                        borderRadius: {
                            xs: "20px",
                            md: "32px",
                        },
                        px: {
                            xs: 2,
                            sm: 4,
                            md: 6,
                        },
                        py: {
                            xs: 4,
                            md: 6,
                        },
                    }}
                >
                    {/* Section Title */}
                    <Typography
                        component="h2"
                        sx={{
                            textAlign: "center",
                            fontSize: {
                                xs: "30px",
                                sm: "38px",
                                md: "48px",
                            },
                            fontWeight: 900,
                            letterSpacing: "-2px",
                            mb: {
                                xs: 3,
                                md: 4,
                            },
                        }}
                    >
                        BROWSE BY DRESS STYLE
                    </Typography>

                    {/* Dress Style Cards */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr",
                            },
                            gap: {
                                xs: 2,
                                md: 3,
                            },
                        }}
                    >
                        {dressStyles.map((style) => (
                            <Box
                                key={style.title}
                                onClick={() =>
                                    handleStyleClick(
                                        style.categoryId
                                    )
                                }
                                sx={{
                                    position: "relative",
                                    height: {
                                        xs: "190px",
                                        sm: "220px",
                                        md: "260px",
                                    },
                                    borderRadius: "18px",
                                    overflow: "hidden",
                                    backgroundColor: "#fff",
                                    cursor: "pointer",
                                }}
                            >
                                {/* Dress Style Image */}
                                <Box
                                    component="img"
                                    src={style.image}
                                    alt={style.title}
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                        transition:
                                            "transform 0.3s ease",
                                        "&:hover": {
                                            transform:
                                                "scale(1.03)",
                                        },
                                    }}
                                />

                                {/* Dress Style Title */}
                                <Typography
                                    component="h3"
                                    sx={{
                                        position: "absolute",
                                        top: {
                                            xs: "18px",
                                            sm: "22px",
                                            md: "24px",
                                        },
                                        left: {
                                            xs: "20px",
                                            sm: "24px",
                                            md: "28px",
                                        },
                                        fontSize: {
                                            xs: "24px",
                                            sm: "28px",
                                            md: "32px",
                                        },
                                        lineHeight: 1.1,
                                        fontWeight: 700,
                                        color: "#000",
                                        zIndex: 2,
                                        pointerEvents: "none",
                                    }}
                                >
                                    {style.title}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default DressStyleSection;