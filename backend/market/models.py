import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.utils.text import slugify
from mptt.fields import TreeForeignKey
from mptt.models import MPTTModel


class SellerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seller_profile",null=True, blank=True)
    email = models.EmailField(unique=True)
    stripe_account_id = models.CharField(max_length=255, blank=True, null=True)
    charges_enabled = models.BooleanField(default=False)
    details_submitted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class Order(models.Model):
    STATUS_CHOICES = [
        ("requires_payment_method", "requires_payment_method"),
        ("processing", "processing"),
        ("succeeded", "succeeded"),
        ("canceled", "canceled"),
    ]

    seller = models.ForeignKey(SellerProfile, on_delete=models.PROTECT, related_name="orders")
    payment_intent_id = models.CharField(max_length=255, unique=True)
    amount = models.IntegerField() # cents
    fee = models.IntegerField(default=0) # cents
    currency = models.CharField(max_length=10, default="usd")
    buyer_email = models.EmailField(blank=True, null=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="processing")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payment_intent_id} — {self.amount} {self.currency} ({self.status})"


class Category(MPTTModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    parent = TreeForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="children")

    class MPTTMeta:
        order_insertion_by = ["name"]

    class Meta:
        unique_together = [("parent", "slug")]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            # чтобы одинаковые названия не конфликтовали под разными родителями
            if Category.objects.filter(parent=self.parent, slug=base_slug).exists():
                base_slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
            self.slug = base_slug
        super().save(*args, **kwargs)


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    categories = models.ManyToManyField(Category, related_name="products", blank=True)

    def main_image(self):
        img = self.images.filter(is_main=True).first()
        return img or self.images.order_by("position", "id").first()

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="products/%Y/%m/%d/")
    is_main = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)

    def preview(self):
        if self.image:
            return mark_safe(f'<img src="{self.image.url}" width="80" style="border-radius:6px;object-fit:cover;"/>')
        return "—"

    preview.short_description = "Preview"

    class Meta:
        ordering = ["position", "id"]
        # Гарантия: только ОДНА главная картинка на продукт
        constraints = [
            models.UniqueConstraint(
                fields=["product"],
                condition=Q(is_main=True),
                name="unique_main_image_per_product",
            )
        ]

    def __str__(self):
        return f"{self.product} #{self.pk}"
