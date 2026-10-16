from decimal import Decimal, InvalidOperation

from django.db.models import Q

from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from users.permissions import IsAdminUser

from .models import (
    Category,
    Gender,
    Product,
    ProductType,
)
from .serializers import (
    CategorySerializer,
    GenderSerializer,
    ProductSerializer,
    ProductTypeSerializer,
)


# ---------------------------------------------------------------
# Small helpers so bad query values (?category=abc, ?min_price=x)
# never crash the API with a 500 error.
# ---------------------------------------------------------------

def clean_id(value):
    """Return the value only if it is a whole number."""
    if value and str(value).isdigit():
        return value

    return None


def clean_price(value):
    """Return a Decimal, or None if the value is not a valid number."""
    try:
        return Decimal(value)
    except (InvalidOperation, TypeError):
        return None


def search_variants(term):
    """
    "shirts" should also find "shirt" and "T-shirt".
    Returns the word itself, plus a singular form for plurals.
    """
    variants = {term}

    if len(term) > 3 and term.endswith("s"):
        variants.add(term[:-1])

    return variants


class GenderListView(generics.ListAPIView):
    queryset = Gender.objects.all()
    serializer_class = GenderSerializer
    permission_classes = [AllowAny]


class BrandListView(generics.ListAPIView):
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        brands = (
            Product.objects
            .exclude(brand="")
            .exclude(brand__isnull=True)
            .values_list("brand", flat=True)
            .distinct()
            .order_by("brand")
        )

        return Response(list(brands))


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    # short list -> return everything in one response
    pagination_class = None

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]

        return [AllowAny()]


class CategoryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminUser()]

        return [AllowAny()]


class ProductTypeListView(generics.ListAPIView):
    queryset = ProductType.objects.select_related(
        "category"
    ).all()

    serializer_class = ProductTypeSerializer
    permission_classes = [AllowAny]

    # short list -> return everything in one response
    pagination_class = None


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]

        return [AllowAny()]

    def get_queryset(self):
        params = self.request.query_params

        queryset = (
            Product.objects
            .select_related(
                "gender",
                "category",
                "product_type",
            )
            .prefetch_related(
                "variants__color",
                "variants__sizes",
                "variants__images",
            )
        )

        # SEARCH
        #
        # Every word must match somewhere: the product name, brand,
        # category (Casual, Formal...), product type (T-shirts, Jeans...)
        # or gender (Men, Women...).
        #
        #   "casual"         -> everything in the Casual category
        #   "casual shirt"   -> Casual AND shirt
        #   "jeans"          -> the Jeans type + products named jeans
        #
        # Description is NOT searched on purpose: it made unrelated
        # products show up whenever a word appeared in some sentence.
        # To add it back, add:  | Q(description__icontains=variant)
        search = (params.get("search") or "").strip()

        if search:
            for term in search.split():
                term_q = Q()

                for variant in search_variants(term):
                    term_q |= (
                        Q(name__icontains=variant)
                        | Q(brand__icontains=variant)
                        | Q(category__name__icontains=variant)
                        | Q(product_type__name__icontains=variant)
                        | Q(gender__name__icontains=variant)
                    )

                queryset = queryset.filter(term_q)

        # GENDER FILTER
        gender = clean_id(params.get("gender"))

        if gender:
            queryset = queryset.filter(
                gender_id=gender
            )

        # CATEGORY FILTER
        category = clean_id(params.get("category"))

        if category:
            queryset = queryset.filter(
                category_id=category
            )

        # PRODUCT TYPE FILTER
        product_type = clean_id(params.get("product_type"))

        if product_type:
            queryset = queryset.filter(
                product_type_id=product_type
            )

        # COLOR + SIZE FILTER
        #
        # One single .filter() call, so both conditions must be true
        # on the SAME variant (red AND size Large of the same variant),
        # not "some variant is red and some other variant has Large".
        color = params.get("color")
        size = params.get("size")

        if color or size:
            variant_q = Q()

            if color:
                variant_q &= Q(variants__color__name__iexact=color)

            if size:
                variant_q &= Q(variants__sizes__name__iexact=size)

            queryset = queryset.filter(variant_q)

        # MIN PRICE
        min_price = clean_price(params.get("min_price"))

        if min_price is not None:
            queryset = queryset.filter(
                price__gte=min_price
            )

        # MAX PRICE
        max_price = clean_price(params.get("max_price"))

        if max_price is not None:
            queryset = queryset.filter(
                price__lte=max_price
            )

        # ON SALE
        if params.get("on_sale") == "true":
            queryset = queryset.filter(
                discount_percentage__gt=0
            )

        # BRAND
        brand = params.get("brand")

        if brand:
            queryset = queryset.filter(
                brand__iexact=brand
            )

        # ORDERING
        ordering = params.get("ordering")

        allowed_ordering = [
            "price",
            "-price",
            "rating",
            "-rating",
            "name",
            "-name",
            "created_at",
            "-created_at",
        ]

        if ordering not in allowed_ordering:
            ordering = "-created_at"

        # "-id" is a tie-breaker. Without it, products with the same
        # rating/price can swap places between pages, so the same
        # product appears twice and others never appear.
        queryset = queryset.order_by(ordering, "-id")

        return queryset.distinct()


class ProductDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = (
        Product.objects
        .select_related(
            "gender",
            "category",
            "product_type",
        )
        .prefetch_related(
            "variants__color",
            "variants__sizes",
            "variants__images",
        )
        .all()
    )

    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method in [
            "PUT",
            "PATCH",
            "DELETE",
        ]:
            return [IsAdminUser()]

        return [AllowAny()]