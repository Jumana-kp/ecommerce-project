import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";

function PromoBar() {
    const [visible, setVisible] = useState(true);

    if (!visible) {
        return null;
    }

    return (
        <Box
            sx={{
                backgroundColor: "#000",
                color: "#fff",
                minHeight: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                px: 5,
            }}
        >
            <Typography
                sx={{
                    fontSize: {
                        xs: "11px",
                        sm: "12px",
                        md: "14px",
                    },
                    textAlign: "center",
                }}
            >
                Sign up and get 20% off to your first order.{" "}
                <Box
                    component={Link}
                    to="/register"
                    sx={{
                        color: "#fff",
                        fontWeight: 600,
                        textDecoration: "underline",
                    }}
                >
                    Sign Up Now
                </Box>
            </Typography>

            <IconButton
                onClick={() => setVisible(false)}
                aria-label="Close promotion"
                size="small"
                sx={{
                    position: "absolute",
                    right: {
                        xs: 4,
                        md: 20,
                    },
                    color: "#fff",
                    "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                    },
                }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </Box>
    );
}

export default PromoBar;