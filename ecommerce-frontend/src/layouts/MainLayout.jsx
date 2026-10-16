import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import PromoBar from "../components/common/PromoBar";
import Navbar from "../components/common/Navbar";
import Newsletter from "../components/common/Newsletter";
import Footer from "../components/common/Footer";

function MainLayout() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#fff",
            }}
        >
            {/* Sticky Header */}
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1100,
                }}
            >
                <PromoBar />
                <Navbar />
            </Box>

            {/* Page Content */}
            <Box component="main">
                <Outlet />
            </Box>

            {/* Newsletter + Footer */}
            <Footer newsletter={<Newsletter />} />
        </Box>
    );
}

export default MainLayout;