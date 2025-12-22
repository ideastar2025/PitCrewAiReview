# Backend/webhooks/handlers.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from backend.repos.models import Repository
from backend.reviews.models import PullRequest, AIReview, ReviewIssue
from .ai_analyzer import analyze_pr_with_ai

@csrf_exempt
@require_http_methods(["POST"])
def bitbucket_webhook(request):
    """Handle Bitbucket webhook events"""
    try:
        payload = json.loads(request.body)
        event_type = request.headers.get('X-Event-Key')
        
        if event_type in ['pullrequest:created', 'pullrequest:updated']:
            process_pr_event(payload)
        
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def process_pr_event(payload):
    """Process pull request event"""
    pr_data = payload.get('pullrequest')
    repo_data = payload.get('repository')
    
    # Get or create repository
    repo, _ = Repository.objects.get_or_create(
        provider='bitbucket',
        repo_id=repo_data['uuid'],
        defaults={
            'name': repo_data['name'],
            'full_name': repo_data['full_name'],
            'url': repo_data['links']['html']['href']
        }
    )
    
    # Create or update PR
    pr, created = PullRequest.objects.update_or_create(
        repository=repo,
        pr_number=pr_data['id'],
        defaults={
            'title': pr_data['title'],
            'description': pr_data.get('description', ''),
            'author': pr_data['author']['display_name'],
            'status': pr_data['state'],
            'source_branch': pr_data['source']['branch']['name'],
            'target_branch': pr_data['destination']['branch']['name'],
            'url': pr_data['links']['html']['href'],
            'created_at': pr_data['created_on']
        }
    )
    
    # Trigger AI analysis
    if created:
        analyze_and_save_review(pr)