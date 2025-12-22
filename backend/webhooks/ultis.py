"""
Utility functions for webhook handling and processing
"""
import hashlib
import hmac
import logging
import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


# ============================================================================
# SIGNATURE VERIFICATION
# ============================================================================

def verify_webhook_signature(payload_body: bytes, signature: str, secret: str, algorithm: str = 'sha256') -> bool:
    """
    Verify webhook signature using HMAC
    
    Args:
        payload_body: Raw request body (bytes)
        signature: Signature from webhook header
        secret: Webhook secret
        algorithm: Hash algorithm (default: sha256)
        
    Returns:
        Boolean indicating if signature is valid
    """
    if not secret:
        logger.warning("No webhook secret configured, skipping signature verification")
        return True
    
    try:
        # Create HMAC hash
        hash_object = hmac.new(
            secret.encode('utf-8'),
            msg=payload_body,
            digestmod=getattr(hashlib, algorithm)
        )
        
        # Format expected signature based on provider
        if algorithm == 'sha256':
            expected_signature = f"sha256={hash_object.hexdigest()}"
        elif algorithm == 'sha1':
            expected_signature = f"sha1={hash_object.hexdigest()}"
        else:
            expected_signature = hash_object.hexdigest()
        
        # Compare signatures using constant-time comparison
        return hmac.compare_digest(expected_signature, signature)
        
    except Exception as e:
        logger.error(f"Error verifying webhook signature: {str(e)}")
        return False


def verify_github_signature(payload_body: bytes, signature: str, secret: str) -> bool:
    """
    Verify GitHub webhook signature (SHA-256)
    
    Args:
        payload_body: Raw request body
        signature: X-Hub-Signature-256 header value
        secret: GitHub webhook secret
        
    Returns:
        Boolean indicating if signature is valid
    """
    return verify_webhook_signature(payload_body, signature, secret, 'sha256')


def verify_bitbucket_signature(payload_body: bytes, signature: str, secret: str) -> bool:
    """
    Verify Bitbucket webhook signature (SHA-256)
    
    Args:
        payload_body: Raw request body
        signature: X-Hub-Signature header value
        secret: Bitbucket webhook secret
        
    Returns:
        Boolean indicating if signature is valid
    """
    return verify_webhook_signature(payload_body, signature, secret, 'sha256')


# ============================================================================
# DIFF PARSING
# ============================================================================

def extract_files_from_diff(diff_content: str) -> List[str]:
    """
    Extract list of changed files from diff content
    
    Args:
        diff_content: Git diff string
        
    Returns:
        List of file paths
    """
    files = []
    
    for line in diff_content.split('\n'):
        if line.startswith('diff --git'):
            # Extract file path from "diff --git a/path/to/file b/path/to/file"
            parts = line.split()
            if len(parts) >= 4:
                file_path = parts[2][2:]  # Remove "a/" prefix
                if file_path not in files:
                    files.append(file_path)
    
    return files


def count_changes_in_diff(diff_content: str) -> Dict[str, int]:
    """
    Count additions and deletions in a diff
    
    Args:
        diff_content: Git diff string
        
    Returns:
        Dictionary with 'additions', 'deletions', and 'total' counts
    """
    additions = 0
    deletions = 0
    
    for line in diff_content.split('\n'):
        if line.startswith('+') and not line.startswith('+++'):
            additions += 1
        elif line.startswith('-') and not line.startswith('---'):
            deletions += 1
    
    return {
        'additions': additions,
        'deletions': deletions,
        'total': additions + deletions
    }


def extract_changed_functions(diff_content: str) -> List[Dict[str, str]]:
    """
    Extract information about changed functions from diff
    
    Args:
        diff_content: Git diff string
        
    Returns:
        List of dictionaries with function information
    """
    functions = []
    current_file = None
    
    for line in diff_content.split('\n'):
        # Track current file
        if line.startswith('diff --git'):
            parts = line.split()
            if len(parts) >= 4:
                current_file = parts[2][2:]
        
        # Look for function definitions in diff hunks
        elif line.startswith('@@'):
            # Extract function name from hunk header
            match = re.search(r'@@.*?@@\s*(.+)', line)
            if match and current_file:
                func_name = match.group(1).strip()
                if func_name:
                    functions.append({
                        'file': current_file,
                        'function': func_name
                    })
    
    return functions


