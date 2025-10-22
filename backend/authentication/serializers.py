from djoser.serializers import UserSerializer
from .models import User


class CustomUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = ("id", "email", "username", "role")
