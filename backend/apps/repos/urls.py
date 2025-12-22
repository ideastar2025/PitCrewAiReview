# apps/repos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RepositoryViewSet

# Create a router and register the viewset
router = DefaultRouter()
router.register(r'repositories', RepositoryViewSet, basename='repository')

# Include the router URLs
urlpatterns = [
    path('', include(router.urls)),
]
