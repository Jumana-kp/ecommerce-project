import { Box, Container, Typography } from "@mui/material";

const brands = ["VERSACE", "ZARA", "GUCCI", "PRADA", "Calvin Klein"];

function BrandStrip() {
    return (
        <Box
            sx={{
                backgroundColor: "#000",
                color: "#fff",
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
                        minHeight: { xs: "auto", md: "120px" },
                        py: { xs: 4, md: 0 },
                        display: "flex",
                        alignItems: "center",

                        /* phone: wraps into 2 centered rows (like Figma)
                           desktop: one row spread across */
                        flexWrap: { xs: "wrap", md: "nowrap" },
                        justifyContent: { xs: "center", md: "space-between" },
                        columnGap: { xs: 4, sm: 6, md: 6 },
                        rowGap: { xs: 2.5, md: 0 },
                    }}
                >
                    {brands.map((brand) => (
                        <Typography
                            key={brand}
                            sx={{
                                fontSize: {
                                    xs: "22px",
                                    sm: "26px",
                                    md: "30px",
                                },
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                letterSpacing: "-1px",
                            }}
                        >
                            {brand}
                        </Typography>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}

export default BrandStrip;
