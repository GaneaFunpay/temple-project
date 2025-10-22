from django.urls import path
from .views import CookieTokenRefreshView, CookieTokenObtainPairView

urlpatterns = [
    path("jwt/refresh-cookie/", CookieTokenRefreshView.as_view(), name="jwt-cookie-refresh"),
    path("jwt/create/", CookieTokenObtainPairView.as_view(), name="jwt-cookie-create"),
]