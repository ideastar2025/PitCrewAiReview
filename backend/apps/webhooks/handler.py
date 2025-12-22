# Backend/webhooks/handlers.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from apps.repos.models import Repository  # CHANGED from backend.repos.models
from apps.reviews.models import PullRequest, AIReview, ReviewIssue  # CHANGED from backend.reviews.models
from .ai_analyzer import analyze_pr_with_ai

# ... rest of the file