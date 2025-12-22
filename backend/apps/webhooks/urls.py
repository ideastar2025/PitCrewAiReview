from django.urls import path
from . import views

app_name = 'webhooks'

urlpatterns = [
    # Add webhook endpoints here
    # path('github/', views.github_webhook, name='github'),
    # path('bitbucket/', views.bitbucket_webhook, name='bitbucket'),
]