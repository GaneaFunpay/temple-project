from django.conf import settings

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView


class CookieTokenRefreshView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])
        if not refresh_token:
            return Response({"detail": "No refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            new_token = RefreshToken(refresh_token)
            access = str(new_token.access_token)
            new_refresh = str(new_token)
        except Exception:
            return Response({"detail": "Invalid refresh"}, status=status.HTTP_401_UNAUTHORIZED)

        resp = Response({"access": access})
        resp.set_cookie(
            settings.SIMPLE_JWT["AUTH_COOKIE"],
            new_refresh,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/",
        )
        return resp


class CookieTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/jwt/create/
    Тело: {username/email, password}
    Ответ: {"access": "..."} + Set-Cookie: refresh_token=...; HttpOnly
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)  # data: {access, refresh}
        data = response.data
        refresh = data.get("refresh")
        access = data.get("access")
        resp = Response({"access": access})
        if refresh:
            resp.set_cookie(
                settings.SIMPLE_JWT["AUTH_COOKIE"],
                refresh,
                httponly=True,
                secure=False,          # True на проде
                samesite="Lax",
                path="/",
            )
        return resp
