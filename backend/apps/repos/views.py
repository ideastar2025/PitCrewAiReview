# Backend/repos/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Repository
from .serializers import RepositorySerializer
import requests

class RepositoryViewSet(viewsets.ModelViewSet):
    serializer_class = RepositorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Repository.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """List available repositories from GitHub/Bitbucket"""
        provider = request.query_params.get('provider', 'github')
        access_token = request.user.profile.access_token
        
        if not access_token:
            return Response(
                {'error': 'No access token found'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if provider == 'github':
            repos = self._fetch_github_repos(access_token)
        elif provider == 'bitbucket':
            repos = self._fetch_bitbucket_repos(access_token)
        else:
            return Response({'error': 'Invalid provider'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(repos)
    
    def _fetch_github_repos(self, token):
        headers = {'Authorization': f'token {token}'}
        response = requests.get('https://api.github.com/user/repos', headers=headers)
        
        if response.status_code != 200:
            return []
        
        repos = response.json()
        return [
            {
                'id': repo['id'],
                'name': repo['name'],
                'full_name': repo['full_name'],
                'url': repo['html_url'],
                'provider': 'github'
            }
            for repo in repos
        ]
    
    def _fetch_bitbucket_repos(self, token):
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get('https://api.bitbucket.org/2.0/repositories?role=member', headers=headers)
        
        if response.status_code != 200:
            return []
        
        repos = response.json().get('values', [])
        return [
            {
                'id': repo['uuid'],
                'name': repo['name'],
                'full_name': repo['full_name'],
                'url': repo['links']['html']['href'],
                'provider': 'bitbucket'
            }
            for repo in repos
        ]