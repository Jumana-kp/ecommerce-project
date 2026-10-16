from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):

    product_id = serializers.IntegerField(
        source="product_variant.product.id",
        read_only=True,
    )

    product_variant_id = serializers.IntegerField(
        source="product_variant.id",
        read_only=True,
    )

    product_name = serializers.CharField(
        source="product_variant.product.name",
        read_only=True,
    )

    product_image = serializers.SerializerMethodField()

    color = serializers.CharField(
        source="product_variant.color.name",
        read_only=True,
    )

    size = serializers.CharField(
        source="selected_size.name",
        read_only=True,
    )

    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem

        fields = [
            "id",
            "product_id",
            "product_variant_id",
            "product_name",
            "product_image",
            "color",
            "size",
            "quantity",
            "unit_price",
            "subtotal",

            # Review
            "review_rating",
            "review_comment",
            "review_created_at",
            "reviewer_name",
        ]

        read_only_fields = [
            "id",
            "product_id",
            "product_variant_id",
            "product_name",
            "product_image",
            "color",
            "size",
            "unit_price",
            "subtotal",

            # Review
            "review_rating",
            "review_comment",
            "review_created_at",
            "reviewer_name",
        ]

    def get_product_image(self, obj):

        variant = obj.product_variant

        # First use selected variant image
        image = (
            variant.images
            .order_by("display_order", "id")
            .first()
        )

        if image and image.image:

            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(
                    image.image.url
                )

            return image.image.url

        # Fallback to product image
        product_image = variant.product.image

        if not product_image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                product_image.url
            )

        return product_image.url

    def get_reviewer_name(self, obj):

        user = obj.order.user

        full_name = (
            f"{user.first_name} {user.last_name}"
        ).strip()

        if full_name:
            return full_name

        return user.email.split("@")[0]


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Order

        fields = [
            "id",
            "status",
            "total_amount",
            "items",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "total_amount",
            "items",
            "created_at",
            "updated_at",
        ]