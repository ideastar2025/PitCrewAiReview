# ============================================
# pitcrew/urls.py - URL Configuration
# ============================================

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

# Import viewsets
from repos.views import RepositoryViewSet
from reviews.views import PullRequestViewSet, AIReviewViewSet

# Create router
router = DefaultRouter()
router.register(r'repositories', RepositoryViewSet, basename='repository')
router.register(r'pull_requests', PullRequestViewSet, basename='pullrequest')
router.register(r'ai_reviews', AIReviewViewSet, basename='review')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/webhooks/', include('apps.webhooks.urls')),
    
    path('api/repos/', include('apps.repos.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    
    # API documentation (optional)
    # path('api/docs/', include('rest_framework.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


