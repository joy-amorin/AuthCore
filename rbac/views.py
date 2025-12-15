from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from .models import Permission, Role, RolePermission
from .serializers import PermissionSerializer, RoleSerializer

# only admins can manage permissions
class PermissionViewSet(viewsets.ModelViewSet): # create automatically  GET, POST, PUT, DELETE with Model Viewset
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAdminUser]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['POST'], url_path='permissions')
    def assign_permissions(self, request, pk=None):
        role = self.get_objects()

        permissions_ids = request.data('permissions', [])

        if not isinstance(permissions_ids, list):
            return Response(
                {"error": "permissions debe ser una lista de IDs"},
                status=status.HTTP_400_BAD_REQUEST
            )    
        for perm_id in permissions_ids:
            permission = get_object_or_404(Permission, id=perm_id)
            RolePermission.objects.get_or_create(
                role=role,
                permission=permission
            )

        return Response(
            {"detail": "Permisos asignados correctamente"},
            status=status.HTTP_200_OK
        )