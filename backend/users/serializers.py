from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rbac.models import Role, Permission

User = get_user_model() # get custom user model

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create(
            email = validated_data['email'],
            first_name = validated_data.get('first_name', ''),
            last_name = validated_data.get('last_name' '')
        )
        user.set_password(validated_data['password']) # encrypt the password
        user.save()
        return user
    
class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined', 'roles', 'is_superuser']
        read_only_fields = ['id', 'is_staff', 'date_joined', 'is_superuser']

    def get_roles(self, obj):
        return list(
            obj.user_roles
                .select_related('role')
                .values('role__id', 'role__name')
            )
class MeSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'roles', 'is_superuser', 'permissions']
        read_only_fields = fields
    
    def get_roles(self, obj):
        return list(
            obj.user_roles
                .select_related('role')
                .values_list('role__name', flat=True)
        )
    def get_permissions(self, obj):

        if obj.is_superuser:
            return list(
                Permission.objects.values_list('name', flat=True)
            )
        roles = Role.objects.filter(role_assignments__user=obj
                                    ).prefetch_related('permissions')
        permission = set()
        for role in roles:
            for perm in role.permissions.all():
                permission.add(perm.name)
        return list(permission)
        