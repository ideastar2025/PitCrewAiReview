# Backend/repos/serializers.py
from rest_framework import serializers
from .models import Repository

class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = ['id', 'name', 'description', 'url', 'private', 'owner', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']