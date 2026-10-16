from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import ProductVariant, Size

from .models import Cart, CartItem
from .serializers import CartSerializer


class CartView(generics.GenericAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        cart, created = Cart.objects.get_or_create(
            user=user
        )

        return cart

    def get(self, request):
        cart = self.get_cart(request.user)

        cart = (
            Cart.objects
            .prefetch_related(
                "items__product_variant__product",
                "items__product_variant__color",
                "items__selected_size",
            )
            .get(
                id=cart.id
            )
        )

        serializer = self.get_serializer(
            cart,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        product_variant_id = request.data.get(
            "product_variant"
        )

        selected_size_id = request.data.get(
            "selected_size"
        )

        quantity = request.data.get(
            "quantity",
            1
        )

        if not product_variant_id:
            return Response(
                {
                    "error": "Product variant is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not selected_size_id:
            return Response(
                {
                    "error": "Selected size is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)

        except (TypeError, ValueError):
            return Response(
                {
                    "error": "Quantity must be a valid number."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity < 1:
            return Response(
                {
                    "error": "Quantity must be at least 1."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            variant = (
                ProductVariant.objects
                .select_related(
                    "product",
                    "color",
                )
                .prefetch_related("sizes")
                .get(
                    id=product_variant_id
                )
            )

        except ProductVariant.DoesNotExist:
            return Response(
                {
                    "error": "Product variant not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            size = Size.objects.get(
                id=selected_size_id
            )

        except Size.DoesNotExist:
            return Response(
                {
                    "error": "Selected size not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not variant.sizes.filter(
            id=size.id
        ).exists():
            return Response(
                {
                    "error": (
                        "Selected size is not available "
                        "for this product variant."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if variant.stock < quantity:
            return Response(
                {
                    "error": (
                        f"Only {variant.stock} "
                        "items are available."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_cart(
            request.user
        )

        cart_item, created = (
            CartItem.objects.get_or_create(
                cart=cart,
                product_variant=variant,
                selected_size=size,
                defaults={
                    "quantity": quantity
                }
            )
        )

        if not created:
            new_quantity = (
                cart_item.quantity + quantity
            )

            if new_quantity > variant.stock:
                return Response(
                    {
                        "error": (
                            "Requested quantity exceeds "
                            "available stock."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity = new_quantity

            cart_item.save(
                update_fields=[
                    "quantity",
                    "updated_at",
                ]
            )

        serializer = self.get_serializer(
            cart,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class CartMergeView(generics.GenericAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        cart, created = Cart.objects.get_or_create(
            user=user
        )

        return cart

    def post(self, request):
        items = request.data.get(
            "items",
            []
        )

        if not isinstance(items, list):
            return Response(
                {
                    "error": "Items must be a list."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_cart(
            request.user
        )

        for item in items:
            if not isinstance(item, dict):
                return Response(
                    {
                        "error": (
                            "Each cart item must be an object."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            product_variant_id = item.get(
                "product_variant"
            )

            selected_size_id = item.get(
                "selected_size"
            )

            quantity = item.get(
                "quantity",
                1
            )

            if not product_variant_id:
                return Response(
                    {
                        "error": (
                            "Product variant is required."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not selected_size_id:
                return Response(
                    {
                        "error": (
                            "Selected size is required."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                quantity = int(quantity)

            except (TypeError, ValueError):
                return Response(
                    {
                        "error": (
                            "Quantity must be a valid number."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if quantity < 1:
                return Response(
                    {
                        "error": (
                            "Quantity must be at least 1."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                variant = (
                    ProductVariant.objects
                    .select_related(
                        "product",
                        "color",
                    )
                    .prefetch_related("sizes")
                    .get(
                        id=product_variant_id
                    )
                )

            except ProductVariant.DoesNotExist:
                return Response(
                    {
                        "error": (
                            "Product variant not found."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            try:
                size = Size.objects.get(
                    id=selected_size_id
                )

            except Size.DoesNotExist:
                return Response(
                    {
                        "error": (
                            "Selected size not found."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            if not variant.sizes.filter(
                id=size.id
            ).exists():
                return Response(
                    {
                        "error": (
                            "Selected size is not available "
                            "for this product variant."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if variant.stock < quantity:
                return Response(
                    {
                        "error": (
                            f"Only {variant.stock} "
                            "items are available."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item, created = (
                CartItem.objects.get_or_create(
                    cart=cart,
                    product_variant=variant,
                    selected_size=size,
                    defaults={
                        "quantity": quantity
                    }
                )
            )

            if not created:
                new_quantity = (
                    cart_item.quantity +
                    quantity
                )

                if new_quantity > variant.stock:
                    return Response(
                        {
                            "error": (
                                "Requested quantity exceeds "
                                "available stock."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                cart_item.quantity = new_quantity

                cart_item.save(
                    update_fields=[
                        "quantity",
                        "updated_at",
                    ]
                )

        cart = (
            Cart.objects
            .prefetch_related(
                "items__product_variant__product",
                "items__product_variant__color",
                "items__selected_size",
            )
            .get(
                id=cart.id
            )
        )

        serializer = self.get_serializer(
            cart,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class CartItemUpdateView(
    generics.GenericAPIView
):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        try:
            cart_item = (
                CartItem.objects
                .select_related(
                    "cart",
                    "product_variant",
                )
                .get(
                    id=item_id,
                    cart__user=request.user,
                )
            )

        except CartItem.DoesNotExist:
            return Response(
                {
                    "error": "Cart item not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        quantity = request.data.get(
            "quantity"
        )

        if quantity is None:
            return Response(
                {
                    "error": "Quantity is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)

        except (TypeError, ValueError):
            return Response(
                {
                    "error": "Quantity must be a valid number."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity < 1:
            return Response(
                {
                    "error": "Quantity must be at least 1."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity > cart_item.product_variant.stock:
            return Response(
                {
                    "error": (
                        "Requested quantity exceeds "
                        "available stock."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.quantity = quantity

        cart_item.save(
            update_fields=[
                "quantity",
                "updated_at",
            ]
        )

        cart = (
            Cart.objects
            .prefetch_related(
                "items__product_variant__product",
                "items__product_variant__color",
                "items__selected_size",
            )
            .get(
                id=cart_item.cart.id
            )
        )

        serializer = self.get_serializer(
            cart,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class CartItemDeleteView(
    generics.DestroyAPIView
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(
            cart__user=self.request.user
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        instance = self.get_object()

        cart = instance.cart

        instance.delete()

        cart = (
            Cart.objects
            .prefetch_related(
                "items__product_variant__product",
                "items__product_variant__color",
                "items__selected_size",
            )
            .get(
                id=cart.id
            )
        )

        serializer = CartSerializer(
            cart,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )