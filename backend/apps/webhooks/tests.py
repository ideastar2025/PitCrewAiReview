"""
Tests for webhook handlers
"""
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
import json

from apps.repos.models import Repository  # CHANGED
from apps.reviews.models import PullRequest, AIReview  # CHANGED
from apps.auth_app.models import UserProfile  # CHANGED

# ... rest of the tests