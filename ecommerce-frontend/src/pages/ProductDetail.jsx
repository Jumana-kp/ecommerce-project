import React, { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";

import {
  Add,
  ArrowBack,
  Check,
  KeyboardArrowDown,
  Remove,
  Tune,
} from "@mui/icons-material";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Rating,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

/* =========================================================
   IMAGE URL
========================================================= */

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (typeof image === "object") {
    image = image.image || image.url || image.src || "";
  }

  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  const baseURL = api?.defaults?.baseURL || "";

  const mediaBase = baseURL.replace(/\/api(?:\/v\d+)?\/?$/, "");

  return `${mediaBase}${image.startsWith("/") ? "" : "/"}${image}`;
};

/* =========================================================
   GUEST CART
========================================================= */

const GUEST_CART_KEY = "guest_cart";

const getAccessToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    null
  );
};

const saveGuestCartItem = ({ product, variant, size, quantity }) => {
  const existingCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");

  const variantId = variant?.id;
  const sizeId = size?.id;

  if (!variantId) {
    throw new Error("Product variant is required.");
  }

  if (!sizeId) {
    throw new Error("Selected size is required.");
  }

  const existingIndex = existingCart.findIndex(
    (item) =>
      Number(item.product_variant_id) === Number(variantId) &&
      Number(item.selected_size_id) === Number(sizeId),
  );

  const variantImage =
    variant?.images?.length > 0
      ? getImageUrl(variant.images[0]?.image || variant.images[0])
      : getImageUrl(product?.image);

  const price =
    variant?.effective_price != null
      ? Number(variant.effective_price)
      : variant?.price != null
        ? Number(variant.price)
        : Number(product?.price || 0);

  if (existingIndex >= 0) {
    const existingItem = existingCart[existingIndex];

    const newQuantity = Number(existingItem.quantity) + Number(quantity);

    existingCart[existingIndex] = {
      ...existingItem,
      quantity: newQuantity,
      subtotal: price * newQuantity,
    };
  } else {
    existingCart.push({
      id: `guest-${variantId}-${sizeId}`,

      product_id: product?.id,

      product_variant_id: variantId,

      product_name: product?.name || "",

      product_image: variantImage,

      color: variant?.color?.name || "",

      size: size?.name || "",

      selected_size_id: sizeId,

      product_price: price,

      quantity: Number(quantity),

      subtotal: price * Number(quantity),
    });
  }

  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(existingCart));
};

/* =========================================================
   TAB PANEL
========================================================= */

function TabPanel({ value, index, children }) {
  if (value !== index) {
    return null;
  }

  return (
    <Box
      role="tabpanel"
      sx={{
        pt: 4,
        pb: 6,
      }}
    >
      {children}
    </Box>
  );
}

/* =========================================================
   FORMAT REVIEW DATE
========================================================= */

const formatReviewDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/* =========================================================
   PRODUCT DETAIL
========================================================= */

