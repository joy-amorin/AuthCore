from .models import Permission

def has_permission(user, permission_name: str) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return Permission.objects.filter(
        name=permission_name,
        permission_roles__role__role_assignments__user=user
    ).exists()
