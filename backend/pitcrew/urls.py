from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.decorators import api_view

# Simple health check endpoint
@api_view(['GET'])
def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'PitCrew AI Review API',
        'version': '1.0.0'
    })

# API root endpoint
@api_view(['GET'])
def api_root(request):
    return JsonResponse({
        'message': 'Welcome to PitCrew AI Review API',
        'endpoints': {
            'health': '/health/',
            'admin': '/admin/',
            'auth': {
                'github_callback': '/api/auth/github/callback/',
                'bitbucket_callback': '/api/auth/bitbucket/callback/',
                'current_user': '/api/auth/me/',
                'logout': '/api/auth/logout/',
            },
            'api': {
                'repos': '/api/repos/',
                'reviews': '/api/reviews/',
                'webhooks': '/api/webhooks/',
            },
        },
        'authentication': 'Token-based (Include "Authorization: Token YOUR_TOKEN" in headers)'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('', api_root, name='api_root'),
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/repos/', include('apps.repos.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/webhooks/', include('apps.webhooks.urls')),
    path('api-auth/', include('rest_framework.urls')),
]