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

