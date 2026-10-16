import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Rating,
    TextField,
    Typography,
} from "@mui/material";

import api from "../services/api";


export default function ProductReviews({ productId }) {

    const [reviews, setReviews] = useState([]);

    const [reviewCount, setReviewCount] = useState(0);

    const [loading, setLoading] = useState(true);

    const [reviewOpen, setReviewOpen] =
        useState(false);

    const [rating, setRating] = useState(5);

    const [comment, setComment] =
        useState("");

    const [error, setError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    // =================================================
    // LOAD REVIEWS
    // =================================================

    const fetchReviews = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                `/orders/products/${productId}/reviews/`,
                {
                    skipAuth: true,
                }
            );

            setReviews(
                response.data.results || []
            );

            setReviewCount(
                response.data.count || 0
            );

        } catch (error) {

            console.error(
                "Failed to load reviews:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        if (productId) {
            fetchReviews();
        }

    }, [productId]);


    // =================================================
    // AVERAGE RATING
    // =================================================

    const averageRating =
        reviews.length > 0
            ? reviews.reduce(
                  (sum, review) =>
                      sum + Number(review.rating),
                  0
              ) / reviews.length
            : 0;


    // =================================================
    // OPEN REVIEW
    // =================================================

    const handleOpenReview = () => {

        setError("");

        setRating(5);

        setComment("");

        setReviewOpen(true);
    };


    // =================================================
    // CLOSE REVIEW
    // =================================================

    const handleCloseReview = () => {

        if (submitting) {
            return;
        }

        setReviewOpen(false);
    };


    // =================================================
    // SUBMIT REVIEW
    // =================================================

    const handleSubmitReview = async () => {

        if (!comment.trim()) {

            setError(
                "Please write a review."
            );

            return;
        }

        try {

            setSubmitting(true);

            setError("");

            await api.post(
                `/orders/products/${productId}/review/`,
                {
                    rating,
                    comment: comment.trim(),
                }
            );

            setReviewOpen(false);

            setRating(5);

            setComment("");

            await fetchReviews();

        } catch (error) {

            setError(
                error.response?.data?.error ||
                "Unable to submit review."
            );

        } finally {

            setSubmitting(false);

        }
    };


    return (
        <Box
            sx={{
                mt: 8,
                px: {
                    xs: 2,
                    md: 4,
                },
            }}
        >

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: {
                        xs: "flex-start",
                        md: "center",
                    },
                    flexDirection: {
                        xs: "column",
                        md: "row",
                    },
                    gap: 2,
                    mb: 4,
                }}
            >

                <Box>

                    <Typography
                        sx={{
                            fontSize: 26,
                            fontWeight: 800,
                        }}
                    >
                        Rating & Reviews
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                        }}
                    >

                        <Rating
                            value={averageRating}
                            precision={0.5}
                            readOnly
                            size="small"
                        />

                        <Typography
                            sx={{
                                color: "#777",
                                fontSize: 14,
                            }}
                        >
                            {averageRating
                                ? averageRating.toFixed(1)
                                : "0.0"}{" "}
                            ({reviewCount})
                        </Typography>

                    </Box>

                </Box>


                <Button
                    variant="contained"
                    onClick={handleOpenReview}
                    sx={{
                        backgroundColor: "#000",
                        color: "#fff",
                        borderRadius: 20,
                        px: 3,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                            backgroundColor: "#222",
                        },
                    }}
                >
                    Write a Review
                </Button>

            </Box>


            {/* ================================================= */}
            {/* REVIEWS */}
            {/* ================================================= */}

            {loading ? (

                <Typography
                    sx={{
                        color: "#777",
                    }}
                >
                    Loading reviews...
                </Typography>

            ) : reviews.length === 0 ? (

                <Box
                    sx={{
                        border: "1px solid #e5e5e5",
                        borderRadius: 2,
                        p: 4,
                        textAlign: "center",
                    }}
                >

                    <Typography
                        sx={{
                            fontWeight: 600,
                        }}
                    >
                        No reviews yet
                    </Typography>

                    <Typography
                        sx={{
                            color: "#777",
                            mt: 1,
                        }}
                    >
                        Be the first to review this product.
                    </Typography>

                </Box>

            ) : (

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "1fr 1fr",
                        },
                        gap: 2,
                    }}
                >

                    {reviews.map((review) => (

                        <Box
                            key={review.id}
                            sx={{
                                border: "1px solid #e5e5e5",
                                borderRadius: 2,
                                p: 2.5,
                            }}
                        >

                            <Rating
                                value={Number(
                                    review.rating
                                )}
                                readOnly
                                size="small"
                            />


                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 1,
                                }}
                            >

                                <Typography
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: 14,
                                    }}
                                >
                                    {review.user_name}
                                </Typography>


                                {review.is_verified && (

                                    <Box
                                        sx={{
                                            width: 16,
                                            height: 16,
                                            borderRadius:
                                                "50%",
                                            backgroundColor:
                                                "#16a34a",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            fontSize: 10,
                                        }}
                                    >
                                        ✓
                                    </Box>

                                )}

                            </Box>


                            <Typography
                                sx={{
                                    mt: 1.5,
                                    color: "#555",
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                }}
                            >
                                "{review.comment}"
                            </Typography>


                            <Typography
                                sx={{
                                    mt: 2,
                                    color: "#999",
                                    fontSize: 11,
                                }}
                            >
                                Posted on{" "}
                                {new Date(
                                    review.created_at
                                ).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    }
                                )}
                            </Typography>

                        </Box>

                    ))}

                </Box>

            )}


            {/* ================================================= */}
            {/* WRITE REVIEW DIALOG */}
            {/* ================================================= */}

            <Dialog
                open={reviewOpen}
                onClose={handleCloseReview}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle
                    sx={{
                        fontWeight: 700,
                    }}
                >
                    Write a Review
                </DialogTitle>


                <DialogContent>

                    <Typography
                        sx={{
                            mb: 1,
                            fontSize: 14,
                            fontWeight: 600,
                        }}
                    >
                        Your Rating
                    </Typography>


                    <Rating
                        value={rating}
                        onChange={(
                            event,
                            newValue
                        ) => {

                            if (newValue) {
                                setRating(newValue);
                            }

                        }}
                        size="large"
                    />


                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Your review"
                        placeholder="Tell us what you think about this product..."
                        value={comment}
                        onChange={(event) =>
                            setComment(
                                event.target.value
                            )
                        }
                        error={Boolean(error)}
                        helperText={error}
                        sx={{
                            mt: 3,
                        }}
                    />

                </DialogContent>


                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                    }}
                >

                    <Button
                        onClick={handleCloseReview}
                        disabled={submitting}
                        sx={{
                            color: "#555",
                        }}
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        sx={{
                            backgroundColor: "#000",
                            borderRadius: 20,
                            px: 3,
                            "&:hover": {
                                backgroundColor: "#222",
                            },
                        }}
                    >
                        {submitting
                            ? "Submitting..."
                            : "Submit Review"}
                    </Button>

                </DialogActions>

            </Dialog>

        </Box>
    );
}