from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def github_webhook(request):
    """Handle GitHub webhook events"""
    event = request.headers.get('X-GitHub-Event', 'unknown')
    logger.info(f'Received GitHub webhook: {event}')
    
    return Response({
        'status': 'received',
        'event': event
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def bitbucket_webhook(request):
    """Handle Bitbucket webhook events"""
    event = request.headers.get('X-Event-Key', 'unknown')
    logger.info(f'Received Bitbucket webhook: {event}')
    
    return Response({
        'status': 'received',
        'event': event
    })