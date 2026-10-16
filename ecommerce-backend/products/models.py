from django.db import models


# =====================================================
# GENDER
# =====================================================

class Gender(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True,
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name


# =====================================================
# CATEGORY / DRESS STYLE
# =====================================================

class Category(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


# =====================================================
# PRODUCT TYPE
# =====================================================

class ProductType(models.Model):
    name = models.CharField(
        max_length=100,
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="product_types",
    )

    class Meta:
        ordering = ["id"]

        constraints = [
            models.UniqueConstraint(
                fields=["name", "category"],
                name="unique_product_type_per_category",
            )
        ]

    def __str__(self):
        return f"{self.category.name} - {self.name}"


# =====================================================
# SIZE
# =====================================================

class Size(models.Model):
    name = models.CharField(
        max_length=20,
        unique=True,
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name


# =====================================================
# COLOR
# =====================================================

class Color(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True,
    )

    hex_code = models.CharField(
        max_length=7,
        blank=True,
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name


# =====================================================
# PRODUCT
# =====================================================

class Product(models.Model):
    name = models.CharField(
        max_length=200,
    )

    slug = models.SlugField(
        max_length=220,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    # -------------------------------------------------
    # Current selling price
    # -------------------------------------------------

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    # -------------------------------------------------
    # Original price before discount
    # -------------------------------------------------

    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    discount_percentage = models.PositiveIntegerField(
        default=0,
    )

    # -------------------------------------------------
    # Brand
    # -------------------------------------------------

    brand = models.CharField(
        max_length=100,
        blank=True,
    )

    # -------------------------------------------------
    # Product classification
    # -------------------------------------------------

    gender = models.ForeignKey(
        Gender,
        on_delete=models.CASCADE,
        related_name="products",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products",
    )

    product_type = models.ForeignKey(
        ProductType,
        on_delete=models.CASCADE,
        related_name="products",
    )

    # -------------------------------------------------
    # Main product image
    # Used for category/listing cards
    # -------------------------------------------------

    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
    )

    # -------------------------------------------------
    # Rating
    # -------------------------------------------------

    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0,
    )

    review_count = models.PositiveIntegerField(
        default=0,
    )

    # -------------------------------------------------
    # Timestamps
    # -------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


# =====================================================
# PRODUCT VARIANT
# =====================================================

class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
    )

    # -------------------------------------------------
    # Variant color
    # -------------------------------------------------

    color = models.ForeignKey(
        Color,
        on_delete=models.CASCADE,
        related_name="product_variants",
    )

    # -------------------------------------------------
    # Available sizes for this color
    # -------------------------------------------------

    sizes = models.ManyToManyField(
        Size,
        blank=True,
        related_name="product_variants",
    )

    # -------------------------------------------------
    # SKU
    # -------------------------------------------------

    sku = models.CharField(
        max_length=100,
        unique=True,
    )

    # -------------------------------------------------
    # Optional variant-specific price
    # If empty, Product.price is used
    # -------------------------------------------------

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    # -------------------------------------------------
    # Stock
    # -------------------------------------------------

    stock = models.PositiveIntegerField(
        default=0,
    )

    class Meta:
        ordering = ["id"]

        constraints = [
            models.UniqueConstraint(
                fields=["product", "color"],
                name="unique_product_color_variant",
            )
        ]

    def __str__(self):
        return f"{self.product.name} - {self.color.name}"


# =====================================================
# PRODUCT VARIANT IMAGE
# =====================================================

class ProductVariantImage(models.Model):
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="images",
    )

    image = models.ImageField(
        upload_to="products/variants/",
    )

    display_order = models.PositiveIntegerField(
        default=0,
    )

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return (
            f"{self.variant.product.name} - "
            f"{self.variant.color.name} - "
            f"Image {self.id}"
        )