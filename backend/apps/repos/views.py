from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Repository
from .serializers import RepositorySerializer
import logging

logger = logging.getLogger(__name__)

class RepositoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Repository operations"""
    permission_classes = [IsAuthenticated]
    serializer_class = RepositorySerializer
    
    def get_queryset(self):
        """Get repositories for the current user"""
        return Repository.objects.filter(owner=self.request.user)
    
    def list(self, request):
        """List all repositories for the current user"""
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'count': queryset.count(),
                'repositories': serializer.data
            })
        except Exception as e:
            logger.error(f"Error listing repositories: {str(e)}")
            return Response(
                {'error': 'Failed to fetch repositories'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, pk=None):
        """Get a specific repository"""
        try:
            repository = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(repository)
            return Response(serializer.data)
        except Repository.DoesNotExist:
            return Response(
                {'error': 'Repository not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving repository: {str(e)}")
            return Response(
                {'error': 'Failed to fetch repository'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def create(self, request):
        """Create/add a new repository"""
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save(owner=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating repository: {str(e)}")
            return Response(
                {'error': 'Failed to create repository'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Sync repository data"""
        try:
            repository = self.get_queryset().get(pk=pk)
            # Add sync logic here
            return Response({
                'message': f'Repository {repository.name} synced successfully',
                'repository': self.get_serializer(repository).data
            })
        except Repository.DoesNotExist:
            return Response(
                {'error': 'Repository not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error syncing repository: {str(e)}")
            return Response(
                {'error': 'Failed to sync repository'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )