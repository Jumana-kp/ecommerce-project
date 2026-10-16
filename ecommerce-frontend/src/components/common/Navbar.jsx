import {
    AppBar,
    Badge,
    Box,
    Collapse,
    Divider,
    Drawer,
    IconButton,
    InputBase,
    List,
    ListItemButton,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { logout, logoutLocally } from "../../store/slices/authSlice";

import api from "../../services/api";

function Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const { totalItems } = useSelector((state) => state.cart);

    const [search, setSearch] = useState("");

    const [accountAnchor, setAccountAnchor] = useState(null);
    const [shopAnchor, setShopAnchor] = useState(null);
    const [brandsAnchor, setBrandsAnchor] = useState(null);

    const [genders, setGenders] = useState([]);
    const [brands, setBrands] = useState([]);

    /* MOBILE: hamburger drawer + search bar toggle */
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileShopOpen, setMobileShopOpen] = useState(false);
    const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    /* =====================================================
       USER INITIAL
    ===================================================== */

    const getUserInitial = () => {
        if (user?.first_name?.trim()) {
            return user.first_name.trim().charAt(0).toUpperCase();
        }

        if (user?.email?.trim()) {
            return user.email.trim().charAt(0).toUpperCase();
        }

        return "U";
    };

    const userInitial = getUserInitial();

    /* =====================================================
       FETCH GENDERS + BRANDS FROM BACKEND
    ===================================================== */

    useEffect(() => {
        const fetchGenders = async () => {
            try {
                const response = await api.get("/products/genders/", {
                    skipAuth: true,
                });

                const data = response.data;
                const genderList = data.results || data;

                setGenders(Array.isArray(genderList) ? genderList : []);
            } catch (error) {
                console.error("Failed to fetch genders:", error);
                setGenders([]);
            }
        };

        fetchGenders();
    }, []);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await api.get("/products/brands/", {
                    skipAuth: true,
                });

                const data = response.data;
                const brandList = data.results || data;

                setBrands(Array.isArray(brandList) ? brandList : []);
            } catch (error) {
                console.error("Failed to fetch brands:", error);
                setBrands([]);
            }
        };

        fetchBrands();
    }, []);

    /* =====================================================
       DROPDOWNS (desktop)
    ===================================================== */

    const handleShopOpen = (event) => setShopAnchor(event.currentTarget);
    const handleShopClose = () => setShopAnchor(null);

    const handleBrandsOpen = (event) => setBrandsAnchor(event.currentTarget);
    const handleBrandsClose = () => setBrandsAnchor(null);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    /* =====================================================
       GENDER / BRAND CLICK (desktop + mobile)
    ===================================================== */

    const handleGenderClick = (genderId) => {
        handleShopClose();
        closeMobileMenu();

        navigate(`/products?gender=${genderId}`);
    };

    const handleBrandClick = (brand) => {
        handleBrandsClose();
        closeMobileMenu();

        navigate(`/products?brand=${encodeURIComponent(brand)}`);
    };

    /* =====================================================
       SEARCH
    ===================================================== */

    const handleSearch = (event) => {
        if (event.key === "Enter" && search.trim()) {
            navigate(`/products?search=${encodeURIComponent(search.trim())}`);

            setSearch("");
            setMobileSearchOpen(false);
        }
    };

    /* =====================================================
       CART / ACCOUNT / ORDERS / LOGOUT
    ===================================================== */

    const handleCartClick = () => {
        navigate("/cart");
    };

    const handleAccountClick = (event) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        setAccountAnchor(event.currentTarget);
    };

    const handleAccountClose = () => setAccountAnchor(null);

    const handleOrdersClick = () => {
        handleAccountClose();

        navigate("/orders");
    };

    const handleLogout = async () => {
        handleAccountClose();

        const refreshToken = localStorage.getItem("refresh_token");

        if (refreshToken) {
            const result = await dispatch(logout(refreshToken));

            if (logout.rejected.match(result)) {
                dispatch(logoutLocally());
            }
        } else {
            dispatch(logoutLocally());
        }

        navigate("/");
    };

    /* =====================================================
       SHARED STYLES
    ===================================================== */

    const dropdownPaper = {
        mt: 1.5,
        minWidth: "220px",
        maxHeight: "400px",
        borderRadius: "14px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        border: "1px solid #eee",
    };

    const dropdownItem = {
        fontSize: "14px",
        fontWeight: 500,
        color: "#333",
        py: 1.3,
        "&:hover": {
            color: "#000",
            backgroundColor: "#f7f7f7",
        },
    };

    const drawerText = {
        "& .MuiListItemText-primary": {
            fontSize: "16px",
            fontWeight: 600,
        },
    };

    const drawerSubText = {
        pl: 2,
        "& .MuiListItemText-primary": {
            fontSize: "14px",
            fontWeight: 500,
            color: "#444",
        },
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: "#fff",
                color: "#000",
                borderBottom: "1px solid #f0f0f0",
            }}
        >
            <Toolbar
                sx={{
                    minHeight: { xs: "64px", md: "88px" },
                    maxWidth: "1240px",
                    width: "100%",
                    mx: "auto",
                    px: { xs: 2, md: 3 },
                    gap: { xs: 1, md: 3 },
                }}
            >
                {/* =================================================
                    HAMBURGER (mobile + tablet)
                ================================================= */}

                <IconButton
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open menu"
                    edge="start"
                    sx={{
                        display: { xs: "inline-flex", md: "none" },
                        color: "#000",
                        mr: -0.5,
                    }}
                >
                    <MenuIcon />
                </IconButton>

                {/* LOGO */}

                <Typography
                    component={Link}
                    to="/"
                    sx={{
                        textDecoration: "none",
                        color: "#000",
                        fontSize: { xs: "22px", md: "32px" },
                        fontWeight: 900,
                        letterSpacing: "-1.5px",
                        flexShrink: 0,
                    }}
                >
                    SHOP.CO
                </Typography>

                {/* =================================================
                    DESKTOP NAVIGATION
                ================================================= */}

                <Box
                    component="nav"
                    sx={{
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        gap: 3,
                        ml: 2,
                    }}
                >
                    {/* SHOP */}

                    <Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={handleShopOpen}
                            sx={{
                                ...navLinkStyle,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.3,
                                border: "none",
                                background: "transparent",
                                padding: 0,
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            Shop

                            <KeyboardArrowDownIcon
                                sx={{
                                    fontSize: 18,
                                    transition: "transform 0.2s ease",
                                    transform: Boolean(shopAnchor)
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                }}
                            />
                        </Box>

                        <Menu
                            anchorEl={shopAnchor}
                            open={Boolean(shopAnchor)}
                            onClose={handleShopClose}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                            }}
                            slotProps={{ paper: { sx: dropdownPaper } }}
                        >
                            {genders.length > 0 ? (
                                genders.map((gender) => (
                                    <MenuItem
                                        key={gender.id}
                                        onClick={() =>
                                            handleGenderClick(gender.id)
                                        }
                                        sx={dropdownItem}
                                    >
                                        {gender.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem
                                    disabled
                                    sx={{ fontSize: "13px", color: "#999" }}
                                >
                                    No genders found
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>

                    {/* ON SALE */}

                    <Typography
                        component={Link}
                        to="/products?on_sale=true"
                        sx={navLinkStyle}
                    >
                        On Sale
                    </Typography>

                    {/* NEW ARRIVALS */}

                    <Typography
                        component={Link}
                        to="/products?ordering=-created_at"
                        sx={navLinkStyle}
                    >
                        New Arrivals
                    </Typography>

                    {/* BRANDS */}

                    <Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={handleBrandsOpen}
                            sx={{
                                ...navLinkStyle,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.3,
                                border: "none",
                                background: "transparent",
                                padding: 0,
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            Brands

                            <KeyboardArrowDownIcon
                                sx={{
                                    fontSize: 18,
                                    transition: "transform 0.2s ease",
                                    transform: Boolean(brandsAnchor)
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                }}
                            />
                        </Box>

                        <Menu
                            anchorEl={brandsAnchor}
                            open={Boolean(brandsAnchor)}
                            onClose={handleBrandsClose}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                            }}
                            slotProps={{ paper: { sx: dropdownPaper } }}
                        >
                            {brands.length > 0 ? (
                                brands.map((brand) => (
                                    <MenuItem
                                        key={brand}
                                        onClick={() => handleBrandClick(brand)}
                                        sx={dropdownItem}
                                    >
                                        {brand}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem
                                    disabled
                                    sx={{ fontSize: "13px", color: "#999" }}
                                >
                                    No brands found
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>
                </Box>

                {/* =================================================
                    SEARCH (tablet + desktop)
                ================================================= */}

                <Box
                    sx={{
                        flex: 1,
                        maxWidth: "500px",
                        ml: { xs: 0, md: "auto" },
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "999px",
                        px: 2,
                        height: "46px",
                    }}
                >
                    <SearchIcon sx={{ color: "#777", mr: 1 }} />

                    <InputBase
                        placeholder="Search for products..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={handleSearch}
                        fullWidth
                        sx={{ fontSize: "14px" }}
                    />
                </Box>

                {/* =================================================
                    SEARCH ICON + CART + ACCOUNT
                ================================================= */}

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        ml: { xs: "auto", md: 0 },
                    }}
                >
                    {/* SEARCH ICON (phones only) */}

                    <IconButton
                        onClick={() => setMobileSearchOpen((prev) => !prev)}
                        aria-label="Search"
                        sx={{
                            display: { xs: "inline-flex", sm: "none" },
                            color: "#000",
                        }}
                    >
                        <SearchIcon />
                    </IconButton>

                    {/* CART */}

                    <IconButton
                        onClick={handleCartClick}
                        aria-label="Shopping cart"
                        sx={{ color: "#000" }}
                    >
                        <Badge
                            badgeContent={totalItems > 0 ? totalItems : 0}
                            invisible={totalItems === 0}
                            sx={{
                                "& .MuiBadge-badge": {
                                    backgroundColor: "#000",
                                    color: "#fff",
                                    fontSize: "9px",
                                    minWidth: "16px",
                                    height: "16px",
                                },
                            }}
                        >
                            <ShoppingCartOutlinedIcon sx={{ fontSize: 24 }} />
                        </Badge>
                    </IconButton>

                    {/* ACCOUNT */}

                    <IconButton
                        onClick={handleAccountClick}
                        aria-label="Account"
                        sx={{ color: "#000", p: 0.5 }}
                    >
                        {isAuthenticated ? (
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    backgroundColor: "#000",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                }}
                            >
                                {userInitial}
                            </Box>
                        ) : (
                            <PersonOutlineOutlinedIcon sx={{ fontSize: 25 }} />
                        )}
                    </IconButton>

                    {isAuthenticated && (
                        <Menu
                            anchorEl={accountAnchor}
                            open={Boolean(accountAnchor)}
                            onClose={handleAccountClose}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            slotProps={{
                                paper: {
                                    sx: {
                                        mt: 1,
                                        minWidth: "170px",
                                        borderRadius: "12px",
                                        boxShadow:
                                            "0 8px 25px rgba(0,0,0,0.12)",
                                    },
                                },
                            }}
                        >
                            <MenuItem onClick={handleOrdersClick}>
                                My Orders
                            </MenuItem>

                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    )}
                </Box>
            </Toolbar>

            {/* =================================================
                MOBILE SEARCH BAR (opens from the search icon)
            ================================================= */}

            <Collapse
                in={mobileSearchOpen}
                sx={{ display: { xs: "block", sm: "none" } }}
            >
                <Box sx={{ px: 2, pb: 1.5 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "999px",
                            px: 2,
                            height: "44px",
                        }}
                    >
                        <SearchIcon sx={{ color: "#777", mr: 1 }} />

                        <InputBase
                            placeholder="Search for products..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={handleSearch}
                            fullWidth
                            sx={{ fontSize: "14px" }}
                        />
                    </Box>
                </Box>
            </Collapse>

            {/* =================================================
                MOBILE MENU DRAWER (hamburger)
            ================================================= */}

            <Drawer
                anchor="left"
                open={mobileMenuOpen}
                onClose={closeMobileMenu}
                PaperProps={{ sx: { width: 290 } }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 2,
                        py: 1.5,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "22px",
                            fontWeight: 900,
                            letterSpacing: "-1.5px",
                        }}
                    >
                        SHOP.CO
                    </Typography>

                    <IconButton
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider />

                <List sx={{ py: 1 }}>
                    {/* SHOP */}

                    <ListItemButton
                        onClick={() => setMobileShopOpen((prev) => !prev)}
                    >
                        <ListItemText primary="Shop" sx={drawerText} />

                        {mobileShopOpen ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </ListItemButton>

                    <Collapse in={mobileShopOpen} unmountOnExit>
                        <List disablePadding>
                            {genders.length > 0 ? (
                                genders.map((gender) => (
                                    <ListItemButton
                                        key={gender.id}
                                        onClick={() =>
                                            handleGenderClick(gender.id)
                                        }
                                    >
                                        <ListItemText
                                            primary={gender.name}
                                            sx={drawerSubText}
                                        />
                                    </ListItemButton>
                                ))
                            ) : (
                                <ListItemText
                                    secondary="No genders found"
                                    sx={{ pl: 4, py: 1 }}
                                />
                            )}
                        </List>
                    </Collapse>

                    {/* ON SALE */}

                    <ListItemButton
                        component={Link}
                        to="/products?on_sale=true"
                        onClick={closeMobileMenu}
                    >
                        <ListItemText primary="On Sale" sx={drawerText} />
                    </ListItemButton>

                    {/* NEW ARRIVALS */}

                    <ListItemButton
                        component={Link}
                        to="/products?ordering=-created_at"
                        onClick={closeMobileMenu}
                    >
                        <ListItemText primary="New Arrivals" sx={drawerText} />
                    </ListItemButton>

                    {/* BRANDS */}

                    <ListItemButton
                        onClick={() => setMobileBrandsOpen((prev) => !prev)}
                    >
                        <ListItemText primary="Brands" sx={drawerText} />

                        {mobileBrandsOpen ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </ListItemButton>

                    <Collapse in={mobileBrandsOpen} unmountOnExit>
                        <List disablePadding>
                            {brands.length > 0 ? (
                                brands.map((brand) => (
                                    <ListItemButton
                                        key={brand}
                                        onClick={() => handleBrandClick(brand)}
                                    >
                                        <ListItemText
                                            primary={brand}
                                            sx={drawerSubText}
                                        />
                                    </ListItemButton>
                                ))
                            ) : (
                                <ListItemText
                                    secondary="No brands found"
                                    sx={{ pl: 4, py: 1 }}
                                />
                            )}
                        </List>
                    </Collapse>
                </List>
            </Drawer>
        </AppBar>
    );
}

/* =====================================================
   NAV LINK STYLE
===================================================== */

const navLinkStyle = {
    textDecoration: "none",
    color: "#000",
    fontSize: "14px",
    fontWeight: 500,
    whiteSpace: "nowrap",
    "&:hover": {
        opacity: 0.6,
    },
};

export default Navbar;