def get_diff_statistics(diff_content: str) -> Dict:
    """
    Get comprehensive statistics about a diff
    
    Args:
        diff_content: Git diff string
        
    Returns:
        Dictionary with various diff statistics
    """
    files = extract_files_from_diff(diff_content)
    changes = count_changes_in_diff(diff_content)
    
    # Count files by type
    file_types = {}
    for file in files:
        ext = file.split('.')[-1] if '.' in file else 'no_ext'
        file_types[ext] = file_types.get(ext, 0) + 1
    
    return {
        'total_files': len(files),
        'files': files,
        'additions': changes['additions'],
        'deletions': changes['deletions'],
        'total_changes': changes['total'],
        'file_types': file_types,
        'lines_of_code': changes['additions'] - changes['deletions']
    }


# ============================================================================
# REVIEW COMMENT FORMATTING
# ============================================================================

def format_review_comment(ai_review) -> str:
    """
    Format AI review as a markdown comment for posting to PR
    
    Args:
        ai_review: AIReview instance
        
    Returns:
        Formatted markdown string
    """
    pr = ai_review.pull_request
    issues = ai_review.issues.all()
    
    # Determine emoji based on risk score
    if ai_review.risk_score < 30:
        risk_emoji = "✅"
        risk_label = "Low Risk"
    elif ai_review.risk_score < 60:
        risk_emoji = "⚠️"
        risk_label = "Medium Risk"
    else:
        risk_emoji = "🚨"
        risk_label = "High Risk"
    
    # Build comment header
    comment_parts = [
        "## 🤖 PitCrew AI Code Review\n\n",
        f"**Risk Score:** {risk_emoji} {ai_review.risk_score}/100 ({risk_label})\n",
        f"**Deployment Ready:** {'✅ Yes' if ai_review.deployment_ready else '❌ No'}\n",
        f"**Reviewed at:** {ai_review.created_at.strftime('%Y-%m-%d %H:%M UTC')}\n\n",
        "---\n\n"
    ]
    
    # Add summary
    comment_parts.append(f"### 📋 Summary\n{ai_review.summary}\n\n")
    
    # Add deployment blockers if any
    blockers = ai_review.analysis_data.get('blockers', [])
    if blockers:
        comment_parts.append("### 🚨 Deployment Blockers\n\n")
        for blocker in blockers:
            comment_parts.append(f"- {blocker}\n")
        comment_parts.append("\n")
    
    # Add issues by severity
    high_issues = issues.filter(severity='high')
    medium_issues = issues.filter(severity='medium')
    low_issues = issues.filter(severity='low')
    
    if high_issues.exists():
        comment_parts.append("### 🔴 High Severity Issues\n\n")
        for i, issue in enumerate(high_issues, 1):
            comment_parts.append(f"**{i}. {issue.title}**\n")
            comment_parts.append(f"- **File:** `{issue.file_path}` (Line {issue.line_number})\n")
            comment_parts.append(f"- **Issue:** {issue.suggestion}\n\n")
    
    if medium_issues.exists():
        comment_parts.append("### 🟡 Medium Severity Issues\n\n")
        for i, issue in enumerate(medium_issues, 1):
            comment_parts.append(f"**{i}. {issue.title}**\n")
            comment_parts.append(f"- **File:** `{issue.file_path}` (Line {issue.line_number})\n")
            comment_parts.append(f"- **Issue:** {issue.suggestion}\n\n")
    
    if low_issues.exists():
        comment_parts.append("### 🟢 Low Severity Issues\n\n")
        for i, issue in enumerate(low_issues, 1):
            comment_parts.append(f"**{i}. {issue.title}**\n")
            comment_parts.append(f"- **File:** `{issue.file_path}` (Line {issue.line_number})\n")
            comment_parts.append(f"- **Suggestion:** {issue.suggestion}\n\n")
    
    # Add recommendations
    recommendations = ai_review.analysis_data.get('recommendations', [])
    if recommendations:
        comment_parts.append("### 💡 Recommendations\n\n")
        for rec in recommendations:
            comment_parts.append(f"- {rec}\n")
        comment_parts.append("\n")
    
    # Add strengths
    strengths = ai_review.analysis_data.get('strengths', [])
    if strengths:
        comment_parts.append("### ✨ Strengths\n\n")
        for strength in strengths:
            comment_parts.append(f"- {strength}\n")
        comment_parts.append("\n")
    
    # Add footer
    comment_parts.append("---\n")
    comment_parts.append("*🤖 Powered by [PitCrew AI](https://pitcrew.dev) • ")
    comment_parts.append(f"Review ID: {ai_review.id}*\n")
    
    return ''.join(comment_parts)


