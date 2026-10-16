from django.urls import path

from .views import (
    BrandListView,
    CategoryDetailView,
    CategoryListCreateView,
    GenderListView,
    ProductDetailView,
    ProductListCreateView,
    ProductTypeListView,
)


urlpatterns = [
    path(
        "genders/",
        GenderListView.as_view(),
        name="gender-list",
    ),

    path(
        "brands/",
        BrandListView.as_view(),
        name="brand-list",
    ),

    path(
        "categories/",
        CategoryListCreateView.as_view(),
        name="category-list-create",
    ),

    path(
        "categories/<int:pk>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),

    path(
        "product-types/",
        ProductTypeListView.as_view(),
        name="product-type-list",
    ),

    path(
        "",
        ProductListCreateView.as_view(),
        name="product-list-create",
    ),

    path(
        "<int:pk>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),
]