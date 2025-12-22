from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RepositoryViewSet

app_name = 'repos'

router = DefaultRouter()
router.register(r'repositories', RepositoryViewSet, basename='repository')

urlpatterns = [
    path('', include(router.urls)),
]