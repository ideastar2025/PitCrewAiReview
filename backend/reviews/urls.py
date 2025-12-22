from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PullRequestViewSet,
    AIReviewViewSet,
    ReviewIssueViewSet
)

app_name = 'reviews'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'pull-requests', PullRequestViewSet, basename='pullrequest')
router.register(r'ai-reviews', AIReviewViewSet, basename='aireview')
router.register(r'issues', ReviewIssueViewSet, basename='reviewissue')

urlpatterns = [
    path('', include(router.urls)),
]

# Available endpoints:
# GET    /api/reviews/pull-requests/                    - List all PRs
# POST   /api/reviews/pull-requests/                    - Create PR
# GET    /api/reviews/pull-requests/{id}/               - Get PR details
# PUT    /api/reviews/pull-requests/{id}/               - Update PR
# PATCH  /api/reviews/pull-requests/{id}/               - Partial update PR
# DELETE /api/reviews/pull-requests/{id}/               - Delete PR
# POST   /api/reviews/pull-requests/{id}/trigger-review/- Trigger AI review
# GET    /api/reviews/pull-requests/{id}/diff/          - Get PR diff
# GET    /api/reviews/pull-requests/stats/              - Get PR statistics
#
# GET    /api/reviews/ai-reviews/                       - List all AI reviews
# GET    /api/reviews/ai-reviews/{id}/                  - Get review details
# GET    /api/reviews/ai-reviews/high-risk/             - Get high-risk reviews
# GET    /api/reviews/ai-reviews/deployment-ready/      - Get deployment-ready reviews
#
# GET    /api/reviews/issues/                           - List all issues
# GET    /api/reviews/issues/{id}/                      - Get issue details
# GET    /api/reviews/issues/by-severity/               - Get issues grouped by severity