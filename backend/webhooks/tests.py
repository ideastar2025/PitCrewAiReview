"""
Tests for webhook handlers
"""
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
import json

from backend.repos.models import Repository
from backend.reviews.models import PullRequest, AIReview
from apps.auth_app.models import UserProfile


class WebhookTestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create user profile with access token
        self.profile = UserProfile.objects.create(
            user=self.user,
            provider='github',
            access_token='test_token_123'
        )
        
        # Create test repository
        self.repo = Repository.objects.create(
            user=self.user,
            provider='github',
            repo_id='12345',
            name='test-repo',
            full_name='testuser/test-repo',
            url='https://github.com/testuser/test-repo'
        )
    
    def test_github_webhook_ping(self):
        """Test GitHub ping event"""
        payload = {
            'zen': 'Keep it logically awesome.',
            'hook_id': 12345
        }
        
        response = self.client.post(
            reverse('webhooks:github'),
            data=json.dumps(payload),
            content_type='application/json',
            HTTP_X_GITHUB_EVENT='ping'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'pong')
    
    def test_github_pr_opened(self):
        """Test GitHub pull request opened event"""
        payload = {
            'action': 'opened',
            'pull_request': {
                'number': 1,
                'title': 'Test PR',
                'body': 'This is a test PR',
                'state': 'open',
                'user': {'login': 'testuser'},
                'head': {'ref': 'feature-branch'},
                'base': {'ref': 'main'},
                'html_url': 'https://github.com/testuser/test-repo/pull/1',
                'created_at': '2024-01-01T00:00:00Z',
                'merged': False
            },
            'repository': {
                'id': 12345,
                'name': 'test-repo',
                'full_name': 'testuser/test-repo',
                'html_url': 'https://github.com/testuser/test-repo'
            }
        }
        
        response = self.client.post(
            reverse('webhooks:github'),
            data=json.dumps(payload),
            content_type='application/json',
            HTTP_X_GITHUB_EVENT='pull_request'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Check PR was created
        pr = PullRequest.objects.filter(
            repository=self.repo,
            pr_number=1
        ).first()
        
        self.assertIsNotNone(pr)
        self.assertEqual(pr.title, 'Test PR')
        self.assertEqual(pr.status, 'open')
    
    def test_bitbucket_webhook(self):
        """Test Bitbucket pull request created event"""
        # Update repo to Bitbucket
        self.repo.provider = 'bitbucket'
        self.repo.repo_id = '{uuid-123}'
        self.repo.save()
        
        payload = {
            'pullrequest': {
                'id': 1,
                'title': 'Test Bitbucket PR',
                'description': 'Test description',
                'state': 'OPEN',
                'author': {'display_name': 'Test User'},
                'source': {'branch': {'name': 'feature'}},
                'destination': {'branch': {'name': 'master'}},
                'links': {'html': {'href': 'https://bitbucket.org/testuser/test-repo/pull-requests/1'}},
                'created_on': '2024-01-01T00:00:00Z'
            },
            'repository': {
                'uuid': '{uuid-123}',
                'name': 'test-repo',
                'full_name': 'testuser/test-repo',
                'links': {'html': {'href': 'https://bitbucket.org/testuser/test-repo'}}
            }
        }
        
        response = self.client.post(
            reverse('webhooks:bitbucket'),
            data=json.dumps(payload),
            content_type='application/json',
            HTTP_X_EVENT_KEY='pullrequest:created'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Check PR was created
        pr = PullRequest.objects.filter(
            repository=self.repo,
            pr_number=1
        ).first()
        
        self.assertIsNotNone(pr)
        self.assertEqual(pr.title, 'Test Bitbucket PR')
    
    def test_webhook_test_endpoint(self):
        """Test webhook test endpoint"""
        response = self.client.get(reverse('webhooks:test'))
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'ok')
        
        # Test POST
        test_payload = {'test': 'data'}
        response = self.client.post(
            reverse('webhooks:test'),
            data=json.dumps(test_payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'received')
        self.assertEqual(data['payload'], test_payload)


class AIAnalyzerTestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        self.repo = Repository.objects.create(
            user=self.user,
            provider='github',
            repo_id='12345',
            name='test-repo',
            full_name='testuser/test-repo',
            url='https://github.com/testuser/test-repo'
        )
        
        self.pr = PullRequest.objects.create(
            repository=self.repo,
            pr_number=1,
            title='Test PR',
            author='testuser',
            status='open',
            source_branch='feature',
            target_branch='main',
            url='https://github.com/testuser/test-repo/pull/1'
        )
    
    def test_parse_ai_response(self):
        """Test parsing AI response"""
        from apps.webhooks.ai_analyzer import parse_ai_response
        
        # Test with valid JSON
        response_text = """```json
{
  "summary": "Test summary",
  "riskScore": 45,
  "issues": [],
  "recommendations": ["Test rec"],
  "blockers": [],
  "deploymentReady": true
}
```"""
        
        result = parse_ai_response(response_text)
        
        self.assertEqual(result['summary'], 'Test summary')
        self.assertEqual(result['riskScore'], 45)
        self.assertTrue(result['deploymentReady'])
    
    def test_fallback_review_creation(self):
        """Test creating fallback review"""
        from apps.webhooks.ai_analyzer import create_fallback_review
        
        review = create_fallback_review(self.pr, 'Test error')
        
        self.assertIsNotNone(review)
        self.assertEqual(review.pull_request, self.pr)
        self.assertEqual(review.risk_score, 50)
        self.assertFalse(review.deployment_ready)


class UtilsTestCase(TestCase):
    def test_extract_files_from_diff(self):
        """Test extracting files from diff"""
        from apps.webhooks.utils import extract_files_from_diff
        
        diff = """diff --git a/file1.py b/file1.py
index abc123..def456 100644
--- a/file1.py
+++ b/file1.py
@@ -1,3 +1,4 @@
+new line
 existing line
diff --git a/folder/file2.js b/folder/file2.js
new file mode 100644"""
        
        files = extract_files_from_diff(diff)
        
        self.assertEqual(len(files), 2)
        self.assertIn('file1.py', files)
        self.assertIn('folder/file2.js', files)
    
    def test_count_changes_in_diff(self):
        """Test counting changes in diff"""
        from apps.webhooks.utils import count_changes_in_diff
        
        diff = """+added line 1
+added line 2
-removed line
 unchanged line"""
        
        result = count_changes_in_diff(diff)
        
        self.assertEqual(result['additions'], 2)
        self.assertEqual(result['deletions'], 1)
        self.assertEqual(result['total'], 3)