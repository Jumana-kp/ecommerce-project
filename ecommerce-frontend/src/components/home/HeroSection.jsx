import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import heroImage from "../../assets/images/hero-img.PNG";

function HeroSection() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                backgroundColor: "#f2f0f1",
                overflow: "hidden",
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
                        minHeight: { xs: "auto", md: "600px" },
                        display: "flex",
                        /* phone/tablet: text on top, image below */
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: { xs: "stretch", md: "center" },
                        position: "relative",
                    }}
                >
                    {/* HERO CONTENT */}

                    <Box
                        sx={{
                            width: { xs: "100%", md: "52%" },
                            position: "relative",
                            zIndex: 2,
                            pt: { xs: 4, sm: 5, md: 0 },
                        }}
                    >
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: {
                                    xs: "36px",
                                    sm: "54px",
                                    md: "64px",
                                },
                                lineHeight: { xs: 1, md: 0.95 },
                                letterSpacing: {
                                    xs: "-1px",
                                    md: "-3px",
                                },
                                fontWeight: 900,
                                maxWidth: "650px",
                                mb: { xs: 2, md: 3 },
                            }}
                        >
                            FIND CLOTHES THAT MATCHES YOUR STYLE
                        </Typography>

                        <Typography
                            sx={{
                                color: "#666",
                                fontSize: { xs: "14px", md: "16px" },
                                lineHeight: 1.6,
                                maxWidth: "550px",
                                mb: { xs: 3, md: 4 },
                            }}
                        >
                            Browse through our diverse range of meticulously
                            crafted garments, designed to bring out your
                            individuality and cater to your sense of style.
                        </Typography>

                        {/* SHOP NOW */}

                        <Button
                            variant="contained"
                            disableElevation
                            onClick={() => navigate("/products")}
                            sx={{
                                backgroundColor: "#000",
                                color: "#fff",
                                borderRadius: "999px",
                                textTransform: "none",
                                fontSize: "16px",
                                fontWeight: 500,
                                px: 5,
                                py: 1.7,
                                width: { xs: "100%", sm: "auto" },
                                minWidth: { sm: "190px" },
                                "&:hover": { backgroundColor: "#222" },
                            }}
                        >
                            Shop Now
                        </Button>

                        {/* STATISTICS
                            phone: 2 on top, 1 centered below
                            desktop: 3 in a row with dividers */}

                        <Box
                            sx={{
                                display: { xs: "grid", md: "flex" },
                                gridTemplateColumns: "1fr 1fr",
                                rowGap: 2,
                                mt: { xs: 3, md: 6 },
                            }}
                        >
                            <HeroStat
                                index={0}
                                value="200+"
                                label="International Brands"
                            />

                            <HeroStat
                                index={1}
                                value="2,000+"
                                label="High-Quality Products"
                            />

                            <HeroStat
                                index={2}
                                value="30,000+"
                                label="Happy Customers"
                            />
                        </Box>
                    </Box>

                    {/* HERO IMAGE */}

                    <Box
                        sx={{
                            position: { xs: "relative", md: "absolute" },
                            width: { xs: "auto", md: "55%" },
                            height: {
                                xs: "360px",
                                sm: "480px",
                                md: "620px",
                            },
                            /* phone/tablet: full width, edge to edge */
                            mx: { xs: -2, sm: -3, md: 0 },
                            right: { md: "-20px" },
                            bottom: 0,
                            mt: { xs: 4, md: 0 },
                            backgroundColor: "#f2f0f1",
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            component="img"
                            src={heroImage}
                            alt="Fashion collection"
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center top",
                                display: "block",
                            }}
                        />
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

function HeroStat({ value, label, index }) {
    return (
        <Box
            sx={{
                /* third stat sits centered under the other two on phones */
                gridColumn: { xs: index === 2 ? "1 / -1" : "auto", md: "auto" },
                textAlign: { xs: "center", md: "left" },

                /* divider lines */
                borderLeft: {
                    xs: index === 1 ? "1px solid #d9d9d9" : "none",
                    md: index > 0 ? "1px solid #d9d9d9" : "none",
                },
                pl: { md: index > 0 ? 4 : 0 },
                pr: { md: index < 2 ? 4 : 0 },
            }}
        >
            <Typography
                sx={{
                    fontSize: { xs: "24px", md: "32px" },
                    fontWeight: 700,
                    lineHeight: 1,
                    mb: 1,
                }}
            >
                {value}
            </Typography>

            <Typography
                sx={{
                    color: "#666",
                    fontSize: { xs: "12px", md: "14px" },
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}

export default HeroSection;
