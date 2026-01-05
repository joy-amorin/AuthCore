from django.db import models
from django.conf import settings

# Create your models here.

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=36) # UUID or register id
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    changes = models.JSONField(default=dict, blank=True) # Store changes as JSON

    def __str__(self):
        return f"{self.user} {self.action} {self.model_name} {self.object_id}"
