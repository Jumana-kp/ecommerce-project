from django.conf import settings
from django.db import models

from products.models import ProductVariant, Size


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart - {self.user.email}"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="cart_items",
       
    )

    selected_size = models.ForeignKey(
        Size,
        on_delete=models.PROTECT,
        related_name="cart_items",
        
    )

    quantity = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "cart",
                    "product_variant",
                    "selected_size",
                ],
                name="unique_variant_size_per_cart",
            )
        ]

    def __str__(self):
        return (
        f"{self.product_variant} - "
        f"{self.selected_size.name} x {self.quantity}"
    )