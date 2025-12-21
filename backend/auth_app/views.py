# ============================================
# apps/auth_app/views.py
# ============================================

import requests
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import UserProfile
from .serializers import UserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def github_login(request):
    """Handle GitHub OAuth callback"""
    
    code = request.data.get('code')
    if not code:
        return Response(
            {'error': 'Authorization code is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Exchange code for access token
    token_url = 'https://github.com/login/oauth/access_token'
    token_data = {
        'client_id': settings.GITHUB_CLIENT_ID,
        'client_secret': settings.GITHUB_CLIENT_SECRET,
        'code': code,
    }
    token_headers = {'Accept': 'application/json'}
    
    try:
        token_response = requests.post(token_url, data=token_data, headers=token_headers)
        token_response.raise_for_status()
        token_json = token_response.json()
        access_token = token_json.get('access_token')
        
        if not access_token:
            return Response(
                {'error': 'Failed to obtain access token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user info from GitHub
        user_url = 'https://api.github.com/user'
        user_headers = {'Authorization': f'token {access_token}'}
        user_response = requests.get(user_url, headers=user_headers)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        # Create or update user
        username = user_data.get('login')
        email = user_data.get('email') or f"{username}@github.com"
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': user_data.get('name', '').split()[0] if user_data.get('name') else '',
            }
        )
        
        # Update profile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.provider = 'github'
        profile.provider_id = str(user_data.get('id'))
        profile.access_token = access_token
        profile.avatar_url = user_data.get('avatar_url')
        profile.save()
        
        # Create or get token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
        
    except requests.RequestException as e:
        return Response(
            {'error': f'OAuth error: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def bitbucket_login(request):
    """Handle Bitbucket OAuth callback"""
    
    code = request.data.get('code')
    if not code:
        return Response(
            {'error': 'Authorization code is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Exchange code for access token
    token_url = 'https://bitbucket.org/site/oauth2/access_token'
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
    }
    
    try:
        token_response = requests.post(
            token_url,
            data=token_data,
            auth=(settings.BITBUCKET_CLIENT_ID, settings.BITBUCKET_CLIENT_SECRET)
        )
        token_response.raise_for_status()
        token_json = token_response.json()
        access_token = token_json.get('access_token')
        
        if not access_token:
            return Response(
                {'error': 'Failed to obtain access token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user info from Bitbucket
        user_url = 'https://api.bitbucket.org/2.0/user'
        user_headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_url, headers=user_headers)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        # Create or update user
        username = user_data.get('username')
        email = user_data.get('email') or f"{username}@bitbucket.com"
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': user_data.get('display_name', '').split()[0] if user_data.get('display_name') else '',
            }
        )
        
        # Update profile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.provider = 'bitbucket'
        profile.provider_id = user_data.get('uuid')
        profile.access_token = access_token
        profile.avatar_url = user_data.get('links', {}).get('avatar', {}).get('href')
        profile.save()
        
        # Create or get token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
        
    except requests.RequestException as e:
        return Response(
            {'error': f'OAuth error: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user by deleting token"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
