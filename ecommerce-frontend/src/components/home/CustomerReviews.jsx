import { Box, Container, IconButton, Rating, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const reviews = [
    {
        name: "Sarah M.",
        rating: 5,
        review: "The quality is amazing and the fit is exactly what I expected. I will definitely shop here again.",
    },
    {
        name: "Alex K.",
        rating: 5,
        review: "I am really happy with my purchase. The clothes look stylish and feel very comfortable.",
    },
    {
        name: "James L.",
        rating: 4.5,
        review: "Great collection and excellent quality. The delivery was also quick and everything arrived perfectly.",
    },
];

function CustomerReviews() {
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
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: { xs: 3, md: 4 },
                    }}
                >
                    <Typography
                        component="h2"
                        sx={{
                            fontSize: {
                                xs: "30px",
                                sm: "38px",
                                md: "48px",
                            },
                            lineHeight: 1,
                            fontWeight: 900,
                            letterSpacing: "-2px",
                        }}
                    >
                        OUR HAPPY CUSTOMERS
                    </Typography>

                    <Box
                        sx={{
                            display: { xs: "none", sm: "flex" },
                            gap: 1,
                        }}
                    >
                        <IconButton
                            aria-label="Previous reviews"
                            sx={{
                                color: "#000",
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>

                        <IconButton
                            aria-label="Next reviews"
                            sx={{
                                color: "#000",
                            }}
                        >
                            <ArrowForwardIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Reviews */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(3, 1fr)",
                        },
                        gap: 2,
                    }}
                >
                    {reviews.map((review) => (
                        <Box
                            key={review.name}
                            sx={{
                                border: "1px solid #e5e5e5",
                                borderRadius: "20px",
                                p: {
                                    xs: 3,
                                    md: 4,
                                },
                                minHeight: {
                                    xs: "190px",
                                    md: "220px",
                                },
                            }}
                        >
                            <Rating
                                value={review.rating}
                                precision={0.5}
                                readOnly
                                size="small"
                                sx={{ mb: 2 }}
                            />

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1.5,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "18px",
                                        fontWeight: 700,
                                    }}
                                >
                                    {review.name}
                                </Typography>

                                <CheckCircleIcon
                                    sx={{
                                        fontSize: 18,
                                        color: "#01AB31",
                                    }}
                                />
                            </Box>

                            <Typography
                                sx={{
                                    color: "#666",
                                    fontSize: {
                                        xs: "14px",
                                        md: "15px",
                                    },
                                    lineHeight: 1.6,
                                }}
                            >
                                "{review.review}"
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}

export default CustomerReviews;