from django.contrib import admin

from .models import (
    Category,
    Color,
    Gender,
    Product,
    ProductType,
    ProductVariant,
    ProductVariantImage,
    Size,
)


# =====================================================
# GENDER
# =====================================================

@admin.register(Gender)
class GenderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
    )

    search_fields = (
        "name",
    )


# =====================================================
# CATEGORY / DRESS STYLE
# =====================================================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "slug",
    )

    search_fields = (
        "name",
        "slug",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }


# =====================================================
# PRODUCT TYPE
# =====================================================

@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "category",
    )

    list_filter = (
        "category",
    )

    search_fields = (
        "name",
        "category__name",
    )


# =====================================================
# SIZE
# =====================================================

@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
    )

    search_fields = (
        "name",
    )


# =====================================================
# COLOR
# =====================================================

@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "hex_code",
    )

    search_fields = (
        "name",
    )


# =====================================================
# PRODUCT VARIANT IMAGE INLINE
# =====================================================

class ProductVariantImageInline(admin.TabularInline):

    model = ProductVariantImage

    extra = 2

    fields = (
        "image",
        "display_order",
    )

    ordering = (
        "display_order",
        "id",
    )


# =====================================================
# PRODUCT VARIANT INLINE
# =====================================================

class ProductVariantInline(admin.TabularInline):

    model = ProductVariant

    extra = 1

    fields = (
        "color",
        "sizes",
        "sku",
        "price",
        "stock",
    )

    show_change_link = True


# =====================================================
# PRODUCT
# =====================================================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "gender",
        "category",
        "product_type",
        "brand",
        "price",
        "original_price",
        "discount_percentage",
        "rating",
        "review_count",
    )

    list_filter = (
        "gender",
        "category",
        "product_type",
        "brand",
    )

    search_fields = (
        "name",
        "brand",
        "description",
        "slug",
        "product_type__name",
        "category__name",
        "gender__name",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    inlines = [
        ProductVariantInline,
    ]

    fieldsets = (
        (
            "Basic Information",
            {
                "fields": (
                    "name",
                    "slug",
                    "description",
                    "brand",
                )
            },
        ),
        (
            "Category",
            {
                "fields": (
                    "gender",
                    "category",
                    "product_type",
                )
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "price",
                    "original_price",
                    "discount_percentage",
                )
            },
        ),
        (
            "Main Image",
            {
                "fields": (
                    "image",
                )
            },
        ),
        (
            "Reviews",
            {
                "fields": (
                    "rating",
                    "review_count",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# =====================================================
# PRODUCT VARIANT
# =====================================================

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "product",
        "color",
        "sku",
        "price",
        "stock",
    )

    list_filter = (
        "color",
        "product__category",
        "product__gender",
    )

    search_fields = (
        "product__name",
        "sku",
        "color__name",
    )

    filter_horizontal = (
        "sizes",
    )

    inlines = [
        ProductVariantImageInline,
    ]


# =====================================================
# PRODUCT VARIANT IMAGE
# =====================================================

@admin.register(ProductVariantImage)
class ProductVariantImageAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "variant",
        "display_order",
        "image",
    )

    list_filter = (
        "variant__color",
        "variant__product__category",
    )

    search_fields = (
        "variant__product__name",
        "variant__color__name",
        "variant__sku",
    )

    ordering = (
        "variant",
        "display_order",
        "id",
    )