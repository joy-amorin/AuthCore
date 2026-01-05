from rest_framework import serializers
from audit.models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    action_display = serializers.SerializerMethodField()
    model_display = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'user_email',
            'model_name',
            'model_display',
            'object_id',
            'action',
            'action_display',
            'timestamp',
            'changes'
        ]

    def get_action_display(self, obj):
            return {
                'create': 'Creación',
                'update': 'Actualización',
                'delete': 'eliminación'

            }.get(obj.action, obj.action)
        
    def get_model_display(self, obj):
            return {
                'Role': 'Rol',
                'Permission': 'Permiso',
                'RolePermission': 'Asignación de permiso'
            }.get(obj.model_name, obj.model_name)