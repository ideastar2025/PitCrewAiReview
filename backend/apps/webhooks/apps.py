from django.apps import AppConfig


class WebhooksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.webhooks'  # CHANGED from 'webhooks'
    verbose_name = 'Webhooks'