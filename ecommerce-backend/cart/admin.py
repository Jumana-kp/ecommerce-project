from django.contrib import admin

from .models import Cart, CartItem


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "created_at",
        "updated_at",
    ]

    search_fields = [
        "user__email",
    ]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "cart",
        "product_variant",
        "selected_size",
        "quantity",
        "created_at",
    ]

    list_filter = [
        "selected_size",
        "product_variant__color",
    ]

    search_fields = [
        "cart__user__email",
        "product_variant__product__name",
        "product_variant__sku",
        "selected_size__name",
    ]