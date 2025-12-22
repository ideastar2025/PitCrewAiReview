# backend/auth_app/apps.py
from django.apps import AppConfig


class AuthAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.auth_app'  # CHANGED from 'auth_app'
    verbose_name = 'Authentication'
    
    def ready(self):
        # Import signals if needed
        import apps.auth_app.models  # CHANGED from auth_app.models