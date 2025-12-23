from django.urls import path
from .views import github_webhook, bitbucket_webhook

app_name = 'webhooks'

urlpatterns = [
    path('github/', github_webhook, name='github_webhook'),
    path('bitbucket/', bitbucket_webhook, name='bitbucket_webhook'),
]