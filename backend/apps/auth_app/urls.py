# ============================================
# apps/auth_app/urls.py
# ============================================

from django.urls import path
from . import views

urlpatterns = [
    path('github/callback/', views.github_login, name='github-callback'),
    path('bitbucket/callback/', views.bitbucket_login, name='bitbucket-callback'),
    path('me/', views.get_current_user, name='current-user'),
    path('logout/', views.logout_user, name='logout'),
]


# ============================================
# apps/auth_app/__init__.py
# ============================================

default_app_config = 'apps.auth_app.apps.AuthAppConfig'


# ============================================
# apps/auth_app/apps.py
# ============================================

from django.apps import AppConfig


class AuthAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.auth_app'
    verbose_name = 'Authentication'
    
    def ready(self):
        import backend.auth_app.models  # noqa