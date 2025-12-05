from django.db import models
import uuid
from users.models import User # user custom
from django.conf import settings

class Permission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"

    def __str__(self):
        return self.name
    
class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    # nany to many relatioship with permissions,usig itermediates tables
    permissions = models.ManyToManyField(
        Permission,
        through='RolePermission',   # intermediate table
        related_name='roles',       # reverse access: permission.roles.all()
        blank=True
    )

    class Meta:
        verbose_name ="Role"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.name
    
class RolePermission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_permissions")
    permission  = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name="permission_roles")
        
        

    class Meta:
        unique_together = ("role", "permission")

class UserRole(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_roles",
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="role",
    )
    class Meta:
        unique_together = ("user", "role")