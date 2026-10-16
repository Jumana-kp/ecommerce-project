from django.urls import path

from .views import (
    CartView,
    CartMergeView,
    CartItemUpdateView,
    CartItemDeleteView,
)


urlpatterns = [
    path(
        "",
        CartView.as_view(),
        name="cart",
    ),

    path(
        "merge/",
        CartMergeView.as_view(),
        name="cart-merge",
    ),

    path(
        "items/<int:item_id>/",
        CartItemUpdateView.as_view(),
        name="cart-item-update",
    ),

    path(
        "items/<int:pk>/delete/",
        CartItemDeleteView.as_view(),
        name="cart-item-delete",
    ),
]