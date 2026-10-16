from rest_framework import serializers

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

class GenderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Gender

        fields = (
            "id",
            "name",
        )


# =====================================================
# CATEGORY
# =====================================================

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category

        fields = (
            "id",
            "name",
            "slug",
        )


# =====================================================
# PRODUCT TYPE
# =====================================================

class ProductTypeSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = ProductType

        fields = (
            "id",
            "name",
            "category",
            "category_name",
        )


# =====================================================
# SIZE
# =====================================================

class SizeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Size

        fields = (
            "id",
            "name",
        )


# =====================================================
# COLOR
# =====================================================

class ColorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Color

        fields = (
            "id",
            "name",
            "hex_code",
        )


# =====================================================
# PRODUCT VARIANT IMAGE
# =====================================================

class ProductVariantImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductVariantImage

        fields = (
            "id",
            "image",
            "display_order",
        )


# =====================================================
# PRODUCT VARIANT
# =====================================================

class ProductVariantSerializer(serializers.ModelSerializer):

    color = ColorSerializer(
        read_only=True,
    )

    sizes = SizeSerializer(
        many=True,
        read_only=True,
    )

    images = ProductVariantImageSerializer(
        many=True,
        read_only=True,
    )

    effective_price = serializers.SerializerMethodField()

    is_default = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant

        fields = (
            "id",
            "color",
            "sizes",
            "sku",
            "price",
            "effective_price",
            "stock",
            "images",
            "is_default",
        )

    def get_effective_price(self, obj):

        if obj.price is not None:
            return obj.price

        return obj.product.price

    def get_is_default(self, obj):

        product_image = obj.product.image

        if not product_image:
            return False

        product_image_name = product_image.name

        return obj.images.filter(
            image=product_image_name
        ).exists()


# =====================================================
# PRODUCT
# =====================================================

class ProductSerializer(serializers.ModelSerializer):

    gender_name = serializers.CharField(
        source="gender.name",
        read_only=True,
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    product_type_name = serializers.CharField(
        source="product_type.name",
        read_only=True,
    )

    variants = ProductVariantSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",
            "description",

            "price",
            "original_price",
            "discount_percentage",

            "brand",

            "gender",
            "gender_name",

            "category",
            "category_name",

            "product_type",
            "product_type_name",

            "image",

            "variants",

            "rating",
            "review_count",

            "created_at",
            "updated_at",
        )