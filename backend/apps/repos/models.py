from django.db import models
from django.contrib.auth.models import User

class Repository(models.Model):
    PROVIDER_CHOICES = [
        ('github', 'GitHub'),
        ('bitbucket', 'Bitbucket'),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='repositories')
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='github')
    full_name = models.CharField(max_length=255)  # e.g., "username/repo-name"
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    url = models.URLField()
    default_branch = models.CharField(max_length=100, default='main')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['owner', 'provider', 'full_name']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.provider}/{self.full_name}"