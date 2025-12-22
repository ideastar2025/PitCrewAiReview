from django.apps import AppConfig


class ReviewsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.reviews'
    verbose_name = 'PR Reviews'
    
    def ready(self):
        """Import signals when app is ready"""
        # Import signals here if needed
        pass