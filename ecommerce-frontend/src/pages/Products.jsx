import { useEffect, useMemo, useState } from "react";

import {
    Box,
    Button,
    CircularProgress,
    Collapse,
    Container,
    Divider,
    Drawer,
    FormControl,
    IconButton,
    MenuItem,
    Pagination,
    PaginationItem,
    Rating,
    Select,
    Slider,
    Typography,
} from "@mui/material";

import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../services/api";

const PRODUCTS_PER_PAGE = 10;

const colors = [
    { name: "Green", hex: "#00C12B" },
    { name: "Red", hex: "#F50606" },
    { name: "Yellow", hex: "#F5DD00" },
    { name: "Orange", hex: "#F57900" },
    { name: "Cyan", hex: "#06CAF5" },
    { name: "Blue", hex: "#063AF5" },
    { name: "Purple", hex: "#7D06F5" },
    { name: "Pink", hex: "#F506A4" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Black", hex: "#000000" },
];

const sizes = [
    "XX-Small",
    "X-Small",
    "Small",
    "Medium",
    "Large",
    "X-Large",
    "XX-Large",
    "3X-Large",
    "4X-Large",
];

const sortOptions = [
    { label: "Most Popular", ordering: "-rating" },
    { label: "Newest", ordering: "-created_at" },
    { label: "Price: Low to High", ordering: "price" },
    { label: "Price: High to Low", ordering: "-price" },
];

/*
 * Read the category of a product type safely, whatever shape the
 * backend sends: category: 1, category_id: 1, or category: { id, name }
 */

const getTypeCategoryId = (pt) => {
    const c = pt.category ?? pt.category_id;

    if (c && typeof c === "object") return String(c.id ?? "");

    return c === null || c === undefined ? "" : String(c);
};

const getTypeCategoryName = (pt) => {
    if (pt.category_name) return pt.category_name;

    if (pt.category && typeof pt.category === "object") {
        return pt.category.name || "";
    }

    return "";
};

/*
 * Load EVERY page of a list endpoint.
 *
 * Django REST Framework paginates lists (usually 10 per page).
 * Reading only the first page meant product types of later categories
 * (Party, Gym ...) were never loaded. This follows "next" until done.
 */

const fetchAllPages = async (path) => {
    let all = [];
    let page = 1;

    while (page <= 50) {
        const response = await api.get(path, {
            params: { page },
            skipAuth: true,
        });

        const data = response.data;
        const list = data?.results || data;

        if (!Array.isArray(list)) return null;

        all = all.concat(list);

        /* not paginated, or last page reached */
        if (!data?.next) break;

        page += 1;
    }

    return all;
};

/*
 * Try several possible URLs until one works.
 * Your Django urls.py decides the real path, so we try the common ones.
 */

const fetchFirstWorking = async (paths) => {
    const tried = [];

    for (const path of paths) {
        try {
            const list = await fetchAllPages(path);

            if (Array.isArray(list)) {
                return { list, path, error: "" };
            }

            tried.push(`${path} (not a list)`);
        } catch (error) {
            tried.push(`${path} (${error?.response?.status || "no response"})`);
        }
    }

    const message = `Tried: ${tried.join(", ")}`;

    console.error("Could not load data.", message);

    return { list: null, path: "", error: message };
};

/*
 * Your products urls.py is mounted under /products/, and the product list
 * itself lives at "" (which is why the products call is "/products/").
 * So the other routes are:
 *   /products/categories/
 *   /products/product-types/
 */

const PRODUCT_TYPE_URLS = ["/products/product-types/"];

const CATEGORY_URLS = ["/products/categories/"];

/*
 * COLLAPSIBLE FILTER SECTION (Price, Colors, Size, Dress Style)
 */

function FilterSection({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <>
            <Box
                onClick={() => setOpen((prev) => !prev)}
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    py: 2,
                }}
            >
                <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                    {title}
                </Typography>

                {open ? (
                    <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
                ) : (
                    <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
                )}
            </Box>

            <Collapse in={open}>
                <Box sx={{ pb: 2.5 }}>{children}</Box>
            </Collapse>

            <Divider />
        </>
    );
}

/*
 * A CLICKABLE ROW WITH RIGHT ARROW (product types + dress styles)
 */

