from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class RepositoryViewSet(viewsets.ViewSet):
    """ViewSet for Repository operations"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """List all repositories"""
        return Response({
            'message': 'Repositories list endpoint',
            'repositories': []
        })
    
    def retrieve(self, request, pk=None):
        """Get a specific repository"""
        return Response({
            'id': pk,
            'message': 'Repository detail endpoint'
        })
    
    def create(self, request):
        """Create/add a new repository"""
        return Response({
            'message': 'Repository added',
            'data': request.data
        })