import os
from pathlib import Path

# Define the app structures
apps = {
    'reviews': {
        'views.py': '''from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class ReviewViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        return Response({'message': 'Reviews endpoint'})

class PullRequestViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        return Response({'message': 'Pull requests endpoint'})

class ReviewCommentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        return Response({'message': 'Comments endpoint'})
''',
        'urls.py': '''from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, PullRequestViewSet, ReviewCommentViewSet

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'pull-requests', PullRequestViewSet, basename='pullrequest')
router.register(r'comments', ReviewCommentViewSet, basename='comment')

app_name = 'reviews'
urlpatterns = [path('', include(router.urls))]
'''
    }
}

for app_name, files in apps.items():
    app_path = Path('apps') / app_name
    for filename, content in files.items():
        file_path = app_path / filename
        file_path.write_text(content)
        print(f'✓ Created {file_path}')

print('\n✓ All files created!')