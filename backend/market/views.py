import os
import stripe
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import SellerProfile, Order
from .serializers import SellerSerializer, OrderSerializer, RegisterSerializer

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


@api_view(["POST"]) # /auth/register
def register(request):
    ser = RegisterSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    ser.save()
    return Response({"ok": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_orders(request):
    email = request.user.email
    if not email:
        return Response({"detail": "seller_email is required"}, status=400)
    seller = get_object_or_404(SellerProfile, email=email)

    qs = Order.objects.filter(seller=seller).order_by("-created_at")
    paginator = PageNumberPagination()
    paginator.page_size = int(request.query_params.get("page_size", 20))
    page = paginator.paginate_queryset(qs, request)
    ser = OrderSerializer(page, many=True)
    return paginator.get_paginated_response(ser.data)


def _get_or_create_seller_for_user(user):
    # никаких публичных ensure — делаем это локально
    sp, _ = SellerProfile.objects.get_or_create(email=user.email, defaults={"user": user})
    if sp.user_id != user.id:
        sp.user = user
        sp.save(update_fields=["user"])
    return sp


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def connect_onboarding(request):
    """
    Начать/продолжить онбординг в Stripe Connect (Express).
    Idempotent: многократные вызовы безопасны.

    body: { "mode": "onboarding" | "update" } (опц., по умолчанию 'onboarding')
    resp: { onboarding_url, stripe_account_id, charges_enabled, details_submitted, requirements_currently_due }
    """
    user = request.user
    seller = _get_or_create_seller_for_user(user)

    # 1) создаём аккаунт, если его ещё нет
    if not seller.stripe_account_id:
        acct = stripe.Account.create(
            type="express",
            email=user.email,
            capabilities={
                "card_payments": {"requested": True},
                "transfers": {"requested": True},
            },
        )
        seller.stripe_account_id = acct["id"]
        seller.save(update_fields=["stripe_account_id"])
    else:
        acct = stripe.Account.retrieve(seller.stripe_account_id)

    # 2) выбираем тип ссылки: onboarding vs update
    mode = (request.data.get("mode") or "onboarding").lower()
    link_type = "account_onboarding" if mode == "onboarding" else "account_update"

    link = stripe.AccountLink.create(
        account=acct["id"],
        refresh_url=f"{FRONTEND_URL}/seller/onboarding?refresh=1",
        return_url=f"{FRONTEND_URL}/seller/return",
        type=link_type,
    )

    # 3) статусные поля
    charges_enabled = bool(acct.get("charges_enabled"))
    details_submitted = bool(acct.get("details_submitted"))
    requirements_currently_due = acct.get("requirements", {}).get("currently_due", [])

    return Response(
        {
            "onboarding_url": link["url"],
            "stripe_account_id": acct["id"],
            "charges_enabled": charges_enabled,
            "details_submitted": details_submitted,
            "requirements_currently_due": requirements_currently_due,
        }
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_stripe(request):
    """
    Статус Stripe для текущего пользователя/продавца.
    resp: { stripe_account_id, charges_enabled, payouts_enabled, details_submitted, requirements_currently_due }
    """
    user = request.user
    seller = _get_or_create_seller_for_user(user)
    if not seller.stripe_account_id:
        # ещё не начинал онбординг
        return Response(
            {
                "stripe_account_id": None,
                "charges_enabled": False,
                "payouts_enabled": False,
                "details_submitted": False,
                "requirements_currently_due": [],
            }
        )

    acct = stripe.Account.retrieve(seller.stripe_account_id)
    return Response(
        {
            "stripe_account_id": acct["id"],
            "charges_enabled": bool(acct.get("charges_enabled")),
            "payouts_enabled": bool(acct.get("payouts_enabled")),
            "details_submitted": bool(acct.get("details_submitted")),
            "requirements_currently_due": acct.get("requirements", {}).get("currently_due", []),
        }
    )


@api_view(["POST"]) # /payments/intents
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Создаёт PaymentIntent для покупателя → деньги уходят продавцу, комиссия остаётся платформе."""
    user = request.user
    seller = SellerProfile.objects.get(user=user)
    amount = int(request.data.get("amount", 0))
    buyer_email = request.data.get("buyer_email", "")
    fee = int(amount * 0.1)
    intent = stripe.PaymentIntent.create(
        amount=amount,
        currency="usd",
        automatic_payment_methods={"enabled": True},
        application_fee_amount=fee,
        transfer_data={"destination": seller.stripe_account_id},
        metadata={"seller_email": seller.email, "buyer_email": buyer_email},
    )
    Order.objects.update_or_create(
        payment_intent_id=intent.id,
        defaults={"seller": seller, "amount": amount, "fee": fee, "currency": "usd", "buyer_email": buyer_email or None,
                  "status": intent.status or "processing"},
    )
    return Response({"clientSecret": intent.client_secret, "paymentIntentId": intent.id})


@api_view(["POST"])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET"))
    except stripe.error.SignatureVerificationError:
        return Response(status=400)


    if event["type"] in {"payment_intent.succeeded", "payment_intent.canceled", "payment_intent.processing"}:
        pi = event["data"]["object"]
        pi_id = pi["id"]
        amount = pi.get("amount", 0)
        currency = pi.get("currency", "usd")
        status = pi.get("status", "processing")
        metadata = pi.get("metadata", {}) or {}
        seller_email = metadata.get("seller_email")
        buyer_email = metadata.get("buyer_email") or None

        if seller_email:
            try:
                seller = SellerProfile.objects.get(email=seller_email)
            except SellerProfile.DoesNotExist:
                seller = None
        else:
            seller = None

        fee = 0
        # Если хочешь точно знать комиссию из события, можно читать из Charge balance transaction.
        # Для MVP оставим значение из предварительной записи/по формуле.

        if seller:
            Order.objects.update_or_create(
                payment_intent_id=pi_id,
                defaults={
                    "seller": seller,
                    "amount": amount,
                    "fee": fee,
                    "currency": currency,
                    "buyer_email": buyer_email,
                    "status": status,
                },
            )

    return Response(status=200)
