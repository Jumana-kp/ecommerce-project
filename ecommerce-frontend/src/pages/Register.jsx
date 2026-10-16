import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
} from "@mui/material";

import {
    register,
    clearAuthError,
} from "../store/slices/authSlice";

function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, error } = useSelector(
        (state) => state.auth
    );

    const searchParams = new URLSearchParams(
        location.search
    );

    const nextPath =
        searchParams.get("next") || "/";

    const [formData, setFormData] = useState({
        email: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        password: "",
        password_confirm: "",
    });

    const [validationError, setValidationError] =
        useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setValidationError("");
        dispatch(clearAuthError());
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !formData.email ||
            !formData.first_name ||
            !formData.last_name ||
            !formData.password ||
            !formData.password_confirm
        ) {
            setValidationError(
                "Please fill in all required fields."
            );
            return;
        }

        if (
            formData.password !==
            formData.password_confirm
        ) {
            setValidationError(
                "Passwords do not match."
            );
            return;
        }

        const result = await dispatch(
            register(formData)
        );

        if (register.fulfilled.match(result)) {
            navigate(
                `/login?next=${encodeURIComponent(
                    nextPath
                )}`,
                {
                    replace: true,
                }
            );
        }
    };

    const getErrorMessage = () => {
        if (!error) {
            return "";
        }

        if (typeof error === "string") {
            return error;
        }

        if (error.email) {
            return error.email[0];
        }

        if (error.password) {
            return error.password[0];
        }

        if (error.password_confirm) {
            return error.password_confirm[0];
        }

        if (error.detail) {
            return error.detail;
        }

        return "Registration failed. Please check your details.";
    };

    return (
        <Box
            sx={{
                minHeight: "calc(100vh - 38px)",
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
                        maxWidth: "500px",
                        backgroundColor: "#fff",
                        borderRadius: "16px",
                        px: { xs: 3, sm: 5 },
                        py: { xs: 4, sm: 5 },
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)",
                    }}
                >
                    <Typography
                        sx={{
                            textAlign: "center",
                            fontSize: "25px",
                            fontWeight: 900,
                            letterSpacing: "-1.5px",
                            mb: 2,
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
                            letterSpacing: "-1px",
                            mb: 1,
                        }}
                    >
                        Create Account
                    </Typography>

                    <Typography
                        sx={{
                            textAlign: "center",
                            color: "#666",
                            fontSize: "13px",
                            mb: 4,
                        }}
                    >
                        Create an account to start shopping
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "1fr 1fr",
                                },
                                gap: 2,
                                mb: 2.5,
                            }}
                        >
                            <FormField
                                label="First Name"
                                id="first_name"
                                name="first_name"
                                value={
                                    formData.first_name
                                }
                                onChange={handleChange}
                                placeholder="First name"
                            />

                            <FormField
                                label="Last Name"
                                id="last_name"
                                name="last_name"
                                value={
                                    formData.last_name
                                }
                                onChange={handleChange}
                                placeholder="Last name"
                            />
                        </Box>

                        <Box sx={{ mb: 2.5 }}>
                            <FormField
                                label="Email"
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                            />
                        </Box>

                        <Box sx={{ mb: 2.5 }}>
                            <FormField
                                label="Phone Number"
                                id="phone_number"
                                name="phone_number"
                                value={
                                    formData.phone_number
                                }
                                onChange={handleChange}
                                placeholder="Phone number"
                            />
                        </Box>

                        <Box sx={{ mb: 2.5 }}>
                            <FormField
                                label="Password"
                                id="password"
                                type="password"
                                name="password"
                                value={
                                    formData.password
                                }
                                onChange={handleChange}
                                placeholder="Password"
                            />
                        </Box>

                        <Box sx={{ mb: 2.5 }}>
                            <FormField
                                label="Confirm Password"
                                id="password_confirm"
                                type="password"
                                name="password_confirm"
                                value={
                                    formData.password_confirm
                                }
                                onChange={handleChange}
                                placeholder="Confirm password"
                            />
                        </Box>

                        {(validationError || error) && (
                            <Typography
                                sx={{
                                    color: "#d32f2f",
                                    fontSize: "12px",
                                    mb: 2,
                                }}
                            >
                                {validationError ||
                                    getErrorMessage()}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disableElevation
                            disabled={loading}
                            sx={{
                                height: "46px",
                                backgroundColor: "#000",
                                color: "#fff",
                                borderRadius: "999px",
                                textTransform: "none",
                                fontSize: "14px",
                                fontWeight: 600,
                                "&:hover": {
                                    backgroundColor: "#222",
                                },
                            }}
                        >
                            {loading
                                ? "Creating account..."
                                : "Register"}
                        </Button>
                    </Box>

                    <Typography
                        sx={{
                            textAlign: "center",
                            color: "#666",
                            fontSize: "13px",
                            mt: 3,
                        }}
                    >
                        Already have an account?{" "}
                        <Box
                            component={Link}
                            to={`/login?next=${encodeURIComponent(
                                nextPath
                            )}`}
                            sx={{
                                color: "#000",
                                fontWeight: 600,
                                textDecoration:
                                    "underline",
                            }}
                        >
                            Login
                        </Box>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

function FormField({
    label,
    id,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
}) {
    return (
        <>
            <Typography
                component="label"
                htmlFor={id}
                sx={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.8,
                }}
            >
                {label}
            </Typography>

            <TextField
                id={id}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                fullWidth
                size="small"
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#fafafa",
                    },
                }}
            />
        </>
    );
}

export default Register;