from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        (
            "cart",
            "0003_remove_cartitem_unique_variant_per_cart_and_more",
        ),
    ]

    operations = [
        migrations.AlterField(
            model_name="cartitem",
            name="product_variant",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="cart_items",
                to="products.productvariant",
            ),
        ),
        migrations.AlterField(
            model_name="cartitem",
            name="selected_size",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="cart_items",
                to="products.size",
            ),
        ),
    ]