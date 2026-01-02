from rest_framework import serializers
from .models import Role, Permission, UserRole, RolePermission


from django.contrib.auth import get_user_model

User = get_user_model

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'description']

class RoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions']
        extra_kwargs = {
            'name': {'label': 'name'},
            'description': {'label': 'description'},
        }
class RoleListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name','description'] 


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', 'user', 'role']
    
class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = ['id', 'role', 'permission']

class AssignPermissionsSerializer(serializers.Serializer):
    permissions = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=True
    )

    def validate_permissions(self, value):
        """
        check that all permissions exist in the database
        """
        existing_ids = set(Permission.objects.filter(id__in=value).values_list('id', flat=True))
        invalid_ids = [str(v) for v in value if v not in existing_ids]
        if invalid_ids:
            raise serializers.ValidationError(
                f"Permisos no existentes: {', '.join(invalid_ids)}"
            )
        return value
class AssignRolesSerializer(serializers.Serializer):
    roles = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False
    )
