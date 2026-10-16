import { Box, Container, Divider, IconButton, Typography } from "@mui/material";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";

const footerColumns = [
    {
        title: "COMPANY",
        links: ["About", "Features", "Works", "Career"],
    },
    {
        title: "HELP",
        links: [
            "Customer Support",
            "Delivery Details",
            "Terms & Conditions",
            "Privacy Policy",
        ],
    },
    {
        title: "FAQ",
        links: ["Account", "Manage Deliveries", "Orders", "Payments"],
    },
    {
        title: "RESOURCES",
        links: [
            "Free eBooks",
            "Development Tutorial",
            "How-to - Blog",
            "Youtube Playlist",
        ],
    },
];

function Footer({ newsletter }) {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: "#f0f0f0",
                mt: { xs: 7, md: 8 },
                pt: { xs: 0, md: 0 },
                pb: { xs: 3, md: 2 },
            }}
        >
            {/* Newsletter */}
            <Box
                sx={{
                    position: "relative",
                    top: { xs: "-35px", md: "-55px" },
                    mb: { xs: "-35px", md: "-55px" },
                    zIndex: 2,
                }}
            >
                {newsletter}
            </Box>

            <Container
                maxWidth={false}
                sx={{
                    maxWidth: "1240px",
                    mx: "auto",
                    px: { xs: 2, sm: 3, md: 4 },
                    pt: { xs: 6, md: 7 },
                }}
            >
                {/* Main Footer */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr 1fr",
                            sm: "1.5fr 1fr 1fr 1fr 1fr",
                        },
                        columnGap: { xs: 4, md: 7 },
                        rowGap: { xs: 5, md: 0 },
                    }}
                >
                    {/* SHOP.CO */}
                    <Box
                        sx={{
                            gridColumn: {
                                xs: "1 / -1",
                                sm: "auto",
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: "27px", md: "25px" },
                                fontWeight: 900,
                                letterSpacing: "-1.5px",
                                mb: 2,
                            }}
                        >
                            SHOP.CO
                        </Typography>

                        <Typography
                            sx={{
                                color: "#666",
                                fontSize: "12px",
                                lineHeight: 1.6,
                                maxWidth: "220px",
                                mb: 2.5,
                            }}
                        >
                            We have clothes that suits your style and which
                            you're proud to wear. From women to men.
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <SocialButton>
                                <TwitterIcon sx={{ fontSize: 14 }} />
                            </SocialButton>

                            <SocialButton>
                                <FacebookIcon sx={{ fontSize: 14 }} />
                            </SocialButton>

                            <SocialButton>
                                <InstagramIcon sx={{ fontSize: 14 }} />
                            </SocialButton>

                            <SocialButton>
                                <GitHubIcon sx={{ fontSize: 14 }} />
                            </SocialButton>
                        </Box>
                    </Box>

                    {/* Footer Columns */}
                    {footerColumns.map((column) => (
                        <Box key={column.title}>
                            <Typography
                                sx={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    letterSpacing: "2px",
                                    mb: 2.2,
                                }}
                            >
                                {column.title}
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1.3,
                                }}
                            >
                                {column.links.map((link) => (
                                    <Typography
                                        key={link}
                                        component="a"
                                        href="#"
                                        sx={{
                                            color: "#666",
                                            fontSize: "11px",
                                            textDecoration: "none",
                                            width: "fit-content",
                                            "&:hover": {
                                                color: "#000",
                                            },
                                        }}
                                    >
                                        {link}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>

                <Divider
                    sx={{
                        mt: { xs: 5, md: 4 },
                        mb: 2,
                        borderColor: "#ddd",
                    }}
                />

                {/* Bottom Footer */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                    }}
                >
                    <Typography
                        sx={{
                            color: "#666",
                            fontSize: "10px",
                            textAlign: { xs: "center", sm: "left" },
                        }}
                    >
                        Shop.co © 2000-2023, All Rights Reserved
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.7,
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        <PaymentBox>VISA</PaymentBox>
                        <PaymentBox>●●</PaymentBox>
                        <PaymentBox>PayPal</PaymentBox>
                        <PaymentBox>Pay</PaymentBox>
                        <PaymentBox>G Pay</PaymentBox>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

function SocialButton({ children }) {
    return (
        <IconButton
            size="small"
            sx={{
                width: 26,
                height: 26,
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                color: "#000",
                "&:hover": {
                    backgroundColor: "#000",
                    color: "#fff",
                },
            }}
        >
            {children}
        </IconButton>
    );
}

function PaymentBox({ children }) {
    return (
        <Box
            sx={{
                minWidth: "40px",
                height: "22px",
                px: 0.7,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "7px",
                fontWeight: 700,
                color: "#333",
            }}
        >
            {children}
        </Box>
    );
}

export default Footer;