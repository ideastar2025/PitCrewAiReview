# ============================================
# pitcrew/urls.py - URL Configuration
# ============================================

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

# Import viewsets
from backend.repos.views import RepositoryViewSet
from backend.reviews.views import PullRequestViewSet, AIReviewViewSet

# Create router
router = DefaultRouter()
router.register(r'repositories', RepositoryViewSet, basename='repository')
router.register(r'pull-requests', PullRequestViewSet, basename='pullrequest')
router.register(r'reviews', AIReviewViewSet, basename='review')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/webhooks/', include('apps.webhooks.urls')),
    
    # API documentation (optional)
    # path('api/docs/', include('rest_framework.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# ============================================
# pitcrew/wsgi.py - WSGI Configuration
# ============================================

"""
WSGI config for pitcrew project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pitcrew.settings')

application = get_wsgi_application()


# ============================================
# pitcrew/asgi.py - ASGI Configuration
# ============================================

"""
ASGI config for pitcrew project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pitcrew.settings')

application = get_asgi_application()


# ============================================
# pitcrew/__init__.py - Package Initialization
# ============================================

# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
from .celery import app as celery_app

__all__ = ('celery_app',)


# ============================================
# pitcrew/celery.py - Celery Configuration
# ============================================

import os
from celery import Celery

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pitcrew.settings')

app = Celery('pitcrew')

# Load config from Django settings with 'CELERY' namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery"""
    print(f'Request: {self.request!r}')