function FilterRow({ label, selected, onClick }) {
    return (
        <Box
            onClick={onClick}
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.8,
                cursor: "pointer",
                color: selected ? "#000" : "#666",
                fontWeight: selected ? 600 : 400,
                "&:hover": { color: "#000" },
            }}
        >
            <Typography
                sx={{
                    fontSize: "14px",
                    color: "inherit",
                    fontWeight: "inherit",
                }}
            >
                {label}
            </Typography>

            <ChevronRightIcon sx={{ fontSize: 18 }} />
        </Box>
    );
}

function Products() {
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    /*
     * URL values
     */

    const urlSearch = searchParams.get("search") || "";
    const urlGender = searchParams.get("gender") || "";
    const urlCategory = searchParams.get("category") || "";
    const urlProductType = searchParams.get("product_type") || "";
    const urlColor = searchParams.get("color") || "";
    const urlSize = searchParams.get("size") || "";
    const urlOrdering = searchParams.get("ordering") || "-rating";
    const urlOnSale = searchParams.get("on_sale") === "true";
    const urlBrand = searchParams.get("brand") || "";
    const urlPage = Number(searchParams.get("page")) || 1;
    const urlMinPrice = Number(searchParams.get("min_price")) || 0;
    const urlMaxPrice = Number(searchParams.get("max_price")) || 1000;

    /*
     * Product data
     */

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    /*
     * Product types from backend
     */

    const [productTypes, setProductTypes] = useState([]);
    const [productTypesLoading, setProductTypesLoading] = useState(true);
    const [productTypesError, setProductTypesError] = useState("");

    /*
     * Mobile filter drawer
     */

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    /*
     * Category
     */

    const [selectedCategory, setSelectedCategory] = useState(urlCategory);
    const [appliedCategory, setAppliedCategory] = useState(urlCategory);

    /*
     * Product type
     */

    const [selectedProductType, setSelectedProductType] =
        useState(urlProductType);
    const [appliedProductType, setAppliedProductType] =
        useState(urlProductType);

    /*
     * Color
     */

    const [selectedColor, setSelectedColor] = useState(urlColor);
    const [appliedColor, setAppliedColor] = useState(urlColor);

    /*
     * Size
     */

    const [selectedSize, setSelectedSize] = useState(urlSize);
    const [appliedSize, setAppliedSize] = useState(urlSize);

    /*
     * Categories from backend (Casual, Formal, Party, Gym ...)
     */

    const [backendCategories, setBackendCategories] = useState([]);

    /*
     * Price
     */

    const [priceRange, setPriceRange] = useState([urlMinPrice, urlMaxPrice]);
    const [appliedPriceRange, setAppliedPriceRange] = useState([
        urlMinPrice,
        urlMaxPrice,
    ]);

    /*
     * Sort
     */

    const [selectedSort, setSelectedSort] = useState(() => {
        return (
            sortOptions.find((option) => option.ordering === urlOrdering) ||
            sortOptions[0]
        );
    });

    /*
     * Pagination
     */

    const [page, setPage] = useState(urlPage);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    /*
     * LOAD PRODUCT TYPES FROM BACKEND
     */

    useEffect(() => {
        const fetchProductTypes = async () => {
            setProductTypesLoading(true);

            const result = await fetchFirstWorking(PRODUCT_TYPE_URLS);

            setProductTypes(result.list || []);
            setProductTypesError(result.error);
            setProductTypesLoading(false);
        };

        fetchProductTypes();
    }, []);

    /*
     * LOAD CATEGORIES FROM BACKEND
     */

    useEffect(() => {
        const fetchCategories = async () => {
            const result = await fetchFirstWorking(CATEGORY_URLS);

            setBackendCategories(result.list || []);
        };

        fetchCategories();
    }, []);

    /*
     * CATEGORIES  ->  [{ id: "1", name: "Casual" }, ...]
     *
     * Uses /categories/ from the backend. If that request fails,
     * they are built from the product types instead.
     */

    const categories = useMemo(() => {
        if (backendCategories.length > 0) {
            return backendCategories.map((c) => ({
                id: String(c.id),
                name: c.name,
            }));
        }

        const seen = new Map();

        productTypes.forEach((pt) => {
            const id = getTypeCategoryId(pt);
            const name = getTypeCategoryName(pt);

            if (id && name && !seen.has(id)) {
                seen.set(id, { id, name });
            }
        });

        return Array.from(seen.values());
    }, [backendCategories, productTypes]);

    /*
     * Product types shown in the sidebar.
     *
     * - Category selected (e.g. Casual) -> only its types
     *   (T-shirts, Shorts, Shirts, Hoodie, Jeans)
     * - No category selected -> all types, grouped by category
     */

    const visibleProductTypes = useMemo(() => {
        if (!appliedCategory) return productTypes;

        return productTypes.filter(
            (pt) => getTypeCategoryId(pt) === String(appliedCategory)
        );
    }, [productTypes, appliedCategory]);

    const groupedProductTypes = useMemo(() => {
        const groups = new Map();

        productTypes.forEach((pt) => {
            const name = getTypeCategoryName(pt) || "Other";

            if (!groups.has(name)) groups.set(name, []);

            groups.get(name).push(pt);
        });

        return Array.from(groups.entries()).map(([name, items]) => ({
            name,
            items,
        }));
    }, [productTypes]);

    /*
     * URL -> STATE
     */

    useEffect(() => {
        const category = searchParams.get("category") || "";
        const productType = searchParams.get("product_type") || "";
        const color = searchParams.get("color") || "";
        const size = searchParams.get("size") || "";
        const ordering = searchParams.get("ordering") || "-rating";
        const currentPage = Number(searchParams.get("page")) || 1;
        const minPrice = Number(searchParams.get("min_price")) || 0;
        const maxPrice = Number(searchParams.get("max_price")) || 1000;

        setSelectedCategory(category);
        setAppliedCategory(category);

        setSelectedProductType(productType);
        setAppliedProductType(productType);

        setSelectedColor(color);
        setAppliedColor(color);

        setSelectedSize(size);
        setAppliedSize(size);

        setPage(currentPage);

        setPriceRange([minPrice, maxPrice]);
        setAppliedPriceRange([minPrice, maxPrice]);

        const sort =
            sortOptions.find((option) => option.ordering === ordering) ||
            sortOptions[0];

        setSelectedSort(sort);
    }, [searchParams]);

    /*
     * FETCH PRODUCTS
     */

    useEffect(() => {
        /* if filters/search change while a request is running,
           the old response must NOT overwrite the new results */
        let ignore = false;

        const fetchProducts = async () => {
            setLoading(true);

            try {
                const params = { page: urlPage };

                if (urlSearch) params.search = urlSearch;

                /* Navbar: /products?gender=1  ->  API: /products/?gender=1 */
                if (urlGender) params.gender = urlGender;

                if (selectedSort?.ordering) {
                    params.ordering = selectedSort.ordering;
                }

                if (appliedCategory) params.category = appliedCategory;
                if (appliedProductType) {
                    params.product_type = appliedProductType;
                }
                if (appliedColor) params.color = appliedColor;
                if (appliedSize) params.size = appliedSize;

                if (appliedPriceRange[0] > 0) {
                    params.min_price = appliedPriceRange[0];
                }

                if (appliedPriceRange[1] < 1000) {
                    params.max_price = appliedPriceRange[1];
                }

                if (urlOnSale) params.on_sale = "true";
                if (urlBrand) params.brand = urlBrand;

                const response = await api.get("/products/", {
                    params,
                    skipAuth: true,
                });

                if (ignore) return;

                const data = response.data;
                const productList = data.results || data;

                setProducts(Array.isArray(productList) ? productList : []);

                const count =
                    data.count !== undefined ? data.count : productList.length;

                setTotalProducts(count);

                if (data.count !== undefined) {
                    setTotalPages(
                        Math.max(1, Math.ceil(data.count / PRODUCTS_PER_PAGE))
                    );
                } else {
                    setTotalPages(1);
                }
            } catch (error) {
                if (ignore) return;

                console.error("Failed to fetch products:", error);

                setProducts([]);
                setTotalProducts(0);
                setTotalPages(1);
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        fetchProducts();

        return () => {
            ignore = true;
        };
    }, [
        urlSearch,
        urlGender,
        urlOnSale,
        urlBrand,
        appliedCategory,
        appliedProductType,
        appliedColor,
        appliedSize,
        appliedPriceRange,
        urlPage,
        selectedSort,
    ]);

    /*
     * UPDATE URL
     */

    const updateUrl = (changes = {}) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(changes).forEach(([key, value]) => {
            if (value === "" || value === null || value === undefined) {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });

        setSearchParams(params);
    };

    /*
     * PRODUCT TYPE CLICK
     */

    const handleProductTypeClick = (productTypeId) => {
        const id = String(productTypeId);

        if (selectedProductType === id) {
            setSelectedProductType("");
            return;
        }

        setSelectedProductType(id);
    };

    /*
     * CATEGORY CLICK (Dress Style list)
     */

    const handleCategoryClick = (categoryId) => {
        const id = String(categoryId);

        setSelectedCategory(id);
        setAppliedCategory(id);

        setSelectedProductType("");
        setAppliedProductType("");

        setPage(1);

        updateUrl({
            category: id,
            product_type: null,
            page: null,
        });

        setMobileFiltersOpen(false);
    };

    /*
     * SORT
     */

    const handleSortChange = (event) => {
        const ordering = event.target.value;

        const option =
            sortOptions.find((item) => item.ordering === ordering) ||
            sortOptions[0];

        setSelectedSort(option);
        setPage(1);

        updateUrl({ ordering, page: null });
    };

    /*
     * PRICE
     */

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    /*
     * APPLY FILTER
     */

    const handleApplyFilter = () => {
        setAppliedCategory(selectedCategory);
        setAppliedProductType(selectedProductType);
        setAppliedColor(selectedColor);
        setAppliedSize(selectedSize);
        setAppliedPriceRange(priceRange);
        setPage(1);

        const params = new URLSearchParams(searchParams);

        if (selectedCategory) params.set("category", selectedCategory);
        else params.delete("category");

        if (selectedProductType) {
            params.set("product_type", selectedProductType);
        } else {
            params.delete("product_type");
        }

        if (selectedColor) params.set("color", selectedColor);
        else params.delete("color");

        if (selectedSize) params.set("size", selectedSize);
        else params.delete("size");

        if (priceRange[0] > 0) {
            params.set("min_price", String(priceRange[0]));
        } else {
            params.delete("min_price");
        }

        if (priceRange[1] < 1000) {
            params.set("max_price", String(priceRange[1]));
        } else {
            params.delete("max_price");
        }

        params.delete("page");

        setSearchParams(params);
        setMobileFiltersOpen(false);
    };

    /*
     * CLEAR FILTERS
     *
     * Gender, search, on_sale and brand are intentionally kept.
     */

    const handleClearFilters = () => {
        setSelectedCategory("");
        setAppliedCategory("");

        setSelectedProductType("");
        setAppliedProductType("");

        setSelectedColor("");
        setAppliedColor("");

        setSelectedSize("");
        setAppliedSize("");

        setPriceRange([0, 1000]);
        setAppliedPriceRange([0, 1000]);

        setPage(1);

        const params = new URLSearchParams();

        if (urlSearch) params.set("search", urlSearch);
        if (urlGender) params.set("gender", urlGender);
        if (urlOnSale) params.set("on_sale", "true");
        if (urlBrand) params.set("brand", urlBrand);

        if (selectedSort.ordering !== "-rating") {
            params.set("ordering", selectedSort.ordering);
        }

        setSearchParams(params);
        setMobileFiltersOpen(false);
    };

    /*
     * PAGINATION
     */

    const handlePageChange = (event, newPage) => {
        setPage(newPage);

        updateUrl({ page: newPage > 1 ? newPage : null });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /*
     * CATEGORY NAME
     */

    const getCurrentCategoryName = () => {
        if (urlOnSale) return "On Sale";

        if (urlBrand) return urlBrand;

        if (urlGender) {
            const genderProduct = products.find((item) => item.gender_name);

            if (genderProduct?.gender_name) {
                return genderProduct.gender_name;
            }

            return "Shop";
        }

        if (appliedProductType) {
            const productType = productTypes.find(
                (item) => String(item.id) === String(appliedProductType)
            );

            if (productType) return productType.name;
        }

        if (appliedCategory) {
            const product = products.find(
                (item) => String(item.category) === String(appliedCategory)
            );

            if (product?.category_name) return product.category_name;

            const category = categories.find(
                (item) => item.id === String(appliedCategory)
            );

            if (category?.name) return category.name;
        }

        if (urlSearch) return `Search results for "${urlSearch}"`;

        if (urlOrdering === "-created_at") return "New Arrivals";

        return "All Products";
    };

    /*
     * DISPLAY RANGE
     */

    const firstProductNumber =
        totalProducts === 0 ? 0 : (page - 1) * PRODUCTS_PER_PAGE + 1;

    const lastProductNumber = Math.min(page * PRODUCTS_PER_PAGE, totalProducts);

    /*
     * FILTER SECTIONS (Product types, Price, Colors, Size, Dress Style)
     *
     * Split from the Apply/Clear buttons on purpose: on the mobile
     * drawer these sections scroll, while Apply/Clear stay pinned to
     * the bottom of the screen - that's what was making the mobile
     * drawer feel "mixed up": everything (title, filters, buttons)
     * was one long block, so a tall filter list could push the
     * Apply/Clear buttons off-screen or squash the layout instead of
     * scrolling cleanly underneath a fixed header/footer.
     *
     * Shared by the desktop sidebar and the mobile drawer, so both
     * always stay identical in content.
     */

    const renderFilterSections = () => (
        <>
            {/* PRODUCT TYPES */}
            <Box sx={{ py: 2 }}>
                {productTypesLoading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 1,
                        }}
                    >
                        <CircularProgress size={22} sx={{ color: "#000" }} />
                    </Box>
                ) : productTypes.length === 0 ? (
                    <Typography sx={{ fontSize: "12px", color: "#c00" }}>
                        {productTypesError
                            ? "Could not load types. Check the product types URL (see browser console)."
                            : "No product types found. Add them in the Django admin."}
                    </Typography>
                ) : appliedCategory ? (
                    visibleProductTypes.length === 0 ? (
                        <Typography sx={{ fontSize: "13px", color: "#999" }}>
                            No types in this category
                        </Typography>
                    ) : (
                        visibleProductTypes.map((productType) => (
                            <FilterRow
                                key={productType.id}
                                label={productType.name}
                                selected={
                                    selectedProductType ===
                                    String(productType.id)
                                }
                                onClick={() =>
                                    handleProductTypeClick(productType.id)
                                }
                            />
                        ))
                    )
                ) : (
                    groupedProductTypes.map((group) => (
                        <Box key={group.name} sx={{ mb: 1.5 }}>
                            <Typography
                                sx={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: "#000",
                                    mb: 0.5,
                                }}
                            >
                                {group.name}
                            </Typography>

                            {group.items.map((productType) => (
                                <FilterRow
                                    key={productType.id}
                                    label={productType.name}
                                    selected={
                                        selectedProductType ===
                                        String(productType.id)
                                    }
                                    onClick={() =>
                                        handleProductTypeClick(productType.id)
                                    }
                                />
                            ))}
                        </Box>
                    ))
                )}
            </Box>

            <Divider />

            {/* PRICE */}
            <FilterSection title="Price">
                <Box sx={{ px: 1 }}>
                    <Slider
                        value={priceRange}
                        onChange={handlePriceChange}
                        valueLabelDisplay="off"
                        min={0}
                        max={1000}
                        step={10}
                        disableSwap
                        sx={{
                            color: "#000",
                            height: 4,
                            "& .MuiSlider-thumb": { width: 14, height: 14 },
                            "& .MuiSlider-rail": {
                                backgroundColor: "#e0e0e0",
                                opacity: 1,
                            },
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
                        ${priceRange[0]}
                    </Typography>

                    <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
                        ${priceRange[1]}
                    </Typography>
                </Box>
            </FilterSection>

            {/* COLORS */}
            <FilterSection title="Colors">
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {colors.map((color) => {
                        const isSelected = selectedColor === color.name;

                        return (
                            <Box
                                key={color.name}
                                title={color.name}
                                onClick={() =>
                                    setSelectedColor(
                                        isSelected ? "" : color.name
                                    )
                                }
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    backgroundColor: color.hex,
                                    border: "1px solid",
                                    borderColor:
                                        color.name === "White"
                                            ? "#ddd"
                                            : "transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                }}
                            >
                                {isSelected && (
                                    <CheckIcon
                                        sx={{
                                            fontSize: 18,
                                            color:
                                                color.name === "White"
                                                    ? "#000"
                                                    : "#fff",
                                        }}
                                    />
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </FilterSection>

            {/* SIZE */}
            <FilterSection title="Size">
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {sizes.map((size) => {
                        const isSelected = selectedSize === size;

                        return (
                            <Box
                                key={size}
                                onClick={() =>
                                    setSelectedSize(isSelected ? "" : size)
                                }
                                sx={{
                                    px: 2,
                                    py: 1,
                                    borderRadius: "999px",
                                    backgroundColor: isSelected
                                        ? "#000"
                                        : "#f0f0f0",
                                    color: isSelected ? "#fff" : "#666",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    "&:hover": {
                                        backgroundColor: isSelected
                                            ? "#000"
                                            : "#e6e6e6",
                                    },
                                }}
                            >
                                {size}
                            </Box>
                        );
                    })}
                </Box>
            </FilterSection>

            {/* DRESS STYLE (categories from backend) */}
            <FilterSection title="Dress Style" defaultOpen={false}>
                {categories.length === 0 ? (
                    <Typography sx={{ fontSize: "12px", color: "#c00" }}>
                        Could not load categories. Check the categories URL
                        (see browser console).
                    </Typography>
                ) : (
                    categories.map((category) => (
                        <FilterRow
                            key={category.id}
                            label={category.name}
                            selected={selectedCategory === category.id}
                            onClick={() => handleCategoryClick(category.id)}
                        />
                    ))
                )}
            </FilterSection>
        </>
    );

    const renderFilterActions = () => (
        <>
            <Button
                fullWidth
                variant="contained"
                disableElevation
                onClick={handleApplyFilter}
                sx={{
                    backgroundColor: "#000",
                    color: "#fff",
                    borderRadius: "999px",
                    textTransform: "none",
                    py: 1.4,
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#222" },
                }}
            >
                Apply Filter
            </Button>

            <Button
                fullWidth
                onClick={handleClearFilters}
                sx={{ mt: 1, color: "#000", textTransform: "none" }}
            >
                Clear Filters
            </Button>
        </>
    );

    /*
     * RENDER
     */

    return (
        <Box
            sx={{
                backgroundColor: "#fff",
                minHeight: "100vh",
                py: { xs: 3, md: 5 },
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
                {/* BREADCRUMB */}

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: { xs: 3, md: 4 },
                        flexWrap: "wrap",
                    }}
                >
                    <Typography
                        sx={{
                            color: "#777",
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                        onClick={() => navigate("/")}
                    >
                        Home
                    </Typography>

                    <ChevronRightIcon sx={{ color: "#777", fontSize: 18 }} />

                    <Typography
                        sx={{
                            color: "#000",
                            fontSize: "14px",
                            fontWeight: 500,
                        }}
                    >
                        {getCurrentCategoryName()}
                    </Typography>
                </Box>

                {/* MAIN */}

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "260px minmax(0,1fr)",
                        },
                        gap: { xs: 3, md: 5 },
                    }}
                >
                    {/* DESKTOP SIDEBAR */}

                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <Box
                            sx={{
                                border: "1px solid #e5e5e5",
                                borderRadius: "16px",
                                px: 3,
                                py: 2.5,
                            }}
                        >
                            {/* HEADER */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    pb: 2,
                                }}
                            >
                                <Typography
                                    sx={{ fontSize: "20px", fontWeight: 700 }}
                                >
                                    Filters
                                </Typography>

                                <TuneIcon sx={{ fontSize: 20 }} />
                            </Box>

                            <Divider />

                            {renderFilterSections()}

                            <Box sx={{ pt: 2.5 }}>
                                {renderFilterActions()}
                            </Box>
                        </Box>
                    </Box>

                    {/* PRODUCTS */}

                    <Box>
                        {/* HEADER */}

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                justifyContent: "space-between",
                                alignItems: {
                                    xs: "stretch",
                                    sm: "center",
                                },
                                gap: 2,
                                mb: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        component="h1"
                                        sx={{
                                            fontSize: {
                                                xs: "32px",
                                                md: "40px",
                                            },
                                            fontWeight: 900,
                                            letterSpacing: "-1.5px",
                                            lineHeight: 1,
                                            mb: 1,
                                        }}
                                    >
                                        {getCurrentCategoryName()}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: "#777",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {`Showing ${firstProductNumber}–${lastProductNumber} of ${totalProducts} Products`}
                                    </Typography>
                                </Box>

                                {/* MOBILE FILTER BUTTON */}
                                <IconButton
                                    onClick={() => setMobileFiltersOpen(true)}
                                    aria-label="Open filters"
                                    sx={{
                                        display: { xs: "inline-flex", md: "none" },
                                        backgroundColor: "#f0f0f0",
                                        width: 40,
                                        height: 40,
                                        "&:hover": {
                                            backgroundColor: "#e6e6e6",
                                        },
                                    }}
                                >
                                    <TuneIcon sx={{ fontSize: 20, color: "#000" }} />
                                </IconButton>
                            </Box>

                            {/* SORT */}

                            <FormControl
                                size="small"
                                sx={{
                                    minWidth: { xs: "100%", sm: "190px" },
                                }}
                            >
                                <Select
                                    value={selectedSort.ordering}
                                    onChange={handleSortChange}
                                    IconComponent={KeyboardArrowDownIcon}
                                    sx={{
                                        borderRadius: "999px",
                                        fontSize: "14px",
                                        backgroundColor: "#f5f5f5",
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            border: "none",
                                        },
                                    }}
                                >
                                    {sortOptions.map((option) => (
                                        <MenuItem
                                            key={option.ordering}
                                            value={option.ordering}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* LOADING / EMPTY / GRID */}

                        {loading ? (
                            <Box
                                sx={{
                                    minHeight: "400px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <CircularProgress sx={{ color: "#000" }} />
                            </Box>
                        ) : products.length === 0 ? (
                            <Box
                                sx={{
                                    minHeight: "400px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "20px",
                                        fontWeight: 600,
                                        mb: 1,
                                    }}
                                >
                                    No products found
                                </Typography>

                                <Typography
                                    sx={{ color: "#777", fontSize: "14px" }}
                                >
                                    Try changing your filters or sorting
                                    options.
                                </Typography>

                                <Button
                                    onClick={handleClearFilters}
                                    sx={{
                                        mt: 2,
                                        color: "#000",
                                        textTransform: "none",
                                        fontWeight: 600,
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </Box>
                        ) : (
                            <>
                                {/* PRODUCT GRID */}

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr 1fr",
                                            sm: "repeat(2, 1fr)",
                                            md: "repeat(3, 1fr)",
                                        },
                                        gap: { xs: 2, sm: 2.5, md: 3 },
                                    }}
                                >
                                    {products.map((product) => (
                                        <CategoryProductCard
                                            key={product.id}
                                            product={product}
                                            onClick={() =>
                                                navigate(
                                                    `/products/${product.id}`
                                                )
                                            }
                                        />
                                    ))}
                                </Box>

                                {/* PAGINATION */}

                                {totalPages > 1 && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            mt: { xs: 5, md: 7 },
                                            mb: 2,
                                        }}
                                    >
                                        <Pagination
                                            count={totalPages}
                                            page={page}
                                            onChange={handlePageChange}
                                            shape="rounded"
                                            size="large"
                                            siblingCount={1}
                                            boundaryCount={1}
                                            renderItem={(item) => {
                                                /* Figma shows text labels -
                                                   "‹ Previous" / "Next ›" -
                                                   not just bare arrow icons,
                                                   which is what MUI's default
                                                   previous/next buttons render */
                                                if (item.type === "previous") {
                                                    return (
                                                        <Button
                                                            onClick={item.onClick}
                                                            disabled={item.disabled}
                                                            startIcon={
                                                                <KeyboardArrowLeftIcon
                                                                    sx={{ fontSize: 18 }}
                                                                />
                                                            }
                                                            sx={{
                                                                color: "#000",
                                                                textTransform: "none",
                                                                fontSize: "14px",
                                                                fontWeight: 500,
                                                                minWidth: "auto",
                                                                px: 1,
                                                                mr: { xs: 0.5, sm: 1 },
                                                                "&.Mui-disabled": {
                                                                    color: "#ccc",
                                                                },
                                                            }}
                                                        >
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    display: {
                                                                        xs: "none",
                                                                        sm: "inline",
                                                                    },
                                                                }}
                                                            >
                                                                Previous
                                                            </Box>
                                                        </Button>
                                                    );
                                                }

                                                if (item.type === "next") {
                                                    return (
                                                        <Button
                                                            onClick={item.onClick}
                                                            disabled={item.disabled}
                                                            endIcon={
                                                                <ChevronRightIcon
                                                                    sx={{ fontSize: 18 }}
                                                                />
                                                            }
                                                            sx={{
                                                                color: "#000",
                                                                textTransform: "none",
                                                                fontSize: "14px",
                                                                fontWeight: 500,
                                                                minWidth: "auto",
                                                                px: 1,
                                                                ml: { xs: 0.5, sm: 1 },
                                                                "&.Mui-disabled": {
                                                                    color: "#ccc",
                                                                },
                                                            }}
                                                        >
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    display: {
                                                                        xs: "none",
                                                                        sm: "inline",
                                                                    },
                                                                }}
                                                            >
                                                                Next
                                                            </Box>
                                                        </Button>
                                                    );
                                                }

                                                return <PaginationItem {...item} />;
                                            }}
                                            sx={{
                                                "& .MuiPaginationItem-root": {
                                                    fontSize: "14px",
                                                    minWidth: "40px",
                                                    height: "40px",
                                                    borderRadius: "8px",
                                                },
                                                "& .MuiPaginationItem-root.Mui-selected":
                                                    {
                                                        backgroundColor: "#000",
                                                        color: "#fff",
                                                    },
                                                "& .MuiPaginationItem-root.Mui-selected:hover":
                                                    {
                                                        backgroundColor: "#222",
                                                    },
                                            }}
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Container>

            {/* MOBILE FILTER DRAWER
                Fixed-height bottom sheet laid out as a column:
                  - header (Filters + close) - never scrolls
                  - filter sections - the ONLY part that scrolls
                  - Apply/Clear - pinned to the bottom, always visible
                This is what keeps the drawer matching the Figma
                instead of everything bunching up together. */}

            <Drawer
                anchor="bottom"
                open={mobileFiltersOpen}
                onClose={() => setMobileFiltersOpen(false)}
                sx={{ display: { xs: "block", md: "none" } }}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: "20px",
                        borderTopRightRadius: "20px",
                        height: "88vh",
                        maxHeight: "88vh",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    },
                }}
            >
                {/* DRAWER HEADER - fixed */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexShrink: 0,
                        px: 3,
                        pt: 2.5,
                        pb: 2,
                    }}
                >
                    <Typography sx={{ fontSize: "20px", fontWeight: 700 }}>
                        Filters
                    </Typography>

                    <IconButton
                        onClick={() => setMobileFiltersOpen(false)}
                        aria-label="Close filters"
                        size="small"
                    >
                        <CloseIcon sx={{ fontSize: 22, color: "#000" }} />
                    </IconButton>
                </Box>

                <Divider sx={{ flexShrink: 0 }} />

                {/* SCROLLABLE FILTER SECTIONS */}
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        WebkitOverflowScrolling: "touch",
                        px: 3,
                    }}
                >
                    {renderFilterSections()}
                </Box>

                {/* PINNED APPLY / CLEAR */}
                <Box
                    sx={{
                        flexShrink: 0,
                        borderTop: "1px solid #eee",
                        px: 3,
                        pt: 2,
                        pb: 3,
                        backgroundColor: "#fff",
                    }}
                >
                    {renderFilterActions()}
                </Box>
            </Drawer>
        </Box>
    );
}

