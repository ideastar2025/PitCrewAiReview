from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import logout
import requests
from django.conf import settings

@api_view(['POST'])
@permission_classes([AllowAny])
def github_callback(request):
    """Handle GitHub OAuth callback"""
    code = request.data.get('code')
    
    if not code:
        return Response({'error': 'No code provided'}, status=400)
    
    try:
        # Exchange code for access token
        token_url = 'https://github.com/login/oauth/access_token'
        token_data = {
            'client_id': settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'code': code,
        }
        
        headers = {'Accept': 'application/json'}
        token_response = requests.post(token_url, data=token_data, headers=headers)
        token_response.raise_for_status()
        
        access_token = token_response.json().get('access_token')
        
        if not access_token:
            return Response({'error': 'Failed to get access token'}, status=400)
        
        # Get user info from GitHub
        user_response = requests.get(
            'https://api.github.com/user',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        user_response.raise_for_status()
        
        github_user = user_response.json()
        
        # Create or get user
        user, created = User.objects.get_or_create(
            username=github_user['login'],
            defaults={
                'email': github_user.get('email', ''),
                'first_name': github_user.get('name', '').split()[0] if github_user.get('name') else '',
            }
        )
        
        # Create or get auth token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
            }
        })
        
    except requests.RequestException as e:
        return Response({'error': f'GitHub API error: {str(e)}'}, status=500)
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def bitbucket_callback(request):
    """Handle Bitbucket OAuth callback"""
    code = request.data.get('code')
    
    if not code:
        return Response({'error': 'No code provided'}, status=400)
    
    # Similar implementation to GitHub
    return Response({'message': 'Bitbucket OAuth not yet implemented'}, status=501)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user and delete token"""
    try:
        request.user.auth_token.delete()
    except:
        pass
    
    logout(request)
    return Response({'message': 'Successfully logged out'})