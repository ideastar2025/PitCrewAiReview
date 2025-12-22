# apps/webhooks/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import hmac
import hashlib
import json

# Example: Webhook secret (for verifying payload)
WEBHOOK_SECRET = "your_webhook_secret_here"


@method_decorator(csrf_exempt, name='dispatch')
class GitHubWebhookView(APIView):
    """
    Handles incoming GitHub webhook events.
    """

    def post(self, request, *args, **kwargs):
        # Verify signature if using secret
        signature = request.META.get('HTTP_X_HUB_SIGNATURE_256', '')
        body = request.body

        if WEBHOOK_SECRET:
            hash_object = hmac.new(WEBHOOK_SECRET.encode(), body, hashlib.sha256)
            expected_signature = f'sha256={hash_object.hexdigest()}'
            if not hmac.compare_digest(expected_signature, signature):
                return Response({"error": "Invalid signature"}, status=status.HTTP_403_FORBIDDEN)

        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON"}, status=status.HTTP_400_BAD_REQUEST)

        # Example: handle push event
        event_type = request.META.get('HTTP_X_GITHUB_EVENT', 'unknown')
        if event_type == "push":
            # Do something with the push event
            print("Received push event:", payload)
        elif event_type == "pull_request":
            print("Received pull request event:", payload)
        else:
            print(f"Received {event_type} event:", payload)

        return Response({"status": "success"}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class GenericWebhookView(APIView):
    """
    Handles generic webhooks from other services.
    """

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            print("Received webhook data:", data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"status": "received"}, status=status.HTTP_200_OK)
