from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from rbac.models import UserRole
from users.models import User
from .models import AuditLog

@receiver(post_save, sender=UserRole)
def log_user_role_save(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    AuditLog.objects.create(
        user=getattr(instance, '_current_user', None),
        model_name='UserRole',
        object_id=str(instance.id),
        action=action,
        changes={
            'user': str(instance.user.email),
            'role': str(instance.role.name)
        }
    )

@receiver(post_delete, sender=UserRole)
def log_user_role_delete(sender, instance, **kwargs):
    if getattr(instance, '_current_user', None):
        AuditLog.objects.create(
            user = instance._current_user,
            model_name='UserRole',
            object_id=str(instance.id),
            action='delete',
            changes={
                'user': str(instance.user.email),
                'role': str(instance.role.name)
            }
        )
@receiver(post_save, sender=User)
def log_user_save(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    AuditLog.objects.create(
        user=getattr(instance, '_current_user', None),
        model_name='User',
        object_id=str(instance.id),
        action=action,
        changes=getattr(instance, "_changes", {})
    )

@receiver(post_delete, sender=User)
def log_user_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        user=getattr(instance, '_current_user', None), 
        model_name='User', 
        object_id=str(instance.id),
        action='delete',
        changes=getattr(instance,"_changes", {})
    )