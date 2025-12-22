from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from repos.models import Repository  # ✅ Import Repository from repos app
from repos.serializers import RepositorySerializer  # ✅ Serializer from repos
from django.db import models
from repos.models import Repository 
from reviews.models import PullRequest, AIReview
import requests
import logging

logger = logging.getLogger(__name__)


class PullRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing repositories (for Pull Requests).
    """
    serializer_class = RepositorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Repository.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def available(self, request):
        provider = request.query_params.get('provider', 'github')

        try:
            access_token = request.user.profile.access_token
        except AttributeError:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not access_token:
            return Response(
                {'error': 'No access token found'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            if provider == 'github':
                repos = self._fetch_github_repos(access_token)
            elif provider == 'bitbucket':
                repos = self._fetch_bitbucket_repos(access_token)
            else:
                return Response(
                    {'error': 'Invalid provider'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(repos, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"{provider} repo fetch failed: {e}")
            return Response(
                {'error': 'Failed to fetch repositories'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Other actions remain the same (toggle_active, setup_webhook, etc.)
    # ...

    # ---------- PROVIDER HELPERS ----------
    # _fetch_github_repos, _fetch_bitbucket_repos, _setup_github_webhook, _setup_bitbucket_webhook
    # ... remain the same


class AIReviewViewSet(viewsets.ViewSet):
    """
    AI-powered Pull Request review logic
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def review(self, request):
        return Response({
            "status": "success",
            "message": "AI Review triggered (logic coming next)"
        })
