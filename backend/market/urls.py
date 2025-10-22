from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views


urlpatterns = [
    # seller & connect
    path("connect/onboarding", views.connect_onboarding, name="connect_onboarding"),
    path("me/stripe", views.me_stripe, name="me_stripe"),

    # payments & orders
    path("payments/intents", views.create_payment_intent),
    path("orders", views.list_orders),
]