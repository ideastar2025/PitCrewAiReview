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
            'admin': '/dashboard/',
            'api': {
                'auth': '/api/auth/',
                'repositories': '/api/repos/',
                'reviews': '/api/reviews/',
                'webhooks': '/api/webhooks/',
            },
            'docs': '/api/docs/',
        }
    })

urlpatterns = [
    # Admin
    path('dashboard/', admin.site.urls),
    
    # Health check
    path('health/', health_check, name='health_check'),
    
    # API root
    path('', api_root, name='api_root'),
    
    # API endpoints
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/repos/', include('apps.repos.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/webhooks/', include('apps.webhooks.urls')),
    
    # REST Framework browsable API auth
    path('api-auth/', include('rest_framework.urls')),
]