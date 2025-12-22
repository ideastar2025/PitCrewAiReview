# ============================================
# pitcrew/urls.py - URL Configuration
# ============================================

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/repos/', include('apps.repos.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/webhooks/', include('apps.webhooks.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)