def format_summary_comment(ai_review) -> str:
    """
    Format a short summary comment (for use in PR status checks)
    
    Args:
        ai_review: AIReview instance
        
    Returns:
        Short summary string
    """
    status = "✅ Ready" if ai_review.deployment_ready else "❌ Blocked"
    risk = f"{ai_review.risk_score}/100"
    issues_count = ai_review.issues.count()
    
    return f"{status} • Risk: {risk} • Issues: {issues_count}"


# ============================================================================
# WEBHOOK REGISTRATION
# ============================================================================

def register_webhook(repository, webhook_url: str) -> Optional[str]:
    """
    Register webhook with GitHub or Bitbucket
    
    Args:
        repository: Repository instance
        webhook_url: URL to receive webhooks
        
    Returns:
        Webhook ID if successful, None otherwise
    """
    import requests
    from django.conf import settings
    
    try:
        access_token = getattr(repository.user.profile, 'access_token', None)
        if not access_token:
            logger.error(f"No access token for repository {repository.id}")
            return None
        
        if repository.provider == 'github':
            return register_github_webhook(repository, webhook_url, access_token)
        elif repository.provider == 'bitbucket':
            return register_bitbucket_webhook(repository, webhook_url, access_token)
        else:
            logger.error(f"Unknown provider: {repository.provider}")
            return None
        
    except Exception as e:
        logger.error(f"Error registering webhook: {str(e)}", exc_info=True)
        return None


def register_github_webhook(repository, webhook_url: str, access_token: str) -> Optional[str]:
    """
    Register webhook with GitHub
    
    Args:
        repository: Repository instance
        webhook_url: Webhook URL
        access_token: GitHub access token
        
    Returns:
        Webhook ID if successful
    """
    import requests
    from django.conf import settings
    
    url = f"https://api.github.com/repos/{repository.full_name}/hooks"
    headers = {
        'Authorization': f'token {access_token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    data = {
        'name': 'web',
        'active': True,
        'events': ['pull_request', 'pull_request_review', 'pull_request_review_comment'],
        'config': {
            'url': webhook_url,
            'content_type': 'json',
            'insecure_ssl': '0'
        }
    }
    
    # Add secret if configured
    webhook_secret = getattr(settings, 'GITHUB_WEBHOOK_SECRET', None)
    if webhook_secret:
        data['config']['secret'] = webhook_secret
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        if response.status_code == 201:
            webhook_data = response.json()
            webhook_id = str(webhook_data['id'])
            logger.info(f"Registered GitHub webhook: {webhook_id} for {repository.full_name}")
            return webhook_id
        else:
            logger.error(f"Failed to register GitHub webhook: {response.status_code} - {response.text}")
            return None
            
    except requests.RequestException as e:
        logger.error(f"Request error registering GitHub webhook: {str(e)}")
        return None


