# backend/webhooks/utils.py
"""
Utility functions for webhook handling
"""
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def fetch_pr_diff(pull_request):
    """
    Fetch diff content for a pull request
    
    Args:
        pull_request: PullRequest model instance
        
    Returns:
        str: Diff content or None if failed
    """
    try:
        repo = pull_request.repository
        access_token = repo.user.profile.access_token
        
        if not access_token:
            logger.error(f"No access token for user {repo.user.id}")
            return None
        
        if repo.provider == 'github':
            return fetch_github_diff(pull_request, access_token)
        elif repo.provider == 'bitbucket':
            return fetch_bitbucket_diff(pull_request, access_token)
        else:
            logger.error(f"Unknown provider: {repo.provider}")
            return None
            
    except Exception as e:
        logger.error(f"Error fetching PR diff: {str(e)}", exc_info=True)
        return None


def fetch_github_diff(pull_request, access_token):
    """Fetch diff from GitHub API"""
    repo = pull_request.repository
    url = f"https://api.github.com/repos/{repo.full_name}/pulls/{pull_request.pr_number}"
    
    headers = {
        'Authorization': f'token {access_token}',
        'Accept': 'application/vnd.github.v3.diff'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        logger.error(f"GitHub diff fetch failed: {str(e)}")
        return None


def fetch_bitbucket_diff(pull_request, access_token):
    """Fetch diff from Bitbucket API"""
    repo = pull_request.repository
    workspace, repo_slug = repo.full_name.split('/', 1)
    url = f"https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/pullrequests/{pull_request.pr_number}/diff"
    
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        logger.error(f"Bitbucket diff fetch failed: {str(e)}")
        return None


def post_review_comment(pull_request, comment_text):
    """
    Post a review comment to the PR
    
    Args:
        pull_request: PullRequest model instance
        comment_text: Comment text to post
        
    Returns:
        bool: True if successful
    """
    try:
        repo = pull_request.repository
        access_token = repo.user.profile.access_token
        
        if not access_token:
            logger.error(f"No access token for user {repo.user.id}")
            return False
        
        if repo.provider == 'github':
            return post_github_comment(pull_request, access_token, comment_text)
        elif repo.provider == 'bitbucket':
            return post_bitbucket_comment(pull_request, access_token, comment_text)
        else:
            logger.error(f"Unknown provider: {repo.provider}")
            return False
            
    except Exception as e:
        logger.error(f"Error posting comment: {str(e)}", exc_info=True)
        return False


def post_github_comment(pull_request, access_token, comment_text):
    """Post comment to GitHub PR"""
    repo = pull_request.repository
    url = f"https://api.github.com/repos/{repo.full_name}/issues/{pull_request.pr_number}/comments"
    
    headers = {
        'Authorization': f'token {access_token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    data = {'body': comment_text}
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        response.raise_for_status()
        logger.info(f"Posted comment to GitHub PR #{pull_request.pr_number}")
        return True
    except requests.RequestException as e:
        logger.error(f"Failed to post GitHub comment: {str(e)}")
        return False


def post_bitbucket_comment(pull_request, access_token, comment_text):
    """Post comment to Bitbucket PR"""
    repo = pull_request.repository
    workspace, repo_slug = repo.full_name.split('/', 1)
    url = f"https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/pullrequests/{pull_request.pr_number}/comments"
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'content': {
            'raw': comment_text
        }
    }
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        response.raise_for_status()
        logger.info(f"Posted comment to Bitbucket PR #{pull_request.pr_number}")
        return True
    except requests.RequestException as e:
        logger.error(f"Failed to post Bitbucket comment: {str(e)}")
        return False