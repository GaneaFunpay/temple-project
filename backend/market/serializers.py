from django.contrib.auth.models import User
from rest_framework import serializers
from .models import SellerProfile, Order


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ("username", "email", "password")

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # автосоздание SellerProfile по email
        sp, _ = SellerProfile.objects.get_or_create(email=user.email)
        sp.user = user
        sp.save()
        return user


class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = [
            "id",
            "email",
            "stripe_account_id",
            "charges_enabled",
            "details_submitted",
            "created_at"
        ]


class OrderSerializer(serializers.ModelSerializer):
    seller_email = serializers.EmailField(source="seller.email", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "seller",
            "payment_intent_id",
            "amount",
            "fee",
            "currency",
            "buyer_email",
            "status",
            "created_at",
            "seller_email",
        ]
