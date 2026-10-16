import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#000000",
        },

        background: {
            default: "#ffffff",
            paper: "#ffffff",
        },

        text: {
            primary: "#000000",
            secondary: "#666666",
        },

        divider: "#e5e5e5",
    },

    typography: {
        fontFamily: "Arial, Helvetica, sans-serif",

        h1: {
            fontWeight: 900,
        },

        h2: {
            fontWeight: 900,
        },

        h3: {
            fontWeight: 700,
        },
    },

    shape: {
        borderRadius: 8,
    },

    components: {
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },

            styleOverrides: {
                root: {
                    textTransform: "none",
                },
            },
        },

        MuiTextField: {
            defaultProps: {
                size: "small",
            },
        },
    },
});

export default theme;