from decimal import Decimal

from django.db import transaction
from django.db.models import Avg
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from cart.models import Cart

from .models import Order, OrderItem
from .serializers import OrderSerializer


DELIVERY_FEE = Decimal("15.00")


def update_product_rating(product_id):
    
    from products.models import Product  # local import avoids a circular import

    average = (
        OrderItem.objects
        .filter(
            product_variant__product_id=product_id,
            review_rating__isnull=False,
        )
        .aggregate(avg=Avg("review_rating"))["avg"]
        or 0
    )

    Product.objects.filter(pk=product_id).update(
        rating=Decimal(str(round(average, 1)))
    )


# =====================================================
# CHECKOUT
# =====================================================

class CheckoutView(generics.GenericAPIView):

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):

        with transaction.atomic():

            try:
                cart = (
                    Cart.objects
                    .prefetch_related(
                        "items__product_variant__product",
                        "items__product_variant__color",
                        "items__product_variant__images",
                        "items__selected_size",
                    )
                    .get(
                        user=request.user
                    )
                )

            except Cart.DoesNotExist:

                return Response(
                    {
                        "error": "Cart not found."
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            cart_items = list(
                cart.items.all()
            )

            if not cart_items:

                return Response(
                    {
                        "error": "Your cart is empty."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # =================================================
            # CHECK STOCK
            # =================================================

            for cart_item in cart_items:

                variant = cart_item.product_variant

                if cart_item.quantity > variant.stock:

                    return Response(
                        {
                            "error": (
                                f"Insufficient stock for "
                                f"{variant.product.name}."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # =================================================
            # CREATE ORDER
            # =================================================

            order = Order.objects.create(
                user=request.user,
                status="pending",
                total_amount=Decimal("0.00"),
            )

            subtotal_amount = Decimal("0.00")

            # =================================================
            # CREATE ORDER ITEMS
            # =================================================

            for cart_item in cart_items:

                variant = cart_item.product_variant
                quantity = cart_item.quantity

                if variant.price is not None:
                    unit_price = variant.price
                else:
                    unit_price = variant.product.price

                item_subtotal = (
                    unit_price * quantity
                )

                OrderItem.objects.create(
                    order=order,
                    product_variant=variant,
                    selected_size=cart_item.selected_size,
                    quantity=quantity,
                    unit_price=unit_price,
                    subtotal=item_subtotal,
                )

                # Reduce stock

                variant.stock -= quantity

                variant.save(
                    update_fields=["stock"]
                )

                subtotal_amount += item_subtotal

            # =================================================
            # FINAL TOTAL
            # =================================================

            total_amount = (
                subtotal_amount
                + DELIVERY_FEE
            )

            order.total_amount = total_amount

            order.save(
                update_fields=["total_amount"]
            )

            # =================================================
            # CLEAR CART
            # =================================================

            cart.items.all().delete()

            serializer = self.get_serializer(
                order,
                context={
                    "request": request
                },
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )


# =====================================================
# ORDER LIST
# =====================================================

class OrderListView(generics.ListAPIView):

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return (
            Order.objects
            .filter(
                user=self.request.user
            )
            .prefetch_related(
                "items__product_variant__product",
                "items__product_variant__color",
                "items__product_variant__images",
                "items__selected_size",
            )
            .order_by("-created_at")
        )


# =====================================================
# ORDER DETAIL
# =====================================================

class OrderDetailView(generics.RetrieveAPIView):

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return (
            Order.objects
            .filter(
                user=self.request.user
            )
            .prefetch_related(
                "items__product_variant__product",
                "items__product_variant__color",
                "items__product_variant__images",
                "items__selected_size",
            )
        )


# =====================================================
# PRODUCT REVIEW
# =====================================================

class ProductReviewView(generics.GenericAPIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):

        rating = request.data.get("rating")
        comment = request.data.get(
            "comment",
            ""
        ).strip()

        # =================================================
        # VALIDATE RATING
        # =================================================

        try:
            rating = int(rating)

        except (TypeError, ValueError):

            return Response(
                {
                    "error": (
                        "Rating must be between 1 and 5."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if rating < 1 or rating > 5:

            return Response(
                {
                    "error": (
                        "Rating must be between 1 and 5."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # VALIDATE COMMENT
        # =================================================

        if not comment:

            return Response(
                {
                    "error": "Please write a review."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # FIND A DELIVERED PURCHASE OF THIS PRODUCT
        #
        # Since there is no live courier/shipping integration yet,
        # "delivered" is set manually in the Django admin (Orders
        # list -> status column -> Delivered -> Save). That is a
        # normal, honest way to run this until real shipment
        # tracking is added - the check itself is exactly what a
        # production store would use.
        # =================================================

        order_items = (
            OrderItem.objects
            .filter(
                order__user=request.user,
                order__status="delivered",
                product_variant__product_id=product_id,
            )
            .select_related(
                "order",
                "order__user",
                "product_variant",
                "product_variant__product",
            )
            .order_by("-order__created_at")
        )

        # User never purchased this product, or it has not been
        # marked delivered yet.

        if not order_items.exists():

            return Response(
                {
                    "error": (
                        "You can review this product "
                        "after your order is delivered."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # ALREADY REVIEWED?
        # =================================================

        if order_items.filter(
            review_rating__isnull=False
        ).exists():

            return Response(
                {
                    "error": (
                        "You have already reviewed "
                        "this product."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # GET ORDER ITEM
        # =================================================

        order_item = order_items.first()

        # =================================================
        # SAVE REVIEW
        # =================================================

        order_item.review_rating = rating
        order_item.review_comment = comment
        order_item.review_created_at = timezone.now()

        order_item.save(
            update_fields=[
                "review_rating",
                "review_comment",
                "review_created_at",
            ]
        )

        # Keep the product's star rating in sync.

        update_product_rating(product_id)

        return Response(
            {
                "message": (
                    "Review submitted successfully."
                ),
                "review": {
                    "id": order_item.id,
                    "product_id": product_id,
                    "rating": order_item.review_rating,
                    "comment": order_item.review_comment,
                    "reviewer_name": (
                        f"{request.user.first_name} "
                        f"{request.user.last_name}"
                    ).strip()
                    or request.user.email.split("@")[0],
                    "created_at": (
                        order_item.review_created_at
                    ),
                },
            },
            status=status.HTTP_201_CREATED,
        )


# =====================================================
# PRODUCT REVIEWS LIST
# =====================================================

class ProductReviewsListView(generics.ListAPIView):

    permission_classes = []

    def get_queryset(self):

        product_id = self.kwargs["product_id"]

        return (
            OrderItem.objects
            .filter(
                product_variant__product_id=product_id,
                review_rating__isnull=False,
            )
            .select_related(
                "order__user",
                "product_variant__product",
            )
            .order_by("-review_created_at")
        )

    def list(self, request, *args, **kwargs):

        queryset = self.get_queryset()

        reviews = []

        for item in queryset:

            user = item.order.user

            full_name = (
                f"{user.first_name} "
                f"{user.last_name}"
            ).strip()

            if not full_name:
                full_name = user.email.split("@")[0]

            reviews.append(
                {
                    "id": item.id,
                    "user_name": full_name,
                    "is_verified": True,
                    "rating": item.review_rating,
                    "comment": item.review_comment,
                    "created_at": item.review_created_at,
                }
            )

        return Response(
            {
                "count": len(reviews),
                "results": reviews,
            }
        )


# =====================================================
# PRODUCT REVIEW STATUS
# =====================================================

class ProductReviewStatusView(generics.GenericAPIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):

        order_items = (
            OrderItem.objects
            .filter(
                order__user=request.user,
                order__status="delivered",
                product_variant__product_id=product_id,
            )
            .order_by("-order__created_at")
        )

        if not order_items.exists():
            return Response({
                "can_review": False,
                "has_review": False,
                "rating": None,
                "comment": "",
                "message": (
                    "You can review this product "
                    "after your order is delivered."
                ),
            })

        reviewed_item = (
            order_items
            .filter(review_rating__isnull=False)
            .first()
        )

        if reviewed_item:
            return Response({
                "can_review": False,
                "has_review": True,
                "rating": reviewed_item.review_rating,
                "comment": reviewed_item.review_comment,
                "message": "You have already reviewed this product.",
            })

        return Response({
            "can_review": True,
            "has_review": False,
            "rating": None,
            "comment": "",
            "message": "You can review this product.",
        })