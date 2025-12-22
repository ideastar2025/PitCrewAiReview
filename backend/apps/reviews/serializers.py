from rest_framework import serializers
from .models import PullRequest, AIReview, ReviewIssue
from apps.repos.serializers import RepositorySerializer  # CHANGED from 'repos.serializers'


class ReviewIssueSerializer(serializers.ModelSerializer):
    """Serializer for Review Issues"""
    
    class Meta:
        model = ReviewIssue
        fields = [
            'id',
            'severity',
            'title',
            'file_path',
            'line_number',
            'suggestion',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AIReviewSerializer(serializers.ModelSerializer):
    """Serializer for AI Reviews"""
    issues = ReviewIssueSerializer(many=True, read_only=True)
    issues_count = serializers.SerializerMethodField()
    high_severity_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AIReview
        fields = [
            'id',
            'pull_request',
            'risk_score',
            'summary',
            'deployment_ready',
            'analysis_data',
            'issues',
            'issues_count',
            'high_severity_count',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_issues_count(self, obj):
        """Get total number of issues"""
        return obj.issues.count()
    
    def get_high_severity_count(self, obj):
        """Get count of high severity issues"""
        return obj.issues.filter(severity='high').count()


class PullRequestSerializer(serializers.ModelSerializer):
    """Basic serializer for Pull Requests"""
    repository_name = serializers.CharField(source='repository.name', read_only=True)
    has_review = serializers.SerializerMethodField()
    risk_score = serializers.SerializerMethodField()
    deployment_ready = serializers.SerializerMethodField()
    
    class Meta:
        model = PullRequest
        fields = [
            'id',
            'repository',
            'repository_name',
            'pr_number',
            'title',
            'description',
            'author',
            'status',
            'source_branch',
            'target_branch',
            'url',
            'has_review',
            'risk_score',
            'deployment_ready',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_has_review(self, obj):
        """Check if PR has an AI review"""
        return hasattr(obj, 'ai_review') and obj.ai_review is not None
    
    def get_risk_score(self, obj):
        """Get risk score from AI review if exists"""
        if hasattr(obj, 'ai_review') and obj.ai_review:
            return obj.ai_review.risk_score
        return None
    
    def get_deployment_ready(self, obj):
        """Get deployment ready status from AI review if exists"""
        if hasattr(obj, 'ai_review') and obj.ai_review:
            return obj.ai_review.deployment_ready
        return False


class PullRequestDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Pull Requests with full review data"""
    repository = RepositorySerializer(read_only=True)
    ai_review = AIReviewSerializer(read_only=True)
    
    class Meta:
        model = PullRequest
        fields = [
            'id',
            'repository',
            'pr_number',
            'title',
            'description',
            'author',
            'status',
            'source_branch',
            'target_branch',
            'url',
            'ai_review',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PRStatsSerializer(serializers.Serializer):
    """Serializer for PR statistics"""
    total_prs = serializers.IntegerField()
    open_prs = serializers.IntegerField()
    merged_prs = serializers.IntegerField()
    closed_prs = serializers.IntegerField()
    reviewed_prs = serializers.IntegerField()
    avg_risk_score = serializers.FloatField()
    deployment_ready = serializers.IntegerField()
    issues = serializers.DictField()
    period_days = serializers.IntegerField()