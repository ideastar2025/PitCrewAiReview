# backend/auth_app/apps.py
from django.apps import AppConfig


class AuthAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'auth_app'
    verbose_name = 'Authentication'
    
    def ready(self):
        # Import signals if needed
        import auth_app.models  # noqa