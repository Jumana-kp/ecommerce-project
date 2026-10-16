from django.urls import path

from .views import (
    CheckoutView,
    OrderListView,
    OrderDetailView,
    ProductReviewView,
    ProductReviewsListView,
    ProductReviewStatusView,
)


urlpatterns = [

    # =================================================
    # CHECKOUT
    # =================================================

    path(
        "checkout/",
        CheckoutView.as_view(),
        name="checkout",
    ),

    # =================================================
    # REVIEW STATUS
    # =================================================

    path(
        "products/<int:product_id>/review-status/",
        ProductReviewStatusView.as_view(),
        name="product-review-status",
    ),

    # =================================================
    # SUBMIT REVIEW
    # =================================================

    path(
        "products/<int:product_id>/review/",
        ProductReviewView.as_view(),
        name="product-review",
    ),

    # =================================================
    # PRODUCT REVIEWS LIST
    # =================================================

    path(
        "products/<int:product_id>/reviews/",
        ProductReviewsListView.as_view(),
        name="product-reviews",
    ),

    # =================================================
    # ORDERS
    # =================================================

    path(
        "",
        OrderListView.as_view(),
        name="order-list",
    ),

    # =================================================
    # ORDER DETAIL
    # =================================================

    path(
        "<int:pk>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),
]