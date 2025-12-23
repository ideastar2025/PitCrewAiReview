from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, PullRequestViewSet, ReviewCommentViewSet

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'pull-requests', PullRequestViewSet, basename='pullrequest')
router.register(r'comments', ReviewCommentViewSet, basename='reviewcomment')

app_name = 'reviews'

urlpatterns = [
    path('', include(router.urls)),
]