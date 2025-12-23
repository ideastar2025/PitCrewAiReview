from django.urls import path
from . import views

app_name = 'auth_app'

urlpatterns = [
    path('github/callback/', views.github_callback, name='github_callback'),
    path('bitbucket/callback/', views.bitbucket_callback, name='bitbucket_callback'),
    path('me/', views.get_current_user, name='current_user'),
    path('logout/', views.logout_view, name='logout'),
]