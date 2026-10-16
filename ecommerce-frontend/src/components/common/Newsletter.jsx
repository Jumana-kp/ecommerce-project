import { Box, Button, Container, TextField, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

function Newsletter() {
    return ( 
        <Box
    sx={{
        backgroundColor: "transparent",
        px: { xs: 2, sm: 3, md: 4 },
    }}
>
     
            <Container
                maxWidth={false}
                sx={{
                    maxWidth: "1240px",
                    mx: "auto",
                    p: 0,
                }}
            >
                <Box
                    sx={{
                        backgroundColor: "#000",
                        borderRadius: { xs: "16px", md: "14px" },
                        minHeight: { xs: "auto", md: "140px" },
                        px: { xs: 3, sm: 4, md: 5 },
                        py: { xs: 4, md: 3 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 4,
                        flexDirection: { xs: "column", md: "row" },
                    }}
                >
                    {/* Heading */}
                    <Typography
                        component="h2"
                        sx={{
                            color: "#fff",
                            fontSize: {
                                xs: "28px",
                                sm: "32px",
                                md: "34px",
                            },
                            lineHeight: 1.05,
                            fontWeight: 900,
                            letterSpacing: "-1.5px",
                            maxWidth: { xs: "100%", md: "500px" },
                            textAlign: { xs: "center", md: "left" },
                        }}
                    >
                        STAY UPTO DATE ABOUT
                        <br />
                        OUR LATEST OFFERS
                    </Typography>

                    {/* Subscribe Form */}
                    <Box
                        component="form"
                        onSubmit={(event) => event.preventDefault()}
                        sx={{
                            width: { xs: "100%", sm: "340px", md: "330px" },
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        <TextField
                            fullWidth
                            placeholder="Enter your email address"
                            type="email"
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <EmailOutlinedIcon
                                        sx={{
                                            fontSize: "17px",
                                            color: "#777",
                                            mr: 1,
                                        }}
                                    />
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    backgroundColor: "#fff",
                                    borderRadius: "999px",
                                    height: "40px",
                                    fontSize: "11px",
                                    "& fieldset": {
                                        border: "none",
                                    },
                                },
                                "& .MuiInputBase-input": {
                                    py: 0,
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disableElevation
                            sx={{
                                backgroundColor: "#fff",
                                color: "#000",
                                borderRadius: "999px",
                                height: "40px",
                                fontSize: "11px",
                                fontWeight: 500,
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#f2f2f2",
                                },
                            }}
                        >
                            Subscribe to Newsletter
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default Newsletter;