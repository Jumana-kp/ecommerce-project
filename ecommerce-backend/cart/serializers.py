from rest_framework import serializers

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):

    product_variant_id = serializers.IntegerField(
        source="product_variant.id",
        read_only=True,
    )

    product_id = serializers.IntegerField(
        source="product_variant.product.id",
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

    product_price = serializers.SerializerMethodField()

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem

        fields = [
            "id",
            "product_id",
            "product_variant_id",
            "product_name",
            "product_image",
            "color",
            "size",
            "product_price",
            "quantity",
            "subtotal",
        ]

        read_only_fields = [
            "id",
            "product_id",
            "product_variant_id",
            "product_name",
            "product_image",
            "color",
            "size",
            "product_price",
            "subtotal",
        ]

    def get_product_image(self, obj):

        variant = obj.product_variant

        # Get the first image belonging to this selected variant
        image = variant.images.order_by("display_order", "id").first()

        # If variant has an image, use it
        if image and image.image:
            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(
                    image.image.url
                )

            return image.image.url

        # Fallback to main product image
        product_image = variant.product.image

        if not product_image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                product_image.url
            )

        return product_image.url

    def get_product_price(self, obj):

        variant_price = obj.product_variant.price

        if variant_price is not None:
            return variant_price

        return obj.product_variant.product.price

    def get_subtotal(self, obj):

        price = self.get_product_price(obj)

        return price * obj.quantity


class CartSerializer(serializers.ModelSerializer):

    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    total_items = serializers.SerializerMethodField()

    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart

        fields = [
            "id",
            "items",
            "total_items",
            "total_price",
        ]

        read_only_fields = [
            "id",
            "items",
            "total_items",
            "total_price",
        ]

    def get_total_items(self, obj):

        return sum(
            item.quantity
            for item in obj.items.all()
        )

    def get_total_price(self, obj):

        total = 0

        for item in obj.items.select_related(
            "product_variant__product"
        ).all():

            if item.product_variant.price is not None:
                price = item.product_variant.price
            else:
                price = item.product_variant.product.price

            total += price * item.quantity

        return total