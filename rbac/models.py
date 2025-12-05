from django.db import models
import uuid
from users.models import User # user custom

class Permission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Permission"
        verbose_name_plurar = "Permissions"

    def __str__(self):
        return self.name
    
class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    # relationship: a role has many permissions
    permissions = models.ManyToManyField(Permission, related_name="roles", blank=True)

    class Meta:
        verbose_name ="Role"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.name
    
# add roles to the user (without creating an extra model)

User.add_to_class(
    "roles",
    models.ManyToManyField(Role, related_name="users", blank=True)
)