export default function ProductDetail() {
  const { id, slug } = useParams();

  const navigate = useNavigate();

  const productIdentifier = id || slug;

  /* =======================================================
       PRODUCT STATE
    ======================================================= */

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =======================================================
       PRODUCT SELECTION
    ======================================================= */

  const [selectedColor, setSelectedColor] = useState(null);

  const [selectedSize, setSelectedSize] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);

  /* =======================================================
       TABS
    ======================================================= */

  const [activeTab, setActiveTab] = useState(0);

  /* =======================================================
       CART
    ======================================================= */

  const [addingToCart, setAddingToCart] = useState(false);

  /* =======================================================
       REVIEWS
       (fetched separately from /orders/products/<id>/reviews/ -
       the product API response does NOT embed reviews, so reading
       product.reviews here always returned an empty array)
    ======================================================= */

  const [reviews, setReviews] = useState([]);

  const [reviewCount, setReviewCount] = useState(0);

  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const [reviewRating, setReviewRating] = useState(0);

  const [reviewComment, setReviewComment] = useState("");

  const [submittingReview, setSubmittingReview] = useState(false);

  const [reviewError, setReviewError] = useState("");

  const [reviewSuccess, setReviewSuccess] = useState("");

  /* =======================================================
       RELATED PRODUCTS
    ======================================================= */

  const [relatedProducts, setRelatedProducts] = useState([]);

  const [relatedLoading, setRelatedLoading] = useState(false);

  /* =======================================================
       FETCH PRODUCT
    ======================================================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await api.get(`/products/${productIdentifier}/`, {
          skipAuth: true,
        });

        setProduct(response.data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (productIdentifier) {
      fetchProduct();
    }
  }, [productIdentifier]);

  /* =======================================================
       FETCH REVIEWS
       Public endpoint - built from OrderItem rows that have
       review_rating set (whether saved via the frontend dialog
       or edited directly in the Django admin).
    ======================================================= */

  const fetchReviews = async () => {
    if (!product?.id) {
      return;
    }

    try {
      setReviewsLoading(true);

      const response = await api.get(
        `/orders/products/${product.id}/reviews/`,
        {
          skipAuth: true,
        },
      );

      setReviews(response.data.results || []);

      setReviewCount(response.data.count || 0);
    } catch (err) {
      console.error("Failed to load reviews:", err);

      setReviews([]);

      setReviewCount(0);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  /* =======================================================
       FETCH RELATED PRODUCTS
    ======================================================= */

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) {
        return;
      }

      try {
        setRelatedLoading(true);

        const response = await api.get("/products/", {
          params: {
            category: product.category,
            page: 1,
          },

          skipAuth: true,
        });

        const data = response.data;

        const products = Array.isArray(data) ? data : data?.results || [];

        const filtered = products
          .filter((item) => Number(item.id) !== Number(product.id))
          .slice(0, 4);

        setRelatedProducts(filtered);
      } catch (err) {
        /* Related products are optional.
                       Do not show an error to user. */

        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  /* =======================================================
       VARIANTS
    ======================================================= */

  const variants = product?.variants || [];

  /* =======================================================
       COLORS
    ======================================================= */

  const colors = useMemo(() => {
    const colorMap = new Map();

    variants.forEach((variant) => {
      if (!variant?.color) {
        return;
      }

      const colorId = variant.color.id ?? variant.color.name;

      if (!colorMap.has(colorId)) {
        colorMap.set(colorId, variant.color);
      }
    });

    return Array.from(colorMap.values());
  }, [variants]);

  /* =======================================================
       INITIAL VARIANT
    ======================================================= */

  useEffect(() => {
    if (!variants.length) {
      setSelectedColor(null);

      setSelectedSize(null);

      setSelectedVariant(null);

      return;
    }

    const firstVariant = variants[0];

    setSelectedColor(firstVariant?.color || null);

    setSelectedSize(firstVariant?.sizes?.[0] || null);

    setSelectedVariant(firstVariant);

    setSelectedImageIndex(0);

    setQuantity(1);
  }, [product, variants]);

  /* =======================================================
       SELECTED COLOR ID
    ======================================================= */

  const selectedColorId = selectedColor?.id ?? selectedColor?.name ?? null;

  /* =======================================================
       COLOR VARIANTS
    ======================================================= */

  const colorVariants = useMemo(() => {
    if (!selectedColorId) {
      return [];
    }

    return variants.filter((variant) => {
      const variantColorId = variant?.color?.id ?? variant?.color?.name;

      return variantColorId === selectedColorId;
    });
  }, [variants, selectedColorId]);

  /* =======================================================
       AVAILABLE SIZES
    ======================================================= */

  const availableSizes = useMemo(() => {
    const sizeMap = new Map();

    colorVariants.forEach((variant) => {
      (variant?.sizes || []).forEach((size) => {
        const sizeId = size?.id ?? size?.name;

        if (sizeId != null && !sizeMap.has(sizeId)) {
          sizeMap.set(sizeId, size);
        }
      });
    });

    return Array.from(sizeMap.values());
  }, [colorVariants]);

  /* =======================================================
       COLOR IMAGES
    ======================================================= */

  const colorImages = useMemo(() => {
    if (!selectedVariant?.images?.length) {
      return [];
    }

    return selectedVariant.images
      .slice()
      .sort(
        (a, b) => Number(a?.display_order ?? 0) - Number(b?.display_order ?? 0),
      )
      .map((item) => ({
        url: getImageUrl(item?.image || item),
      }))
      .filter((item) => item.url);
  }, [selectedVariant]);

  /* =======================================================
       FALLBACK IMAGES
    ======================================================= */

  const allImages = useMemo(() => {
    if (colorImages.length > 0) {
      return colorImages;
    }

    if (product?.image) {
      return [
        {
          url: getImageUrl(product.image),
        },
      ].filter((item) => item.url);
    }

    return [];
  }, [colorImages, product]);

  /* =======================================================
       MAIN IMAGE
    ======================================================= */

  const mainImage =
    allImages[selectedImageIndex]?.url || allImages[0]?.url || "";

  /* =======================================================
       PRICE
    ======================================================= */

  const productPrice = Number(product?.price || 0);

  const variantPrice =
    selectedVariant?.effective_price != null
      ? Number(selectedVariant.effective_price)
      : selectedVariant?.price != null
        ? Number(selectedVariant.price)
        : productPrice;

  const originalPrice = Number(product?.original_price || 0);

  const discountPercentage = Number(product?.discount_percentage || 0);

  /* =======================================================
       STOCK
    ======================================================= */

  const stock = Number(selectedVariant?.stock ?? 0);

  /* =======================================================
       REVIEW DATA (top rating shown near the price)
    ======================================================= */

  const productRating = Number(product?.rating || 0);

  /* =======================================================
       HELPERS
    ======================================================= */

  const getColorName = (color) => {
    if (!color) {
      return "";
    }

    if (typeof color === "string") {
      return color;
    }

    return color.name || color.title || "";
  };

  const getColorHex = (color) => {
    if (!color) {
      return "#E5E5E5";
    }

    if (typeof color === "string") {
      return color;
    }

    return color.hex_code || color.hex || "#E5E5E5";
  };

  const getSizeName = (size) => {
    if (!size) {
      return "";
    }

    if (typeof size === "string") {
      return size;
    }

    return size.name || "";
  };

  /* =======================================================
       COLOR CHANGE
    ======================================================= */

  const handleColorChange = (color) => {
    setError("");

    setSelectedColor(color);

    const colorId = color?.id ?? color?.name;

    const firstVariant = variants.find((variant) => {
      const variantColorId = variant?.color?.id ?? variant?.color?.name;

      return variantColorId === colorId;
    });

    setSelectedVariant(firstVariant || null);

    setSelectedSize(firstVariant?.sizes?.[0] || null);

    setSelectedImageIndex(0);

    setQuantity(1);
  };

  /* =======================================================
       SIZE CHANGE
    ======================================================= */

  const handleSizeChange = (size) => {
    setError("");

    const sizeId = size?.id ?? size?.name;

    const sizeExists = (selectedVariant?.sizes || []).some((variantSize) => {
      const variantSizeId = variantSize?.id ?? variantSize?.name;

      return variantSizeId === sizeId;
    });

    if (!sizeExists) {
      return;
    }

    setSelectedSize(size);

    setQuantity(1);
  };

  /* =======================================================
       QUANTITY
    ======================================================= */

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    if (stock <= 0) {
      return;
    }

    setQuantity((current) => Math.min(stock, current + 1));
  };

  /* =======================================================
       ADD TO CART
    ======================================================= */

  const handleAddToCart = async () => {
    setError("");

    if (!product) {
      return;
    }

    if (variants.length > 0 && !selectedVariant) {
      setError("Please select a color.");

      return;
    }

    if (variants.length > 0 && !selectedVariant?.id) {
      setError("Selected product variant is invalid.");

      return;
    }

    if (!selectedSize?.id) {
      setError("Please select a size.");

      return;
    }

    if (selectedVariant && stock <= 0) {
      setError("This product is out of stock.");

      return;
    }

    if (selectedVariant && quantity > stock) {
      setError("Requested quantity exceeds available stock.");

      return;
    }

    try {
      setAddingToCart(true);

      const accessToken = getAccessToken();

      /* ===============================
                   GUEST
                =============================== */

      if (!accessToken) {
        saveGuestCartItem({
          product,
          variant: selectedVariant,
          size: selectedSize,
          quantity,
        });

        navigate("/cart");

        return;
      }

      /* ===============================
                   LOGGED IN
                =============================== */

      const payload = {
        product_variant: Number(selectedVariant.id),

        selected_size: Number(selectedSize.id),

        quantity: Number(quantity),
      };

      await api.post("/cart/", payload);

      navigate("/cart");
    } catch (err) {
      const data = err?.response?.data;

      setError(data?.error || data?.detail || "Unable to add product to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  /* =======================================================
       WRITE REVIEW CLICK
    ======================================================= */

  const handleWriteReview = () => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      navigate(`/login?next=/products/${productIdentifier}`);

      return;
    }

    setReviewError("");

    setReviewSuccess("");

    setReviewRating(0);

    setReviewComment("");

    setReviewDialogOpen(true);
  };

  /* =======================================================
       SUBMIT REVIEW
    ======================================================= */

  const handleSubmitReview = async () => {
    setReviewError("");

    setReviewSuccess("");

    if (reviewRating < 1) {
      setReviewError("Please select a star rating.");

      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Please write a review.");

      return;
    }

    try {
      setSubmittingReview(true);

      /*
       * Endpoint is under the orders app, matching the /orders/
       * prefix your backend actually exposes for reviews (see
       * ProductReviews.jsx, which already calls this correctly).
       *
       * Backend checks:
       * 1. User has an order containing this product
       *    (delivery status is not required - see views.py note)
       * 2. Item has not already been reviewed
       */

      await api.post(`/orders/products/${product.id}/review/`, {
        rating: Number(reviewRating),

        comment: reviewComment.trim(),
      });

      setReviewSuccess("Your review has been submitted.");

      /*
       * Reload:
       * - reviews list, so the new review appears
       * - product, so the average rating near the price updates
       */

      await fetchReviews();

      const response = await api.get(`/products/${productIdentifier}/`, {
        skipAuth: true,
      });

      setProduct(response.data);

      setTimeout(() => {
        setReviewDialogOpen(false);
      }, 800);
    } catch (err) {
      const data = err?.response?.data;

      setReviewError(
        data?.error ||
          data?.detail ||
          data?.message ||
          "Unable to submit review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  /* =======================================================
       RELATED PRODUCT IMAGE
    ======================================================= */

  const getProductCardImage = (item) => {
    if (item?.image) {
      return getImageUrl(item.image);
    }

    if (item?.variants?.length) {
      const variant = item.variants[0];

      if (variant?.images?.length) {
        return getImageUrl(variant.images[0]?.image || variant.images[0]);
      }
    }

    return "";
  };

  /* =======================================================
       LOADING
    ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* =======================================================
       ERROR
    ======================================================= */

  if (error && !product) {
    return (
      <Box
        sx={{
          maxWidth: 1200,

          mx: "auto",

          px: {
            xs: 2,
            md: 3,
          },

          py: 8,

          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={2}>
          {error}
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{
            borderRadius: 999,

            textTransform: "none",
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  /* =======================================================
       PAGE
    ======================================================= */

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,

          mx: "auto",

          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        {/* =================================================
                    BREADCRUMB
                ================================================= */}

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.8}
          sx={{
            py: 2.5,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => navigate("/")}
          >
            Home
          </Typography>

          <Typography color="text.secondary">›</Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => navigate("/products")}
          >
            Shop
          </Typography>

          {product.gender_name && (
            <>
              <Typography color="text.secondary">›</Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap" }}
              >
                {product.gender_name}
              </Typography>
            </>
          )}

          <Typography color="text.secondary">›</Typography>

          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              whiteSpace: "nowrap",

              overflow: "hidden",

              textOverflow: "ellipsis",
            }}
          >
            {product.product_type_name || product.category_name || product.name}
          </Typography>
        </Stack>

        {/* =================================================
                    PRODUCT AREA
                ================================================= */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",

              md: "minmax(0, 1.15fr) minmax(380px, 0.85fr)",
            },

            gap: {
              xs: 4,
              md: 5,
            },

            pb: 6,
          }}
        >
          {/* =================================================
                        GALLERY
                    ================================================= */}

          <Box
            sx={{
              display: "flex",

              /* phones: main image first, thumbnails in a row below.
                 tablet+: thumbnails column on the left, like Figma */
              flexDirection: { xs: "column", sm: "row" },

              gap: { xs: 1.5, sm: 2 },

              minWidth: 0,
            }}
          >
            {/* THUMBNAILS */}

            <Stack
              direction={{ xs: "row", sm: "column" }}
              spacing={1.5}
              sx={{
                order: { xs: 2, sm: 1 },
                overflowX: { xs: "auto", sm: "visible" },
                flexShrink: 0,
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
            >
              {allImages.map((image, index) => (
                <Box
                  key={`${image.url}-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    width: { xs: "64px", sm: "80px", md: "100px" },

                    aspectRatio: "1 / 1",

                    flexShrink: 0,

                    borderRadius: 2,

                    overflow: "hidden",

                    cursor: "pointer",

                    border: "1px solid",

                    borderColor:
                      selectedImageIndex === index
                        ? "text.primary"
                        : "transparent",

                    bgcolor: "#F0F0F0",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    "&:hover": {
                      borderColor: "text.primary",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    sx={{
                      width: "100%",

                      height: "100%",

                      /* whole product visible, no zoom/crop */
                      objectFit: "contain",
                      objectPosition: "center",

                      /* white image backgrounds blend into the grey box */
                      mixBlendMode: "multiply",

                      display: "block",
                    }}
                  />
                </Box>
              ))}
            </Stack>

            {/* MAIN IMAGE */}

            <Box
              sx={{
                order: { xs: 1, sm: 2 },
                width: "100%",
                minWidth: 0,

                aspectRatio: { xs: "1 / 1", sm: "0.88 / 1" },

                bgcolor: "#F0F0F0",

                borderRadius: {
                  xs: 2,
                  md: 3,
                },

                overflow: "hidden",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              {mainImage ? (
                <Box
                  component="img"
                  src={mainImage}
                  alt={product.name}
                  sx={{
                    width: "100%",

                    height: "100%",

                    /* whole product visible, no zoom/crop */
                    objectFit: "contain",
                    objectPosition: "center",

                    /* white image backgrounds blend into the grey box */
                    mixBlendMode: "multiply",

                    display: "block",
                  }}
                />
              ) : (
                <Typography color="text.secondary">No image</Typography>
              )}
            </Box>
          </Box>

          {/* =================================================
                        PRODUCT INFO
                    ================================================= */}

          <Stack
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: {
                  xs: 28,
                  sm: 32,
                  md: 38,
                },

                lineHeight: 1.1,

                fontWeight: 800,

                letterSpacing: "-0.5px",

                textTransform: "uppercase",

                mb: 1.5,
              }}
            >
              {product.name}
            </Typography>

            {/* RATING */}

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                mb: 2,
              }}
            >
              <Rating
                value={productRating}
                precision={0.5}
                readOnly
                size="small"
              />

              <Typography variant="body2" color="text.secondary">
                {productRating.toFixed(1)}/5
              </Typography>
            </Stack>

            {/* PRICE */}

            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              flexWrap="wrap"
              sx={{
                mb: 2.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: 26,
                    md: 30,
                  },

                  fontWeight: 700,
                }}
              >
                ${variantPrice.toFixed(2)}
              </Typography>

              {originalPrice > variantPrice && (
                <Typography
                  sx={{
                    fontSize: {
                      xs: 24,
                      md: 28,
                    },

                    fontWeight: 600,

                    color: "text.disabled",

                    textDecoration: "line-through",
                  }}
                >
                  ${originalPrice.toFixed(2)}
                </Typography>
              )}

              {discountPercentage > 0 && (
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.6,

                    borderRadius: 999,

                    bgcolor: "rgba(255,51,51,0.10)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,

                      fontWeight: 600,

                      color: "#FF3333",
                    }}
                  >
                    -{discountPercentage}%
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* DESCRIPTION */}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,

                mb: 3,
              }}
            >
              {product.description ||
                "This product is designed with quality materials and a comfortable fit for everyday wear."}
            </Typography>

            <Divider />

            {/* COLORS */}

            {colors.length > 0 && (
              <Box
                sx={{
                  py: 2.5,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,

                    mb: 1.5,
                  }}
                >
                  Select Colors
                </Typography>

                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {colors.map((color) => {
                    const colorId = color.id ?? color.name;

                    const selected = selectedColorId === colorId;

                    const colorHex = getColorHex(color);

                    return (
                      <Box
                        key={colorId}
                        onClick={() => handleColorChange(color)}
                        title={getColorName(color)}
                        sx={{
                          width: 38,

                          height: 38,

                          borderRadius: "50%",

                          bgcolor: colorHex,

                          border: "2px solid",

                          borderColor: selected
                            ? "text.primary"
                            : "transparent",

                          boxShadow: selected
                            ? "0 0 0 3px rgba(0,0,0,0.9)"
                            : "none",

                          cursor: "pointer",

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",
                        }}
                      >
                        {selected && (
                          <Check
                            sx={{
                              fontSize: 19,

                              color:
                                colorHex.toLowerCase() === "#ffffff" ||
                                colorHex.toLowerCase() === "#fff"
                                  ? "#000"
                                  : "#fff",
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

            <Divider />

            {/* SIZE */}

            <Box
              sx={{
                py: 2.5,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 500,

                  mb: 1.5,
                }}
              >
                Choose Size
              </Typography>

              {availableSizes.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {availableSizes.map((size) => {
                    const sizeId = size?.id ?? size?.name;

                    const selected =
                      (selectedSize?.id ??
                        selectedSize?.name ??
                        selectedSize) === sizeId;

                    return (
                      <Button
                        key={sizeId}
                        onClick={() => handleSizeChange(size)}
                        variant="text"
                        sx={{
                          minWidth: {
                            xs: 64,
                            sm: 76,
                          },

                          height: 44,

                          px: 2,

                          borderRadius: 999,

                          textTransform: "none",

                          fontWeight: 500,

                          color: selected ? "#fff" : "text.secondary",

                          bgcolor: selected ? "text.primary" : "grey.100",
                        }}
                      >
                        {getSizeName(size)}
                      </Button>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No sizes available
                </Typography>
              )}
            </Box>

            <Divider />

            {/* STOCK */}

            {selectedVariant && (
              <Typography
                variant="body2"
                sx={{
                  pt: 2,

                  color: stock > 0 ? "text.secondary" : "error.main",
                }}
              >
                {stock > 0 ? `${stock} items available` : "Out of stock"}
              </Typography>
            )}

            {/* ERROR */}

            {error && (
              <Typography
                variant="body2"
                color="error.main"
                sx={{
                  pt: 1.5,
                }}
              >
                {error}
              </Typography>
            )}

            {/* QUANTITY + CART */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
              sx={{
                pt: 2.5,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  width: {
                    xs: "100%",
                    sm: 130,
                  },

                  height: 50,

                  px: 1,

                  borderRadius: 999,

                  bgcolor: "grey.100",
                }}
              >
                <IconButton
                  size="small"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Remove fontSize="small" />
                </IconButton>

                <Typography fontWeight={600}>{quantity}</Typography>

                <IconButton
                  size="small"
                  onClick={increaseQuantity}
                  disabled={stock <= 0 || quantity >= stock}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                onClick={handleAddToCart}
                disabled={
                  addingToCart ||
                  (selectedVariant && stock <= 0) ||
                  (availableSizes.length > 0 && !selectedSize)
                }
                sx={{
                  height: 50,

                  borderRadius: 999,

                  bgcolor: "text.primary",

                  color: "background.paper",

                  textTransform: "none",

                  fontSize: 15,

                  fontWeight: 600,
                }}
              >
                {addingToCart ? (
                  <CircularProgress
                    size={22}
                    sx={{
                      color: "inherit",
                    }}
                  />
                ) : (
                  "Add to Cart"
                )}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* =================================================
                    TABS
                ================================================= */}

        <Box
          sx={{
            borderBottom: "1px solid",

            borderColor: "divider",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="fullWidth"
            sx={{
              minHeight: 58,

              "& .MuiTabs-indicator": {
                height: 2,

                bgcolor: "text.primary",
              },

              "& .MuiTab-root": {
                minHeight: 58,

                textTransform: "none",

                fontSize: {
                  xs: 11.5,
                  sm: 15,
                },

                px: { xs: 0.5, sm: 2 },

                fontWeight: 500,

                color: "text.secondary",

                whiteSpace: { xs: "normal", sm: "nowrap" },

                lineHeight: 1.2,
              },

              "& .Mui-selected": {
                color: "text.primary !important",

                fontWeight: 600,
              },
            }}
          >
            <Tab label="Product Details" />

            <Tab
              label={
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={0.7}
                  sx={{ flexWrap: "wrap", rowGap: 0.3 }}
                >
                  <Box component="span">Rating & Reviews</Box>

                  <Box
                    component="span"
                    sx={{
                      minWidth: 20,
                      height: 20,
                      px: 0.7,
                      borderRadius: 999,
                      bgcolor: "grey.200",
                      color: "text.primary",
                      fontSize: 11,
                      fontWeight: 700,
                      lineHeight: "20px",
                      textAlign: "center",
                      display: "inline-block",
                    }}
                  >
                    {reviewCount}
                  </Box>
                </Stack>
              }
            />

            <Tab label="FAQs" />
          </Tabs>
        </Box>

        {/* =================================================
                    PRODUCT DETAILS TAB
                ================================================= */}

        <TabPanel value={activeTab} index={0}>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Product Details
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              lineHeight: 1.8,

              maxWidth: 850,
            }}
          >
            {product.description || "Product details will be displayed here."}
          </Typography>

          <Stack
            spacing={1.5}
            sx={{
              mt: 3,

              maxWidth: 500,
            }}
          >
            {product.brand && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Brand</Typography>

                <Typography fontWeight={600}>{product.brand}</Typography>
              </Stack>
            )}

            {product.product_type_name && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Type</Typography>

                <Typography fontWeight={600}>
                  {product.product_type_name}
                </Typography>
              </Stack>
            )}

            {product.gender_name && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Gender</Typography>

                <Typography fontWeight={600}>{product.gender_name}</Typography>
              </Stack>
            )}

            {product.category_name && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Category</Typography>

                <Typography fontWeight={600}>
                  {product.category_name}
                </Typography>
              </Stack>
            )}
          </Stack>
        </TabPanel>

        {/* =================================================
                    REVIEWS TAB
                ================================================= */}

        <TabPanel value={activeTab} index={1}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            spacing={2}
            mb={3}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                All Reviews ({reviewCount})
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                <Rating value={productRating} precision={0.5} readOnly />

                <Typography color="text.secondary">
                  {productRating.toFixed(1)}/ 5
                </Typography>
              </Stack>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              rowGap={1}
              justifyContent={{
                xs: "flex-start",
                sm: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Tune />}
                sx={{
                  minWidth: 48,

                  height: 44,

                  borderRadius: 999,

                  textTransform: "none",

                  borderColor: "divider",

                  color: "text.primary",
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
                  Filter
                </Box>
              </Button>

              <Button
                variant="outlined"
                endIcon={<KeyboardArrowDown />}
                sx={{
                  height: 44,

                  borderRadius: 999,

                  textTransform: "none",

                  borderColor: "divider",

                  color: "text.primary",
                }}
              >
                Latest
              </Button>

              <Button
                variant="contained"
                onClick={handleWriteReview}
                sx={{
                  height: 44,

                  px: { xs: 2, sm: 2.5 },

                  borderRadius: 999,

                  textTransform: "none",

                  fontSize: { xs: 13, sm: 14 },

                  bgcolor: "text.primary",

                  color: "background.paper",

                  whiteSpace: "nowrap",
                }}
              >
                Write a Review
              </Button>
            </Stack>
          </Stack>

          {/* REVIEWS */}

          {reviewsLoading ? (
            <Box
              sx={{
                display: "flex",

                justifyContent: "center",

                py: 6,
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : reviews.length > 0 ? (
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
                    border: "1px solid",

                    borderColor: "divider",

                    borderRadius: 3,

                    p: 3,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Rating
                      value={Number(review.rating || 0)}
                      precision={0.5}
                      readOnly
                      size="small"
                    />

                    <Typography color="text.secondary" fontSize={13}>
                      {formatReviewDate(review.created_at)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={0.8} mb={1}>
                    <Typography fontWeight={700}>
                      {review.user_name || "Verified Customer"}
                    </Typography>

                    {review.is_verified && (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          bgcolor: "#16a34a",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                        }}
                      >
                        ✓
                      </Box>
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    lineHeight={1.7}
                  >
                    {review.comment || ""}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                py: 8,

                textAlign: "center",

                border: "1px solid",

                borderColor: "divider",

                borderRadius: 3,
              }}
            >
              <Typography color="text.secondary">No reviews yet.</Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                Be the first customer to review this product.
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* =================================================
                    FAQ
                ================================================= */}

        <TabPanel value={activeTab} index={2}>
          <Typography variant="h5" fontWeight={700} mb={3}>
            Frequently Asked Questions
          </Typography>

          <Stack spacing={2}>
            <Box
              sx={{
                borderBottom: "1px solid",

                borderColor: "divider",

                pb: 2,
              }}
            >
              <Typography fontWeight={600}>
                What sizes are available?
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={1}>
                Available sizes are shown above based on the selected color.
              </Typography>
            </Box>

            <Box
              sx={{
                borderBottom: "1px solid",

                borderColor: "divider",

                pb: 2,
              }}
            >
              <Typography fontWeight={600}>
                Are different colors available?
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={1}>
                Available colors are shown in the Select Colors section.
              </Typography>
            </Box>

            <Box
              sx={{
                borderBottom: "1px solid",

                borderColor: "divider",

                pb: 2,
              }}
            >
              <Typography fontWeight={600}>
                How do I add this product to my cart?
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={1}>
                Select a color and size, choose the quantity, then click Add to
                Cart.
              </Typography>
            </Box>
          </Stack>
        </TabPanel>

        {/* =================================================
                    YOU MAY ALSO LIKE
                ================================================= */}

        {(relatedProducts.length > 0 || relatedLoading) && (
          <Box
            sx={{
              py: { xs: 5, md: 8 },
            }}
          >
            <Typography
              component="h2"
              sx={{
                textAlign: "center",
                fontSize: { xs: "28px", sm: "36px", md: "48px" },
                fontWeight: 900,
                letterSpacing: { xs: "-1px", md: "-2px" },
                lineHeight: 1.05,
                mb: { xs: 3, md: 5 },
              }}
            >
              YOU MIGHT ALSO LIKE
            </Typography>

            {relatedLoading ? (
              <Box
                sx={{
                  display: "flex",

                  justifyContent: "center",

                  py: 5,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              /* true responsive grid - 2 columns on phone/tablet,
                 4 columns on desktop. No horizontal scrolling, so
                 nothing can be cut off or missed on mobile. */
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: { xs: 1.5, sm: 2.5, md: 3 },
                }}
              >
                {relatedProducts.map((item) => {
                  const image = getProductCardImage(item);

                  const price = Number(item.price || item.effective_price || 0);

                  return (
                    <Box
                      key={item.id}
                      onClick={() => navigate(`/products/${item.id}`)}
                      sx={{
                        cursor: "pointer",

                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",

                          aspectRatio: "1 / 1",

                          bgcolor: "#F0F0F0",

                          borderRadius: { xs: "10px", md: "14px" },

                          overflow: "hidden",

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          mb: { xs: 1.2, md: 1.5 },
                        }}
                      >
                        {image ? (
                          <Box
                            component="img"
                            src={image}
                            alt={item.name}
                            sx={{
                              width: "100%",

                              height: "100%",

                              /* whole product visible, no zoom/crop -
                                 same treatment as the category card */
                              objectFit: "contain",
                              objectPosition: "center",

                              mixBlendMode: "multiply",

                              display: "block",

                              transition: "transform 0.25s ease",

                              "&:hover": {
                                transform: "scale(1.03)",
                              },
                            }}
                          />
                        ) : (
                          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                            No image
                          </Typography>
                        )}
                      </Box>

                      <Typography
                        sx={{
                          fontSize: { xs: "14px", md: "16px" },
                          fontWeight: 600,
                          overflow: "hidden",

                          textOverflow: "ellipsis",

                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: { xs: "14px", md: "16px" }, mt: 0.5 }}
                      >
                        ${price.toFixed(2)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* =====================================================
                WRITE REVIEW DIALOG
            ===================================================== */}

      <Dialog
        open={reviewDialogOpen}
        onClose={() => {
          if (!submittingReview) {
            setReviewDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            m: { xs: 2, sm: 3 },
            borderRadius: { xs: 3, sm: 2 },
          },
        }}
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
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
            }}
          >
            {product.name}
          </Typography>

          <Typography variant="body2" fontWeight={600} mb={1}>
            Your Rating
          </Typography>

          <Rating
            value={reviewRating}
            onChange={(_, value) => setReviewRating(value)}
            size="large"
          />

          <TextField
            fullWidth
            multiline
            minRows={4}
            value={reviewComment}
            onChange={(event) => setReviewComment(event.target.value)}
            placeholder="Share your experience with this product..."
            label="Your Review"
            sx={{
              mt: 3,
            }}
          />

          {reviewError && (
            <Typography
              color="error.main"
              variant="body2"
              sx={{
                mt: 2,
              }}
            >
              {reviewError}
            </Typography>
          )}

          {reviewSuccess && (
            <Typography
              color="success.main"
              variant="body2"
              sx={{
                mt: 2,
              }}
            >
              {reviewSuccess}
            </Typography>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={() => setReviewDialogOpen(false)}
            disabled={submittingReview}
            sx={{
              borderRadius: 999,

              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={submittingReview}
            sx={{
              borderRadius: 999,

              textTransform: "none",

              bgcolor: "text.primary",

              color: "background.paper",
            }}
          >
            {submittingReview ? (
              <CircularProgress
                size={20}
                sx={{
                  color: "inherit",
                }}
              />
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}