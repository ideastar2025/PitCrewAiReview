from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Repository
from .serializers import RepositorySerializer

class RepositoryViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing repository instances.
    """
    queryset = Repository.objects.all()
    serializer_class = RepositorySerializer
    permission_classes = [permissions.IsAuthenticated]

    # Optional: Custom action example
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """
        Custom endpoint to get repository details by ID.
        """
        repo = self.get_object()
        serializer = self.get_serializer(repo)
        return Response(serializer.data)
