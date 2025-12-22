# apps/webhooks/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('github/', views.GitHubWebhookView.as_view(), name='github-webhook'),
    path('generic/', views.GenericWebhookView.as_view(), name='generic-webhook'),
]
