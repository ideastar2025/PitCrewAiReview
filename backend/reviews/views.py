# backend/reviews/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.db.models import Count, Q, Avg
from datetime import datetime, timedelta
import requests
import logging

from .models import PullRequest, AIReview, ReviewIssue
from .serializers import (
    PullRequestSerializer,
    PullRequestDetailSerializer,
    AIReviewSerializer,
    ReviewIssueSerializer,
    PRStatsSerializer
)

logger = logging.getLogger(__name__)


class PullRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for Pull Requests"""
    
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PullRequestDetailSerializer
        return PullRequestSerializer
    
    def get_queryset(self):
        # Filter PRs from repositories owned by user
        return PullRequest.objects.filter(
            repository__user=self.request.user
        ).select_related('repository', 'ai_review').prefetch_related('ai_review__issues')
    
    @action(detail=True, methods=['post'])
    def trigger_review(self, request, pk=None):
        """Trigger AI review for a pull request"""
        pr = self.get_object()
        
        # Check if review already exists
        if hasattr(pr, 'ai_review'):
            return Response(
                {'error': 'Review already exists for this PR'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Import here to avoid circular imports
            from backend.webhooks.ai_analyzer import analyze_pr_with_ai
            from backend.webhooks.ultis import fetch_pr_diff
            
            # Fetch PR diff
            diff_content = fetch_pr_diff(pr)
            if not diff_content:
                return Response(
                    {'error': 'Failed to fetch PR diff'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Analyze with AI
            pr_data = {
                'title': pr.title,
                'description': pr.description,
            }
            analysis = analyze_pr_with_ai(pr_data, diff_content)
            
            # Create AI review
            ai_review = AIReview.objects.create(
                pull_request=pr,
                risk_score=analysis.get('riskScore', 50),
                summary=analysis.get('summary', ''),
                deployment_ready=analysis.get('deploymentReady', False),
                analysis_data=analysis
            )
            
            # Create issues
            for issue_data in analysis.get('issues', []):
                ReviewIssue.objects.create(
                    ai_review=ai_review,
                    severity=issue_data.get('severity', 'low'),
                    title=issue_data.get('title', ''),
                    file_path=issue_data.get('file', ''),
                    line_number=issue_data.get('line'),
                    suggestion=issue_data.get('suggestion', '')
                )
            
            serializer = AIReviewSerializer(ai_review)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error triggering review: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to analyze PR: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def diff(self, request, pk=None):
        """Get PR diff content"""
        pr = self.get_object()
        
        try:
            from apps.webhooks.utils import fetch_pr_diff
            diff_content = fetch_pr_diff(pr)
            
            if diff_content:
                return Response({'diff': diff_content})
            else:
                return Response(
                    {'error': 'Failed to fetch diff'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            logger.error(f"Error fetching diff: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get PR statistics"""
        days = int(request.query_params.get('days', 30))
        since = datetime.now() - timedelta(days=days)
        
        queryset = self.get_queryset().filter(created_at__gte=since)
        
        stats = {
            'total_prs': queryset.count(),
            'open_prs': queryset.filter(status='open').count(),
            'merged_prs': queryset.filter(status='merged').count(),
            'closed_prs': queryset.filter(status='closed').count(),
            'reviewed_prs': queryset.filter(ai_review__isnull=False).count(),
            'avg_risk_score': queryset.filter(
                ai_review__isnull=False
            ).aggregate(Avg('ai_review__risk_score'))['ai_review__risk_score__avg'] or 0,
            'deployment_ready': queryset.filter(
                ai_review__deployment_ready=True
            ).count(),
            'issues': {
                'high': ReviewIssue.objects.filter(
                    ai_review__pull_request__in=queryset,
                    severity='high'
                ).count(),
                'medium': ReviewIssue.objects.filter(
                    ai_review__pull_request__in=queryset,
                    severity='medium'
                ).count(),
                'low': ReviewIssue.objects.filter(
                    ai_review__pull_request__in=queryset,
                    severity='low'
                ).count(),
            },
            'period_days': days
        }
        
        serializer = PRStatsSerializer(stats)
        return Response(serializer.data)


class AIReviewViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AI Reviews (read-only)"""
    
    serializer_class = AIReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AIReview.objects.filter(
            pull_request__repository__user=self.request.user
        ).select_related('pull_request', 'pull_request__repository').prefetch_related('issues')
    
    @action(detail=False, methods=['get'])
    def high_risk(self, request):
        """Get high-risk reviews (risk score >= 70)"""
        queryset = self.get_queryset().filter(risk_score__gte=70)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def deployment_ready(self, request):
        """Get deployment-ready reviews"""
        queryset = self.get_queryset().filter(deployment_ready=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ReviewIssueViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Review Issues (read-only)"""
    
    serializer_class = ReviewIssueSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ReviewIssue.objects.filter(
            ai_review__pull_request__repository__user=self.request.user
        ).select_related('ai_review', 'ai_review__pull_request')
    
    @action(detail=False, methods=['get'])
    def by_severity(self, request):
        """Get issues grouped by severity"""
        queryset = self.get_queryset()
        
        grouped = {
            'high': self.get_serializer(
                queryset.filter(severity='high'),
                many=True
            ).data,
            'medium': self.get_serializer(
                queryset.filter(severity='medium'),
                many=True
            ).data,
            'low': self.get_serializer(
                queryset.filter(severity='low'),
                many=True
            ).data,
        }
        
        return Response(grouped)