def register_bitbucket_webhook(repository, webhook_url: str, access_token: str) -> Optional[str]:
    """
    Register webhook with Bitbucket
    
    Args:
        repository: Repository instance
        webhook_url: Webhook URL
        access_token: Bitbucket access token
        
    Returns:
        Webhook ID if successful
    """
    import requests
    
    workspace, repo_slug = repository.full_name.split('/', 1)
    url = f"https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/hooks"
    headers = {'Authorization': f'Bearer {access_token}'}
    
    data = {
        'description': 'PitCrew AI Code Review',
        'url': webhook_url,
        'active': True,
        'events': [
            'pullrequest:created',
            'pullrequest:updated',
            'pullrequest:fulfilled',
            'pullrequest:rejected',
            'pullrequest:comment_created'
        ]
    }
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        if response.status_code == 201:
            webhook_data = response.json()
            webhook_id = webhook_data['uuid']
            logger.info(f"Registered Bitbucket webhook: {webhook_id} for {repository.full_name}")
            return webhook_id
        else:
            logger.error(f"Failed to register Bitbucket webhook: {response.status_code} - {response.text}")
            return None
            
    except requests.RequestException as e:
        logger.error(f"Request error registering Bitbucket webhook: {str(e)}")
        return None


def unregister_webhook(repository) -> bool:
    """
    Unregister webhook from GitHub or Bitbucket
    
    Args:
        repository: Repository instance with webhook_id
        
    Returns:
        Boolean indicating success
    """
    import requests
    
    if not repository.webhook_id:
        logger.info(f"No webhook ID for repository {repository.id}")
        return True
    
    try:
        access_token = getattr(repository.user.profile, 'access_token', None)
        if not access_token:
            logger.error(f"No access token for repository {repository.id}")
            return False
        
        if repository.provider == 'github':
            url = f"https://api.github.com/repos/{repository.full_name}/hooks/{repository.webhook_id}"
            headers = {
                'Authorization': f'token {access_token}',
                'Accept': 'application/vnd.github.v3+json'
            }
            response = requests.delete(url, headers=headers, timeout=30)
            
        elif repository.provider == 'bitbucket':
            workspace, repo_slug = repository.full_name.split('/', 1)
            url = f"https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/hooks/{repository.webhook_id}"
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.delete(url, headers=headers, timeout=30)
        
        else:
            logger.error(f"Unknown provider: {repository.provider}")
            return False
        
        if response.status_code in [204, 404]:
            logger.info(f"Unregistered webhook for repository {repository.id}")
            repository.webhook_id = None
            repository.save()
            return True
        else:
            logger.error(f"Failed to unregister webhook: {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"Error unregistering webhook: {str(e)}", exc_info=True)
        return False


# ============================================================================
# ISSUE SEVERITY ANALYSIS
# ============================================================================

def calculate_severity_score(issues) -> int:
    """
    Calculate overall severity score from issues
    
    Args:
        issues: QuerySet of ReviewIssue
        
    Returns:
        Severity score (0-100)
    """
    severity_weights = {
        'high': 10,
        'medium': 5,
        'low': 2
    }
    
    total_score = 0
    for issue in issues:
        weight = severity_weights.get(issue.severity, 0)
        total_score += weight
    
    # Cap at 100
    return min(100, total_score * 2)


def group_issues_by_file(issues) -> Dict[str, List]:
    """
    Group issues by file path
    
    Args:
        issues: QuerySet of ReviewIssue
        
    Returns:
        Dictionary mapping file paths to lists of issues
    """
    grouped = {}
    
    for issue in issues:
        file_path = issue.file_path
        if file_path not in grouped:
            grouped[file_path] = []
        grouped[file_path].append(issue)
    
    return grouped


def get_issue_statistics(issues) -> Dict:
    """
    Get statistics about review issues
    
    Args:
        issues: QuerySet of ReviewIssue
        
    Returns:
        Dictionary with issue statistics
    """
    stats = {
        'total': issues.count(),
        'high': issues.filter(severity='high').count(),
        'medium': issues.filter(severity='medium').count(),
        'low': issues.filter(severity='low').count(),
        'files_affected': len(set(issue.file_path for issue in issues))
    }
    
    return stats


# ============================================================================
# TIME & DATE UTILITIES
# ============================================================================

def calculate_review_time(pr) -> Optional[timedelta]:
    """
    Calculate time taken for AI review
    
    Args:
        pr: PullRequest instance
        
    Returns:
        timedelta if review exists, None otherwise
    """
    try:
        ai_review = pr.ai_review
        return ai_review.created_at - pr.created_at
    except:
        return None


def format_time_ago(dt: datetime) -> str:
    """
    Format datetime as "X time ago"
    
    Args:
        dt: datetime object
        
    Returns:
        Human-readable time string
    """
    from django.utils import timezone
    
    now = timezone.now()
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    elif seconds < 2592000:
        days = int(seconds / 86400)
        return f"{days} day{'s' if days != 1 else ''} ago"
    else:
        months = int(seconds / 2592000)
        return f"{months} month{'s' if months != 1 else ''} ago"


# ============================================================================
# DATA VALIDATION
# ============================================================================

def validate_webhook_payload(payload: Dict, provider: str) -> Tuple[bool, Optional[str]]:
    """
    Validate webhook payload structure
    
    Args:
        payload: Webhook payload dictionary
        provider: 'github' or 'bitbucket'
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if provider == 'github':
        required_fields = ['pull_request', 'repository', 'action']
        for field in required_fields:
            if field not in payload:
                return False, f"Missing required field: {field}"
        
        pr_fields = ['number', 'title', 'user', 'head', 'base']
        for field in pr_fields:
            if field not in payload['pull_request']:
                return False, f"Missing PR field: {field}"
    
    elif provider == 'bitbucket':
        required_fields = ['pullrequest', 'repository']
        for field in required_fields:
            if field not in payload:
                return False, f"Missing required field: {field}"
        
        pr_fields = ['id', 'title', 'author', 'source', 'destination']
        for field in pr_fields:
            if field not in payload['pullrequest']:
                return False, f"Missing PR field: {field}"
    
    else:
        return False, f"Unknown provider: {provider}"
    
    return True, None


def sanitize_pr_description(description: str, max_length: int = 5000) -> str:
    """
    Sanitize and truncate PR description
    
    Args:
        description: Raw PR description
        max_length: Maximum length
        
    Returns:
        Sanitized description
    """
    if not description:
        return ""
    
    # Remove potentially harmful content
    description = re.sub(r'<script.*?</script>', '', description, flags=re.DOTALL)
    description = re.sub(r'javascript:', '', description, flags=re.IGNORECASE)
    
    # Truncate if too long
    if len(description) > max_length:
        description = description[:max_length] + "..."
    
    return description.strip()


# ============================================================================
# LOGGING & DEBUGGING
# ============================================================================

def log_webhook_event(provider: str, event_type: str, payload_summary: Dict):
    """
    Log webhook event for debugging
    
    Args:
        provider: 'github' or 'bitbucket'
        event_type: Event type string
        payload_summary: Summary of payload data
    """
    logger.info(f"Webhook Event - Provider: {provider}, Type: {event_type}")
    logger.debug(f"Payload Summary: {payload_summary}")


def create_webhook_payload_summary(payload: Dict, provider: str) -> Dict:
    """
    Create a summary of webhook payload for logging
    
    Args:
        payload: Full webhook payload
        provider: 'github' or 'bitbucket'
        
    Returns:
        Dictionary with key information
    """
    if provider == 'github':
        pr = payload.get('pull_request', {})
        repo = payload.get('repository', {})
        return {
            'action': payload.get('action'),
            'pr_number': pr.get('number'),
            'pr_title': pr.get('title'),
            'repository': repo.get('full_name'),
            'author': pr.get('user', {}).get('login')
        }
    
    elif provider == 'bitbucket':
        pr = payload.get('pullrequest', {})
        repo = payload.get('repository', {})
        return {
            'pr_id': pr.get('id'),
            'pr_title': pr.get('title'),
            'repository': repo.get('full_name'),
            'author': pr.get('author', {}).get('display_name'),
            'state': pr.get('state')
        }
    
    return {}