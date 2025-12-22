from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from reviews.models import Repository
from reviews.serializers import RepositorySerializer
import requests
import logging

logger = logging.getLogger(__name__)


class PullRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing pull requests & repositories
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

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        repo = self.get_object()
        repo.is_active = not repo.is_active
        repo.save()
        return Response(self.get_serializer(repo).data)

    @action(detail=True, methods=['post'])
    def setup_webhook(self, request, pk=None):
        repository = self.get_object()
        token = request.user.profile.access_token

        try:
            if repository.provider == 'github':
                webhook_id = self._setup_github_webhook(repository, token)
            elif repository.provider == 'bitbucket':
                webhook_id = self._setup_bitbucket_webhook(repository, token)
            else:
                return Response({'error': 'Unsupported provider'}, status=400)

            repository.webhook_id = webhook_id
            repository.save()
            return Response({'webhook_id': webhook_id})

        except Exception as e:
            logger.error(e)
            return Response({'error': 'Webhook setup failed'}, status=500)

    # ---------- PROVIDER HELPERS ----------

    def _fetch_github_repos(self, token):
        headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json'
        }

        response = requests.get(
            'https://api.github.com/user/repos',
            headers=headers,
            timeout=10
        )

        response.raise_for_status()

        return [
            {
                'id': repo['id'],
                'name': repo['name'],
                'full_name': repo['full_name'],
                'url': repo['html_url'],
                'provider': 'github'
            }
            for repo in response.json()
        ]

    def _fetch_bitbucket_repos(self, token):
        headers = {'Authorization': f'Bearer {token}'}

        response = requests.get(
            'https://api.bitbucket.org/2.0/repositories',
            headers=headers,
            timeout=10
        )

        response.raise_for_status()

        return [
            {
                'id': repo['uuid'],
                'name': repo['name'],
                'full_name': repo['full_name'],
                'url': repo['links']['html']['href'],
                'provider': 'bitbucket'
            }
            for repo in response.json().get('values', [])
        ]

    def _setup_github_webhook(self, repository, token):
        headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json'
        }

        payload = {
            'name': 'web',
            'active': True,
            'events': ['pull_request'],
            'config': {
                'url': f"{settings.BACKEND_URL}/api/webhooks/github/",
                'content_type': 'json'
            }
        }

        response = requests.post(
            f'https://api.github.com/repos/{repository.full_name}/hooks',
            headers=headers,
            json=payload,
            timeout=10
        )

        response.raise_for_status()
        return response.json()['id']

    def _setup_bitbucket_webhook(self, repository, token):
        headers = {'Authorization': f'Bearer {token}'}

        payload = {
            'description': 'PitCrew AI Webhook',
            'url': f"{settings.BACKEND_URL}/api/webhooks/bitbucket/",
            'active': True,
            'events': ['pullrequest:created']
        }

        response = requests.post(
            f'https://api.bitbucket.org/2.0/repositories/{repository.full_name}/hooks',
            headers=headers,
            json=payload,
            timeout=10
        )

        response.raise_for_status()
        return response.json()['uuid']


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
