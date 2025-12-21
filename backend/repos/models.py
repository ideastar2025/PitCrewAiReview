# Backend/repos/models.py
from django.db import models
from django.contrib.auth.models import User

class Repository(models.Model):
    PROVIDER_CHOICES = [
        ('github', 'GitHub'),
        ('bitbucket', 'Bitbucket'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='repositories')
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    repo_id = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)
    url = models.URLField()
    is_active = models.BooleanField(default=True)
    webhook_id = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'repositories'
        unique_together = ['provider', 'repo_id']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.provider}/{self.full_name}"