/*
 * PRODUCT CARD
 */

function CategoryProductCard({ product, onClick }) {
    const discount =
        product.original_price && product.price
            ? Math.round(
                  ((Number(product.original_price) - Number(product.price)) /
                      Number(product.original_price)) *
                      100
              )
            : product.discount_percentage || 0;

    return (
        <Box onClick={onClick} sx={{ cursor: "pointer", minWidth: 0 }}>
            {/* IMAGE */}

            <Box
                sx={{
                    height: { xs: "220px", sm: "280px", md: "300px" },
                    backgroundColor: "#f0eeef",
                    borderRadius: "12px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                }}
            >
                <Box
                    component="img"
                    src={product.image || "https://placehold.co/600x600"}
                    alt={product.name}
                    sx={{
                        width: "100%",
                        height: "100%",
                        /* contain = whole product always visible, no zoom/crop */
                        objectFit: "contain",
                        objectPosition: "center",
                        /* white image backgrounds blend into the grey box */
                        mixBlendMode: "multiply",
                        display: "block",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "scale(1.03)" },
                    }}
                />
            </Box>

            {/* NAME */}

            <Typography
                sx={{
                    fontSize: { xs: "14px", md: "16px" },
                    fontWeight: 600,
                    lineHeight: 1.3,
                    mb: 0.7,
                }}
            >
                {product.name}
            </Typography>

            {/* RATING */}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    mb: 0.8,
                }}
            >
                <Rating
                    value={Number(product.rating) || 0}
                    precision={0.5}
                    readOnly
                    size="small"
                />

                <Typography sx={{ fontSize: "12px", color: "#555" }}>
                    {product.rating || "0"}/5
                </Typography>
            </Box>

            {/* PRICE */}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                }}
            >
                <Typography
                    sx={{
                        fontSize: { xs: "18px", md: "20px" },
                        fontWeight: 700,
                    }}
                >
                    ${Number(product.price).toFixed(0)}
                </Typography>

                {product.original_price && (
                    <Typography
                        sx={{
                            fontSize: { xs: "16px", md: "18px" },
                            fontWeight: 600,
                            color: "#999",
                            textDecoration: "line-through",
                        }}
                    >
                        ${Number(product.original_price).toFixed(0)}
                    </Typography>
                )}

                {discount > 0 && (
                    <Box
                        sx={{
                            backgroundColor: "#ffe5e5",
                            color: "#ff3333",
                            px: 1,
                            py: 0.4,
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 600,
                        }}
                    >
                        -{discount}%
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Products;
