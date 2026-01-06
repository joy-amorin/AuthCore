from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from rbac.models import Role, Permission,RolePermission
from .models import AuditLog

@receiver(post_save, sender=Role)
def log_role_save(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    AuditLog.objects.create(
        user=getattr(instance, '_current_user', None),
        model_name='Role',
        object_id=str(instance.id),
        action=action,
        changes={}
    )

@receiver(post_delete, sender=Role)
def log_role_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        user=getattr(instance, '_current_user', None),
        model_name='Role',
        object_id=str(instance.id),
        action='delete'
    )

@receiver(post_save, sender=Permission)
def log_permission_save(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    AuditLog.objects.create(
        user=getattr(instance, '_current_user', None),
        model_name='Permission',
        object_id=str(instance.id),
        action=action
    )

@receiver(post_delete, sender=Permission)
def log_permission_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        user=getattr(instance, '_current_user', None),
        model_name='Permission',
        object_id=str(instance.id),
        action='delete'
    )

@receiver(post_save,sender=RolePermission)
def log_pemission_save(sender,instance, created, **kwargs):
    action = 'create' if created else 'update'
    AuditLog.objects.create(
        user=getattr(instance, '_current_user', None),
        model_name='RolePermission',
        object_id=str(instance.id),
        action=action,
        changes={
            'role': str(instance.role.id),
            'permission': str(instance.permission.id)
            }
        )
    
@receiver(post_delete, sender=RolePermission)
def log_permission_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        user=getattr(instance, '_current_user', None),
        model_name='RolePermission',
        object_id=str(instance.id),
        action='delete',
        changes={
            'role': str(instance.role.id),
            'permission': str(instance.permission.id)
        }
    )