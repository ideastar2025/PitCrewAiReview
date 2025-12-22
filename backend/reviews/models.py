# Backend/reviews/models.py
from django.db import models
from repos.models import Repository

class PullRequest(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('merged', 'Merged'),
        ('closed', 'Closed'),
    ]
    
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='pull_requests')
    pr_number = models.IntegerField()
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    author = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    source_branch = models.CharField(max_length=255)
    target_branch = models.CharField(max_length=255)
    url = models.URLField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pull_requests'
        unique_together = ['repository', 'pr_number']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"PR #{self.pr_number}: {self.title}"

class AIReview(models.Model):
    pull_request = models.OneToOneField(PullRequest, on_delete=models.CASCADE, related_name='ai_review')
    risk_score = models.IntegerField()
    summary = models.TextField()
    deployment_ready = models.BooleanField(default=False)
    analysis_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_reviews'
    
    def __str__(self):
        return f"Review for {self.pull_request}"

class ReviewIssue(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    ai_review = models.ForeignKey(AIReview, on_delete=models.CASCADE, related_name='issues')
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    title = models.CharField(max_length=500)
    file_path = models.CharField(max_length=500)
    line_number = models.IntegerField()
    suggestion = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'review_issues'
        ordering = ['-severity', 'file_path', 'line_number']
    
    def __str__(self):
        return f"{self.severity}: {self.title}"