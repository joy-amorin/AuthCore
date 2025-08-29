from django.db import models
from django.conf import settings
import uuid

# Create your models here.

class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
class Permission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.code
    
class UserRole(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='user_roles'
        )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name='role_users'
        )

    class Meta:
        unique_together = ('user', 'role')

    def __str__(self):
        return f"{self.user.email} - {self.role.name}"

class RolePermission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4,editable=False)
    role = models.ForeignKey(
        Role, 
        on_delete=models.CASCADE,
        related_name='role_permissions'
        )
    permission = models.ForeignKey(
        Permission, 
        on_delete=models.CASCADE,
        related_name='permission_roles'
        )
    
    def __str__(self):
        return f"{self.role.name} - {self.permission.code}"

    class Meta:
        unique_together = ('role', 'permission')