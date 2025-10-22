from django.contrib import admin
from django.forms import BaseInlineFormSet
from mptt.admin import MPTTModelAdmin

from .models import SellerProfile, Order, Product, Category, ProductImage


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    pass


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    pass


@admin.register(Category)
class CategoryAdmin(MPTTModelAdmin):
    mptt_level_indent = 20
    list_display = ("name", "parent")


class ProductImageInlineFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()
        main_count = 0
        for form in self.forms:
            if not hasattr(form, "cleaned_data"):
                continue
            # пропускаем удаляемые формы
            if form.cleaned_data.get("DELETE"):
                continue
            if form.cleaned_data.get("is_main"):
                main_count += 1

        if main_count > 1:
            from django.core.exceptions import ValidationError
            raise ValidationError("У товара может быть только одна главная картинка.")

        # Не обязательно, но удобно: если картинка единственная — сделать её главной
        if main_count == 0:
            # Если хотя бы одна форма не удаляется и имеет картинку — пометим первую как главную
            for form in self.forms:
                if form.cleaned_data.get("DELETE"):
                    continue
                img = form.cleaned_data.get("image")
                if img:
                    form.cleaned_data["is_main"] = True
                    break


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    formset = ProductImageInlineFormSet
    fields = ("preview", "image", "is_main", "position")
    readonly_fields = ("preview",)
    ordering = ("position", "id")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "main_image_thumb")
    search_fields = ("name", "slug")
    inlines = [ProductImageInline]

    def main_image_thumb(self, obj):
        img = obj.main_image()
        if img and img.image:
            return img.preview()
        return "—"
    main_image_thumb.short_description = "Main"
