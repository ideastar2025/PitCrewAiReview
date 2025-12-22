# apps/auth_app/serializers.py
# ============================================

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    Used to serialize and deserialize user data.
    """

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'date_joined',
        ]
        read_only_fields = ['id', 'is_active', 'date_joined']


class AuthLoginSerializer(serializers.Serializer):
    """
    Serializer for login via third-party services (e.g., GitHub, Bitbucket).
    This serializer can be extended if you want to accept auth tokens from frontend.
    """
    code = serializers.CharField(required=True, help_text="Authorization code from provider")


class AuthTokenSerializer(serializers.Serializer):
    """
    Serializer for returning authentication token after login.
    """
    token = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)
