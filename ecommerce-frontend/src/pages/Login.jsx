import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Link,
    useNavigate,
    useLocation,
} from "react-router-dom";

import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
} from "@mui/material";

import {
    login,
    clearAuthError,
} from "../store/slices/authSlice";

import { mergeGuestCart } from "../services/cartService";

const GUEST_CART_KEY = "guest_cart";

function getGuestCart() {
    try {
        const storedCart =
            localStorage.getItem(
                GUEST_CART_KEY
            );

        if (!storedCart) {
            return [];
        }

        const parsedCart =
            JSON.parse(storedCart);

        return Array.isArray(parsedCart)
            ? parsedCart
            : [];
    } catch {
        return [];
    }
}

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, error } = useSelector(
        (state) => state.auth
    );

    const searchParams =
        new URLSearchParams(
            location.search
        );

    const nextPath =
        searchParams.get("next") ||
        location.state?.from ||
        "/";

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [validationError, setValidationError] =
        useState("");

    const [cartMergeError, setCartMergeError] =
        useState("");

    const handleChange = (event) => {
        const { name, value } =
            event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setValidationError("");
        setCartMergeError("");

        dispatch(clearAuthError());
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !formData.email ||
            !formData.password
        ) {
            setValidationError(
                "Email and password are required."
            );
            return;
        }

        setCartMergeError("");

        const result = await dispatch(
            login(formData)
        );

        if (!login.fulfilled.match(result)) {
            return;
        }

        const guestCart = getGuestCart();

        if (guestCart.length > 0) {
            try {
                const mergeItems =
                    guestCart.map((item) => ({
                        product_variant:
                            Number(
                                item.product_variant_id
                            ),
                        selected_size:
                            Number(
                                item.selected_size_id
                            ),
                        quantity:
                            Number(
                                item.quantity || 1
                            ),
                    }));

                await mergeGuestCart(
                    mergeItems
                );

                localStorage.removeItem(
                    GUEST_CART_KEY
                );
            } catch (mergeError) {
                setCartMergeError(
                    mergeError?.response
                        ?.data?.detail ||
                        mergeError?.response
                            ?.data?.message ||
                        "Unable to merge your cart."
                );

                return;
            }
        }

        navigate(nextPath, {
            replace: true,
        });
    };

    const getErrorMessage = () => {
        if (!error) {
            return "";
        }

        if (typeof error === "string") {
            return error;
        }

        if (error.detail) {
            return error.detail;
        }

        if (error.non_field_errors) {
            return error.non_field_errors[0];
        }

        return "Invalid email or password.";
    };

    return (
        <Box
            sx={{
                minHeight:
                    "calc(100vh - 38px)",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: { xs: 5, md: 7 },
            }}
        >
            <Container
                maxWidth="sm"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "440px",
                        backgroundColor: "#fff",
                        borderRadius: "16px",
                        px: {
                            xs: 3,
                            sm: 5,
                        },
                        py: {
                            xs: 4,
                            sm: 5,
                        },
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)",
                    }}
                >
                    <Typography
                        sx={{
                            textAlign: "center",
                            fontSize: "25px",
                            fontWeight: 900,
                            letterSpacing:
                                "-1.5px",
                            mb: 3,
                        }}
                    >
                        SHOP.CO
                    </Typography>

                    <Typography
                        component="h1"
                        sx={{
                            textAlign: "center",
                            fontSize: {
                                xs: "28px",
                                sm: "32px",
                            },
                            fontWeight: 900,
                            letterSpacing:
                                "-1px",
                            mb: 1,
                        }}
                    >
                        Welcome Back
                    </Typography>

                    <Typography
                        sx={{
                            textAlign: "center",
                            color: "#666",
                            fontSize: "13px",
                            mb: 4,
                        }}
                    >
                        Login to continue shopping
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={
                            handleSubmit
                        }
                    >
                        <Box
                            sx={{ mb: 2.5 }}
                        >
                            <Typography
                                component="label"
                                htmlFor="email"
                                sx={{
                                    display:
                                        "block",
                                    fontSize:
                                        "13px",
                                    fontWeight:
                                        600,
                                    mb: 0.8,
                                }}
                            >
                                Email
                            </Typography>

                            <TextField
                                id="email"
                                type="email"
                                name="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter your email"
                                fullWidth
                                size="small"
                                sx={{
                                    "& .MuiOutlinedInput-root":
                                        {
                                            borderRadius:
                                                "8px",
                                            backgroundColor:
                                                "#fafafa",
                                        },
                                }}
                            />
                        </Box>

                        <Box
                            sx={{ mb: 2.5 }}
                        >
                            <Typography
                                component="label"
                                htmlFor="password"
                                sx={{
                                    display:
                                        "block",
                                    fontSize:
                                        "13px",
                                    fontWeight:
                                        600,
                                    mb: 0.8,
                                }}
                            >
                                Password
                            </Typography>

                            <TextField
                                id="password"
                                type="password"
                                name="password"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter your password"
                                fullWidth
                                size="small"
                                sx={{
                                    "& .MuiOutlinedInput-root":
                                        {
                                            borderRadius:
                                                "8px",
                                            backgroundColor:
                                                "#fafafa",
                                        },
                                }}
                            />
                        </Box>

                        {(validationError ||
                            error ||
                            cartMergeError) && (
                            <Typography
                                sx={{
                                    color:
                                        "#d32f2f",
                                    fontSize:
                                        "12px",
                                    mb: 2,
                                }}
                            >
                                {validationError ||
                                    cartMergeError ||
                                    getErrorMessage()}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disableElevation
                            disabled={
                                loading
                            }
                            sx={{
                                height:
                                    "46px",
                                backgroundColor:
                                    "#000",
                                color:
                                    "#fff",
                                borderRadius:
                                    "999px",
                                textTransform:
                                    "none",
                                fontSize:
                                    "14px",
                                fontWeight:
                                    600,
                                "&:hover":
                                    {
                                        backgroundColor:
                                            "#222",
                                    },
                            }}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </Button>
                    </Box>

                    <Typography
                        sx={{
                            textAlign:
                                "center",
                            color: "#666",
                            fontSize:
                                "13px",
                            mt: 3,
                        }}
                    >
                        Don't have an account?{" "}
                        <Box
                            component={
                                Link
                            }
                            to={`/register?next=${encodeURIComponent(
                                nextPath
                            )}`}
                            sx={{
                                color:
                                    "#000",
                                fontWeight:
                                    600,
                                textDecoration:
                                    "underline",
                            }}
                        >
                            Register
                        </Box>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

export default Login;