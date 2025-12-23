from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RepositoryViewSet

router = DefaultRouter()
router.register(r'repositories', RepositoryViewSet, basename='repository')

app_name = 'repos'

urlpatterns = [
    path('', include(router.urls)),
]