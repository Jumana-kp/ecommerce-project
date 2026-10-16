from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):

    model = OrderItem

    extra = 0

    readonly_fields = (
        "product_variant",
        "selected_size",
        "quantity",
        "unit_price",
        "subtotal",
        "review_rating",
        "review_comment",
        "review_created_at",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "status",
        "total_amount",
        "created_at",
    )

    # Lets you change status directly from the Orders list
    # (e.g. pending -> delivered) without opening each order.
    list_editable = (
        "status",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "user__email",
    )

    inlines = [
        OrderItemInline,
    ]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "order",
        "product_name",
        "quantity",
        "review_rating",
        "review_created_at",
    )

    list_filter = (
        "review_rating",
    )

    @admin.display(
        description="Product"
    )
    def product_name(self, obj):
        return obj.product_variant.product.name