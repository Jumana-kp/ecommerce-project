from django.conf import settings
from django.db import models

from products.models import ProductVariant, Size


class Order(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    selected_size = models.ForeignKey(
        Size,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    quantity = models.PositiveIntegerField(
        default=1,
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    # =====================================================
    # REVIEW
    # =====================================================

    review_rating = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    review_comment = models.TextField(
        blank=True,
        default="",
    )

    review_created_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return (
            f"{self.product_variant.product.name} "
            f"× {self.quantity}"
        )